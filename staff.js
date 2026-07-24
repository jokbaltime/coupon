// ======================================
// JOKBALTlME STAFF
// COUPON CHECK SYSTEM
// ======================================


import {

    db,
    doc,
    getDoc,
    updateDoc

} from "./firebase.js";





let currentCoupon = null;






// =============================
// URL 쿠폰번호 자동 입력
// =============================


const params =
new URLSearchParams(
    location.search
);



const urlCoupon =
params.get(
    "coupon"
);




const couponInput =
document.getElementById(
    "couponNumber"
);



if(urlCoupon && couponInput){


    couponInput.value =
    urlCoupon;


}









// =============================
// 쿠폰 조회
// =============================


async function findCoupon(){



    const number =
    couponInput.value.trim();



    const result =
    document.getElementById(
        "result"
    );





    if(!number){


        result.innerHTML =
        "❌ 쿠폰번호를 입력하세요";


        return null;


    }






    try{


        const ref =
        doc(

            db,

            "coupon_issue",

            number

        );





        const snap =
        await getDoc(
            ref
        );





        if(!snap.exists()){


            result.innerHTML =
            "❌ 존재하지 않는 쿠폰입니다.";


            currentCoupon = null;


            return null;


        }





        currentCoupon = {


            ref:ref,


            data:snap.data()


        };



        return currentCoupon;



    }


    catch(error){


        console.error(
            error
        );


        result.innerHTML =
        "⚠️ 조회 오류입니다.";


        return null;


    }



}









// =============================
// 사용 확인
// =============================


const checkButton =
document.getElementById(
    "checkButton"
);



if(checkButton){


checkButton.onclick =
async()=>{



    const coupon =
    await findCoupon();




    if(!coupon)
    return;




    const result =
    document.getElementById(
        "result"
    );





    if(coupon.data.used === true){


        result.innerHTML =

        `
        ❌ 이미 사용된 쿠폰입니다.
        `;


    }


    else{


        result.innerHTML =

        `
        ✅ 사용 가능한 쿠폰입니다.<br><br>
        ${coupon.data.couponNumber}
        `;


    }



};


}









// =============================
// 사용 완료
// =============================


const useButton =
document.getElementById(
    "useButton"
);



if(useButton){


useButton.onclick =
async()=>{



    const coupon =
    await findCoupon();




    if(!coupon)
    return;





    await updateDoc(

        coupon.ref,

        {

            used:true,


            usedTime:new Date()


        }

    );





    document.getElementById(
        "result"
    )
    .innerHTML =

    `
    ✅ 사용 완료 처리되었습니다.
    `;



};


}









// =============================
// 사용 취소
// =============================


const cancelButton =
document.getElementById(
    "cancelButton"
);



if(cancelButton){


cancelButton.onclick =
async()=>{



    const coupon =
    await findCoupon();




    if(!coupon)
    return;





    await updateDoc(

        coupon.ref,

        {


            used:false,


            cancelTime:new Date()


        }

    );





    document.getElementById(
        "result"
    )
    .innerHTML =

    `
    ♻️ 사용 취소 완료되었습니다.
    `;



};


}
