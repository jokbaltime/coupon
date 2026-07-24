// ======================================
// JOKBALTlME CUSTOMER APP
// FIREBASE COUPON SYSTEM v2
// ======================================


import {

    db,
    doc,
    setDoc,
    getDoc,
    onSnapshot

} from "./firebase.js";





// =============================
// 쿠폰 설정 실시간 반영
// =============================


const couponRef =
doc(
    db,
    "coupon",
    "setting"
);



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
            data.title || "메인메뉴";

        }



        if(discount){

            discount.textContent =
            (data.discount || 20) + "%";

        }



        if(notice){

            notice.innerHTML =
            (data.notice || "")
            .replace(
                /\n/g,
                "<br>"
            );

        }



    }


});









// =============================
// 쿠폰번호 생성
// =============================


function createCouponNumber(){


    const now =
    new Date();



    const ymd =

    String(
        now.getFullYear()
    )
    .slice(2)

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
        Math.random()*9000
    )
    +
    1000;




    return `JT-${ymd}-${random}`;


}









// =============================
// 쿠폰 발급
// =============================


async function issueCoupon(){


    let couponNumber =
    localStorage.getItem(
        "jokbaltimeCoupon"
    );




    // 기존 쿠폰 없음

    if(!couponNumber){


        couponNumber =
        createCouponNumber();



        localStorage.setItem(

            "jokbaltimeCoupon",

            couponNumber

        );



        const issueRef =
        doc(

            db,

            "coupon_issue",

            couponNumber

        );




        await setDoc(

            issueRef,

            {

                couponNumber:
                couponNumber,


                used:
                false,


                createdTime:
                new Date()


            }

        );


    }






    const display =
    document.getElementById(
        "couponNumber"
    );



    if(display){


        display.textContent =
        couponNumber;


    }



}






issueCoupon();









// =============================
// 현재 시간
// =============================


function updateClock(){


    const clock =
    document.getElementById(
        "clock"
    );



    if(clock){


        clock.textContent =

        new Date()
        .toLocaleString(
            "ko-KR"
        );


    }


}



setInterval(
    updateClock,
    1000
);



updateClock();









// =============================
// 직원 확인 안내
// =============================


const staffButton =
document.getElementById(
    "staffButton"
);



if(staffButton){


staffButton.onclick = ()=>{


    alert(
        "직원에게 쿠폰 화면을 보여주세요."
    );


};


}
