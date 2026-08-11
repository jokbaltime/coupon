// ======================================
// coupons.js
// JOKBAL TIME COUPON LIST (페이지네이션 20개씩)
// ======================================

import {
  db,
  auth,
  collection,
  doc,
  getDoc,
  deleteDoc,
  addDoc,
  onSnapshot,
  serverTimestamp
} from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const listBox = document.getElementById("listBox");
const searchInput = document.getElementById("searchInput");
const couponList = document.getElementById("couponList");
const pageInfo = document.getElementById("pageInfo");
const pagination = document.getElementById("pagination");
const logoutBtn = document.getElementById("logoutBtn");

const PAGE_SIZE = 20;
let allCoupons = [];
let currentFilter = "all";
let currentSearch = "";
let currentPage = 1;

// ================================
// AUTH (admin.js와 동일한 권한 체크)
// ================================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "login.html";
    return;
  }

  const userSnap = await getDoc(doc(db, "users", user.uid));

  if (!userSnap.exists() || (userSnap.data().role !== "staff" && userSnap.data().role !== "admin")) {
    alert("관리자 권한이 없습니다.");
    await signOut(auth);
    return;
  }

  listBox.classList.remove("hidden");
  loadCoupons();
});

if (logoutBtn) {
  logoutBtn.onclick = async () => {
    await signOut(auth);
  };
}

// ================================
// LOAD
// ================================
function loadCoupons() {
  onSnapshot(collection(db, "coupons"), (snapshot) => {
    allCoupons = [];
    snapshot.forEach((item) => {
      allCoupons.push({ id: item.id, ...item.data() });
    });
    currentPage = 1;
    render();
  });
}

function statusText(data) {
  switch (data.status) {
    case "issued": return "✅ 사용 가능";
    case "waiting": return "⏳ 승인 대기";
    case "approved": return "✅ 승인 완료";
    case "used": return "❌ 사용 완료";
    case "expired": return "🔴 기간 만료";
    default: return data.status || "-";
  }
}

// ================================
// FILTER + SEARCH
// ================================
function getFiltered() {
  let list = [...allCoupons].sort((a, b) => {
    const at = a.updatedAt?.seconds || a.createdAt?.seconds || 0;
    const bt = b.updatedAt?.seconds || b.createdAt?.seconds || 0;
    return bt - at;
  });

  if (currentFilter !== "all") {
    list = list.filter((c) => c.status === currentFilter);
  }

  if (currentSearch) {
    const kw = currentSearch.toLowerCase();
    list = list.filter((c) =>
      (c.couponNumber || "").toLowerCase().includes(kw) ||
      (c.title || "").toLowerCase().includes(kw)
    );
  }

  return list;
}

// ================================
// RENDER (현재 페이지 20개만)
// ================================
function render() {
  const filtered = getFiltered();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  couponList.innerHTML = "";

  if (pageItems.length === 0) {
    couponList.innerHTML = "<p style='color:#888; text-align:center; padding:30px 0;'>쿠폰이 없습니다.</p>";
  }

  pageItems.forEach((data) => {
    const div = document.createElement("div");
    div.className = "coupon-card";
    div.innerHTML = `
      <p><b>${data.couponNumber}</b></p>
      <p>${data.title || "-"}</p>
      <p>상태 : ${statusText(data)}</p>
      <p>할인 : ${data.discount || 0}%</p>
      <button class="viewEditBtn">조회/수정</button>
      <button class="deleteBtn">삭제</button>
    `;

    div.querySelector(".viewEditBtn").onclick = () => {
      // admin.html에서 이 번호로 자동 조회되도록 이동
      location.href = "admin.html?search=" + encodeURIComponent(data.couponNumber);
    };

    div.querySelector(".deleteBtn").onclick = async () => {
      if (!confirm("삭제하시겠습니까?")) return;

      const snap = await getDoc(doc(db, "coupons", data.id));
      if (!snap.exists()) {
        alert("쿠폰을 찾을 수 없습니다.");
        return;
      }

      const couponData = snap.data();
      if (couponData.status === "used") {
        alert("사용 완료 쿠폰은 삭제할 수 없습니다.");
        return;
      }

      await deleteDoc(doc(db, "coupons", data.id));
      await addDoc(collection(db, "coupon_history"), {
        couponNumber: couponData.couponNumber,
        action: "deleted",
        admin: auth.currentUser?.email || "-",
        time: serverTimestamp()
      });

      alert("삭제 완료");
    };

    couponList.appendChild(div);
  });

  pageInfo.textContent = `전체 ${filtered.length}개 · ${currentPage} / ${totalPages} 페이지`;
  renderPagination(totalPages);
}

// ================================
// PAGINATION (1 2 3 4 5 ... 식 번호 버튼)
// ================================
function renderPagination(totalPages) {
  pagination.innerHTML = "";
  if (totalPages <= 1) return;

  const addBtn = (label, page, disabled = false, active = false) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.disabled = disabled;
    if (active) btn.classList.add("active");
    btn.onclick = () => {
      currentPage = page;
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    pagination.appendChild(btn);
  };

  const addDots = () => {
    const span = document.createElement("span");
    span.textContent = "···";
    span.className = "dots";
    pagination.appendChild(span);
  };

  addBtn("‹", Math.max(1, currentPage - 1), currentPage === 1);

  const windowSize = 5;
  let startPage = Math.max(1, currentPage - Math.floor(windowSize / 2));
  let endPage = Math.min(totalPages, startPage + windowSize - 1);
  startPage = Math.max(1, endPage - windowSize + 1);

  if (startPage > 1) {
    addBtn("1", 1);
    if (startPage > 2) addDots();
  }

  for (let p = startPage; p <= endPage; p++) {
    addBtn(String(p), p, false, p === currentPage);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) addDots();
    addBtn(String(totalPages), totalPages);
  }

  addBtn("›", Math.min(totalPages, currentPage + 1), currentPage === totalPages);
}

// ================================
// FILTER BUTTONS
// ================================
document.querySelectorAll("#filterRow button").forEach((btn) => {
  btn.onclick = () => {
    document.querySelectorAll("#filterRow button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    currentPage = 1;
    render();
  };
});

// ================================
// SEARCH
// ================================
searchInput.addEventListener("input", () => {
  currentSearch = searchInput.value.trim();
  currentPage = 1;
  render();
});
