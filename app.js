// ======================================
// JOKBALTIME CUSTOMER APP
// FIREBASE COUPON ISSUE v5
// ======================================


import {

    db,
    doc,
    setDoc,
    onSnapshot

} from "./firebase.js";




// =============================
// 쿠폰 설정 위치
// =============================

const couponRef =
doc(
    db,
    "coupon",
    "setting"
);





// =============================
// 쿠폰 실시간 반영
// =============================


onSnapshot(
couponRef,
(snapshot)=>{


    if(snapshot.exists()){


        const data =
        snapshot.data();



        const title =
        document.getElementById(
            "couponTitle"
        );


        const discount =
        document.getElementById(
            "discountValue"
        );


        const notice =
        document.getElementById(
            "couponNotice"
        );



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
            data.notice.replace(
                /\n/g,
                "<br>"
            );

        }


    }


});









// =============================
// 쿠폰번호 생성 + Firebase 저장
// =============================


async function createCouponNumber(){


    const now =
    new Date();



    const date =

    String(
        now.getFullYear()
    )
    .slice(-2)

    +

    String(
        now.getMonth()+1
    )
    .padStart(2,"0")

    +

    String(
        now.getDate()
    )
    .padStart(2,"0");




    const random =

    Math.floor(
        Math.random()*9000+1000
    );




    const number =

    `JT-${date}-${random}`;





    const couponNumber =
    document.getElementById(
        "couponNumber"
    );



    if(couponNumber){

        couponNumber.textContent =
        number;

    }




    // Firebase 저장 위치

    const issueRef =
    doc(
        db,
        "coupon_issue",
        number
    );





    await setDoc(

        issueRef,

        {


            couponNumber:
            number,


            createdTime:
            new Date(),


            used:false


        }

    );



}




// =============================
// 쿠폰번호 유지 발급
// =============================


async function createCouponNumber(){


    let savedNumber =
    localStorage.getItem(
        "jokbaltime_coupon"
    );



    const couponNumber =
    document.getElementById(
        "couponNumber"
    );




    // 기존 쿠폰 있음

    if(savedNumber){


        couponNumber.textContent =
        savedNumber;


        return;


    }







    // 신규 쿠폰 생성


    const now =
    new Date();



    const date =

    String(
        now.getFullYear()
    )
    .slice(-2)

    +

    String(
        now.getMonth()+1
    )
    .padStart(2,"0")

    +

    String(
        now.getDate()
    )
    .padStart(2,"0");





    const random =

    Math.floor(
        Math.random()*9000+1000
    );




    const number =

    `JT-${date}-${random}`;






    localStorage.setItem(

        "jokbaltime_coupon",

        number

    );






    couponNumber.textContent =
    number;





    // Firebase 저장


    const issueRef =
    doc(

        db,

        "coupon_issue",

        number

    );




    await setDoc(

        issueRef,

        {


            couponNumber:number,


            createdTime:
            new Date(),


            used:false


        }

    );



}



createCouponNumber();









// =============================
// 시계
// =============================


function updateClock(){


    const clock =
    document.getElementById(
        "clock"
    );


    if(!clock)
    return;



    const now =
    new Date();



    clock.textContent =

    now.toLocaleString(
        "ko-KR"
    );


}



updateClock();


setInterval(
updateClock,
1000
);









// =============================
// 메뉴 슬라이드
// =============================


const menuImages=[

"images/menu1.jpg",

"images/menu2.jpg",

"images/menu3.jpg",

"images/menu4.jpg"

];


let currentImage=0;



const sliderImage =
document.getElementById(
"sliderImage"
);



const dots =
document.querySelectorAll(
".dot"
);



function changeSlide(){


if(!sliderImage)
return;



currentImage++;



if(
currentImage >= menuImages.length
){

currentImage=0;

}



sliderImage.style.opacity="0";



setTimeout(()=>{


sliderImage.src =
menuImages[currentImage];


sliderImage.style.opacity="1";


},250);



dots.forEach(
d=>d.classList.remove("active")
);



if(dots[currentImage]){

dots[currentImage]
.classList.add("active");

}


}



setInterval(
changeSlide,
3000
);
