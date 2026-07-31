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
onSnapshot,
getDocs,
query,
where
  
} from "./firebase.js";



// ================================
// ELEMENT
// ================================


const couponNumber =
document.getElementById("couponNumber");

let couponCreating = false;

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
const eventKey = "jokbal_event";


const eventCheck = await getDocs(

query(

collection(db,"event_logs"),

where(
"event",
"==",
eventKey
)

)

);

async function createAutoCoupon(){

const customerId =
getCustomerId();

const savedCoupon =
localStorage.getItem("myCoupon");

if(savedCoupon){

    return savedCoupon;

}

const couponNumber =

"JBT-" +

Date.now()
.toString()
.slice(-8);



const couponData = {


couponNumber:


couponNumber,

customerId:

getCustomerId(),  

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

await addDoc(

collection(
db,
"event_logs"
),

{

event:"jokbal",

customerId:getCustomerId(),

couponNumber:couponNumber,

createdAt:
serverTimestamp()

}

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

async function autoLoadCoupon(){


const params =
new URLSearchParams(window.location.search);

// ================================
// AUTO EVENT COUPON LOAD
// ================================


const coupon =
params.get("coupon");



const event =
params.get("event");





if(coupon){


couponNumber.value = coupon;


loadCoupon(coupon);


}



else if(event){

const savedEventCoupon =
localStorage.getItem("myCoupon")
||
localStorage.getItem("eventCoupon");

if(couponCreating){

return;

}


couponCreating = true;


createAutoCoupon()

.then((newCoupon)=>{


couponNumber.value =
newCoupon;



loadCoupon(newCoupon);

localStorage.setItem(
"myCoupon",
newCoupon
);
result.innerHTML =
"🎉 이벤트 쿠폰을 확인했습니다.";



})

.catch((error)=>{


console.error(error);


result.innerHTML =
"❌ 쿠폰 발급 오류";


})
.finally(()=>{


couponCreating = false;


});


}


// 저장된 쿠폰이 있는 경우
else{


const savedCoupon =
localStorage.getItem("myCoupon")
||
localStorage.getItem("eventCoupon");

if(savedCoupon){


couponNumber.value =
savedCoupon;


loadCoupon(savedCoupon);

}


}
  
}

function getCustomerId(){

let id =
localStorage.getItem("customerId");


if(!id){

id =
"USER-" +
Date.now() +
"-" +
Math.random()
.toString(36)
.substring(2,8);


localStorage.setItem(
"customerId",
id
);

}


return id;

}

autoLoadCoupon();
