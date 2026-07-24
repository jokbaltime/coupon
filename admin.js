// ======================================
// JOKBALTlME ADMIN
// FIREBASE COUPON MANAGER
// ======================================


import {

    db,
    doc,
    setDoc,
    getDoc,
    updateDoc

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
// 관리자 로그인
// =============================


const loginButton =
document.getElementById(
    "loginButton"
);


const loginBox =
document.querySelector(
    ".login-box"
);


const adminPanel =
document.getElementById(
    "adminPanel"
);




if(loginButton){


loginButton.onclick = async()=>{


    const pin =
    document.getElementById(
        "adminPin"
    ).value;



    if(pin === "7812"){


        if(loginBox){

            loginBox.classList.add(
                "hidden"
            );

        }


        if(adminPanel){

            adminPanel.classList.remove(
                "hidden"
            );

        }


        await loadSetting();


    }
    else{


        alert(
            "PIN이 올바르지 않습니다."
        );


    }


};


}







// =============================
// 쿠폰 설정 불러오기
// =============================


async function loadSetting(){


    const snap =
    await getDoc(
        couponRef
    );



    if(snap.exists()){


        const data =
        snap.data();



        const title =
        document.getElementById(
            "title"
        );


        const discount =
        document.getElementById(
            "discount"
        );


        const notice =
        document.getElementById(
            "notice"
        );




        if(title){

            title.value =
            data.title || "메인메뉴";

        }



        if(discount){

            discount.value =
            data.discount || 20;

        }



        if(notice){

            notice.value =
            data.notice || "";

        }



    }


}









// =============================
// 쿠폰 설정 저장
// =============================


const saveButton =
document.getElementById(
    "saveButton"
);



if(saveButton){


saveButton.onclick = async()=>{


    const data = {


        title:

        document.getElementById(
            "title"
        ).value,



        discount:

        Number(
            document.getElementById(
                "discount"
            ).value
        ),



        notice:

        document.getElementById(
            "notice"
        ).value



    };




    await setDoc(

        couponRef,

        data

    );



    alert(
        "Firebase 저장 완료"
    );



};


}









// =============================
// 쿠폰 찾기
// =============================


async function findCoupon(){


    const input =
    document.getElementById(
        "useCouponNumber"
    );


    const result =
    document.getElementById(
        "useResult"
    );



    if(!input){

        return null;

    }



    const number =
    input.value.trim();




    if(!number){


        if(result){

            result.innerHTML =
            "❌ 쿠폰번호 입력";

        }


        return null;

    }




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


        if(result){

            result.innerHTML =
            "❌ 쿠폰을 찾을 수 없습니다.";

        }


        return null;


    }




    return {

        ref:ref,

        data:snap.data()

    };


}









// =============================
// 사용 확인
// =============================


const checkButton =
document.getElementById(
    "checkUseButton"
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
        "useResult"
    );



    if(coupon.data.used === true){


        result.innerHTML =
        "❌ 이미 사용된 쿠폰입니다.";


    }
    else{


        result.innerHTML =
        "✅ 사용 가능한 쿠폰입니다.";


    }


};


}









// =============================
// 사용 완료
// =============================


const completeButton =
document.getElementById(
    "completeUseButton"
);



if(completeButton){


completeButton.onclick =
async()=>{


    const coupon =
    await findCoupon();



    if(!coupon)
    return;




    await updateDoc(

        coupon.ref,

        {


            used:true,


            usedTime:
            new Date()


        }

    );



    document.getElementById(
        "useResult"
    ).innerHTML =
    "✅ 사용 완료 처리";


};


}









// =============================
// 사용 취소
// =============================


const cancelButton =
document.getElementById(
    "cancelUseButton"
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


            cancelTime:
            new Date()


        }

    );



    document.getElementById(
        "useResult"
    ).innerHTML =
    "♻️ 사용 취소 완료";


};


}
