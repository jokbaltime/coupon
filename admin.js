// ======================================
// JOKBALTlME ADMIN FIREBASE
// ======================================

import {
    db,
    doc,
    setDoc,
    getDoc
} from "./firebase.js";


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


loginButton.addEventListener("click", async function(){

    const pin =
    document.getElementById("adminPin").value;


    if(pin === "7812"){

        loginBox.classList.add("hidden");

        adminPanel.classList.remove("hidden");

        await loadData();

    }
    else{

        alert("PIN이 올바르지 않습니다.");

    }

});


// =============================
// Firebase 불러오기
// =============================

async function loadData(){

    const snapshot =
    await getDoc(couponRef);


    if(snapshot.exists()){

        const data =
        snapshot.data();


        document.getElementById("discount").value =
        data.discount ?? 20;


        document.getElementById("title").value =
        data.title ?? "메인메뉴";


        document.getElementById("notice").value =
        data.notice ?? 
        "매장 내 식사만 가능\n포장 · 배달 제외";

    }

}


// =============================
// Firebase 저장
// =============================

const saveButton =
document.getElementById("saveButton");


saveButton.addEventListener("click", async function(){


    const couponData = {

        discount:
        Number(document.getElementById("discount").value),


        title:
        document.getElementById("title").value,


        notice:
        document.getElementById("notice").value

    };


    await setDoc(
        couponRef,
        couponData
    );


    alert("Firebase 저장 완료");


});
