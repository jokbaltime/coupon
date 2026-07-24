// ===============================
// 실시간 시계
// ===============================

function updateClock() {

    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    const second = String(now.getSeconds()).padStart(2, "0");

    const text =
        `${year}-${month}-${day} ${hour}:${minute}:${second}`;

    document.getElementById("clock").innerHTML = text;

}

setInterval(updateClock,1000);

updateClock();


// ===============================
// 쿠폰번호 생성
// ===============================

function createCoupon(){

    const now = new Date();

    const number =
    "JT-" +
    now.getFullYear() +
    String(now.getMonth()+1).padStart(2,"0") +
    String(now.getDate()).padStart(2,"0") +
    "-" +
    Math.floor(Math.random()*9000+1000);

    document.getElementById("couponNumber").innerHTML = number;

}

createCoupon();


// ===============================
// 직원 확인
// ===============================

document.getElementById("staffButton").onclick=function(){

    const pin=prompt("직원 PIN을 입력하세요");

    if(pin==="7812"){

        alert("✅ 쿠폰 사용 완료");

    }

    else{

        alert("❌ PIN이 올바르지 않습니다.");

    }

};
