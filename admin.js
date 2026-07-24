// ======================================
// JOKBALTIME ADMIN
// FIREBASE COUPON MANAGER v2
// ======================================


import {

    db,
    doc,
    setDoc,
    getDoc,
    deleteDoc,
    collection,
    query,
    where,
    getDocs

} from "./firebase.js";




// =============================
// 쿠폰 설정 위치
// =============================


const couponRef = doc(
    db,
    "coupon",
    "setting"
);




// =============================
// 관리자 로그인
// =============================


const loginButton =
document.getElementById("loginButton");


const loginBox =
document.querySelector(".login-box");


const adminPanel =
document.getElementById("adminPanel");




loginButton.addEventListener(
"click",
async function(){


    const pin =
    document.getElementById("adminPin").value;



    if(pin === "7812"){


        loginBox.classList.add(
            "hidden"
        );


        adminPanel.classList.remove(
            "hidden"
        );


        await loadData();


    }
    else{


        alert(
            "PIN이 올바르지 않습니다."
        );


    }


});






// =============================
// Firebase 쿠폰 설정 불러오기
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
        data.notice || 
        "매장 내 식사만 가능\n포장 · 배달 제외";


    }


}






// =============================
// 쿠폰 설정 저장
// =============================


document
.getElementById("saveButton")
.addEventListener(
"click",
async function(){



    const couponData = {


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

        couponData

    );



    alert(
        "Firebase 저장 완료"
    );


});







// =============================
// 쿠폰 사용 확인
// =============================


document
.getElementById("checkUseButton")
.addEventListener(
"click",
async function(){



    const number =

    document.getElementById(
        "useCouponNumber"
    )
    .value
    .trim();




    const result =

    document.getElementById(
        "useResult"
    );




    if(!number){


        result.innerHTML =
        "❌ 쿠폰번호를 입력하세요.";


        return;


    }





    const q = query(

        collection(
            db,
            "coupon_use"
        ),

        where(

            "couponNumber",
            "==",
            number

        )

    );





    const snap =

  
