// ======================================
// reservations.js
// JOKBAL TIME RESERVATION LIST
// ======================================

import {
  db,
  auth,
  collection,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  serverTimestamp
} from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const listBox = document.getElementById("listBox");
const reservationList = document.getElementById("reservationList");
const logoutBtn = document.getElementById("logoutBtn");

let allReservations = [];
let currentFilter = "upcoming";

// ================================
// AUTH
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
  loadReservations();
});

if (logoutBtn) {
  logoutBtn.onclick = async () => {
    await signOut(auth);
  };
}

// ================================
// LOAD
// ================================
function loadReservations() {
  onSnapshot(collection(db, "reservations"), (snapshot) => {
    allReservations = [];
    snapshot.forEach((item) => {
      allReservations.push({ id: item.id, ...item.data() });
    });
    render();
  });
}

function sortKey(r) {
  return `${r.date || "9999-99-99"}T${r.time || "99:99"}`;
}

function getFiltered() {
  const now = new Date();
  const nowKey = now.toISOString().split("T")[0] + "T" + now.toTimeString().slice(0,5);

  let list = [...allReservations];

  if (currentFilter === "upcoming") {
    list = list.filter((r) => r.status !== "cancelled" && sortKey(r) >= nowKey);
  } else if (currentFilter !== "all") {
    list = list.filter((r) => r.status === currentFilter);
  }

  list.sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  return list;
}

function statusLabel(status) {
  switch (status) {
    case "requested": return { text: "⏳ 신청됨", cls: "status-requested" };
    case "confirmed": return { text: "✅ 확정", cls: "status-confirmed" };
    case "cancelled": return { text: "❌ 취소됨", cls: "status-cancelled" };
    default: return { text: status || "-", cls: "status-requested" };
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr + "T00:00:00");
  const days = ["일","월","화","수","목","금","토"];
  return `${dateStr} (${days[d.getDay()]})`;
}

// ================================
// RENDER
// ================================
function render() {
  const filtered = getFiltered();
  reservationList.innerHTML = "";

  if (filtered.length === 0) {
    reservationList.innerHTML = "<p style='color:#888; text-align:center; padding:30px 0;'>예약이 없습니다.</p>";
    return;
  }

  filtered.forEach((r) => {
    const st = statusLabel(r.status);
    const div = document.createElement("div");
    div.className = "res-card";
    div.innerHTML = `
      <div class="when">${formatDate(r.date)} ${r.time || ""}</div>
      <p>👥 인원 : <b>${r.people || "-"}명</b></p>
      <p>🎟 쿠폰번호 : ${r.couponNumber || "-"}</p>
      <p>신청시간 : ${r.createdAt ? r.createdAt.toDate().toLocaleString() : "-"}</p>
      <span class="status-tag ${st.cls}">${st.text}</span>
      <div class="actions">
        ${r.status !== "confirmed" ? '<button class="confirm-btn">✅ 확정</button>' : ""}
        ${r.status !== "cancelled" ? '<button class="cancel-btn2">↩️ 취소</button>' : ""}
        <button class="delete-btn2">🗑 삭제</button>
      </div>
    `;

    const confirmBtn = div.querySelector(".confirm-btn");
    if (confirmBtn) {
      confirmBtn.onclick = async () => {
        await setDoc(doc(db, "reservations", r.id), { status: "confirmed", confirmedAt: serverTimestamp() }, { merge: true });
      };
    }

    const cancelBtn = div.querySelector(".cancel-btn2");
    if (cancelBtn) {
      cancelBtn.onclick = async () => {
        if (!confirm("이 예약을 취소 처리할까요?")) return;
        await setDoc(doc(db, "reservations", r.id), { status: "cancelled", cancelledAt: serverTimestamp() }, { merge: true });
      };
    }

    div.querySelector(".delete-btn2").onclick = async () => {
      if (!confirm("이 예약 기록을 완전히 삭제할까요?")) return;
      await deleteDoc(doc(db, "reservations", r.id));
    };

    reservationList.appendChild(div);
  });
}

// ================================
// FILTER BUTTONS
// ================================
document.querySelectorAll("#filterRow button").forEach((btn) => {
  btn.onclick = () => {
    document.querySelectorAll("#filterRow button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  };
});
