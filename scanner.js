// ======================================
// scanner.js
// JOKBAL TIME STAFF SYSTEM
// ======================================


import {

db,
doc,
getDoc,
updateDoc,
serverTimestamp

} from "./firebase.js";



const couponNumber =
document.getElementById("couponNumber");


const checkBtn =
document.getElementById("checkBtn");


const useBtn =
document.getElementById("useBtn");


const result =
document.getElementById("result");



let currentCoupon = null;



// 쿠폰 확인

checkBtn.onclick = async()=>{


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


result.innerHTML =
"❌ 존재하지 않는 쿠폰";


useBtn.classList.add("hidden");


return;


}



const data =
snap.data();



currentCoupon = number;



if(data.status==="used"){


result.innerHTML =
"❌ 이미 사용된 쿠폰입니다";


useBtn.classList.add("hidden");


return;


}



result.innerHTML =

`
✅ 사용 가능

<br>

${data.title}

<br>

할인 :
${data.discount}%

`;



useBtn.classList.remove("hidden");

};





// 사용 처리

useBtn.onclick = async()=>{


if(!currentCoupon)
return;



await updateDoc(

doc(
db,
"coupons",
currentCoupon
),

{

status:"used",

usedAt:
serverTimestamp(),

updatedAt:
serverTimestamp()

}

);



result.innerHTML =
"🎉 사용 완료 처리되었습니다";

  // ================================
// QR CAMERA SCAN
// ================================


function startQR(){


const scanner =
new Html5Qrcode("reader");



scanner.start(

{
facingMode:"environment"
},

{
fps:10,
qrbox:250
},


(qrCodeMessage)=>{


couponNumber.value =
qrCodeMessage;


scanner.stop();


result.innerHTML =
"📱 QR 인식 완료";


}


)

.catch((err)=>{

console.log(err);

});


}



startQR();

useBtn.classList.add("hidden");


};
