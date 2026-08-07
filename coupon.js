// ======================================
// coupon.js
// JOKBAL TIME USER COUPON SYSTEM
// ======================================

import {
  db,
  doc,
  getDoc
} from "./firebase.js";

// DOM Elements
const couponInput = document.getElementById("couponInput");
const searchBtn = document.getElementById("searchBtn");
const resultCard = document.getElementById("resultCard");
const qrcodeDiv = document.getElementById("qrcode");

let qrcodeObj = null;

// ================================
// SEARCH COUPON
// ================================
searchBtn.onclick = async () => {
  const number = couponInput.value.trim();

  if (!number) {
    alert("쿠폰번호를 입력해 주세요.");
    return;
  }

  try {
    const couponRef = doc(db, "coupons", number);
    const snap = await getDoc(couponRef);

    if (!snap.exists()) {
      resultCard.innerHTML = `
        <h3 style="color:#c62828;">❌ 쿠폰을 찾을 수 없습니다.</h3>
        <p>쿠폰 번호를 다시 확인해 주세요.</p>
      `;
      clearQr();
      return;
    }

    const data = snap.data();
    renderCoupon(data);
  } catch (error) {
    console.error("쿠폰 조회 중 오류 발생:", error);
    alert("쿠폰 조회 실패. 다시 시도해 주세요.");
  }
};

// 엔터키 검색 지원
couponInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

// ================================
// RENDER COUPON & QR
// ================================
function renderCoupon(data) {
  const today = new Date();
  const endDate = data.endDate ? new Date(data.endDate) : null;
  
  let isExpired = false;
  if (endDate) {
    // 종료일 당일 23:59:59까지 유효하도록 처리
    endDate.setHours(23, 59, 59, 999);
    if (today > endDate) isExpired = true;
  }

  const isUsed = data.status === "used" || (data.useCount || 0) >= (data.maxUseCount || 1);
  const isWaiting = data.status === "waiting";

  let statusHtml = "";
  let canUse = false;

  if (isUsed) {
    statusHtml = `<p class="status" style="color:#c62828;">❌ 이미 사용된 쿠폰입니다.</p>`;
  } else if (isExpired || data.status === "expired") {
    statusHtml = `<p class="status" style="color:#757575;">🔴 사용 기간이 만료되었습니다.</p>`;
  } else if (isWaiting) {
    statusHtml = `<p class="status" style="color:#f57c00;">⏳ 승인 대기 중입니다.</p>`;
  } else {
    statusHtml = `<p class="status" style="color:#2e7d32;">✅ 사용 가능한 쿠폰입니다.</p>`;
    canUse = true;
  }

  // 쿠폰 카드 HTML 구성
  resultCard.innerHTML = `
    <h3>${data.title || "JOKBAL TIME 쿠폰"}</h3>
    <div class="discount">${data.discount || 0}%</div>
    ${statusHtml}
    
    <div class="date">
      <p><b>쿠폰번호:</b> ${data.couponNumber}</p>
      <p><b>유효기간:</b> ${data.startDate || "상시"} ~ ${data.endDate || "상시"}</p>
    </div>

    ${data.notice ? `<p class="guide" style="margin-top:15px;">📌 ${data.notice}</p>` : ""}
  `;

  // QR 코드 생성 (사용 가능하고 토큰이 있는 경우만)
  if (canUse && data.token) {
    const qrText = `${data.couponNumber}|${data.token}`;
    generateQr(qrText);
  } else {
    clearQr();
  }
}

// ================================
// QR CODE GENERATOR
// ================================
function generateQr(text) {
  qrcodeDiv.innerHTML = "";
  qrcodeObj = new QRCode(qrcodeDiv, {
    text: text,
    width: 180,
    height: 180,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}

function clearQr() {
  qrcodeDiv.innerHTML = "<p style='color:#999; font-size:14px;'>사용 가능한 쿠폰 조회 시 QR이 표시됩니다.</p>";
}
