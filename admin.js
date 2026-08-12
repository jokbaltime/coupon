// ======================================
// admin.js
// JOKBAL TIME COUPON ADMIN SYSTEM
// FIX VERSION (INTEGRATED) + PASTE(번호|토큰) 지원
// ======================================

import {
  db,
  auth,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  runTransaction
} from "./firebase.js";

import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ================================
// DOM ELEMENTS
// ================================
const adminBox = document.getElementById("adminBox");
const logoutBtn = document.getElementById("logoutBtn");

const couponNumber = document.getElementById("couponNumber");
const couponTitle = document.getElementById("couponTitle");
const discount = document.getElementById("discount");
const maxUseCount = document.getElementById("maxUseCount");
const notice = document.getElementById("notice");
const imageUrl = document.getElementById("imageUrl");
const startDate = document.getElementById("startDate");
const endDate = document.getElementById("endDate");
const saveCouponBtn = document.getElementById("saveCouponBtn");
const setAsTemplate = document.getElementById("setAsTemplate");
const templateStatus = document.getElementById("templateStatus");
const cleanupOldBtn = document.getElementById("cleanupOldBtn");

const requestList = document.getElementById("requestList");

const searchCoupon = document.getElementById("searchCoupon");
const searchBtn = document.getElementById("searchBtn");
const searchTitle = document.getElementById("searchTitle");
const searchTitleBtn = document.getElementById("searchTitleBtn");
const couponResult = document.getElementById("couponResult");

const useCouponBtn = document.getElementById("useCouponBtn");
const cancelUseBtn = document.getElementById("cancelUseBtn");
const deleteCouponBtn = document.getElementById("deleteCouponBtn");

const editButtons = document.getElementById("editButtons");
const editCouponBtn = document.getElementById("editCouponBtn");
const updateCouponBtn = document.getElementById("updateCouponBtn");

const historyList = document.getElementById("historyList");

const totalCoupon = document.getElementById("totalCoupon");
const waitingCount = document.getElementById("waitingCount");
const approvedCount = document.getElementById("approvedCount");
const usedCount = document.getElementById("usedCount");
const expiredCount = document.getElementById("expiredCount");
const todayIssued = document.getElementById("todayIssued");
const todayUsed = document.getElementById("todayUsed");
const uniqueCustomers = document.getElementById("uniqueCustomers");
const revisitCount = document.getElementById("revisitCount");

const scanQrBtn = document.getElementById("scanQrBtn");
const reader = document.getElementById("reader");

let currentUserRole = "";

// ================================
// AUTHENTICATION
// ================================
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userSnap = await getDoc(doc(db, "users", user.uid));

    if (!userSnap.exists()) {
      alert("사용자 권한 정보가 없습니다.");
      await signOut(auth);
      return;
    }

    const userData = userSnap.data();
    currentUserRole = userData.role;

    if (userData.role !== "staff" && userData.role !== "admin") {
      alert("관리자 권한이 없습니다.");
      await signOut(auth);
      return;
    }

    adminBox.classList.remove("hidden");

    await checkExpiredCoupons();
    await fixOldCouponTokens();

    loadDashboard();
    loadHistory();
    loadRequests();

    // coupons.html에서 "조회/수정"으로 넘어온 경우 자동 조회
    const urlParams = new URLSearchParams(window.location.search);
    const presetSearch = urlParams.get("search");
    if (presetSearch) {
      searchCoupon.value = presetSearch;
      setTimeout(() => searchBtn.click(), 300);
    }

    if (currentUserRole === "staff") {
      if (saveCouponBtn) saveCouponBtn.style.display = "none";
      if (cleanupOldBtn) cleanupOldBtn.style.display = "none";
    }
  } else {
    location.href = "login.html";
  }
});

logoutBtn.onclick = async () => {
  await signOut(auth);
};

