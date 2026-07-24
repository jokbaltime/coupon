// ======================================
// JOKBALTIME ADMIN
// FIREBASE COUPON MANAGER
// ======================================


import {

db,
doc,
setDoc,
getDoc,
deleteDoc

} from "./firebase.js";





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


loadData();


}

else{


alert(
"PIN이 올바르지 않습니다."
);


}


};







// =============================
// 설정 불러오기
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
data.title;



document.getElementById(
"discount"
).value =
data.discount;



document.getElementById(
"notice"
).value =
data.notice;



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
"Firebase 저장 완료"
);


};







// =============================
// 쿠폰 사용 확인
// =============================



document
.getElementById(
"checkUseButton"
)
.onclick = async()=>{


const number =

document.getElementById(
"useCouponNumber"
).value;



const useRef =

doc(

db,

"coupon_use",

number

);




const snap =

await getDoc(
useRef
);



const result =

document.getElementById(
"useResult"
);




if(snap.exists()){


result.innerHTML =

"✅ 사용완료 쿠폰입니다.";



}

else{


result.innerHTML =

"❌ 사용 기록이 없습니다.";


}



};







// =============================
// 쿠폰 사용 취소
// =============================



document
.getElementById(
"cancelUseButton"
)
.onclick = async()=>{


const number =

document.getElementById(
"useCouponNumber"
).value;




if(!number){


alert(
"쿠폰번호를 입력하세요."
);


return;


}





const useRef =

doc(

db,

"coupon_use",

number

);




await deleteDoc(
useRef
);




document.getElementById(
"useResult"
).innerHTML =

"♻️ 사용 취소 완료";



};
