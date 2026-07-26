// customer.js FULL REPLACEMENT
// 승인 완료 코드 자동 표시 + 요청/승인 상태 단일화 FIX


import {
db,
doc,
getDoc,
setDoc,
onSnapshot,
serverTimestamp
} from "./firebase.js";


const couponInput =
document.getElementById("couponNumber");


const requestButton =
document.getElementById("requestButton");


const result =
document.getElementById("result");



let currentCoupon = "";

let stopIssue = null;
let stopRequest = null;




// ==============================
// 상태 감시
// ==============================

function watchCoupon(code){


if(!code)return;


currentCoupon = code;



if(stopIssue)
stopIssue();


if(stopRequest)
stopRequest();




// 승인 완료 쿠폰 감시

stopIssue = onSnapshot(

doc(
db,
"coupon_issue",
code
),

(snap)=>{


if(!snap.exists()){

result.innerHTML =
"❌ 존재하지 않는 쿠폰";

return;

}



const data =
snap.data();



if(data.used){


result.innerHTML =
"❌ 이미 사용 완료된 쿠폰";


requestButton.disabled=true;


return;

}




if(data.approved){


result.innerHTML =

`

<b style="color:green">

✅ 승인 완료

</b>

<br>

사용 가능 쿠폰번호 :

<h2>

${code}

</h2>

직원에게 이 번호를 보여주세요.

`;



requestButton.innerText =
"✅ 승인 완료";


requestButton.disabled=true;



return;

}




result.innerHTML =
"⏳ 승인 대기 중";



}

);





// 요청 상태 감시

stopRequest = onSnapshot(

doc(
db,
"coupon_request",
code
),

(snap)=>{


if(!snap.exists()){

return;

}


const data =
snap.data();



if(data.status==="waiting"){


result.innerHTML =
"⏳ 직원 승인 요청 중";



requestButton.innerText =
"⏳ 요청 진행중";


requestButton.disabled=true;



}




if(
data.status==="approved"
&&
data.approvedCoupon
){


result.innerHTML =

`

<b style="color:green">

🎉 승인 완료

</b>

<br>

새 쿠폰번호 :

<h2>

${data.approvedCoupon}

</h2>

`;



couponInput.value =
data.approvedCoupon;


localStorage.setItem(
"JT_COUPON_NUMBER",
data.approvedCoupon
);



watchCoupon(data.approvedCoupon);



}



}

);


}




// ==============================
// 입력 감지
// ==============================


if(couponInput){


couponInput.addEventListener(
"input",
()=>{


const code =
couponInput.value.trim();



if(code){

localStorage.setItem(
"JT_COUPON_NUMBER",
code
);


watchCoupon(code);

}


}

);

}





// ==============================
// 페이지 시작
// ==============================


const saved =
localStorage.getItem(
"JT_COUPON_NUMBER"
);



if(saved){


couponInput.value=saved;

watchCoupon(saved);


}





// ==============================
// 승인 요청
// ==============================


if(requestButton){


requestButton.onclick=async()=>{


const code =
couponInput.value.trim();



if(!code){

alert("쿠폰번호 입력");

return;

}




const issue =
await getDoc(

doc(
db,
"coupon_issue",
code
)

);



if(!issue.exists()){

alert("없는 쿠폰");

return;

}



const data =
issue.data();



if(data.used){

alert("사용 완료 쿠폰");

return;

}



if(data.approved){

alert("이미 승인 완료");

return;

}





await setDoc(

doc(
db,
"coupon_request",
code
),

{

couponNumber:code,

status:"waiting",

requestClosed:false,

createdTime:
serverTimestamp()

}

);




result.innerHTML =
"⏳ 직원 승인 요청 완료";



requestButton.innerText =
"⏳ 승인 대기중";


requestButton.disabled=true;



watchCoupon(code);



};


}
