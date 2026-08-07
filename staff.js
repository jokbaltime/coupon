// ======================================
// staff.js
// JOKBAL TIME STAFF SYSTEM (FIXED)
// ======================================

import {
  db,
  auth,
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "./firebase.js";

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

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBox.classList.add("hidden");
    staffBox.classList.remove("hidden");
    loadRequests();
  } else {
    loginBox.classList.remove("hidden");
    staffBox.classList.add("hidden");
    stopQRScanner();
  }
});

logoutBtn.onclick = async () => {
  await signOut(auth);
};

// ================================
// REQUEST LIST
// ================================
function loadRequests() {
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
        <button class="approve-btn">승인</button>
      `;

      div.querySelector(".approve-btn").onclick = async () => {
        await approveCoupon(data.couponNumber);
      };

      requestList.appendChild(div);
    }
  });
}

// ================================
// APPROVE
// ================================
async function approveCoupon(number) {
  try {
    const couponRef = doc(db, "coupons", number);
    await updateDoc(couponRef, {
      status: "approved",
      approvedAt: serverTimestamp()
    });

    await updateDoc(doc(db, "coupon_requests", number), {
      status: "approved"
    });

    await addDoc(collection(db, "coupon_history"), {
      couponNumber: number,
      action: "approved",
      time: serverTimestamp()
    });

    alert("승인이 완료되었습니다.");
  } catch (error) {
    console.error("승인 처리 중 오류:", error);
    alert("승인 처리 실패");
  }
}

// ================================
// CHECK COUPON
// ================================
checkBtn.onclick = async () => {
  const number = useCouponNumber.value.trim();

  if (!number) {
    alert("쿠폰번호를 입력해 주세요.");
    return;
  }

  try {
    const snap = await getDoc(doc(db, "coupons", number));

    if (!snap.exists()) {
      couponInfo.innerHTML = "❌ 존재하지 않는 쿠폰입니다.";
      useBtn.disabled = true;
      return;
    }

    const data = snap.data();
    const qrToken = useCouponNumber.dataset.token;

    // QR 토큰 검증 (쿠폰에 토큰이 부여된 경우 검증 실행)
    if (data.token && (!qrToken || data.token !== qrToken)) {
      couponInfo.innerHTML = `
        <div class="coupon-detail">
          <h3>❌ QR 인증 실패</h3>
          <p>유효하지 않거나 QR 인증을 거치지 않은 쿠폰입니다.</p>
        </div>
      `;
      useBtn.disabled = true;
      return;
    }

    // 자동 만료 처리
    const today = new Date();

    if (data.endDate && data.status !== "used") {
      const endDate = new Date(data.endDate);
      endDate.setHours(23, 59, 59, 999);

      if (today > endDate) {
        await updateDoc(doc(db, "coupons", number), {
          status: "expired"
        });
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
        useBtn.disabled = true;
        useBtn.textContent = "기간 만료";
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
        <div class="qr-ok">🟢 ${data.token ? "QR 인증 완료" : "쿠폰 확인 완료"}</div>
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

    // 사용 가능 상태 제어 (issued 또는 approved 허용)
    const isUsableState = data.status === "issued" || data.status === "approved";
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
  } catch (err) {
    console.error("쿠폰 조회 중 에러:", err);
    couponInfo.innerHTML = "❌ 쿠폰 조회 중 오류 발생";
    useBtn.disabled = true;
  }
};

// ================================
// USE COMPLETE
// ================================
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
      alert("QR 인증이 필요합니다.");
      return;
    }

    if (data.status === "used" || (data.useCount || 0) >= 1) {
      alert("이미 사용 완료된 쿠폰입니다.");
      return;
    }

    useBtn.disabled = true;

    await updateDoc(doc(db, "coupons", number), {
      status: "used",
      useCount: 1,
      usedAt: serverTimestamp()
    });

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

    // 효과음 & 진동
    try {
      const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
      audio.play();
    } catch (e) { /* 오디오 재생 차단 무시 */ }

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
    alert("처리 중 오류가 발생했습니다.");
    useBtn.disabled = false;
  }
};

// ================================
// QR SCANNER CONTROL
// ================================
scanQRBtn.onclick = () => {
  if (html5QrCode) {
    stopQRScanner();
    return;
  }

  reader.innerHTML = "";
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
        checkBtn.click();
      });
    },
    (errorMessage) => { /* 스캔 대기 무시 */ }
  ).catch((err) => {
    console.error("카메라 구동 실패:", err);
    alert("카메라를 켤 수 없습니다.");
  });
};

async function stopQRScanner() {
  if (html5QrCode) {
    try {
      await html5QrCode.stop();
    } catch (e) {
      console.warn("스캐너 중지 에러:", e);
    }
    reader.innerHTML = "";
    html5QrCode = null;
  }
}
