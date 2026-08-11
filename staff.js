// ======================================
// staff.js
// JOKBAL TIME STAFF SYSTEM (FULLY FIXED & SAFE)
// + 고객이 전달한 "번호|토큰" 붙여넣기 지원
// ======================================

// 1. Firestore 모듈은 ./firebase.js 에서 가져오기
import {
  db,
  auth,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp
} from "./firebase.js";

// 2. Auth 인증 모듈은 Firebase 공식 CDN URL에서 가져오기
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ================================
// DOM ELEMENTS
// ================================
const loginBox = document.getElementById("loginBox");
const staffBox = document.getElementById("staffBox");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const requestList = document.getElementById("requestList");
const useCouponNumber = document.getElementById("useCouponNumber");
const checkBtn = document.getElementById("checkBtn");
const couponInfo = document.getElementById("couponInfo");
const useBtn = document.getElementById("useBtn");
const scanQRBtn = document.getElementById("scanQRBtn");
const reader = document.getElementById("reader");

let html5QrCode = null;

// ================================
// AUTHENTICATION
// ================================
if (loginBtn) {
  loginBtn.onclick = async () => {
    const email = document.getElementById("staffEmail").value.trim();
    const password = document.getElementById("staffPassword").value.trim();

    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      console.error(e);
      alert("로그인 실패: " + e.message);
    }
  };
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    if (loginBox) loginBox.classList.add("hidden");
    if (staffBox) staffBox.classList.remove("hidden");
    loadRequests();
  } else {
    if (loginBox) loginBox.classList.remove("hidden");
    if (staffBox) staffBox.classList.add("hidden");
    stopQRScanner();
  }
});

if (logoutBtn) {
  logoutBtn.onclick = async () => {
    await signOut(auth);
  };
}

// ================================
// REQUEST LIST
// ================================
function loadRequests() {
  if (!requestList) return;

  const q = query(
    collection(db, "coupon_requests"),
    where("status", "==", "waiting")
  );

  onSnapshot(q, async (snapshot) => {
    requestList.innerHTML = "";

    if (snapshot.empty) {
      requestList.innerHTML = "<p style='color:#888;'>대기 중인 요청이 없습니다.</p>";
      return;
    }

    for (const item of snapshot.docs) {
      const data = item.data();
      const div = document.createElement("div");
      div.className = "request-item";

      let couponData = {};
      try {
        const couponSnap = await getDoc(doc(db, "coupons", data.couponNumber));
        if (couponSnap.exists()) {
          couponData = couponSnap.data();
        }
      } catch (err) {
        console.error("쿠폰 정보 로드 실패:", err);
      }

      div.innerHTML = `
        <p>쿠폰번호 : <b>${data.couponNumber}</b></p>
        <p>쿠폰명 : ${couponData.title || "-"}</p>
        <p>할인 : ${couponData.discount || 0}%</p>
        <p>요청시간 : ${data.createdAt ? data.createdAt.toDate().toLocaleString() : ""}</p>
        <button class="approve-btn">✅ 사용 처리</button>
      `;

      div.querySelector(".approve-btn").onclick = async (e) => {
        e.target.disabled = true;
        await processRequestUse(data.couponNumber, data.token, item.id);
        e.target.disabled = false;
      };

      requestList.appendChild(div);
    }
  });
}

// ================================
// 승인요청 → 즉시 사용 처리 (토큰 검증 포함)
// ================================
async function processRequestUse(number, token, requestId) {
  try {
    const ref = doc(db, "coupons", number);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      alert("존재하지 않는 쿠폰입니다.");
      return;
    }

    const data = snap.data();

    if (data.token && token && data.token !== token) {
      alert("❌ 인증 실패 — 고객이 전달한 정보와 쿠폰 토큰이 일치하지 않습니다.");
      return;
    }

    if (data.status === "used" || (data.useCount || 0) >= (data.maxUseCount || 1)) {
      alert("이미 사용 완료된 쿠폰입니다.");
      await setDoc(doc(db, "coupon_requests", requestId), { status: "expired" }, { merge: true });
      return;
    }

    if (data.endDate) {
      const today = new Date();
      const endDate = new Date(data.endDate);
      endDate.setHours(23, 59, 59, 999);
      if (today > endDate) {
        alert("사용 기간이 만료된 쿠폰입니다.");
        await setDoc(ref, { status: "expired" }, { merge: true });
        await setDoc(doc(db, "coupon_requests", requestId), { status: "expired" }, { merge: true });
        return;
      }
    }

    if (!confirm(`쿠폰 [${number}] (${data.title || "-"} / ${data.discount || 0}%) 를 사용 처리하시겠습니까?`)) {
      return;
    }

    await setDoc(ref, {
      status: "used",
      useCount: 1,
      usedAt: serverTimestamp()
    }, { merge: true });

    await setDoc(doc(db, "coupon_requests", requestId), { status: "completed" }, { merge: true });

    await addDoc(collection(db, "coupon_use"), {
      couponNumber: number,
      staffUid: auth.currentUser ? auth.currentUser.uid : "unknown",
      staffEmail: auth.currentUser ? auth.currentUser.email : "unknown",
      usedAt: serverTimestamp()
    });

    await addDoc(collection(db, "coupon_history"), {
      couponNumber: number,
      action: "used",
      time: serverTimestamp()
    });

    if (navigator.vibrate) navigator.vibrate(200);
    alert("✅ 사용 완료 처리되었습니다.");
  } catch (error) {
    console.error("승인요청 처리 중 오류:", error);
    alert("처리 실패: " + error.message);
  }
}

