import {

db,
doc,
getDoc,
addDoc,
collection,
serverTimestamp

} from "./firebase.js";


console.log("customer.js 실행");



const couponInput =
document.getElementById("couponNumber");


const requestButton =
document.getElementById("requestButton");


const result =
document.getElementById("result");



requestButton.onclick = async()=>{


const number =
couponInput.value.trim();

const snap =
await getDoc(

doc(
db,
"coupon_issue",
number
)

);

if(!snap.exists()){

result.innerHTML =
"❌ 존재하지 않는 쿠폰입니다.";

return;

}

if(!number){

result.innerHTML =
"쿠폰번호를 입력하세요";

return;

}



try{


await addDoc(

collection(
db,
"coupon_request"
),

{


couponNumber:number,


status:"waiting",


requestTime:
serverTimestamp()


}

);



result.innerHTML =
"✅ 직원 승인 요청 완료";


couponInput.value="";


}


catch(error){


console.error(error);


result.innerHTML =
"요청 오류 : "
+error.message;


}


};
