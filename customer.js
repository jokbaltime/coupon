// ======================================
// CUSTOMER.JS - 고객용 전체 통합 로직
// ======================================
import {
  db,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp
} from "./firebase.js";

// DOM 요소 참조
const couponInput = document.getElementById("couponNumber");
const requestBtn = document.getElementById("staffButton") || document.getElementById("requestButton");
const statusNotice = document.getElementById("result") || document.getElementById("couponNotice");

// 1. 입력창 또는 로컬스토리지에서 쿠폰 번호 가져오기
function getCurrentCouponNumber() {
  const fromInput = couponInput ? couponInput.value.trim() : "";
  const fromStorage = localStorage.getItem("JT_COUPON_NUMBER") || "";
  return fromInput || fromStorage;
}

// 2. 실시간 상태 감지 (직원이 승인/사용 처리 시 화면 및 버튼 상태 자동 변경)
let unsubscribe = null;

function listenToCouponStatus(couponNum) {
  if (!couponNum) return;
  
  if (unsubscribe) unsubscribe();

  const issueRef = doc(db, "coupon_issue", couponNum);
  
  unsubscribe = onSnapshot(issueRef, (snap) => {
    if (!snap.exists()) {
      if (statusNotice) statusNotice.innerHTML = "❌ 존재하지 않는 유효하지 않은 쿠폰입니다.";
      if (requestBtn) {
        requestBtn.innerText = "직원 승인 요청";
        requestBtn.disabled = false;
      }
      return;
    }

    const data = snap.data();

    // A. 이미 사용 완료된 경우
    if (data.used) {
      if (statusNotice) {
        statusNotice.innerHTML = "<b style='color:#ff5252;'>❌ 이미 사용 완료된 쿠폰입니다.</b>";
      }
      if (requestBtn) {
        requestBtn.innerText = "❌ 사용 완료됨";
        requestBtn.disabled = true;
      }
    } 
    // B. 직원이 승인 완료한 경우
    else if (data.approved) {
      if (statusNotice) {
        statusNotice.innerHTML = "<b style='color:#4caf50;'>🎉 직원 승인 완료! (매장 직원에게 이 화면을 보여주세요)</b>";
      }
      if (requestBtn) {
        requestBtn.innerText = "✅ 승인 완료됨";
        requestBtn.disabled = true;
      }
    } 
    // C. 승인 요청이 가능한 상태
    else {
      if (statusNotice) {
        statusNotice.innerHTML = "ℹ️ 승인 요청이 필요합니다.";
      }
      if (requestBtn) {
        requestBtn.innerText = "직원 승인 요청";
        requestBtn.disabled = false;
      }
    }
  });
}

// 3. 페이지 로드 시 초기 상태 감지
const initialCoupon = getCurrentCouponNumber();
if (initialCoupon) {
  if (couponInput && !couponInput.value) couponInput.value = initialCoupon;
  listenToCouponStatus(initialCoupon);
}

// 4. 입력창 변경 시 감지 대상 업데이트
if (couponInput) {
  couponInput.addEventListener("input", (e) => {
    const num = e.target.value.trim();
    if (num) {
      localStorage.setItem("JT_COUPON_NUMBER", num);
      listenToCouponStatus(num);
    }
  });
}

// 5. 직원 승인 요청 버튼 이벤트 (상태 2중 검증 후 요청)
if (requestBtn) {
  requestBtn.onclick = async () => {
    const couponNum = getCurrentCouponNumber();

    if (!couponNum) {
      alert("쿠폰 번호를 입력해 주세요.");
      return;
    }

    requestBtn.disabled = true;
    requestBtn.innerText = "상태 확인 중...";

    try {
      // Step A: 쿠폰 상태 실시간 검증
      const issueRef = doc(db, "coupon_issue", couponNum);
      const issueSnap = await getDoc(issueRef);

      if (!issueSnap.exists()) {
        alert("❌ 존재하지 않는 유효하지 않은 쿠폰 번호입니다.");
        requestBtn.disabled = false;
        requestBtn.innerText = "직원 승인 요청";
        return;
      }

      const issueData = issueSnap.data();

      // [차단 1] 이미 사용 완료된 쿠폰
      if (issueData.used) {
        alert("❌ 이미 사용 완료된 쿠폰입니다. 다시 승인 요청할 수 없습니다.");
        requestBtn.disabled = true;
        requestBtn.innerText = "❌ 사용 완료됨";
        return;
      }

      // [차단 2] 이미 승인 완료된 쿠폰
      if (issueData.approved) {
        alert("🎉 이미 직원 승인이 완료된 쿠폰입니다.");
        requestBtn.disabled = true;
        requestBtn.innerText = "✅ 승인 완료됨";
        return;
      }

      // Step B: 요청 데이터 생성 (쿠폰 번호를 문서 ID로 지정)
      await setDoc(doc(db, "coupon_request", couponNum), {
        couponNumber: couponNum,
        status: "waiting",
        createdTime: serverTimestamp()
      });

      alert("직원에게 승인 요청을 보냈습니다. 잠시만 기다려주세요.");
      
      listenToCouponStatus(couponNum);

    } catch (error) {
      console.error("요청 오류:", error);
      alert("요청 처리 중 오류가 발생했습니다: " + error.message);
      requestBtn.disabled = false;
      requestBtn.innerText = "직원 승인 요청";
    }
  };
}
