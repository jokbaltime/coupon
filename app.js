// ======================================
// JOKBALTIME ADMIN FIREBASE
// ======================================
import {
    db,
    doc,
    onSnapshot
} from "./firebase.js";
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
// ======================================
// FIREBASE 실시간 쿠폰 반영
// ======================================

const couponRef = doc(
    db,
    "coupon",
    "setting"
);


onSnapshot(couponRef, (snapshot)=>{


    if(snapshot.exists()){


        const data = snapshot.data();


        const title =
        document.getElementById("couponTitle");


        const discount =
        document.getElementById("discountValue");


        const notice =
        document.getElementById("couponNotice");



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
            data.notice.replace(/\n/g,"<br>");

        }


    }

});
