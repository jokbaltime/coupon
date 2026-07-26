// ======================================
// STAFF.JS - 모든 updateDoc을 setDoc(..., { merge: true })로 안전 교체
// ======================================
import {
  db,
  auth,
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from "./firebase.js";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// DOM 요소 참조
const loginArea = document.getElementById("loginArea");
const staffArea = document.getElementById("staffArea");
const loginBtn = document.getElementById("loginButton");
const logoutBtn = document.getElementById("logoutButton");
const couponInput = document.getElementById("couponNumber");
const checkBtn = document.getElementById("checkButton");
const useBtn = document.getElementById("useButton");
const resultDiv = document.getElementById("result");

// 1. 로그인 / 로그아웃 처리
if (loginBtn) {
  loginBtn.onclick = async () => {
    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("password").value.trim();
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) {
      alert("로그인 실패: " + e.message);
    }
  };
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    if (loginArea) loginArea.style.display = "none";
    if (staffArea) staffArea.style.display = "block";
    startRequestListener();
  } else {
    if (loginArea) loginArea.style.display = "block";
    if (staffArea) staffArea.style.display = "none";
  }
});

if (logoutBtn) {
  logoutBtn.onclick = () => signOut(auth);
}

// 2. 실시간 요청 목록 수신 및 승인 처리
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
      list.innerHTML = "<p style='color:#888; text-align:center;'>대기 중인 요청이 없습니다.</p>";
      return;
    }

    snapshot.forEach((item) => {
      const data = item.data();

      if (data.requestClosed) return;

      const div = document.createElement("div");
      div.style.cssText = "background:#222; padding:15px; border-radius:8px; margin-bottom:10px; border:1px solid #d4af37;";

      div.innerHTML = `
        <p style="margin:0 0 10px 0; color:#fff;">쿠폰번호: <b style="color:#d4af37;">${data.couponNumber}</b></p>
        <button class="app-btn" style="width:100%; padding:10px; background:#2e7d32; color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">✅ 승인하기</button>
      `;

      div.querySelector(".app-btn").onclick = async (e) => {
        const btn = e.target;
        btn.disabled = true;
        btn.innerText = "승인 처리 중...";

        try {
          const num = data.couponNumber;
          const staffEmail = auth.currentUser ? auth.currentUser.email : "staff";

          // ⭐ 문서가 존재하지 않아도 새로 만들며 승인 처리 (No document 에러 원천 차단)
          await setDoc(doc(db, "coupon_issue", num), {
            approved: true,
            approvedTime: serverTimestamp()
          }, { merge: true });

          await setDoc(doc(db, "coupon_request", item.id), {
            status: "approved",
            requestClosed: true,
            approvedBy: staffEmail,
            approvedTime: serverTimestamp()
          }, { merge: true });

          await addDoc(collection(db, "coupon_history"), {
            couponNumber: num,
            action: "approved",
            timestamp: serverTimestamp(),
            staff: staffEmail
          });

// 새 쿠폰 생성
const newCoupon =
"JT" + Date.now();

await setDoc(
  doc(db, "coupon_issue", newCoupon),
  {
    couponNumber:newCoupon,
    used:false,
    approved:false,
    createdTime:serverTimestamp()
  }
);
          
         if(couponInput){
    couponInput.value = num;
}
          alert(`[${num}] 쿠폰이 정상적으로 승인 처리되었습니다.`);
        } catch (e) {
          btn.disabled = false;
          btn.innerText = "✅ 승인하기";
          alert("승인 처리 중 오류 발생: " + e.message);
        }
      };

      list.appendChild(div);
    });
  });
}

// 3. 직원 직접 쿠폰 조회
if (checkBtn) {
  checkBtn.onclick = async () => {
    const num = couponInput.value.trim();
    if (!num) return alert("쿠폰 번호를 입력하세요.");

    const snap = await getDoc(doc(db, "coupon_issue", num));
    if (!snap.exists()) {
      if (resultDiv) resultDiv.innerText = "❌ 존재하지 않는 쿠폰";
      return;
    }
    const d = snap.data();
    if (d.used) {
      if (resultDiv) resultDiv.innerText = "❌ 이미 사용된 쿠폰";
    } else if (d.approved) {
      if (resultDiv) resultDiv.innerText = "⚠️ 승인 완료된 쿠폰 (사용 처리 가능)";
    } else {
      if (resultDiv) resultDiv.innerText = "✅ 사용 가능 (미승인 상태)";
    }
  };
}

// 4. 직원 사용 완료 처리
if (useBtn) {
  useBtn.onclick = async () => {
    const num = couponInput.value.trim();
    if (!num) return alert("쿠폰 번호를 입력하세요.");

    try {
      const staffEmail = auth.currentUser ? auth.currentUser.email : "staff";

      // ⭐ 사용 완료 처리도 setDoc merge로 안전하게 변경
      await setDoc(doc(db, "coupon_issue", num), {
        used: true,
        usedTime: serverTimestamp()
      }, { merge: true });

      await addDoc(collection(db, "coupon_history"), {
        couponNumber: num,
        action: "used",
        timestamp: serverTimestamp(),
        staff: staffEmail
      });

    alert(
`[${num}] 사용 완료\n새 쿠폰 : ${newCoupon}`
);
      couponInput.value = "";
      if (resultDiv) resultDiv.innerText = "";
    } catch (e) {
      alert("사용 처리 오류: " + e.message);
    }
  };
}
