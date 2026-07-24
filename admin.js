// =============================
// 관리자 로그인
// =============================

const loginButton = document.getElementById("loginButton");
const loginBox = document.querySelector(".login-box");
const adminPanel = document.getElementById("adminPanel");

loginButton.addEventListener("click", () => {

    const pin = document.getElementById("adminPin").value;

    if (pin === "7812") {

        loginBox.classList.add("hidden");
        adminPanel.classList.remove("hidden");

        loadData();

    } else {

        alert("PIN이 올바르지 않습니다.");

    }

});

// =============================
// 저장
// =============================

const saveButton = document.getElementById("saveButton");

saveButton.addEventListener("click", () => {

    localStorage.setItem("discount",
        document.getElementById("discount").value);

    localStorage.setItem("title",
        document.getElementById("title").value);

    localStorage.setItem("notice",
        document.getElementById("notice").value);

    alert("저장되었습니다.");

});

// =============================
// 불러오기
// =============================

function loadData(){

    document.getElementById("discount").value =
        localStorage.getItem("discount") || "20";

    document.getElementById("title").value =
        localStorage.getItem("title") || "메인메뉴";

    document.getElementById("notice").value =
        localStorage.getItem("notice") ||
        "매장 내 식사만 가능\n포장 · 배달 제외";

}
