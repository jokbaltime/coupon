// ======================================
// JOKBALTIMESTAFF SYSTEM
// staff.js FULL VERSION
// ======================================


import {

db,
auth,
doc,
getDoc,
getDocs,
updateDoc,
addDoc,
collection,
query,
where,
onSnapshot,
orderBy,
serverTimestamp

} from "./firebase.js";

console.log("staff.js 정상 실행");

import {

signInWithEmailAndPassword,
signOut,
onAuthStateChanged

} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";



// ======================
// ELEMENT
// ======================


const ADMIN_EMAIL =
"admin@jokbaltime.com";

const loginArea =
document.getElementById("loginArea");

const staffArea =
document.getElementById("staffArea");


const loginButton =
document.getElementById("loginButton");

const logoutButton =
document.getElementById("logoutButton");


const couponInput =
document.getElementById("couponNumber");


const checkButton =
document.getElementById("checkButton");


const useButton =
document.getElementById("useButton");


const cancelButton =
document.getElementById("cancelButton");


const scanButton =
document.getElementById("scanButton");


const resultDiv =
document.getElementById("result");


const reader =
document.getElementById("reader");

const historyList =
document.getElementById("historyList");

const adminArea =
document.getElementById("adminArea");

const adminStats =
document.getElementById("adminStats");

let html5QrCode = null;



// ======================
// LOGIN
// ======================


if(loginButton){

loginButton.onclick = async()=>{


const email =
document.getElementById("email")
.value.trim();


const password =
document.getElementById("password")
.value.trim();



try{


await signInWithEmailAndPassword(

auth,

email,

password

);


alert(
"로그인 성공"
);


}

catch(error){


alert(
"로그인 실패 : "
+ error.message
);


}


};

}



// ======================
// AUTH CHECK
// ======================


onAuthStateChanged(

auth,

(user)=>{


if(user){

console.log("현재 로그인:", user.email);
    
loginArea.style.display="none";

staffArea.style.display="block";


startRequestListener();

loadHistory();

console.log("로그인 계정:", user.email);
console.log("관리자 계정:", ADMIN_EMAIL);
console.log("관리자 영역:", adminArea);

if(user.email === ADMIN_EMAIL){

adminArea.style.display="block";

loadAdminStats();

}

}

else{


loginArea.style.display="block";


staffArea.style.display="none";


stopScanner();


}


}

);




// ======================
// LOGOUT
// ======================


if(logoutButton){

logoutButton.onclick = async()=>{


await stopScanner();


await signOut(auth);


alert(
"로그아웃"
);


};

}



// ======================
// REQUEST LISTENER
// ======================


function startRequestListener(){


const list =
document.getElementById("requestList");


if(!list)return;



const q =
query(

collection(
db,
"coupon_request"
),

where(
"status",
"==",
"waiting"
)

);



onSnapshot(

q,

(snapshot)=>{


list.innerHTML="";



snapshot.forEach(

(item)=>{


const data =
item.data();



const div =
document.createElement("div");



div.innerHTML=

`

<h3>
🔔 쿠폰 요청
</h3>

<p>
쿠폰번호 :
<b>
${data.couponNumber}
</b>
</p>

<button>
승인
</button>

`;



div.querySelector("button")
.onclick = async()=>{


try{


await updateDoc(

doc(
db,
"coupon_issue",
data.couponNumber
),

{

used:true,

usedTime:
serverTimestamp()

}

);



await addDoc(

collection(
db,
"coupon_history"
),

{

couponNumber:
data.couponNumber,

action:
"approved",

usedTime:
serverTimestamp(),

staff:
auth.currentUser.email

}

);



await updateDoc(

doc(
db,
"coupon_request",
item.id
),

{

status:
"approved",

approvedTime:
serverTimestamp(),

approvedBy:
auth.currentUser.email

}

);



alert(
"승인 완료"
);


}

catch(error){


alert(
"승인 오류 : "
+error.message
);


}


};



list.appendChild(div);



}


);



}


);


}

// ======================
// COUPON CHECK
// ======================


if(checkButton){


checkButton.onclick = async()=>{


const number =
couponInput.value.trim();



if(!number){


resultDiv.innerHTML =
"쿠폰번호 입력";


return;


}



try{


const snap =
await getDoc(

doc(
db,
"coupon_issue",
number
)

);



if(!snap.exists()){


resultDiv.innerHTML =
"❌ 없는 쿠폰";


return;


}



const data =
snap.data();



if(data.used){


resultDiv.innerHTML =
"❌ 사용 완료 쿠폰";


}

else{


resultDiv.innerHTML =
"✅ 사용 가능한 쿠폰";


}


}

catch(error){


resultDiv.innerHTML =
"조회 오류 : "
+ error.message;


}



};


}







