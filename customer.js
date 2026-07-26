// customer.js FULL REPLACEMENT
// CUSTOMER REQUEST / APPROVAL / USE SYNC VERSION


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



let stopIssue = null;
let stopRequest = null;



function show(text){

if(result){

result.innerHTML = text;

}

}




function watchCoupon(number){


if(!number)
return;



if(stopIssue)
stopIssue();


if(stopRequest)
stopRequest();




const issueRef =
doc(
db,
"coupon_issue",
number
);



const requestRef =
doc(
db,
"coupon_request",
number
);





// 쿠폰 최종 상태 감시

stopIssue = onSnapshot(

issueRef,

(snapshot)=>{


if(!snapshot.exists()){


show(
"❌ 존재하지 않는 쿠폰"
);


requestButton.disabled=false;

requestButton.innerText=
"사용 요청";


return;

}



const data =
snapshot.data();




if(data.used){


show(
"❌ 이미 사용 완료된 쿠폰"
);


requestButton.disabled=true;


return;


}




if(data.approved){


show(

`

<h3 style="color:green">

✅ 승인 완료

</h3>


<p>

직원에게 쿠폰번호를 보여주세요.

</p>


<h2>

${number}

</h2>

`

);



requestButton.disabled=true;


requestButton.innerText=
"승인 완료";


return;


}



show(
"⏳ 직원 승인 대기 중"
);



}

);







// 요청 상태 감시

stopRequest = onSnapshot(

requestRef,

(snapshot)=>{


if(!snapshot.exists()){

return;

}



const data =
snapshot.data();




if(
data.status==="waiting"
&&
data.requestClosed!==true
){


show(
"⏳ 직원 승인 요청 중"
);


requestButton.disabled=true;


requestButton.innerText=
"승인 대기";


}




if(
data.status==="approved"
&&
data.requestClosed===true
){



show(
"✅ 승인 완료"
);



requestButton.disabled=true;



}



}

);



}








// 입력 변경

if(couponInput){


couponInput.addEventListener(

"input",

()=>{


const number =
couponInput.value.trim();



if(number){


localStorage.setItem(
"JT_COUPON_NUMBER",
number
);



watchCoupon(number);


}


}

);


}







// 새로고침 유지

const saved =
localStorage.getItem(
"JT_COUPON_NUMBER"
);



if(saved){


couponInput.value=saved;


watchCoupon(saved);


}









// 고객 승인 요청

requestButton.onclick =
async()=>{


const number =
couponInput.value.trim();



if(!number){


alert(
"쿠폰번호를 입력하세요."
);


return;


}




try{



requestButton.disabled=true;


requestButton.innerText=
"확인중...";





// 쿠폰 존재 확인

const issueSnap =
await getDoc(

doc(
db,
"coupon_issue",
number
)

);




if(!issueSnap.exists()){


alert(
"존재하지 않는 쿠폰입니다."
);


requestButton.disabled=false;


requestButton.innerText=
"사용 요청";


return;

}




const issue =
issueSnap.data();




if(issue.used){


alert(
"이미 사용 완료된 쿠폰입니다."
);


return;


}





if(issue.approved){


alert(
"이미 승인 완료된 쿠폰입니다."
);


return;


}







// 기존 요청 확인

const requestSnap =
await getDoc(

doc(
db,
"coupon_request",
number
)

);





if(requestSnap.exists()){


const request =
requestSnap.data();



if(
request.status==="waiting"
&&
request.requestClosed!==true
){


alert(
"이미 승인 요청 중입니다."
);


watchCoupon(number);


return;

}



}





// 요청 생성

await setDoc(

doc(
db,
"coupon_request",
number
),

{


couponNumber:number,


status:"waiting",


requestClosed:false,


createdTime:
serverTimestamp()


}

);





show(
"⏳ 직원 승인 요청 완료"
);



requestButton.innerText=
"승인 대기";



watchCoupon(number);



}

catch(error){


console.error(error);


alert(
"요청 오류 : "
+error.message
);



requestButton.disabled=false;


requestButton.innerText=
"사용 요청";


}



};
