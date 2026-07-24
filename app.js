// ======================================
// JOKBALTIME PREMIUM COUPON
// CUSTOMER APP
// ======================================


import {
    db,
    doc,
    setDoc,
    serverTimestamp,
    onSnapshot
} from "./firebase.js";


// ======================================
// 실시간 시계
// ======================================

function updateClock(){

    const now = new Date();


    const year =
    now.getFullYear();

    const month =
    String(now.getMonth()+1).padStart(2,"0");

    const day =
    String(now.getDate()).padStart(2,"0");


    const hour =
    String(now.getHours()).padStart(2,"0");

    const minute =
    String(now.getMinutes()).padStart(2,"0");

    const second =
    String(now.getSeconds()).padStart(2,"0");


    document.getElementById("clock").textContent =
    `${year}-${month}-${day} ${hour}:${minute}:${second}`;

}


updateClock();

setInterval(updateClock,1000);



// ======================================
// 쿠폰번호 생성
// ======================================

function createCouponNumber(){

    const now = new Date();


    const date =

    String(now.getFullYear()).slice(-2) +

    String(now.getMonth()+1).padStart(2,"0") +

    String(now.getDate()).padStart(2,"0");


    const random =

    Math.floor(Math.random()*9000+1000);



    document.getElementById("couponNumber").textContent =

    `JT-${date}-${random}`;

}


createCouponNumber();



// ======================================
// Firebase 쿠폰 설정 실시간 적용
// ======================================


const couponSettingRef =
doc(
    db,
    "coupon",
    "setting"
);



onSnapshot(
    couponSettingRef,
    (snapshot)=>{


        if(snapshot.exists()){


            const data =
            snapshot.data();



            const title =
            document.getElementById("couponTitle");


            const discount =
            document.getElementById("discountValue");


            const notice =
            document.getElementById("couponNotice");



            if(title){

                title.textContent =
                data.title;

            }


            if(discount){

                discount.textContent =
                data.discount + "%";

            }



            if(notice){

                notice.innerHTML =
                data.notice.replace(/\n/g,"<br>");

            }


        }


    }
);



// ======================================
// 메뉴 슬라이드
// ======================================


const menuImages = [

    "images/menu1.jpg",
    "images/menu2.jpg",
    "images/menu3.jpg",
    "images/menu4.jpg"

];


let currentImage = 0;


const sliderImage =
document.getElementById("sliderImage");


const dots =
document.querySelectorAll(".dot");



function changeSlide(){


    currentImage++;


    if(currentImage >= menuImages.length){

        currentImage = 0;

    }



    sliderImage.style.opacity="0";



    setTimeout(()=>{


        sliderImage.src =
        menuImages[currentImage];


        sliderImage.style.opacity="1";


    },250);



    dots.forEach(dot=>{

        dot.classList.remove("active");

    });



    if(dots[currentImage]){

        dots[currentImage].classList.add("active");

    }


}



setInterval(changeSlide,3000);




// ======================================
// 직원 쿠폰 확인
// ======================================


const staffButton =
document.getElementById("staffButton");



staffButton.addEventListener(
"click",
async function(){



    const pin =
    prompt("직원 PIN을 입력하세요.");



    if(pin !== "7812"){


        alert(
            "❌ PIN이 올바르지 않습니다."
        );


        return;

    }



    const couponNumber =

    document.getElementById("couponNumber").textContent;



    await setDoc(

        doc(
            db,
            "coupon_use",
            couponNumber
        ),

        {

            couponNumber:
            couponNumber,


            status:
            "사용완료",


            usedTime:
            serverTimestamp()

        }

    );



    alert(

        "✅ 쿠폰 사용 완료\n\n" +

        couponNumber

    );


});
