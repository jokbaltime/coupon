// ======================================
// JOKBALTIME COUPON APP
// FIREBASE VERSION
// ======================================


import {

    db,
    doc,
    getDoc,
    setDoc,
    serverTimestamp

} from "./firebase.js";




// ======================================
// 실시간 시계
// ======================================


function updateClock(){


    const now = new Date();


    const time =

    now.getFullYear()
    + "-"
    + String(now.getMonth()+1).padStart(2,"0")
    + "-"
    + String(now.getDate()).padStart(2,"0")
    + " "
    + String(now.getHours()).padStart(2,"0")
    + ":"
    + String(now.getMinutes()).padStart(2,"0")
    + ":"
    + String(now.getSeconds()).padStart(2,"0");



    document.getElementById("clock")
    .textContent = time;


}


updateClock();

setInterval(updateClock,1000);





// ======================================
// 쿠폰 번호 생성
// ======================================


const couponNumber =

"JT-"
+
Date.now();




document.getElementById("couponNumber")
.textContent = couponNumber;






// ======================================
// 직원 확인
// ======================================



const staffButton =

document.getElementById("staffButton");





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

    "✅ 쿠폰 사용 완료 처리되었습니다."

    );



});
