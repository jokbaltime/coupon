// ======================================
// JOKBaltime CUSTOMER APP
// FIREBASE REALTIME COUPON
// ======================================


import {

    db,
    doc,
    onSnapshot

} from "./firebase.js";




// =============================
// 쿠폰 데이터 위치
// =============================


const couponRef = doc(
    db,
    "coupon",
    "setting"
);





// =============================
// Firebase 실시간 쿠폰 반영
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


    }

);







// =============================
// 실시간 시계
// =============================


function updateClock(){


    const now =
    new Date();



    const year =
    now.getFullYear();



    const month =
    String(
        now.getMonth()+1
    )
    .padStart(2,"0");



    const day =
    String(
        now.getDate()
    )
    .padStart(2,"0");



    const hour =
    String(
        now.getHours()
    )
    .padStart(2,"0");



    const minute =
    String(
        now.getMinutes()
    )
    .padStart(2,"0");



    const second =
    String(
        now.getSeconds()
    )
    .padStart(2,"0");




    const clock =
    document.getElementById(
        "clock"
    );



    if(clock){


        clock.textContent =

        `${year}-${month}-${day} ${hour}:${minute}:${second}`;


    }


}



updateClock();


setInterval(
    updateClock,
    1000
);








// =============================
// 쿠폰번호 생성
// =============================


function createCouponNumber(){


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




    const couponNumber =

    document.getElementById(
        "couponNumber"
    );



    if(couponNumber){


        couponNumber.textContent =

        `JT-${date}-${random}`;


    }


}



createCouponNumber();








// =============================
// 메뉴 슬라이드
// =============================


const menuImages = [

"images/menu1.jpg",

"images/menu2.jpg",

"images/menu3.jpg",

"images/menu4.jpg"

];


let currentImage = 0;



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

        currentImage = 0;

    }




    sliderImage.style.opacity="0";



    setTimeout(()=>{


        sliderImage.src =
        menuImages[currentImage];


        sliderImage.style.opacity="1";


    },250);





    dots.forEach(
        dot=>
        dot.classList.remove(
            "active"
        )
    );



    if(dots[currentImage]){


        dots[currentImage]
        .classList.add(
            "active"
        );


    }


}



setInterval(
    changeSlide,
    3000
);