// ================================
// EXPIRED COUPON CHECK
// ================================
async function checkExpiredCoupons() {
  const snapshot = await getDocs(collection(db, "coupons"));
  const today = new Date();

  for (const item of snapshot.docs) {
    const data = item.data();

    if (!data.endDate || data.status === "used" || data.status === "expired") {
      continue;
    }

    const itemEndDate = new Date(data.endDate);

    if (today > itemEndDate) {
      await updateDoc(doc(db, "coupons", item.id), {
        status: "expired",
        expiredAt: serverTimestamp()
      });
      console.log("기간 만료 처리:", data.couponNumber);
    }
  }
}

// ================================
// DASHBOARD
// ================================
function loadDashboard() {
  onSnapshot(collection(db, "coupons"), (snapshot) => {
    let issued = 0;
    let waiting = 0;
    let approved = 0;
    let used = 0;
    let expired = 0;
    let todayIssuedCount = 0;
    let todayUsedCount = 0;

    const todayStr = new Date().toDateString();
    const customerCounts = new Map(); // customerId → 발급 받은 횟수

    snapshot.forEach((item) => {
      const data = item.data();

      if (data.status === "waiting") waiting++;
      if (data.status === "approved") approved++;
      if (data.status === "used") used++;
      if (data.status === "expired") expired++;

      issued++;

      if (data.createdAt && data.createdAt.toDate && data.createdAt.toDate().toDateString() === todayStr) {
        todayIssuedCount++;
      }
      if (data.usedAt && data.usedAt.toDate && data.usedAt.toDate().toDateString() === todayStr) {
        todayUsedCount++;
      }

      // customerId가 있는 쿠폰 = 고객이 직접(자동발급으로) 받은 쿠폰
      if (data.customerId) {
        customerCounts.set(data.customerId, (customerCounts.get(data.customerId) || 0) + 1);
      }
    });

    // 순 방문 고객 수 = 서로 다른 customerId 개수
    // 재방문 발급 = 2개 이상 받은 고객들의 (받은 횟수 - 1) 합
    let revisit = 0;
    customerCounts.forEach((count) => {
      if (count > 1) revisit += (count - 1);
    });

    if (totalCoupon) totalCoupon.innerText = issued;
    if (waitingCount) waitingCount.innerText = waiting;
    if (approvedCount) approvedCount.innerText = approved;
    if (usedCount) usedCount.innerText = used;
    if (expiredCount) expiredCount.innerText = expired;
    if (todayIssued) todayIssued.innerText = todayIssuedCount;
    if (todayUsed) todayUsed.innerText = todayUsedCount;
    if (uniqueCustomers) uniqueCustomers.innerText = customerCounts.size;
    if (revisitCount) revisitCount.innerText = revisit;
  });
}

// ================================
// SAVE COUPON
// ================================
saveCouponBtn.onclick = async () => {
  const number = couponNumber.value.trim();

  if (!number) {
    alert("쿠폰번호 입력");
    return;
  }

  const token = crypto.randomUUID();

  const couponData = {
    couponNumber: number,
    title: couponTitle.value.trim(),
    discount: Number(discount.value),
    maxUseCount: Number(maxUseCount.value),
    useCount: 0,
    status: "issued",
    notice: notice.value.trim(),
    image: imageUrl.value.trim(),
    startDate: startDate.value,
    endDate: endDate.value,
    createdAt: serverTimestamp(),
    token: token,
    updatedAt: serverTimestamp()
  };

  await setDoc(doc(db, "coupons", number), couponData);

  // "대표 쿠폰으로 지정"이 체크된 경우, 자동발급 기준 설정에도 동일하게 저장
  if (setAsTemplate && setAsTemplate.checked) {
    await setDoc(doc(db, "settings", "activeTemplate"), {
      title: couponData.title,
      discount: couponData.discount,
      maxUseCount: couponData.maxUseCount,
      notice: couponData.notice,
      image: couponData.image,
      startDate: couponData.startDate,
      endDate: couponData.endDate,
      sourceCoupon: number,
      updatedAt: serverTimestamp()
    });
    setAsTemplate.checked = false;
  }

  alert("쿠폰 저장 완료");
};

