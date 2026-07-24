// ======================================
// JOKBALTIME COUPON APP
// COUPON ID FIX VERSION
// ======================================


import {

    db,
    doc,
    getDoc,
    setDoc,
    serverTimestamp

} from "./firebase.js";




// ======================================
// 시계
// ======================================


function updateClock(){


    const now = new Date();


    document.getElementById("clock")
    .textContent =

    now.toLocaleString("ko-KR");


}


updateClock();

setInterval(updateClock,1000);





// ======================================
// 쿠폰 번호 생성 / 유지
// ======================================


let couponNumber =

localStorage.getItem(
    "jokbal_coupon"
);




if(!couponNumber){


    couponNumber =

    "JT-"
    +
    Date.now();



    localStorage.setItem(

        "jokbal_coupon",

        couponNumber

    );


}




document
.getElementById("couponNumber")
.textContent = couponNumber;







// ======================================
// Firebase 쿠폰 설정 실시간 적용
// ======================================



const settingRef =

doc(

    db,

    "coupon",

    "setting"

);




const { onSnapshot } =

await import(

"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"

);




onSnapshot(

settingRef,

(snapshot)=>{


    if(snapshot.exists()){


        const data = snapshot.data();



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



        if(title)

        title.textContent =
        data.title;



        if(discount)

        discount.textContent =
        data.discount+"%";



        if(notice)

        notice.innerHTML =
        data.notice.replace(
            /\n/g,
            "<br>"
        );


    }


});







// ======================================
// 직원 확인
// ======================================


const staffButton =

document.getElementById(
    "staffButton"
);




staffButton.addEventListener(

"click",

async()=>{



    const pin =

    prompt(
        "직원 PIN을 입력하세요."
    );



    if(pin !== "7812"){


        alert(
            "PIN이 올바르지 않습니다."
        );


        return;


    }





    const couponRef =

    doc(

        db,

        "coupon_use",

        couponNumber

    );





    const check =

    await getDoc(couponRef);





    if(check.exists()){


        alert(
            "이미 사용된 쿠폰입니다."
        );


        return;


    }





    await setDoc(

        couponRef,

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
        "✅ 쿠폰 사용 완료"
    );



});
