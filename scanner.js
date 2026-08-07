// ======================================
// scanner.js
// JOKBAL TIME STAFF SYSTEM (FIXED)
// ======================================

import {
  db,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "./firebase.js";

// DOM Elements
const couponNumberInput = document.getElementById("couponNumber");
const checkBtn = document.getElementById("checkBtn");
const useBtn = document.getElementById("useBtn");
const result = document.getElementById("result");

let currentCoupon = null;
let html5QrCode = null;

// ================================
// COUPON CHECK FUNCTION
// ================================
async function checkCoupon(number) {
  if (!number) {
    alert("쿠폰번호를 입력해 주세요.");
    return;
  }

  // QR 데이터에 토큰이 포함된 경우(쿠폰번호|토큰) 분리
  let targetNumber = number.trim();
  if (targetNumber.includes("|")) {
    targetNumber = targetNumber.split("|")[0];
  }

  couponNumberInput.value = targetNumber;

  try {
    result.innerHTML = "🔍 쿠폰 정보 확인 중...";
    const snap = await getDoc(doc(db, "coupons", targetNumber));

    if (!snap.exists()) {
      result.innerHTML = "❌ 존재하지 않는 쿠폰입니다.";
      useBtn.classList.add("hidden");
      currentCoupon = null;
      return;
    }

    const data = snap.data();

    if (data.status === "used") {
      result.innerHTML = "❌ 이미 사용 완료된 쿠폰입니다.";
      useBtn.classList.add("hidden");
      currentCoupon = null;
      return;
    }

    // 날짜 만료 검사
    const today = new Date().toISOString().split("T")[0];
    if (data.startDate && data.endDate && (today < data.startDate || today > data.endDate)) {
      result.innerHTML = "⛔ 사용 기간이 만료된 쿠폰입니다.";
      useBtn.classList.add("hidden");
      currentCoupon = null;
      return;
    }

    currentCoupon = targetNumber;
    result.innerHTML = `
      ✅ <b>사용 가능 쿠폰</b><br>
      📌 ${data.title || "할인 쿠폰"}<br>
      💰 할인율: <b>${data.discount || 0}%</b>
    `;

    useBtn.classList.remove("hidden");

  } catch (error) {
    console.error("쿠폰 조회 에러:", error);
    result.innerHTML = "❌ 조회 중 오류가 발생했습니다.";
    useBtn.classList.add("hidden");
  }
}

// 버튼 및 입력창 이벤트
checkBtn.onclick = () => {
  const number = couponNumberInput.value.trim();
  checkCoupon(number);
};

couponNumberInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    checkBtn.click();
  }
});

// ================================
// COUPON USE ACTION
// ================================
useBtn.onclick = async () => {
  if (!currentCoupon) return;

  const confirmUse = confirm("해당 쿠폰을 사용 처리하시겠습니까?");
  if (!confirmUse) return;

  try {
    await updateDoc(doc(db, "coupons", currentCoupon), {
      status: "used",
      usedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    result.innerHTML = "🎉 사용 완료 처리되었습니다.";
    useBtn.classList.add("hidden");
    couponNumberInput.value = "";
    currentCoupon = null;

  } catch (error) {
    console.error("사용 처리 에러:", error);
    alert("사용 처리 중 오류가 발생했습니다.");
  }
};

// ================================
// QR CAMERA SCANNER START
// ================================
function startQR() {
  html5QrCode = new Html5Qrcode("reader");

  html5QrCode.start(
    { facingMode: "environment" }, // 후면 카메라 사용
    {
      fps: 10,
      qrbox: { width: 220, height: 220 }
    },
    (qrCodeMessage) => {
      // QR 인식 성공 시 자동으로 조회 실행
      checkCoupon(qrCodeMessage);
    },
    (errorMessage) => {
      // 프레임 디코딩 대기 중 에러 (무시)
    }
  ).catch((err) => {
    console.warn("카메라 구동 실패:", err);
    result.innerHTML = "📷 카메라를 연결할 수 없어 수동 입력 모드로 동작합니다.";
  });
}

// 스크립트 로드 시 즉시 카메라 실행
startQR();