// ================================
// 현재 대표 쿠폰(자동발급 기준) 실시간 표시 + 종료 임박 경고
// ================================
if (templateStatus) {
  onSnapshot(doc(db, "settings", "activeTemplate"), (snap) => {
    if (!snap.exists()) {
      templateStatus.textContent = "⚠️ 현재 지정된 대표 쿠폰이 없습니다 (자동발급 안 됨)";
      templateStatus.style.color = "#e57373";
      return;
    }

    const t = snap.data();
    let ddayText = "";
    let warn = false;

    if (t.endDate) {
      const end = new Date(t.endDate);
      end.setHours(23, 59, 59, 999);
      const diffDays = Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        ddayText = " · ⚠️ 이미 종료됨 (자동발급 중단 상태)";
        warn = true;
      } else if (diffDays === 0) {
        ddayText = " · ⚠️ 오늘 종료";
        warn = true;
      } else if (diffDays <= 3) {
        ddayText = ` · ⚠️ 종료까지 D-${diffDays}`;
        warn = true;
      } else {
        ddayText = ` · 종료까지 D-${diffDays}`;
      }
    }

    templateStatus.textContent = `현재 대표 쿠폰: ${t.sourceCoupon} (${t.title || "-"} / ${t.discount || 0}% / ~${t.endDate || "-"})${ddayText}`;
    templateStatus.style.color = warn ? "#ff6b6b" : "#D4AF37";
    templateStatus.style.fontWeight = warn ? "bold" : "normal";
  });
}