// ======================
// USE COUPON
// ======================


if(useButton){


useButton.onclick = async()=>{


const number =
couponInput.value.trim();



if(!number){


alert(
"쿠폰번호 입력"
);


return;


}



try{


const ref =
doc(
db,
"coupon_issue",
number
);



const snap =
await getDoc(ref);



if(!snap.exists()){


alert(
"없는 쿠폰입니다."
);


return;


}



const data =
snap.data();



if(data.used){


alert(
"이미 사용 완료된 쿠폰입니다."
);


return;


}




// 사용 처리

await updateDoc(

ref,

{

used:true,

usedTime:
serverTimestamp()

}

);




// 기록 저장

await addDoc(

collection(
db,
"coupon_history"
),

{

couponNumber:number,

action:"used",

usedTime:
serverTimestamp(),

staff:
auth.currentUser.email

}

);



resultDiv.innerHTML =
"❌ 사용 완료 쿠폰";



couponInput.value="";



alert(
"사용 완료 처리되었습니다."
);


}

catch(error){


console.error(error);


alert(
"사용 처리 오류 : "
+error.message
);


}



};


}







// ======================
// CANCEL COUPON
// ======================


if(cancelButton){


cancelButton.onclick = async()=>{


const number =
couponInput.value.trim();



if(!number){


alert(
"쿠폰번호 입력"
);


return;


}



try{


const ref =
doc(
db,
"coupon_issue",
number
);



const snap =
await getDoc(ref);



if(!snap.exists()){


alert(
"없는 쿠폰입니다."
);


return;


}




await updateDoc(

ref,

{

used:false,

usedTime:null

}

);





await addDoc(

collection(
db,
"coupon_history"
),

{

couponNumber:number,

action:"cancel",

usedTime:
serverTimestamp(),

staff:
auth.currentUser.email

}

);




resultDiv.innerHTML =
"✅ 사용 가능 쿠폰";



alert(
"사용 취소 완료"
);



}

catch(error){


alert(
"취소 오류 : "
+error.message
);


}



};


}







// ======================
// QR SCANNER START
// ======================


if(scanButton){


scanButton.onclick = async()=>{


if(html5QrCode){


await stopScanner();


}

else{


await startScanner();


}


};


}







async function startScanner(){



reader.style.display="block";



html5QrCode =
new Html5Qrcode(
"reader"
);



const config = {


fps:10,


qrbox:250


};




try{


await html5QrCode.start(

{

facingMode:
"environment"

},

config,

async(decodedText)=>{


console.log(
"QR:",
decodedText
);



couponInput.value =
decodedText;



await stopScanner();



checkButton.click();



},


(error)=>{}



);



}

catch(error){


alert(
"카메라 오류 : "
+error.message
);


await stopScanner();


}



}







// ======================
// QR STOP
// ======================


async function stopScanner(){


if(html5QrCode){


try{


await html5QrCode.stop();



html5QrCode.clear();



}

catch(error){


console.log(error);


}



html5QrCode=null;



}



if(reader){


reader.style.display="none";


}

}  

// ======================
// HISTORY LIST
// ======================

function loadHistory(){


if(!historyList) return;



const q =
query(

collection(
db,
"coupon_history"
),

orderBy(
"usedTime",
"desc"
)
);



onSnapshot(

q,

(snapshot)=>{


historyList.innerHTML="";



if(snapshot.empty){

historyList.innerHTML =
"기록이 없습니다.";

return;

}



snapshot.forEach((item)=>{

    const data = item.data();

    let time="";

    if(data.usedTime){

        time =
        data.usedTime
        .toDate()
        .toLocaleString();

    }


    const div =
    document.createElement("div");


    div.style.borderBottom =
    "1px solid #444";


    div.style.padding =
    "10px 0";


    div.innerHTML = `

    <b>쿠폰번호</b> :
    ${data.couponNumber}

    <br>

    <b>처리</b> :
    ${data.action || "used"}

    <br>

    <b>직원</b> :
    ${data.staff || ""}

    <br>

    <b>시간</b> :
    ${time}

    `;


   historyList.appendChild(div);

});

}

);

}

function loadAdminStats(){

if(!adminStats) return;


const q =
query(
collection(db,"coupon_issue")
);


onSnapshot(q,(snap)=>{


let total = snap.size;

let used = 0;


snap.forEach((doc)=>{

const data = doc.data();


if(data.used){

used++;

}

});


adminStats.innerHTML = `

<p>
전체 쿠폰 : ${total}
</p>

<p>
사용 완료 : ${used}
</p>

<p>
사용 가능 : ${total-used}
</p>

`;

});


}
