// ======================================
// customer.js
// JOKBAL TIME CUSTOMER COUPON SYSTEM
// ======================================


import {

db,
doc,
getDoc,
setDoc,
addDoc,
collection,
serverTimestamp,
onSnapshot

} from "./firebase.js";



// ================================
// ELEMENT
// ================================


const couponNumber =
document.getElementById("couponNumber");


const requestBtn =
document.getElementById("requestBtn");


const result =
document.getElementById("result");


const couponTitle =
document.getElementById("couponTitle");


const discount =
document.getElementById("discount");


const notice =
document.getElementById("notice");


const mainImage =
document.getElementById("mainImage");

const qrCode =
document.getElementById("qrcode");

// ================================
// AUTO COUPON CREATE
// ================================

async function createAutoCoupon(){


const couponNumber =

"JBT-" +

Date.now()
.toString()
.slice(-8);



const couponData = {


couponNumber:


couponNumber,


title:

"첫 방문 할인 쿠폰",


discount:

10,


maxUseCount:

1,


useCount:

0,


status:

"issued",


notice:

"족발타임 방문 감사 쿠폰입니다.",


startDate:

new Date()
.toISOString()
.split("T")[0],


endDate:

"2099-12-31",


createdAt:

serverTimestamp(),


updatedAt:

serverTimestamp()


};



await setDoc(

doc(
db,
"coupons",
couponNumber
),

couponData

);



return couponNumber;


}

// ================================
// COUPON LOAD
// ================================


async function loadCoupon(number){


if(!number)
return;



const snap =
await getDoc(

doc(
db,
"coupons",
number
)

);



if(!snap.exists()){


result.innerHTML =
"❌ 존재하지 않는 쿠폰입니다.";


return;


}



const data =
snap.data();



const today =
new Date()
.toISOString()
.split("T")[0];



if(data.startDate && data.endDate){


if(
today < data.startDate ||
today > data.endDate
){


result.innerHTML =
"⛔ 사용 기간 만료";


requestBtn.disabled=true;


return;


}


}




couponTitle.innerText =
data.title || "족발타임 쿠폰";



discount.innerText =
(data.discount || 0)+"%";



notice.innerText =
data.notice || "";





if(data.image){


mainImage.src =
data.image;


}

qrCode.innerHTML = "";

new QRCode(qrCode, {

text:number,

width:320,

height:320,

correctLevel:QRCode.CorrectLevel.H

});

listenCoupon(number);



}








// ================================
// REALTIME STATUS
// ================================


function listenCoupon(number){


onSnapshot(

doc(
db,
"coupons",
number
),

(snapshot)=>{


if(!snapshot.exists())
return;



const data =
snapshot.data();



const today =
new Date()
.toISOString()
.split("T")[0];



if(data.startDate && data.endDate){


if(
today < data.startDate ||
today > data.endDate
){


result.innerHTML =
"⛔ 사용 기간 만료";


requestBtn.disabled=true;


return;


}

}


if(data.status==="used"){


result.innerHTML =
"❌ 이미 사용 완료된 쿠폰입니다.";


requestBtn.disabled=true;


}


else{


result.innerHTML =
"✅ 사용 가능한 쿠폰입니다.";


requestBtn.disabled=false;


}



}


);


}








// ================================
// INPUT
// ================================


couponNumber.addEventListener(

"change",

()=>{


const number =
couponNumber.value.trim();


loadCoupon(number);


}

);



// ================================
// COUPON CHECK BUTTON
// ================================

requestBtn.onclick = async()=>{


const number =
couponNumber.value.trim();


if(!number){

alert("쿠폰번호 입력");

return;

}


const snap =
await getDoc(

doc(
db,
"coupons",
number
)

);



if(!snap.exists()){

alert("쿠폰 없음");

return;

}



const data =
snap.data();



if(data.status==="used"){

result.innerHTML =
"❌ 이미 사용 완료된 쿠폰입니다.";

return;

}



result.innerHTML =
"📱 QR 또는 쿠폰번호를 직원에게 보여주세요";



};


console.log(
"requestBtn 확인:",
requestBtn
);

// ================================
// AUTO LOAD FROM URL
// ================================

const params =
new URLSearchParams(window.location.search);


const coupon =
params.get("coupon");


// QR로 처음 들어온 경우
if(coupon){


couponNumber.value = coupon;


// 내 쿠폰 저장
localStorage.setItem(
"myCoupon",
coupon
);


loadCoupon(coupon);


}


// 저장된 쿠폰이 있는 경우
else{


const savedCoupon =
localStorage.getItem("myCoupon");


if(savedCoupon){


couponNumber.value =
savedCoupon;


loadCoupon(savedCoupon);


}


}
