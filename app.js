// ======================================
// JOKBALTlME CUSTOMER COUPON
// ======================================

import {
    db,
    doc,
    onSnapshot
} from "./firebase.js";


// Firebase 쿠폰 위치

const couponRef = doc(
    db,
    "coupon",
    "setting"
);


// =============================
// 실시간 쿠폰 데이터 반영
// =============================

onSnapshot(couponRef, (snapshot)=>{


    if(snapshot.exists()){


        const data = snapshot.data();


        // 제목 변경

        const title =
        document.getElementById("couponTitle");


        if(title){

            title.textContent =
            data.title || "메인메뉴";

        }



        // 할인율 변경

        const discount =
        document.getElementById("discountValue");


        if(discount){

            discount.textContent =
            (data.discount || 20) + "%";

        }



        // 안내문 변경

        const notice =
        document.getElementById("couponNotice");


        if(notice){

            notice.innerHTML =
            (data.notice || "")
            .replace(/\n/g,"<br>");

        }


    }


});



// =============================
// 실시간 시계
// =============================

function updateClock(){

    const now = new Date();


    const time =
    now.getFullYear()+"-"+
    String(now.getMonth()+1).padStart(2,"0")+"-"+
    String(now.getDate()).padStart(2,"0")+" "+
    String(now.getHours()).padStart(2,"0")+":"+
    String(now.getMinutes()).padStart(2,"0")+":"+
    String(now.getSeconds()).padStart(2,"0");


    const clock =
    document.getElementById("clock");


    if(clock){

        clock.textContent=time;

    }

}


updateClock();

setInterval(updateClock,1000);



// =============================
// 쿠폰번호 생성
// =============================

const couponNumber =
document.getElementById("couponNumber");


if(couponNumber){

    const random =
    Math.floor(Math.random()*9000)+1000;


    couponNumber.textContent =
    "JT-"+random;

}