// ================================
// 입력값 정규화: "쿠폰번호|토큰" 붙여넣기 지원
// (QR 스캔 결과와 동일한 포맷을 손으로 붙여넣었을 때도 인증되게 함)
// ================================
function normalizeCouponInput() {
  let raw = useCouponNumber.value.trim();

  if (raw.includes("|")) {
    const parts = raw.split("|");
    const number = parts[0].trim();
    const token = (parts[1] || "").trim();

    useCouponNumber.value = number;
    if (token) {
      useCouponNumber.dataset.token = token;
    }
    return number;
  }

  return raw;
}

// ================================
// CHECK COUPON
// ================================
if (checkBtn) {
  checkBtn.onclick = async () => {
    const number = normalizeCouponInput();

    if (!number) {
      alert("쿠폰번호를 입력해 주세요.");
      return;
    }

    try {
      const snap = await getDoc(doc(db, "coupons", number));

      if (!snap.exists()) {
        couponInfo.innerHTML = "❌ 존재하지 않는 쿠폰입니다.";
        if (useBtn) useBtn.disabled = true;
        return;
      }

      const data = snap.data();
      const qrToken = useCouponNumber.dataset.token;

      // QR / 붙여넣기 토큰 검증
      if (data.token && (!qrToken || data.token !== qrToken)) {
        couponInfo.innerHTML = `
          <div class="coupon-detail">
            <h3>❌ 인증 실패</h3>
            <p>QR을 스캔하거나, 고객이 전달한 쿠폰번호|인증코드를 그대로 붙여넣어 주세요.</p>
          </div>
        `;
        if (useBtn) useBtn.disabled = true;
        return;
      }

      // 자동 만료 처리
      const today = new Date();

      if (data.endDate && data.status !== "used") {
        const endDate = new Date(data.endDate);
        endDate.setHours(23, 59, 59, 999);

        if (today > endDate) {
          await setDoc(doc(db, "coupons", number), {
            status: "expired"
          }, { merge: true });
          data.status = "expired";
        }
      }

      if (data.endDate) {
        const endDate = new Date(data.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (today > endDate) {
          couponInfo.innerHTML = `
            <div class="coupon-detail">
              <h3>${data.title || "-"}</h3>
              <hr>
              <p style="color:#d32f2f;">❌ 기간이 만료된 쿠폰입니다.</p>
              <p>사용기간<br>${data.startDate || "-"} ~ ${data.endDate}</p>
            </div>
          `;
          if (useBtn) {
            useBtn.disabled = true;
            useBtn.textContent = "기간 만료";
          }
          return;
        }
      }

      let statusText = "";
      if ((data.useCount || 0) >= 1) {
        statusText = "❌ 사용 완료";
      } else {
        switch (data.status) {
          case "issued":
          case "approved":
            statusText = "✅ 사용 가능";
            break;
          case "waiting":
            statusText = "⏳ 승인 대기";
            break;
          case "used":
            statusText = "❌ 사용 완료";
            break;
          case "expired":
            statusText = "⛔ 만료됨";
            break;
          default:
            statusText = data.status;
        }
      }

      couponInfo.innerHTML = `
        <div class="coupon-detail">
          <div class="qr-ok">🟢 ${data.token ? "인증 완료" : "쿠폰 확인 완료"}</div>
          <h3>${data.title || "-"}</h3>
          <hr>
          <p><b>쿠폰번호</b> : ${number}</p>
          <p><b>상태</b> : ${statusText}</p>
          <p><b>할인율</b> : ${data.discount || 0}%</p>
          <p><b>사용횟수</b> : ${data.useCount || 0} / ${data.maxUseCount || 1}</p>
          <p><b>사용기간</b><br>${data.startDate || "-"} ~ ${data.endDate || "-"}</p>
          <p><b>승인시간</b><br>${data.approvedAt ? data.approvedAt.toDate().toLocaleString() : "-"}</p>
          <p><b>사용시간</b><br>${data.usedAt ? data.usedAt.toDate().toLocaleString() : "-"}</p>
        </div>
      `;

      const isUsableState = data.status === "issued" || data.status === "approved";
      if (useBtn) {
        if (isUsableState && (data.useCount || 0) < (data.maxUseCount || 1)) {
          useBtn.disabled = false;
          useBtn.textContent = "사용 완료 처리";
        } else {
          useBtn.disabled = true;
          if (data.status === "used" || (data.useCount || 0) >= (data.maxUseCount || 1)) {
            useBtn.textContent = "사용 완료";
          } else {
            useBtn.textContent = "사용 불가";
          }
        }
      }
    } catch (err) {
      console.error("쿠폰 조회 중 에러:", err);
      couponInfo.innerHTML = "❌ 쿠폰 조회 중 오류 발생";
      if (useBtn) useBtn.disabled = true;
    }
  };
}

// ================================
// USE COMPLETE
// ================================
if (useBtn) {
  useBtn.onclick = async () => {
    const number = useCouponNumber.value.trim();

    if (!number) {
      alert("쿠폰번호를 입력해 주세요.");
      return;
    }

    try {
      const snap = await getDoc(doc(db, "coupons", number));

      if (!snap.exists()) {
        alert("존재하지 않는 쿠폰입니다.");
        return;
      }

      const data = snap.data();
      const qrToken = useCouponNumber.dataset.token;

      if (data.token && (!qrToken || data.token !== qrToken)) {
        alert("인증이 필요합니다.");
        return;
      }

      if (data.status === "used" || (data.useCount || 0) >= 1) {
        alert("이미 사용 완료된 쿠폰입니다.");
        return;
      }

      useBtn.disabled = true;

      await setDoc(doc(db, "coupons", number), {
        status: "used",
        useCount: 1,
        usedAt: serverTimestamp()
      }, { merge: true });

      await addDoc(collection(db, "coupon_use"), {
        couponNumber: number,
        staffUid: auth.currentUser ? auth.currentUser.uid : "unknown",
        staffEmail: auth.currentUser ? auth.currentUser.email : "unknown",
        usedAt: serverTimestamp()
      });

      await addDoc(collection(db, "coupon_history"), {
        couponNumber: number,
        action: "used",
        time: serverTimestamp()
      });

      try {
        const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
        audio.play();
      } catch (e) { /* 무시 */ }

      if (navigator.vibrate) {
        navigator.vibrate(200);
      }

      couponInfo.innerHTML = `
        <div class="coupon-detail">
          <div class="success-box">
            <h2>✅ 사용 완료</h2>
            <p>처리가 완료되었습니다.</p>
          </div>
        </div>
      `;

      useCouponNumber.value = "";
      delete useCouponNumber.dataset.token;

      setTimeout(() => {
        couponInfo.innerHTML = "";
        useCouponNumber.focus();
      }, 1500);

    } catch (error) {
      console.error("사용 처리 에러:", error);
      alert("처리 중 오류가 발생했습니다: " + error.message);
      useBtn.disabled = false;
    }
  };
}

// ================================
// QR SCANNER CONTROL
// ================================
if (scanQRBtn) {
  scanQRBtn.onclick = () => {
    if (html5QrCode) {
      stopQRScanner();
      return;
    }

    if (reader) reader.innerHTML = "";
    html5QrCode = new Html5Qrcode("reader");

    html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false
      },
      (decodedText) => {
        const qrData = decodedText.split("|");
        const couponNumber = qrData[0];
        const token = qrData[1] || "";

        useCouponNumber.value = couponNumber;
        if (token) {
          useCouponNumber.dataset.token = token;
        }

        stopQRScanner().then(() => {
          if (checkBtn) checkBtn.click();
        });
      },
      (errorMessage) => { /* 스캔 대기 */ }
    ).catch((err) => {
      console.error("카메라 구동 실패:", err);
      alert("카메라를 켤 수 없습니다.");
    });
  };
}

async function stopQRScanner() {
  if (html5QrCode) {
    try {
      await html5QrCode.stop();
    } catch (e) {
      console.warn("스캐너 중지 에러:", e);
    }
    if (reader) reader.innerHTML = "";
    html5QrCode = null;
  }
}
