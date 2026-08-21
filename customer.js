// ======================================
// customer.js
// JOKBAL TIME CUSTOMER COUPON SYSTEM
// FIX VERSION (INTEGRATED) + SEND-TO-STAFF
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
const validPeriod = document.getElementById("validPeriod");
const qrCode = document.getElementById("qrcode");
const sendBtn = document.getElementById("sendBtn");
const reserveDate = document.getElementById("reserveDate");
const reserveTime = document.getElementById("reserveTime");
const reservePeople = document.getElementById("reservePeople");
const reserveBtn = document.getElementById("reserveBtn");
const reserveResult = document.getElementById("reserveResult");

let couponCreating = false;
let currentUnsubscribe = null; // 실시간 수신기 해제용

// 직원 전달 버튼용 현재 쿠폰 정보
let currentCouponNumber = null;
let currentToken = null;

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
    // 저장된 쿠폰이 아직 유효한지 먼저 확인
    try {
      const savedSnap = await getDoc(doc(db, "coupons", savedCoupon));

      if (savedSnap.exists()) {
        const savedData = savedSnap.data();
        const isUsedUp = savedData.status === "used" || (savedData.useCount || 0) >= (savedData.maxUseCount || 1);
        const isExpired = savedData.status === "expired";

        if (!isUsedUp && !isExpired) {
          // 아직 사용 가능한 쿠폰이면 그대로 재사용
          return savedCoupon;
        }
        // 사용완료/만료된 쿠폰이면 지우고 아래에서 새로 발급
        localStorage.removeItem("myCoupon");
      } else {
        localStorage.removeItem("myCoupon");
      }
    } catch (e) {
      console.warn("기존 쿠폰 확인 실패, 저장된 쿠폰 유지:", e);
      return savedCoupon;
    }
  }

  // 관리자가 지정한 "대표 쿠폰(자동발급 기준)" 불러오기
  let template = null;
  try {
    const templateSnap = await getDoc(doc(db, "settings", "activeTemplate"));
    if (templateSnap.exists()) template = templateSnap.data();
  } catch (e) {
    console.warn("대표 쿠폰 설정 로드 실패:", e);
  }

  // 대표 쿠폰의 사용 종료일이 지났으면 자동발급 중단
  if (template && template.endDate) {
    const today = new Date().toISOString().split("T")[0];
    if (today > template.endDate) {
      throw new Error("EVENT_ENDED");
    }
  }

  const newCouponNumber = "JBT-" + Date.now().toString().slice(-8);
  const token = crypto.randomUUID();

  const couponData = {
    couponNumber: newCouponNumber,
    customerId: getCustomerId(),
    title: template?.title || "첫 방문 할인 쿠폰",
    discount: template?.discount ?? 10,
    maxUseCount: template?.maxUseCount || 1,
    useCount: 0,
    status: "issued",
    notice: template?.notice || "족발타임 방문 감사 쿠폰입니다.",
    image: template?.image || "",
    startDate: template?.startDate || new Date().toISOString().split("T")[0],
    endDate: template?.endDate || "2099-12-31",
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
      disableSendBtn();
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

    if (validPeriod) {
      validPeriod.innerHTML = `사용기간 : <b>${data.startDate || "-"} ~ ${data.endDate || "-"}</b>`;
    }

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
      disableSendBtn();
      return;
    }

    if (data.status === "used") {
      result.innerHTML = "❌ 이미 사용 완료된 쿠폰입니다.";
      requestBtn.disabled = true;
      clearQr();
      disableSendBtn();
      return;
    }

    // 정상 사용 가능한 경우
    result.innerHTML = "✅ 사용 가능한 쿠폰입니다.";
    requestBtn.disabled = false;

    // 관리자 스캐너용 형식으로 QR 생성 (쿠폰번호|토큰)
    renderQr(`${data.couponNumber}|${token}`);

    // 직원 전달 버튼 활성화
    currentCouponNumber = data.couponNumber;
    currentToken = token;
    enableSendBtn();
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
// SEND TO STAFF (공유 / 클립보드 복사)
// ================================
function enableSendBtn() {
  if (sendBtn) sendBtn.disabled = false;
}
function disableSendBtn() {
  currentCouponNumber = null;
  currentToken = null;
  if (sendBtn) sendBtn.disabled = true;
}

if (sendBtn) {
  sendBtn.disabled = true;

  sendBtn.onclick = async () => {
    if (!currentCouponNumber || !currentToken) return;

    const originalText = sendBtn.textContent;
    sendBtn.disabled = true;
    sendBtn.textContent = "전달 중...";

    try {
      // 직원 승인 요청 목록(coupon_requests)에 기록
      // → staff.html의 "승인 요청"에 실시간으로 표시됨
      await addDoc(collection(db, "coupon_requests"), {
        couponNumber: currentCouponNumber,
        token: currentToken,
        status: "waiting",
        createdAt: serverTimestamp()
      });

      sendBtn.textContent = "✅ 직원에게 전달했어요";
      setTimeout(() => {
        sendBtn.textContent = originalText;
        sendBtn.disabled = false;
      }, 2500);
    } catch (err) {
      console.error("전달 실패:", err);
      sendBtn.textContent = originalText;
      sendBtn.disabled = false;
      alert("전달에 실패했어요. QR을 보여주세요.");
    }
  };
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
      if (error.message === "EVENT_ENDED") {
        result.innerHTML = "😢 현재 진행 중인 쿠폰 이벤트가 없습니다.";
      } else {
        result.innerHTML = "❌ 쿠폰 발급 오류";
      }
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

// ================================
// 방문예약
// ================================
if (reserveBtn) {
  reserveBtn.onclick = async () => {
    const date = reserveDate.value;
    const time = reserveTime.value;
    const people = Number(reservePeople.value);

    if (!date) {
      reserveResult.textContent = "날짜를 선택해 주세요.";
      return;
    }
    if (!time) {
      reserveResult.textContent = "시간을 선택해 주세요.";
      return;
    }
    if (!people || people < 1) {
      reserveResult.textContent = "인원수를 입력해 주세요.";
      return;
    }

    reserveBtn.disabled = true;
    reserveResult.textContent = "예약 신청 중...";

    try {
      await addDoc(collection(db, "reservations"), {
        couponNumber: currentCouponNumber || couponNumberInput.value.trim() || null,
        customerId: getCustomerId(),
        date: date,
        time: time,
        people: people,
        status: "requested",
        createdAt: serverTimestamp()
      });

      reserveResult.textContent = "✅ 예약 신청이 접수되었습니다. 매장에서 확인 후 연락드릴게요.";
      reserveDate.value = "";
      reserveTime.value = "";
      reservePeople.value = "";
    } catch (err) {
      console.error("예약 신청 오류:", err);
      reserveResult.textContent = "❌ 예약 신청에 실패했어요. 잠시 후 다시 시도해 주세요.";
    } finally {
      reserveBtn.disabled = false;
    }
  };
}