// ================================
// 오래된 쿠폰(사용완료/기간만료) 일괄 삭제
// ================================
if (cleanupOldBtn) {
  cleanupOldBtn.onclick = async () => {
    if (!confirm("3개월 지난 사용완료/기간만료 쿠폰을 모두 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    cleanupOldBtn.disabled = true;
    cleanupOldBtn.textContent = "정리 중...";

    try {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const snapshot = await getDocs(collection(db, "coupons"));
      let deletedCount = 0;

      for (const item of snapshot.docs) {
        const data = item.data();

        if (data.status !== "used" && data.status !== "expired") {
          continue;
        }

        const refDate =
          (data.usedAt && data.usedAt.toDate && data.usedAt.toDate()) ||
          (data.expiredAt && data.expiredAt.toDate && data.expiredAt.toDate()) ||
          (data.updatedAt && data.updatedAt.toDate && data.updatedAt.toDate()) ||
          null;

        if (refDate && refDate < threeMonthsAgo) {
          await deleteDoc(doc(db, "coupons", item.id));
          deletedCount++;
        }
      }

      alert(`${deletedCount}개의 오래된 쿠폰을 삭제했습니다.`);
    } catch (err) {
      console.error("오래된 쿠폰 정리 중 오류:", err);
      alert("정리 중 오류가 발생했습니다: " + err.message);
    } finally {
      cleanupOldBtn.disabled = false;
      cleanupOldBtn.textContent = "🗑️ 오래된 쿠폰 일괄 삭제";
    }
  };
}

// ================================
// 검색어 정규화: "쿠폰번호|토큰" 붙여넣기 지원
// (고객이 customer.html "직원에게 전달하기"로 보낸 텍스트를 그대로 붙여넣었을 때 인식)
// ================================
function normalizeSearchInput() {
  let raw = searchCoupon.value.trim();

  if (raw.includes("|")) {
    const parts = raw.split("|");
    const number = parts[0].trim();
    const token = (parts[1] || "").trim();

    searchCoupon.value = number;
    if (token) {
      searchCoupon.dataset.token = token;
    }
    return number;
  }

  // 번호만 입력한 경우 = 관리자의 일반 조회이므로 이전에 붙여있던 토큰은 제거
  delete searchCoupon.dataset.token;
  return raw;
}

// ================================
// SEARCH COUPON
// ================================
searchBtn.onclick = async () => {
  const keyword = normalizeSearchInput();

  if (!keyword) {
    alert("검색어 입력");
    return;
  }

  let snap = null;

  // 1. 쿠폰번호 전체 검색
  const couponRef = doc(db, "coupons", keyword);
  const couponSnap = await getDoc(couponRef);

  if (couponSnap.exists()) {
    snap = couponSnap;
  }

  // 2. 쿠폰번호 뒷자리 검색
  if (!snap) {
    const result = await getDocs(collection(db, "coupons"));
    result.forEach((docItem) => {
      const coupon = docItem.data();
      if (coupon.couponNumber && coupon.couponNumber.endsWith(keyword)) {
        snap = docItem;
      }
    });
  }

  // 3. 쿠폰명 검색
  if (!snap) {
    const q = query(
      collection(db, "coupons"),
      where("title", ">=", keyword),
      where("title", "<=", keyword + "\uf8ff")
    );
    const titleSnap = await getDocs(q);
    if (!titleSnap.empty) {
      snap = titleSnap.docs[0];
    }
  }

  if (!snap) {
    couponResult.innerHTML = "❌ 쿠폰 없음";
    return;
  }

  const data = snap.data();
  let statusText = "";

  // 폼 채우기
  couponNumber.value = data.couponNumber || "";
  couponTitle.value = data.title || "";
  discount.value = data.discount || 0;
  maxUseCount.value = data.maxUseCount || 1;
  notice.value = data.notice || "";
  imageUrl.value = data.image || "";
  startDate.value = data.startDate || "";
  endDate.value = data.endDate || "";

  if (editButtons) {
    editButtons.classList.remove("hidden");
  }

  if ((data.useCount || 0) >= (data.maxUseCount || 1)) {
    statusText = "❌ 사용 완료";
  } else {
    switch (data.status) {
      case "issued":
        statusText = "✅ 사용 가능";
        break;
      case "waiting":
        statusText = "⏳ 승인 대기";
        break;
      case "approved":
        statusText = "✅ 승인 완료";
        break;
      case "used":
        statusText = "❌ 사용 완료";
        break;
      default:
        statusText = data.status || "-";
    }
  }

  const today = new Date();
  const checkEndDate = data.endDate ? new Date(data.endDate) : null;

  if (checkEndDate && today > checkEndDate && data.status !== "used") {
    statusText = "🔴 기간 만료";
  }

  couponResult.innerHTML = `
    <p>번호 : ${data.couponNumber || "-"}</p>
    <p>제목 : ${data.title || "-"}</p>
    <p>상태 : ${statusText}</p>
    <p>할인 : ${data.discount || 0}%</p>
    <p>사용횟수 : ${data.useCount || 0} / ${data.maxUseCount || 1}</p>
    <p>사용기간 : ${data.startDate || "-"} ~ ${data.endDate || "-"}</p>
  `;

  const qrActionBox = document.createElement("div");
  const providedToken = searchCoupon.dataset.token;
  const tokenMismatch = providedToken && data.token && providedToken !== data.token;

  if (data.status === "used" || (data.useCount || 0) >= (data.maxUseCount || 1)) {
    qrActionBox.innerHTML = "<p style='margin-top:15px;'>❌ 이미 사용 완료된 쿠폰</p>";
  } else if (tokenMismatch) {
    qrActionBox.innerHTML = `
      <div style="background:#fdecea; padding:15px; border-radius:10px; margin-top:20px;">
        <p style="font-weight:bold; color:#c62828;">
          ❌ 인증 실패 — 전달받은 코드가 이 쿠폰과 일치하지 않습니다.
        </p>
      </div>
    `;
  } else {
    qrActionBox.innerHTML = `
      <div style="background:#fff3cd; padding:15px; border-radius:10px; margin-top:20px;">
        <p style="font-weight:bold; color:#856404; margin-bottom:10px;">
          ⚠️ 사용 처리 후 되돌릴 수 있습니다.
        </p>
        <button id="qrUseBtn" style="width:100%; padding:15px; background:#8B0000; color:white; border:none; border-radius:10px; font-size:18px; cursor:pointer;">
          ✅ 쿠폰 사용 처리
        </button>
      </div>
    `;

    qrActionBox.querySelector("#qrUseBtn").onclick = () => {
      useCouponBtn.click();
    };
  }

  couponResult.appendChild(qrActionBox);
};

// ================================
// SEARCH COUPON TITLE
// ================================
searchTitleBtn.onclick = async () => {
  const title = searchTitle.value.trim();

  if (!title) {
    alert("쿠폰명 입력");
    return;
  }

  const q = query(collection(db, "coupons"), where("title", "==", title));
  const snap = await getDocs(q);

  if (snap.empty) {
    couponResult.innerHTML = "❌ 쿠폰 없음";
    return;
  }

  couponResult.innerHTML = "";
  snap.forEach((item) => {
    const data = item.data();
    couponResult.innerHTML += `
      <p>번호 : ${data.couponNumber}</p>
      <p>제목 : ${data.title}</p>
      <p>상태 : ${data.status}</p>
      <p>할인 : ${data.discount}%</p>
      <hr>
    `;
  });
};

// ================================
// USE COUPON
// ================================
useCouponBtn.onclick = async () => {
  const number = searchCoupon.value.trim();

  if (!number) {
    alert("쿠폰번호 입력");
    return;
  }

  const snap = await getDoc(doc(db, "coupons", number));

  if (!snap.exists()) {
    alert("쿠폰 없음");
    return;
  }

  const data = snap.data();

  if (
    data.status === "used" ||
    data.status === "expired" ||
    (data.useCount || 0) >= (data.maxUseCount || 1)
  ) {
    alert("사용할 수 없는 쿠폰입니다.");
    return;
  }

  await runTransaction(db, async (transaction) => {
    const couponRef = doc(db, "coupons", number);
    const couponSnap = await transaction.get(couponRef);

    if (!couponSnap.exists()) {
      throw new Error("쿠폰 없음");
    }

    const couponData = couponSnap.data();

    if (
      couponData.status === "used" ||
      couponData.status === "expired" ||
      (couponData.useCount || 0) >= (couponData.maxUseCount || 1)
    ) {
      throw new Error("ALREADY_USED");
    }

    const nextUseCount = (couponData.useCount || 0) + 1;

    transaction.update(couponRef, {
      status: nextUseCount >= (couponData.maxUseCount || 1) ? "used" : couponData.status,
      useCount: nextUseCount,
      usedAt: serverTimestamp()
    });
  }).catch((err) => {
    if (err.message === "ALREADY_USED") {
      alert("이미 다른 곳에서 처리된 쿠폰입니다.");
    } else {
      alert("처리 중 오류가 발생했습니다.");
    }
    throw err;
  });

  await addDoc(collection(db, "coupon_history"), {
    couponNumber: number,
    action: "used",
    admin: auth.currentUser?.email || "-",
    time: serverTimestamp()
  });

  couponResult.innerHTML = `
    <div style="background:#e8f5e9; padding:25px; border-radius:15px; text-align:center; color:#2e7d32;">
      <h2>✅ 사용 완료</h2>
      <hr style="margin: 15px 0;">
      <p><b>쿠폰번호</b></p>
      <p>${number}</p>
      <p style="margin-top:10px;"><b>처리시간</b></p>
      <p>${new Date().toLocaleString()}</p>
      <hr style="margin: 15px 0;">
      <h3>직원 확인 완료</h3>
    </div>
  `;

  alert("쿠폰 사용 완료");
};

// ================================
// CANCEL USE
// ================================
cancelUseBtn.onclick = async () => {
  const number = searchCoupon.value.trim();

  if (!number) {
    alert("쿠폰번호 입력");
    return;
  }

  await updateDoc(doc(db, "coupons", number), {
    status: "issued",
    token: crypto.randomUUID(),
    useCount: 0,
    usedAt: null,
    cancelledAt: serverTimestamp()
  });

  await addDoc(collection(db, "coupon_history"), {
    couponNumber: number,
    action: "cancelled",
    admin: auth.currentUser?.email || "-",
    time: serverTimestamp()
  });

  alert("사용 취소 완료");
};

// ================================
// DELETE COUPON
// ================================
deleteCouponBtn.onclick = async () => {
  const number = searchCoupon.value.trim();

  if (!number) {
    alert("삭제할 쿠폰번호 입력");
    return;
  }

  const snap = await getDoc(doc(db, "coupons", number));

  if (!snap.exists()) {
    alert("쿠폰 없음");
    return;
  }

  const data = snap.data();

  if (data.status === "used") {
    alert("사용 완료 쿠폰은 삭제 불가");
    return;
  }

  if (!confirm("삭제하시겠습니까?")) {
    return;
  }

  await deleteDoc(doc(db, "coupons", number));

  await addDoc(collection(db, "coupon_history"), {
    couponNumber: number,
    action: "deleted",
    admin: auth.currentUser?.email || "-",
    time: serverTimestamp()
  });

  couponResult.innerHTML = "";
  alert("삭제 완료");
};

// ================================
// UPDATE COUPON
// ================================
if (editCouponBtn) {
  editCouponBtn.onclick = () => {
    const section = document.querySelector("#couponEditSection");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };
}

updateCouponBtn.onclick = async () => {
  const number = couponNumber.value.trim();

  if (!number) {
    alert("쿠폰번호 입력");
    return;
  }

  const snap = await getDoc(doc(db, "coupons", number));

  if (!snap.exists()) {
    alert("쿠폰 없음");
    return;
  }

  const data = snap.data();

  if (data.status === "used") {
    alert("사용 완료 쿠폰 수정 불가");
    return;
  }

  await updateDoc(doc(db, "coupons", number), {
    title: couponTitle.value.trim(),
    discount: Number(discount.value),
    maxUseCount: Number(maxUseCount.value),
    notice: notice.value.trim(),
    image: imageUrl.value.trim(),
    startDate: startDate.value,
    endDate: endDate.value,
    updatedAt: serverTimestamp()
  });

  await addDoc(collection(db, "coupon_history"), {
    couponNumber: number,
    action: "updated",
    admin: auth.currentUser?.email || "-",
    time: serverTimestamp()
  });

  alert("수정 완료");
};

// ================================
// REQUEST LIST (staff.js와 동일한 흐름으로 통일)
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
      div.className = "request-card";

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
        <div style="display:flex; gap:8px; margin-top:10px;">
          <button class="approve-btn" style="flex:1;">✅ 사용 처리</button>
          <button class="cancel-btn" style="flex:1; background:#555;">↩️ 다음에 사용</button>
        </div>
      `;

      div.querySelector(".approve-btn").onclick = async (e) => {
        e.target.disabled = true;
        await processRequestUse(data.couponNumber, data.token, item.id);
        e.target.disabled = false;
      };

      div.querySelector(".cancel-btn").onclick = async (e) => {
        if (!confirm(`쿠폰 [${data.couponNumber}] 요청을 목록에서 지울까요?\n(쿠폰 자체는 그대로 남아있어 나중에 다시 전달하거나 QR로 사용할 수 있어요)`)) {
          return;
        }
        e.target.disabled = true;
        try {
          await setDoc(doc(db, "coupon_requests", item.id), { status: "cancelled" }, { merge: true });
        } catch (err) {
          console.error("요청 취소 중 오류:", err);
          alert("취소 실패: " + err.message);
          e.target.disabled = false;
        }
      };

      requestList.appendChild(div);
    }
  });
}

// ================================
// 승인요청 → 즉시 사용 처리 (토큰 검증 포함)
// ================================
async function processRequestUse(number, token, requestId) {
  try {
    const ref = doc(db, "coupons", number);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      alert("존재하지 않는 쿠폰입니다.");
      return;
    }

    const data = snap.data();

    if (data.token && token && data.token !== token) {
      alert("❌ 인증 실패 — 고객이 전달한 정보와 쿠폰 토큰이 일치하지 않습니다.");
      return;
    }

    if (data.status === "used" || (data.useCount || 0) >= (data.maxUseCount || 1)) {
      alert("이미 사용 완료된 쿠폰입니다.");
      await setDoc(doc(db, "coupon_requests", requestId), { status: "expired" }, { merge: true });
      return;
    }

    if (data.endDate) {
      const today = new Date();
      const endDate = new Date(data.endDate);
      endDate.setHours(23, 59, 59, 999);
      if (today > endDate) {
        alert("사용 기간이 만료된 쿠폰입니다.");
        await setDoc(ref, { status: "expired" }, { merge: true });
        await setDoc(doc(db, "coupon_requests", requestId), { status: "expired" }, { merge: true });
        return;
      }
    }

    if (!confirm(`쿠폰 [${number}] (${data.title || "-"} / ${data.discount || 0}%) 를 사용 처리하시겠습니까?`)) {
      return;
    }

    await setDoc(ref, {
      status: "used",
      useCount: 1,
      usedAt: serverTimestamp()
    }, { merge: true });

    await setDoc(doc(db, "coupon_requests", requestId), { status: "completed" }, { merge: true });

    await addDoc(collection(db, "coupon_history"), {
      couponNumber: number,
      action: "used",
      admin: auth.currentUser?.email || "-",
      time: serverTimestamp()
    });

    alert("✅ 사용 완료 처리되었습니다.");
  } catch (error) {
    console.error("승인요청 처리 중 오류:", error);
    alert("처리 실패: " + error.message);
  }
}

// ================================
// HISTORY
// ================================
function loadHistory() {
  const q = query(collection(db, "coupon_history"), orderBy("time", "desc"), limit(50));

  onSnapshot(q, (snapshot) => {
    historyList.innerHTML = "";

    snapshot.forEach((item) => {
      const data = item.data();
      const div = document.createElement("div");
      div.className = "history-card";
      div.innerHTML = `
        <p>쿠폰 : ${data.couponNumber || "-"}</p>
        <p>처리 : ${data.action || "-"}</p>
        <p>관리자 : ${data.admin || "-"}</p>
        <p>시간 : ${data.time ? data.time.toDate().toLocaleString() : "-"}</p>
        <hr style="margin: 8px 0; border-top: 1px dashed #333;">
      `;
      historyList.appendChild(div);
    });
  });
}

// ================================
// OLD COUPON TOKEN FIX
// ================================
async function fixOldCouponTokens() {
  const snapshot = await getDocs(collection(db, "coupons"));

  for (const item of snapshot.docs) {
    const data = item.data();

    if (!data.token) {
      await updateDoc(doc(db, "coupons", item.id), {
        token: crypto.randomUUID(),
        updatedAt: serverTimestamp()
      });
      console.log("기존 쿠폰 token 추가:", data.couponNumber);
    }
  }
}

// ================================
// QR SCANNER (검증 통과 후에만 결과 표시)
// ================================
scanQrBtn.onclick = async () => {
  const scanner = new Html5Qrcode("reader");

  try {
    await scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      async (decodedText) => {
        await scanner.stop();
        reader.innerHTML = "";

        const qrData = decodedText.split("|");
        const scanCouponNumber = qrData[0];
        const token = qrData[1] || "";

        const snap = await getDoc(doc(db, "coupons", scanCouponNumber));

        if (!snap.exists()) {
          alert("등록되지 않은 쿠폰입니다.");
          return;
        }

        const data = snap.data();

        if (!data.token || data.token !== token) {
          alert("❌ QR 인증 실패 (유효하지 않은 토큰)");
          return;
        }

        // 인증 성공한 경우에만 검색창에 반영하고 결과를 표시
        searchCoupon.value = scanCouponNumber;
        searchCoupon.dataset.token = token;
        searchBtn.click();
      }
    );
  } catch (error) {
    console.error(error);
    alert("QR 카메라 실행 실패");
  }
};
