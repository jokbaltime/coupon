import {

db,
doc,
getDoc,
getDocs,
setDoc,
collection,
query,
where,
serverTimestamp

} from "./firebase.js";


console.log("★★★★★ NEW CUSTOMER.JS 2026-07-26 ★★★★★");



const couponInput =
document.getElementById("couponNumber");


const requestButton =
document.getElementById("requestButton");


const result =
document.getElementById("result");



requestButton.onclick = async()=>{


const number =
couponInput.value.trim();

if(!number){

result.innerHTML =
"쿠폰번호를 입력하세요";

return;

}

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

// 이미 요청 중인지 확인

const requestQuery = query(

collection(
db,
"coupon_request"
),

where(
"couponNumber",
"==",
number
),

where(
"status",
"==",
"waiting"
)

);


const requestSnap =
await getDocs(requestQuery);


if(!requestSnap.empty){

result.innerHTML =
"⏳ 이미 승인 대기중인 쿠폰입니다.";

return;

}

console.log("요청 시작");

await setDoc(

doc(
db,
"coupon_request",
number
),

{

couponNumber: number,

status: "waiting",

requestTime: serverTimestamp()

}

);

console.log("저장 성공");


result.innerHTML =
"✅ 직원 승인 요청 완료";


couponInput.value="";


}


catch(error){

console.error("저장 실패", error);

result.innerHTML =
"요청 오류 : "
+error.message;

}


};
