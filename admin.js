// ======================================
// JOKBALTlME ADMIN
// COUPON MANAGER v7
// ======================================


import {

    db,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    getDocs,
    query,
    orderBy

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
// 로그인
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




loginButton.onclick = async()=>{


    const pin =
    document.getElementById(
        "adminPin"
    ).value;




    if(pin==="7812"){


        loginBox.classList.add(
            "hidden"
        );


        adminPanel.classList.remove(
            "hidden"
        );


        await loadData();


        await loadCouponList();



    }
    else{


        alert(
            "PIN이 올바르지 않습니다."
        );


    }


};








// =============================
// 쿠폰 설정 불러오기
// =============================


async function loadData(){


    const snap =
    await getDoc(
        couponRef
    );



    if(snap.exists()){


        const data =
        snap.data();



        document.getElementById(
            "title"
        ).value =
        data.title || "메인메뉴";



        document.getElementById(
            "discount"
        ).value =
        data.discount || 20;



        document.getElementById(
            "notice"
        ).value =
        data.notice || "";



    }


}









// =============================
// 쿠폰 설정 저장
// =============================


document
.getElementById(
    "saveButton"
)
.onclick = async()=>{


    await setDoc(

        couponRef,

        {


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


        }

    );



    alert(
        "쿠폰 설정 저장 완료"
    );



};









// =============================
// 쿠폰 사용 확인
// =============================


document
.getElementById("checkUseButton")
.onclick = async()=>{


    const number =
    document
    .getElementById("useCouponNumber")
    .value
    .trim();



    const result =
    document
    .getElementById("useResult");



    if(!number){


        result.innerHTML =
        "❌ 쿠폰번호를 입력하세요";


        return;

    }





    try{


        const ref =
        doc(

            db,

            "coupon_issue",

            number

        );



        const snap =
        await getDoc(ref);





        if(!snap.exists()){


            result.innerHTML =
            "❌ 쿠폰을 찾을 수 없습니다.";


            return;


        }





        const data =
        snap.data();





        if(data.used === true){


            result.innerHTML =
            "❌ 이미 사용된 쿠폰입니다.";


        }
        else{


            result.innerHTML =
            "✅ 사용 가능한 쿠폰입니다.";


        }



    }
    catch(error){


        console.error(error);


        result.innerHTML =
        "⚠ 오류 발생";


    }



};

// =============================
// 사용 완료
// =============================


document
.getElementById(
    "completeUseButton"
)
.onclick = async()=>{


    const number =
    document.getElementById(
        "useCouponNumber"
    )
    .value
    .trim();




    if(!number)
    return;




    const ref =
    doc(

        db,

        "coupon_issue",

        number

    );




    await updateDoc(

        ref,

        {


            used:true,


            usedTime:
            new Date()


        }

    );




    document.getElementById(
        "useResult"
    )
    .innerHTML =
    "✅ 사용 완료 처리";



    loadCouponList();



};









// =============================
// 사용 취소
// =============================


document
.getElementById(
    "cancelUseButton"
)
.onclick = async()=>{


    const number =
    document.getElementById(
        "useCouponNumber"
    )
    .value
    .trim();




    if(!number)
    return;




    const ref =
    doc(

        db,

        "coupon_issue",

        number

    );




    await updateDoc(

        ref,

        {


            used:false,


            cancelTime:
            new Date()


        }

    );




    document.getElementById(
        "useResult"
    )
    .innerHTML =
    "♻️ 사용 취소 완료";



    loadCouponList();


};









// =============================
// 최근 발급 쿠폰 목록
// =============================


async function loadCouponList(){


    const list =
    document.getElementById(
        "couponList"
    );
