// ======================================
// customer.js
// JOKBAL TIME CUSTOMER COUPON SYSTEM
// ======================================


import {

db,
doc,
getDoc,
setDoc,
onSnapshot,
serverTimestamp

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

// QR 생성
qrCode.innerHTML = "";

new QRCode(qrCode, {

text: number,

width: 180,

height: 180

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




if(data.status==="waiting"){


result.innerHTML =
"⏳ 승인 요청 대기중";


requestBtn.disabled=true;


}



else if(data.status==="approved"){


result.innerHTML =
"✅ 승인 완료 직원에게 보여주세요";


requestBtn.disabled=true;


}



else if(data.status==="used"){


result.innerHTML =
"❌ 이미 사용 완료된 쿠폰입니다.";


requestBtn.disabled=true;


}


else{


result.innerHTML =
"사용 요청 가능";


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
// REQUEST
// ================================


requestBtn.onclick = async()=>{


console.log(
"사용 요청 버튼 클릭됨"
);



try{


const number =
couponNumber.value.trim();



if(!number){


alert(
"쿠폰번호 입력"
);


return;


}





const couponSnap =
await getDoc(

doc(
db,
"coupons",
number
)

);





if(!couponSnap.exists()){


alert(
"쿠폰 없음"
);


return;


}





const data =
couponSnap.data();




if(data.status==="used"){

alert(
"❌ 이미 사용 완료된 쿠폰입니다."
);

return;

}





console.log(
"요청 저장 시작"
);





await setDoc(

doc(
db,
"coupon_requests",
number
),

{


couponNumber:number,


status:"waiting",


createdAt:
serverTimestamp()


}

);






console.log(
"요청 저장 완료"
);







await setDoc(

doc(
db,
"coupons",
number
),

{


status:"waiting"


},

{

merge:true

}

);






console.log(
"쿠폰 상태 변경 완료"
);





result.innerHTML =
"⏳ 직원 승인 요청 완료";



}

catch(error){


console.error(
"요청 오류:",
error
);


alert(
"요청 처리 오류 : "
+
error.message
);


}



};





console.log(
"requestBtn 확인:",
requestBtn
);
