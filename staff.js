// ======================================
// JOKBALTIME STAFF SYSTEM
// staff.js FIX VERSION
// ======================================

import {
  db,
  auth,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp
} from "./firebase.js";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

console.log("staff.js 정상 실행");

// ======================
// ELEMENTS
// ======================
const ADMIN_EMAIL = "admin@jokbaltime.com";

const loginArea = document.getElementById("loginArea");
const staffArea = document.getElementById("staffArea");
const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");
const couponInput = document.getElementById("couponNumber");
const checkButton = document.getElementById("checkButton");
const useButton = document.getElementById("useButton");
const cancelButton = document.getElementById("cancelButton");
const scanButton = document.getElementById("scanButton");
const resultDiv = document.getElementById("result");
const reader = document.getElementById("reader");
const historyList = document.getElementById("historyList");
const adminArea = document.getElementById("adminArea");
const adminStats = document.getElementById("adminStats");
const adminRequestArea = document.getElementById("adminRequestArea");
const adminHistory = document.getElementById("adminHistory");

let currentUserIsAdmin = false;
let html5QrCode = null;

// ======================
// LOGIN
// ======================
if (loginButton) {
  loginButton.onclick = async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("로그인 성공");
    } catch (error) {
      alert("로그인 실패 : " + error.message);
    }
  };
}

// ======================
// AUTH CHECK
// ======================
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("현재 로그인:", user.email);
    loginArea.style.display = "none";
    staffArea.style.display = "block";

    loadHistory();
    startRequestListener();

    if (user.email === ADMIN_EMAIL) {
      currentUserIsAdmin = true;
      if (adminArea) adminArea.style.display = "block";
      if (adminRequestArea) adminRequestArea.style.display = "block";
      loadAdminStats();
    } else {
      currentUserIsAdmin = false;
      if (adminArea) adminArea.style.display = "none";
    }
  } else {
    loginArea.style.display = "block";
    staffArea.style.display = "none";
    stopScanner();
  }
});

// ======================
// LOGOUT
// ======================
if (logoutButton) {
  logoutButton.onclick = async () => {
    await stopScanner();
    await signOut(auth);
    alert("로그아웃 되었습니다.");
  };
}

// ======================
// REQUEST LISTENER (실시간 요청)
// ======================
function startRequestListener() {
  const list = document.getElementById("requestList");
  if (!list) return;

  const q = query(
    collection(db, "coupon_request"),
    where("status", "==", "waiting")
  );

  onSnapshot(q, (snapshot) => {
    list.innerHTML = "";

    if (snapshot.empty) {
      list.innerHTML = "<p style='color:#888;'>대기 중인 요청이 없습니다.</p>";
      return;
    }

    snapshot.forEach((item) => {
      const data = item.data();
      if (data.requestClosed === true || data.deleted === true) return;

      const div = document.createElement("div");
      div.style.background = "#222";
      div.style.padding = "15px";
      div.style.borderRadius = "8px";
      div.style.marginBottom = "10px";
      div.style.border = "1px solid var(--gold, #d4af37)";

      div.innerHTML = `
        <h3 style="margin:0 0 8px 0; color:#fff;">🔔 쿠폰 요청</h3>
        <p style="margin:0 0 12px 0;">쿠폰번호 : <b>${data.couponNumber}</b></p>
        <button class="approve-btn" style="padding:8px 16px; background:#2e7d32; color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">승인 처리</button>
      `;

      div.querySelector(".approve-btn").onclick = async (e) => {
        const btn = e.target;
        btn.disabled = true;
        btn.innerText = "처리 중...";

        try {
          // 1. 쿠폰 발행 정보 승인 상태로 업데이트
          await updateDoc(doc(db, "coupon_issue", data.couponNumber), {
            approved: true,
            approvedTime: serverTimestamp()
          });

          // 2. 히스토리 기록
          await addDoc(collection(db, "coupon_history"), {
            couponNumber: data.couponNumber,
            action: "approved",
            timestamp: serverTimestamp(),
            staff: auth.currentUser.email
          });

          // 3. 요청 상태 업데이트
          await updateDoc(doc(db, "coupon_request", item.id), {
            status: "approved",
            requestClosed: true,
            approvedTime: serverTimestamp(),
            approvedBy: auth.currentUser.email
          });

          alert("승인 완료되었습니다.");
        } catch (error) {
          btn.disabled = false;
          btn.innerText = "승인 처리";
          alert("승인 오류 : " + error.message);
        }
      };

      list.appendChild(div);
    });
  });
}

// ======================
// COUPON CHECK
// ======================
if (checkButton) {
  checkButton.onclick = async () => {
    const number = couponInput.value.trim();
    if (!number) {
      resultDiv.innerHTML = "쿠폰번호를 입력해주세요.";
      return;
    }

    try {
      const snap = await getDoc(doc(db, "coupon_issue", number));
      if (!snap.exists()) {
        resultDiv.innerHTML = "<span style='color:#ff4444;'>❌ 존재하지 않는 쿠폰</span>";
        return;
      }

      const data = snap.data();
      if (data.used) {
        resultDiv.innerHTML = "<span style='color:#ff4444;'>❌ 이미 사용 완료된 쿠폰</span>";
      } else if (data.approved) {
        resultDiv.innerHTML = "<span style='color:#ffbb33;'>⚠️ 승인 완료된 쿠폰 (결제 진행 가능)</span>";
      } else {
        resultDiv.innerHTML = "<span style='color:#00C851;'>✅ 사용 가능한 쿠폰</span>";
      }
    } catch (error) {
      resultDiv.innerHTML = "조회 오류 : " + error.message;
    }
  };
}

