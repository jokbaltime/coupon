// ======================================
// login.js
// JOKBAL TIME ADMIN LOGIN
// ======================================

import {
  auth,
  signInWithEmailAndPassword
} from "./firebase.js";

// DOM Elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const result = document.getElementById("result");

// ================================
// LOGIN HANDLER
// ================================
loginBtn.onclick = async () => {
  const emailVal = emailInput.value.trim();
  const passwordVal = passwordInput.value.trim();

  if (!emailVal || !passwordVal) {
    result.innerHTML = "⚠️ 이메일과 비밀번호를 모두 입력해 주세요.";
    result.style.color = "#d32f2f";
    return;
  }

  try {
    loginBtn.disabled = true;
    result.innerHTML = "로그인 시도 중...";
    result.style.color = "#555";

    await signInWithEmailAndPassword(auth, emailVal, passwordVal);

    result.innerHTML = "✅ 로그인 성공! 페이지를 이동합니다.";
    result.style.color = "#2e7d32";

    setTimeout(() => {
      location.href = "admin.html";
    }, 800);

  } catch (error) {
    console.error("로그인 오류:", error);
    loginBtn.disabled = false;
    result.style.color = "#d32f2f";

    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        result.innerHTML = "❌ 이메일 또는 비밀번호가 올바르지 않습니다.";
        break;
      case "auth/invalid-email":
        result.innerHTML = "❌ 유효하지 않은 이메일 형식입니다.";
        break;
      case "auth/too-many-requests":
        result.innerHTML = "❌ 접속 시도가 많아 잠시 후 다시 시도해 주세요.";
        break;
      default:
        result.innerHTML = "❌ 로그인 실패 (" + error.code + ")";
    }
  }
};

// 엔터키 로그인 지원
passwordInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    loginBtn.click();
  }
});
