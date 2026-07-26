// ======================================
// CUSTOMER.JS FULL REPLACEMENT
// COUPON REQUEST / APPROVAL SYNC VERSION
// ======================================


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



let stopListener = null;





function show(message){

if(result){

result.innerHTML = message;

}

}





function watchCoupon(couponNumber){


if(!couponNumber)
return;



if(stopListener){

stopListener();

}



const couponRef =
doc(
db,
"coupon_issue",
couponNumber
);





stopListener = onSnapshot(

couponRef,

(snapshot)=>{



if(!snapshot.exists()){


show(
"❌ 존재하지 않는 쿠폰입니다."
);


requestButton.disabled=false;

requestButton.innerText=
"사용 요청";


return;

}



const data =
snapshot.data();





// 사용 완료

if(data.used===true){


show(

`

<b style="color:red">

❌ 사용 완료 쿠폰

</b>

`

);



requestButton.disabled=true;


return;


}





// 승인 완료

if(data.approved===true){


show(

`

<b style="color:#4caf50">

✅ 승인 완료

</b>

<br>

직원에게 쿠폰번호를 보여주세요.

<br><br>

<b>

${couponNumber}

</b>

`

);



requestButton.disabled=true;


requestButton.innerText=
"승인 완료";


return;


}





// 승인 전

show(

`

<b style="color:#ff9800">

⏳ 직원 승인 대기 가능

</b>

`

);



requestButton.disabled=false;

requestButton.innerText=
"사용 요청";



}

);


}









// 입력 감지

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









// 페이지 재접속 유지

const savedNumber =
localStorage.getItem(
"JT_COUPON_NUMBER"
);



if(savedNumber){


couponInput.value=savedNumber;


watchCoupon(savedNumber);


}









// 고객 승인 요청

if(requestButton){


requestButton.onclick =
async()=>{


const couponNumber =
couponInput.value.trim();




if(!couponNumber){


alert(
"쿠폰번호를 입력하세요."
);


return;

}



try{


requestButton.disabled=true;


requestButton.innerText=
"확인중...";





// 쿠폰 확인

const couponSnap =
await getDoc(

doc(
db,
"coupon_issue",
couponNumber
)

);





if(!couponSnap.exists()){


alert(
"존재하지 않는 쿠폰입니다."
);



requestButton.disabled=false;


requestButton.innerText=
"사용 요청";


return;


}





const couponData =
couponSnap.data();






if(couponData.used){


alert(
"이미 사용 완료된 쿠폰입니다."
);


return;


}





if(couponData.approved){


alert(
"이미 승인 완료된 쿠폰입니다."
);


return;


}







// 승인 요청 생성

await setDoc(

doc(
db,
"coupon_request",
couponNumber
),

{

couponNumber:

couponNumber,


status:

"waiting",


createdTime:

serverTimestamp()


}

);






show(

`

<b style="color:#ff9800">

⏳ 직원 승인 요청 완료

</b>

`

);



requestButton.innerText=
"승인 대기";



watchCoupon(couponNumber);



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


}
