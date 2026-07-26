// customer.js FULL REPLACEMENT
// CUSTOMER REQUEST / APPROVAL SYNC VERSION


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



// 상태 감시

function watchCoupon(couponNumber){


if(!couponNumber) return;


currentCoupon = couponNumber;



if(stopIssue)
stopIssue();


if(stopRequest)
stopRequest();




// coupon_issue 상태

stopIssue = onSnapshot(

doc(
db,
"coupon_issue",
couponNumber
),

(snapshot)=>{


if(!snapshot.exists()){

result.innerHTML =
"❌ 존재하지 않는 쿠폰";

return;

}



const data =
snapshot.data();




if(data.used){


result.innerHTML =
"❌ 사용 완료 쿠폰";


requestButton.disabled=true;


return;

}




if(data.approved){


result.innerHTML =

`
<h3 style="color:green">
✅ 승인 완료
</h3>

<p>
사용 가능한 쿠폰번호
</p>

<h2>
${couponNumber}
</h2>

직원에게 보여주세요.
`;



requestButton.innerText =
"승인 완료";


requestButton.disabled=true;


return;

}




result.innerHTML =
"⏳ 승인 대기 중";


}

);





// coupon_request 상태

stopRequest = onSnapshot(

doc(
db,
"coupon_request",
couponNumber
),

(snapshot)=>{


if(!snapshot.exists()){

return;

}



const data =
snapshot.data();





if(
data.status === "waiting"
&&
data.requestClosed !== true
){


result.innerHTML =
"⏳ 직원 승인 요청 중";


requestButton.innerText =
"승인 대기중";


requestButton.disabled=true;


return;

}





if(
data.status === "approved"
&&
data.requestClosed === true
){


result.innerHTML =
"🎉 직원 승인 완료";



requestButton.innerText =
"승인 완료";


requestButton.disabled=true;


}



}

);



}





// 입력 감시

if(couponInput){


couponInput.addEventListener(
"input",
()=>{


const num =
couponInput.value.trim();



if(num){


localStorage.setItem(
"JT_COUPON_NUMBER",
num
);



watchCoupon(num);


}


}

);


}





// 초기 실행

const savedCoupon =
localStorage.getItem(
"JT_COUPON_NUMBER"
);



if(savedCoupon){


couponInput.value =
savedCoupon;


watchCoupon(savedCoupon);


}





// 승인 요청

if(requestButton){


requestButton.onclick =
async()=>{


const couponNumber =
couponInput.value.trim();



if(!couponNumber){

alert(
"쿠폰번호 입력"
);

return;

}



try{


const issueSnap =
await getDoc(

doc(
db,
"coupon_issue",
couponNumber
)

);



if(!issueSnap.exists()){


alert(
"없는 쿠폰입니다."
);


return;


}



const issue =
issueSnap.data();




if(issue.used){


alert(
"사용 완료 쿠폰입니다."
);


return;

}




if(issue.approved){


alert(
"이미 승인 완료된 쿠폰입니다."
);


return;

}





const requestSnap =
await getDoc(

doc(
db,
"coupon_request",
couponNumber
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


return;

}



if(
request.status==="approved"
){


alert(
"이미 승인 완료되었습니다."
);


return;

}


}




await setDoc(

doc(
db,
"coupon_request",
couponNumber
),

{

couponNumber:couponNumber,

status:"waiting",

requestClosed:false,

createdTime:
serverTimestamp()

}

);



result.innerHTML =
"⏳ 직원 승인 요청 완료";


requestButton.innerText =
"승인 대기중";


requestButton.disabled=true;



watchCoupon(couponNumber);



}


catch(error){


console.error(error);


alert(
"요청 오류 : "
+error.message
);



requestButton.disabled=false;


}



};


}
