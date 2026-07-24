// ======================================
// JOKBALTIME ADMIN FIREBASE
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


// 로그인

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

        loadCoupon();

    }else{

        alert("PIN이 올바르지 않습니다.");

    }

});


// 데이터 불러오기

async function loadCoupon(){

    const snap =
    await getDoc(couponRef);


    if(snap.exists()){

        const data = snap.data();


        document.getElementById("title").value =
        data.title || "메인메뉴";


        document.getElementById("discount").value =
        data.discount || 20;


        document.getElementById("notice").value =
        data.notice || "";

    }

}


// 저장

document
.getElementById("saveButton")
.addEventListener("click", async ()=>{


    const data={

        title:
        document.getElementById("title").value,


        discount:
        Number(document.getElementById("discount").value),


        notice:
        document.getElementById("notice").value

    };


    await setDoc(
        couponRef,
        data
    );


    alert("Firebase 저장 완료");

});
