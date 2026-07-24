// ======================================
// JOKBALTIME PREMIUM COUPON v2
// ======================================

// -------------------------------
// 실시간 시계
// -------------------------------

function updateClock() {

    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    const second = String(now.getSeconds()).padStart(2, "0");

    document.getElementById("clock").textContent =
        `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

updateClock();
setInterval(updateClock, 1000);


// -------------------------------
// 쿠폰번호 생성
// -------------------------------

function createCouponNumber() {

    const now = new Date();

    const date =
        String(now.getFullYear()).slice(-2) +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0");

    const random =
        Math.floor(Math.random() * 9000 + 1000);

    document.getElementById("couponNumber").textContent =
        `JT-${date}-${random}`;
}

createCouponNumber();


// -------------------------------
// 메뉴 슬라이드
// -------------------------------

const menuImages = [
    "images/menu1.jpg",
    "images/menu2.jpg",
    "images/menu3.jpg",
    "images/menu4.jpg"
];

let currentImage = 0;

const sliderImage = document.getElementById("sliderImage");
const dots = document.querySelectorAll(".dot");

function changeSlide() {

    currentImage++;

    if (currentImage >= menuImages.length) {

        currentImage = 0;

    }

    sliderImage.style.opacity = "0";

    setTimeout(() => {

        sliderImage.src = menuImages[currentImage];

        sliderImage.style.opacity = "1";

    }, 250);

    dots.forEach(dot => dot.classList.remove("active"));

    dots[currentImage].classList.add("active");

}

setInterval(changeSlide, 3000);


// -------------------------------
// 직원 확인
// -------------------------------

const staffButton = document.getElementById("staffButton");

staffButton.addEventListener("click", function () {

    const pin = prompt("직원 PIN을 입력하세요.");

    if (pin === "7812") {

        alert("✅ 쿠폰 사용이 확인되었습니다.");

    } else {

        alert("❌ PIN이 올바르지 않습니다.");

    }

});