// ======================
// USE COUPON (사용 완료)
// ======================
if (useButton) {
  useButton.onclick = async () => {
    const number = couponInput.value.trim();
    if (!number) {
      alert("쿠폰번호를 입력하세요.");
      return;
    }

    try {
      const ref = doc(db, "coupon_issue", number);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        alert("존재하지 않는 쿠폰입니다.");
        return;
      }

      const data = snap.data();
      if (data.used) {
        alert("이미 사용된 쿠폰입니다.");
        return;
      }

      await updateDoc(ref, {
        used: true,
        usedTime: serverTimestamp()
      });

      await addDoc(collection(db, "coupon_history"), {
        couponNumber: number,
        action: "used",
        timestamp: serverTimestamp(),
        staff: auth.currentUser.email
      });

      resultDiv.innerHTML = "<span style='color:#ff4444;'>❌ 사용 완료 처리됨</span>";
      couponInput.value = "";
      alert("사용 완료 처리되었습니다.");
    } catch (error) {
      alert("사용 처리 오류 : " + error.message);
    }
  };
}

// ======================
// CANCEL COUPON (사용 취소)
// ======================
if (cancelButton) {
  cancelButton.onclick = async () => {
    if (!currentUserIsAdmin) {
      alert("관리자만 취소 권한이 있습니다.");
      return;
    }

    const number = couponInput.value.trim();
    if (!number) {
      alert("쿠폰번호를 입력하세요.");
      return;
    }

    try {
      const ref = doc(db, "coupon_issue", number);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        alert("존재하지 않는 쿠폰입니다.");
        return;
      }

      await updateDoc(ref, {
        used: false,
        usedTime: null,
        approved: false,
        approvedTime: null
      });

      await addDoc(collection(db, "coupon_history"), {
        couponNumber: number,
        action: "cancel",
        timestamp: serverTimestamp(),
        staff: auth.currentUser.email
      });

      resultDiv.innerHTML = "<span style='color:#00C851;'>✅ 사용 가능 상태로 복원됨</span>";
      alert("사용 취소가 완료되었습니다.");
    } catch (error) {
      alert("취소 오류 : " + error.message);
    }
  };
}

// ======================
// QR SCANNER
// ======================
if (scanButton) {
  scanButton.onclick = async () => {
    if (html5QrCode) {
      await stopScanner();
    } else {
      await startScanner();
    }
  };
}

async function startScanner() {
  if (!reader) return;
  reader.style.display = "block";
  html5QrCode = new Html5Qrcode("reader");

  try {
    await html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      async (decodedText) => {
        couponInput.value = decodedText;
        await stopScanner();
        checkButton.click();
      },
      () => {}
    );
  } catch (error) {
    alert("카메라 접근 오류 : " + error.message);
    await stopScanner();
  }
}

async function stopScanner() {
  if (html5QrCode) {
    try {
      await html5QrCode.stop();
      html5QrCode.clear();
    } catch (error) {
      console.log(error);
    }
    html5QrCode = null;
  }
  if (reader) reader.style.display = "none";
}

// ======================
// HISTORY LIST
// ======================
function loadHistory() {
  if (!historyList) return;

  const q = query(
    collection(db, "coupon_history"),
    orderBy("timestamp", "desc")
  );

  onSnapshot(q, (snapshot) => {
    historyList.innerHTML = "";

    if (snapshot.empty) {
      historyList.innerHTML = "<p style='color:#888;'>처리 기록이 없습니다.</p>";
      return;
    }

    snapshot.forEach((item) => {
      const data = item.data();
      const time = data.timestamp ? data.timestamp.toDate().toLocaleString("ko-KR") : "시간 정보 없음";

      const div = document.createElement("div");
      div.style.borderBottom = "1px solid #444";
      div.style.padding = "10px 0";

      div.innerHTML = `
        <b>쿠폰번호</b> : ${data.couponNumber}<br>
        <b>처리구분</b> : ${data.action}<br>
        <b>담당직원</b> : ${data.staff || "-"}<br>
        <b>처리시간</b> : ${time}
      `;
      historyList.appendChild(div);
    });
  });
}

// ======================
// ADMIN STATS
// ======================
async function loadAdminStats() {
  if (!adminStats) return;

  try {
    const q = query(collection(db, "coupon_history"), orderBy("timestamp", "desc"));
    const snap = await getDocs(q);

    let used = 0;
    let cancel = 0;
    let staffData = {};
    let today = new Date().toLocaleDateString("ko-KR");

    snap.forEach((item) => {
      const data = item.data();
      const itemDate = data.timestamp ? data.timestamp.toDate().toLocaleDateString("ko-KR") : "";

      if (itemDate === today) {
        if (data.action === "used") used++;
        if (data.action === "cancel") cancel++;
      }

      if (data.staff) {
        if (!staffData[data.staff]) staffData[data.staff] = { used: 0, cancel: 0 };
        if (data.action === "used") staffData[data.staff].used++;
        if (data.action === "cancel") staffData[data.staff].cancel++;
      }
    });

    let staffHTML = "";
    Object.keys(staffData).forEach((email) => {
      staffHTML += `
        <div style="padding:8px 0; border-bottom:1px solid #333;">
          <b>${email}</b><br>
          사용: ${staffData[email].used}건 | 취소: ${staffData[email].cancel}건
        </div>`;
    });

    adminStats.innerHTML = `
      <h3>📅 오늘 처리 현황</h3>
      <p>사용 완료: <b>${used}</b>건 | 취소: <b>${cancel}</b>건</p>
      <hr style="border-color:#444;">
      <h3>👨‍🍳 직원별 실적</h3>
      ${staffHTML || "<p>실적 데이터가 없습니다.</p>"}
    `;
  } catch (err) {
    console.error("통계 로딩 실패:", err);
  }
}
