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




// 현재 선택된 쿠폰 저장

let currentCoupon = null;






// =============================
// 쿠폰 조회
// =============================


async function findCoupon(){



    const input =
    document.getElementById(
        "couponNumber"
    );



    const result =
    document.getElementById(
        "result"
    );



    const number =
    input.value.trim();





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
        "⚠️ 조회 오류가 발생했습니다.";


        return null;


    }


}









// =============================
// 사용 확인 버튼
// =============================


const checkButton =

document.getElementById(
    "checkButton"
);



if(checkButton){



checkButton.onclick = async()=>{



    const coupon =
    await findCoupon();




    if(!coupon)
    return;





    const result =
    document.getElementById(
        "result"
    );





    if(coupon.data.used === true){



        let time = "";



        if(coupon.data.usedTime){


            time =
            coupon.data.usedTime
            .toDate()
            .toLocaleString(
                "ko-KR"
            );


        }





        result.innerHTML =

        `
        ❌ 사용 완료 쿠폰<br><br>
        사용시간<br>
        ${time}
        `;



    }


    else{



        result.innerHTML =

        `
        ✅ 사용 가능한 쿠폰입니다.<br><br>
        쿠폰번호<br>
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



useButton.onclick = async()=>{



    const coupon =
    await findCoupon();




    if(!coupon)
    return;





    try{


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



    }


    catch(error){


        console.error(
            error
        );


        alert(
            "처리 실패"
        );


    }



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



cancelButton.onclick = async()=>{



    const coupon =
    await findCoupon();




    if(!coupon)
    return;





    try{


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



    }


    catch(error){


        console.error(
            error
        );


        alert(
            "취소 실패"
        );


    }



};



}
