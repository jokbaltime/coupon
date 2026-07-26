// ======================================
// CUSTOMER.JS - 재요청 및 중복 전송 완벽 차단 FIX
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

// 2. 실시간 상태 감지 (coupon_issue 및 coupon_request 함께 감시)
let unsubscribeIssue = null;
let unsubscribeReq = null;

function listenToCouponStatus(couponNum) {
  if (!couponNum) return;
  
  if (unsubscribeIssue) unsubscribeIssue();
  if (unsubscribeReq) unsubscribeReq();

  const issueRef = doc(db, "coupon_issue", couponNum);
  const reqRef = doc(db, "coupon_request", couponNum);
  
  // A. coupon_issue 실시간 감지
  unsubscribeIssue = onSnapshot(issueRef, (snap) => {
    if (!snap.exists()) {
      if (statusNotice) statusNotice.innerHTML = "❌ 존재하지 않는 유효하지 않은 쿠폰입니다.";
      if (requestBtn) {
        requestBtn.innerText = "직원 승인 요청";
        requestBtn.disabled = false;
      }
      return;
    }

    const data = snap.data();

    // 🛑 사용 완료된 경우
    if (data.used) {
      if (statusNotice) statusNotice.innerHTML = "<b style='color:#ff5252;'>❌ 이미 사용 완료된 쿠폰입니다.</b>";
      if (requestBtn) {
        requestBtn.innerText = "❌ 사용 완료됨";
        requestBtn.disabled = true;
      }
    } 
    // 🛑 직원이 승인 완료한 경우
    else if (data.approved) {

  if (statusNotice) {
    statusNotice.innerHTML =
    `
    <b style='color:#4caf50;'>
    🎉 승인 완료
    </b>
    <br>
    직원에게 쿠폰을 보여주세요.
    `;
  }

  if (requestBtn) {
    requestBtn.innerText = "✅ 승인 완료됨";
    requestBtn.disabled = true;
  }

}
  });

  // B. coupon_request 실시간 감지 (대기 중인 요청이 있는지 체크)
  unsubscribeReq = onSnapshot(reqRef, (snap) => {
    if (snap.exists()) {
      const reqData = snap.data();
      if (reqData.status === "waiting" || !reqData.requestClosed) {
        if (statusNotice) statusNotice.innerHTML = "<b style='color:#ff9800;'>⏳ 직원 승인 대기 중입니다...</b>";
        if (requestBtn) {
          requestBtn.innerText = "⏳ 승인 대기 중";
          requestBtn.disabled = true;
        }
      } else if (reqData.status === "approved" || reqData.requestClosed) {
        if (statusNotice) statusNotice.innerHTML = "<b style='color:#4caf50;'>🎉 직원 승인 완료!</b>";
        if (requestBtn) {
          requestBtn.innerText = "✅ 승인 완료됨";
          requestBtn.disabled = true;
        }
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

// 5. 직원 승인 요청 버튼 이벤트 (삼중 검증 후 전송 차단)
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
      // Step A: 발급 쿠폰(coupon_issue) 상태 검증
      const issueSnap = await getDoc(doc(db, "coupon_issue", couponNum));
      if (!issueSnap.exists()) {
        alert("❌ 존재하지 않는 유효하지 않은 쿠폰 번호입니다.");
        requestBtn.disabled = false;
        requestBtn.innerText = "직원 승인 요청";
        return;
      }

      const issueData = issueSnap.data();
      if (issueData.used) {
        alert("❌ 이미 사용 완료된 쿠폰입니다.");
        requestBtn.innerText = "❌ 사용 완료됨";
        return;
      }
      if (issueData.approved) {
        alert("🎉 이미 직원 승인이 완료된 쿠폰입니다.");
        requestBtn.innerText = "✅ 승인 완료됨";
        return;
      }

      // Step B: 이미 요청(coupon_request)이 존재하는지 2차 검증
      const reqSnap = await getDoc(doc(db, "coupon_request", couponNum));
      if (reqSnap.exists()) {
        const reqData = reqSnap.data();
        if (reqData.status === "waiting" && !reqData.requestClosed) {
          alert("⏳ 이미 승인 요청 후 대기 중인 쿠폰입니다.");
          requestBtn.innerText = "⏳ 승인 대기 중";
          return;
        }
        if (reqData.status === "approved" || reqData.requestClosed) {
          alert("🎉 이미 승인이 처리된 요청입니다.");
          requestBtn.innerText = "✅ 승인 완료됨";
          return;
        }
      }

      // Step C: 모든 검증을 통과한 경우에만 신규 요청 생성
      await setDoc(doc(db, "coupon_request", couponNum), {
        couponNumber: couponNum,
        status: "waiting",
        requestClosed: false,
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
