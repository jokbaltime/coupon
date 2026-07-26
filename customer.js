// ======================================
// CUSTOMER.JS - 통합 고객용 로직
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

// 1. 로컬스토리지 또는 입력창에서 현재 쿠폰 번호 가져오기
function getCurrentCouponNumber() {
  const fromInput = couponInput ? couponInput.value.trim() : "";
  const fromStorage = localStorage.getItem("JT_COUPON_NUMBER") || "";
  return fromInput || fromStorage;
}

// 2. 실시간 상태 감지 (직원이 승인/사용 처리 시 화면 자동 업데이트)
let unsubscribe = null;

function listenToCouponStatus(couponNum) {
  if (!couponNum) return;
  
  // 기존 리스너가 있다면 해제 (중복 감지 방지)
  if (unsubscribe) unsubscribe();

  const issueRef = doc(db, "coupon_issue", couponNum);
  
  unsubscribe = onSnapshot(issueRef, (snap) => {
    if (!snap.exists()) {
      if (statusNotice) statusNotice.innerHTML = "❌ 존재하지 않는 쿠폰 번호입니다.";
      return;
    }

    const data = snap.data();

    if (data.used) {
      if (statusNotice) {
        statusNotice.innerHTML = "<b style='color:#ff5252;'>❌ 사용 완료된 쿠폰입니다.</b>";
      }
      if (requestBtn) requestBtn.disabled = true;
    } else if (data.approved) {
      if (statusNotice) {
        statusNotice.innerHTML = "<b style='color:#4caf50;'>🎉 직원 승인 완료! (매장 직원에게 이 화면을 보여주세요)</b>";
      }
      if (requestBtn) {
        requestBtn.innerText = "✅ 승인 완료됨";
        requestBtn.disabled = true;
      }
    } else {
      if (statusNotice) {
        statusNotice.innerHTML = "ℹ️ 승인 대기 중이거나 승인 요청이 필요합니다.";
      }
      if (requestBtn) {
        requestBtn.innerText = "직원 승인 요청";
        requestBtn.disabled = false;
      }
    }
  });
}

// 페이지 로드 시 기존 저장된 쿠폰이 있다면 실시간 감지 시작
const initialCoupon = getCurrentCouponNumber();
if (initialCoupon) {
  if (couponInput && !couponInput.value) couponInput.value = initialCoupon;
  listenToCouponStatus(initialCoupon);
}

// 입력창 변경 시 실시간 감지 대상 업데이트
if (couponInput) {
  couponInput.addEventListener("input", (e) => {
    const num = e.target.value.trim();
    if (num) {
      localStorage.setItem("JT_COUPON_NUMBER", num);
      listenToCouponStatus(num);
    }
  });
}

// 3. 직원 승인 요청 버튼 클릭 이벤트
if (requestBtn) {
  requestBtn.onclick = async () => {
    const couponNum = getCurrentCouponNumber();

    if (!couponNum) {
      alert("쿠폰 번호를 입력해 주세요.");
      return;
    }

    requestBtn.disabled = true;
    requestBtn.innerText = "요청 전송 중...";

    try {
      // Step A: 발급 DB에서 현재 쿠폰 상태 사전 점검
      const issueRef = doc(db, "coupon_issue", couponNum);
      const issueSnap = await getDoc(issueRef);

      if (!issueSnap.exists()) {
        alert("유효하지 않은 쿠폰 번호입니다.");
        requestBtn.disabled = false;
        requestBtn.innerText = "직원 승인 요청";
        return;
      }

      const issueData = issueSnap.data();
      if (issueData.used) {
        alert("이미 사용 완료된 쿠폰입니다.");
        return;
      }
      if (issueData.approved) {
        alert("이미 승인이 완료된 쿠폰입니다.");
        return;
      }

      // Step B: coupon_request 컬렉션에 쿠폰번호를 문서 ID로 저장
      // (직원이 승인시 이 문서를 deleteDoc 처리함)
      await setDoc(doc(db, "coupon_request", couponNum), {
        couponNumber: couponNum,
        status: "waiting",
        createdTime: serverTimestamp()
      });

      alert("직원에게 승인 요청을 보냈습니다. 잠시만 기다려주세요.");
      
      // 승인 요청을 보낸 후에도 실시간 상태를 계속 감지하도록 설정
      listenToCouponStatus(couponNum);

    } catch (error) {
      console.error("요청 실패:", error);
      alert("요청 처리 중 오류가 발생했습니다: " + error.message);
      requestBtn.disabled = false;
      requestBtn.innerText = "직원 승인 요청";
    }
  };
}

// ======================================
// CUSTOMER.JS - 사용된 쿠폰 승인 요청 재차단 FIX
// ======================================
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
      // 1. 요청을 보내기 전, 발급 DB(coupon_issue)에서 현재 쿠폰 상태를 실시간 조회
      const issueRef = doc(db, "coupon_issue", couponNum);
      const issueSnap = await getDoc(issueRef);

      if (!issueSnap.exists()) {
        alert("❌ 존재하지 않는 유효하지 않은 쿠폰 번호입니다.");
        requestBtn.disabled = false;
        requestBtn.innerText = "직원 승인 요청";
        return;
      }

      const issueData = issueSnap.data();

      // 🛑 [차단 1] 이미 사용 완료된 쿠폰인 경우
      if (issueData.used) {
        alert("❌ 이미 사용 완료된 쿠폰입니다. 다시 승인 요청할 수 없습니다.");
        requestBtn.disabled = true;
        requestBtn.innerText = "❌ 사용 완료됨";
        return;
      }

      // 🛑 [차단 2] 이미 직원 승인이 완료된 쿠폰인 경우
      if (issueData.approved) {
        alert("🎉 이미 직원 승인이 완료된 쿠폰입니다.");
        requestBtn.disabled = true;
        requestBtn.innerText = "✅ 승인 완료됨";
        return;
      }

      // 2. 검증을 통과한 순수 '대기 중' 쿠폰만 요청 생성
      await setDoc(doc(db, "coupon_request", couponNum), {
        couponNumber: couponNum,
        status: "waiting",
        createdTime: serverTimestamp()
      });

      alert("직원에게 승인 요청을 보냈습니다. 잠시만 기다려주세요.");
      
      // 상태 감지 시작
      listenToStatus(couponNum);

    } catch (error) {
      console.error("요청 오류:", error);
      alert("요청 처리 중 오류가 발생했습니다: " + error.message);
      requestBtn.disabled = false;
      requestBtn.innerText = "직원 승인 요청";
    }
  };
}
