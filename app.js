// ======================================
// JOKBALTlME CUSTOMER APP
// FIREBASE COUPON SYSTEM
// ======================================


import {

    db,
    doc,
    setDoc,
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
// 쿠폰번호 생성
// =============================


function createCouponNumber(){


    const now =
    new Date();



    const date =

    now.getFullYear()
    .toString()
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




    return `JT-${date}-${random}`;


}








// =============================
// 쿠폰번호 표시
// =============================


const couponNumber =
document.getElementById(
    "couponNumber"
);




if(couponNumber){


    const number =
    createCouponNumber();



    couponNumber.textContent =
    number;




    saveCoupon(number);



}









// =============================
// Firebase 쿠폰 발급 저장
// =============================


async function saveCoupon(number){



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


            used:
            false



        }

    );



}









// =============================
// 현재 시간 표시
// =============================


function clock(){


    const el =
    document.getElementById(
        "clock"
    );



    if(!el)
    return;



    const now =
    new Date();



    el.textContent =

    now.toLocaleString(
        "ko-KR"
    );


}



setInterval(
clock,
1000
);


clock();









// =============================
// 직원 확인 버튼
// =============================


const staffButton =
document.getElementById(
    "staffButton"
);



if(staffButton){


staffButton.onclick = ()=>{


alert(
"직원에게 화면을 보여주세요."
);


};


}
