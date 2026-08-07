// ======================================
// customer.js
// JOKBAL TIME CUSTOMER COUPON SYSTEM
// FIX VERSION (INTEGRATED)
// ======================================

import {
  db,
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  updateDoc
} from "./firebase.js";

// ================================
// DOM ELEMENTS
// ================================
const couponNumberInput = document.getElementById("couponNumber");
const requestBtn = document.getElementById("requestBtn");
const result = document.getElementById("result");
const couponTitle = document.getElementById("couponTitle");
const discount = document.getElementById("discount");
const notice = document.getElementById("notice");
const mainImage = document.getElementById("mainImage");
const qrCode = document.getElementById("qrcode");

let couponCreating = false;
let currentUnsubscribe = null; // 실시간 수신기 해제용

// ================================
// CUSTOMER ID GENERATOR
// ================================
function getCustomerId() {
  let id = localStorage.getItem("customerId");
  if (!id) {
    id = "USER-" + Date.now() + "-" + Math.random().toString(36).substring(2, 8);
    localStorage.setItem("customerId", id);
  }
  return id;
}

// ================================
// AUTO COUPON CREATE
// ================================
async function createAutoCoupon() {
  const savedCoupon = localStorage.getItem("myCoupon");
  if (savedCoupon) {
    return savedCoupon;
  }

  const newCouponNumber = "JBT-" + Date.now().toString().slice(-8);
  const token = crypto.randomUUID();

  const couponData = {
    couponNumber: newCouponNumber,
    customerId: getCustomerId(),
    title: "첫 방문 할인 쿠폰",
    discount: 10,
    maxUseCount: 1,
    useCount: 0,
    status: "issued",
    notice: "족발타임 방문 감사 쿠폰입니다.",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "2099-12-31",
    token: token,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(doc(db, "coupons", newCouponNumber), couponData);

  await addDoc(collection(db, "event_logs"), {
    event: "jokbal",
    customerId: getCustomerId(),
    couponNumber: newCouponNumber,
    createdAt: serverTimestamp()
  });

  return newCouponNumber;
}

// ================================
// REALTIME COUPON LOAD & LISTEN
// ================================
function loadAndListenCoupon(number) {
  if (!number) return;

  // 기존 구독 해제
  if (currentUnsubscribe) {
    currentUnsubscribe();
  }

  const couponRef = doc(db, "coupons", number);

  currentUnsubscribe = onSnapshot(couponRef, async (snapshot) => {
    if (!snapshot.exists()) {
      result.innerHTML = "❌ 존재하지 않는 쿠폰입니다.";
      clearQr();
      return;
    }

    const data = snapshot.data();
    
    // 토큰이 없는 기존 쿠폰 보정
    let token = data.token;
    if (!token) {
      token = crypto.randomUUID();
      await updateDoc(couponRef, { token: token });
    }

    // UI 정보 업데이트
    couponTitle.innerText = data.title || "족발타임 쿠폰";
    discount.innerText = (data.discount || 0) + "%";
    notice.innerText = data.notice || "";

    if (data.image) {
      mainImage.src = data.image;
    }

    // 만료일 검사
    const today = new Date().toISOString().split("T")[0];
    const isExpired = data.startDate && data.endDate && (today < data.startDate || today > data.endDate);

    if (isExpired || data.status === "expired") {
      result.innerHTML = "⛔ 사용 기간 만료";
      requestBtn.disabled = true;
      clearQr();
      return;
    }

    if (data.status === "used") {
      result.innerHTML = "❌ 이미 사용 완료된 쿠폰입니다.";
      requestBtn.disabled = true;
      clearQr();
      return;
    }

    // 정상 사용 가능한 경우
    result.innerHTML = "✅ 사용 가능한 쿠폰입니다.";
    requestBtn.disabled = false;

    // 관리자 스캐너용 형식으로 QR 생성 (쿠폰번호|토큰)
    renderQr(`${data.couponNumber}|${token}`);
  });
}

function renderQr(text) {
  qrCode.innerHTML = "";
  new QRCode(qrCode, {
    text: text,
    width: 240,
    height: 240,
    correctLevel: QRCode.CorrectLevel.H
  });
}

function clearQr() {
  qrCode.innerHTML = "<p style='color:#888; padding:20px 0;'>QR 코드를 표시할 수 없습니다.</p>";
}

// ================================
// EVENT LISTENERS
// ================================
couponNumberInput.addEventListener("change", () => {
  const number = couponNumberInput.value.trim();
  loadAndListenCoupon(number);
});

requestBtn.onclick = async () => {
  const number = couponNumberInput.value.trim();
  if (!number) {
    alert("쿠폰번호를 입력해 주세요.");
    return;
  }

  const snap = await getDoc(doc(db, "coupons", number));
  if (!snap.exists()) {
    alert("존재하지 않는 쿠폰입니다.");
    return;
  }

  const data = snap.data();
  if (data.status === "used") {
    result.innerHTML = "❌ 이미 사용 완료된 쿠폰입니다.";
    return;
  }

  result.innerHTML = "📱 QR 코드를 직원에게 보여주세요";
};

// ================================
// AUTO LOAD FROM URL & LOCALSTORAGE
// ================================
async function autoLoadCoupon() {
  const params = new URLSearchParams(window.location.search);
  const coupon = params.get("coupon");
  const event = params.get("event");

  if (coupon) {
    couponNumberInput.value = coupon;
    loadAndListenCoupon(coupon);
  } else if (event) {
    if (couponCreating) return;
    couponCreating = true;

    try {
      const newCoupon = await createAutoCoupon();
      couponNumberInput.value = newCoupon;
      localStorage.setItem("myCoupon", newCoupon);
      result.innerHTML = "🎉 이벤트 쿠폰이 발급되었습니다.";
      loadAndListenCoupon(newCoupon);
    } catch (error) {
      console.error(error);
      result.innerHTML = "❌ 쿠폰 발급 오류";
    } finally {
      couponCreating = false;
    }
  } else {
    const savedCoupon = localStorage.getItem("myCoupon") || localStorage.getItem("eventCoupon");
    if (savedCoupon) {
      couponNumberInput.value = savedCoupon;
      loadAndListenCoupon(savedCoupon);
    }
  }
}

autoLoadCoupon();
