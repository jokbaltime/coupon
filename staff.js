// staff.js FULL REPLACEMENT
// 승인 → 신규 쿠폰 코드 생성 → 요청 종료 → 고객 동기화 FIX

import {
db,
auth,
doc,
getDoc,
setDoc,
addDoc,
collection,
query,
where,
onSnapshot,
serverTimestamp
} from "./firebase.js";

import {
signInWithEmailAndPassword,
signOut,
onAuthStateChanged
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


const ADMIN_EMAIL = "admin@jokbaltime.com";


const loginArea = document.getElementById("loginArea");
const staffArea = document.getElementById("staffArea");

const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");

const requestList = document.getElementById("requestList");

const couponInput = document.getElementById("couponNumber");
const checkButton = document.getElementById("checkButton");
const useButton = document.getElementById("useButton");

const resultDiv = document.getElementById("result");


let currentUserIsAdmin = false;



// LOGIN

if(loginButton){

loginButton.onclick = async()=>{

const email =
document.getElementById("email").value.trim();

const password =
document.getElementById("password").value.trim();


try{

await signInWithEmailAndPassword(
auth,
email,
password
);

}
catch(e){

alert(e.message);

}

};

}



// AUTH

onAuthStateChanged(auth,(user)=>{

if(user){

loginArea.style.display="none";
staffArea.style.display="block";


currentUserIsAdmin =
user.email === ADMIN_EMAIL;


startRequestListener();


}
else{

loginArea.style.display="block";
staffArea.style.display="none";

}

});



// LOGOUT

if(logoutButton){

logoutButton.onclick=async()=>{

await signOut(auth);

};

}



// ==============================
// 요청 목록
// ==============================

function startRequestListener(){

if(!requestList)return;


const q=query(
collection(db,"coupon_request"),
where("status","==","waiting")
);



onSnapshot(q,(snapshot)=>{


requestList.innerHTML="";


snapshot.forEach((item)=>{


const data=item.data();


const div=document.createElement("div");


div.innerHTML=

`

<p>
쿠폰번호 :
<b>${data.couponNumber}</b>
</p>

<button>
승인
</button>

`;



div.querySelector("button")
.onclick=async()=>{


if(!currentUserIsAdmin){

alert("관리자만 승인 가능합니다.");

return;

}


const btn =
div.querySelector("button");


btn.disabled=true;



try{


const oldCode =
data.couponNumber;



// 신규 사용 코드 생성

const newCode =
"JT" + Date.now();




// 신규 쿠폰 생성

await setDoc(

doc(
db,
"coupon_issue",
newCode
),

{

couponNumber:newCode,

approved:true,

used:false,

sourceRequest:oldCode,

createdTime:
serverTimestamp(),

approvedTime:
serverTimestamp()

}

);





// 요청 종료

await setDoc(

doc(
db,
"coupon_request",
item.id
),

{

status:"approved",

requestClosed:true,

approvedCoupon:newCode,

approvedTime:
serverTimestamp()

},

{

merge:true

}

);






// 기록

await addDoc(

collection(db,"coupon_history"),

{

couponNumber:newCode,

action:"approved",

staff:
auth.currentUser.email,

approvedTime:
serverTimestamp()

}

);



alert(

"승인 완료\n새 쿠폰 : "+newCode

);



}

catch(e){

alert(
"승인 오류 : "+e.message
);


btn.disabled=false;

}



};



requestList.appendChild(div);



});


});


}



// ==============================
// 쿠폰 조회
// ==============================

if(checkButton){


checkButton.onclick=async()=>{


const num =
couponInput.value.trim();


if(!num)return;


const snap =
await getDoc(

doc(
db,
"coupon_issue",
num
)

);



if(!snap.exists()){

resultDiv.innerHTML="❌ 없는 쿠폰";

return;

}



const data=snap.data();



if(data.used){

resultDiv.innerHTML="❌ 사용 완료";

}

else if(data.approved){

resultDiv.innerHTML="✅ 승인 완료 사용 가능";

}

else{

resultDiv.innerHTML="⏳ 승인 대기";

}



};


}



// ==============================
// 사용 처리
// ==============================


if(useButton){


useButton.onclick=async()=>{


const num =
couponInput.value.trim();



if(!num)return;



const ref =
doc(
db,
"coupon_issue",
num
);



const snap =
await getDoc(ref);



if(!snap.exists()){

alert("없는 쿠폰");

return;

}



const data=snap.data();



if(data.used){

alert("이미 사용");

return;

}



await setDoc(

ref,

{

used:true,

usedTime:
serverTimestamp()

},

{

merge:true

}

);



await addDoc(

collection(db,"coupon_history"),

{

couponNumber:num,

action:"used",

staff:
auth.currentUser.email,

usedTime:
serverTimestamp()

}

);



alert("사용 완료");


couponInput.value="";


};


}
