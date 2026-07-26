// staff.js FULL REPLACEMENT
// REQUEST APPROVAL / COUPON STATUS SYNC VERSION


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
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";



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


const requestList =
document.getElementById("requestList");


const couponInput =
document.getElementById("couponNumber");


const checkButton =
document.getElementById("checkButton");


const useButton =
document.getElementById("useButton");


const result =
document.getElementById("result");



let isAdmin = false;



// LOGIN

if(loginButton){


loginButton.onclick =
async()=>{


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



alert(
"로그인 성공"
);


}

catch(error){


alert(
"로그인 실패 : "
+error.message
);


}



};


}





// AUTH

onAuthStateChanged(

auth,

(user)=>{


if(user){


if(loginArea)
loginArea.style.display="none";


if(staffArea)
staffArea.style.display="block";



isAdmin =
user.email === ADMIN_EMAIL;



startRequestListener();



}

else{


if(loginArea)
loginArea.style.display="block";


if(staffArea)
staffArea.style.display="none";


}


}

);





// LOGOUT

if(logoutButton){


logoutButton.onclick =
async()=>{


await signOut(auth);


};


}






// 요청 목록

function startRequestListener(){


if(!requestList)
return;



const q = query(

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


requestList.innerHTML="";



snapshot.forEach(

(item)=>{


const data =
(item.data());



if(
data.requestClosed === true
)
return;




const div =
document.createElement("div");



div.innerHTML =

`

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
.onclick =
async()=>{


if(!isAdmin){


alert(
"관리자만 승인 가능합니다."
);


return;


}




const code =
data.couponNumber;




try{


// coupon_issue 승인

await setDoc(

doc(
db,
"coupon_issue",
code
),

{

approved:true,

approvedTime:
serverTimestamp()

},

{

merge:true

}

);






// coupon_request 유지

await setDoc(

doc(
db,
"coupon_request",
item.id
),

{

status:"approved",

requestClosed:true,

approvedTime:
serverTimestamp(),

approvedBy:
auth.currentUser.email

},

{

merge:true

}

);






// history 기록

await addDoc(

collection(
db,
"coupon_history"
),

{

couponNumber:code,

action:"approved",

approvedTime:
serverTimestamp(),

staff:
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



requestList.appendChild(div);



}


);


}

);


}






// 쿠폰 조회

if(checkButton){


checkButton.onclick =
async()=>{


const code =
couponInput.value.trim();



if(!code)
return;



const snap =
await getDoc(

doc(
db,
"coupon_issue",
code
)

);



if(!snap.exists()){


result.innerHTML =
"❌ 없는 쿠폰";


return;


}



const data =
snap.data();



if(data.used){


result.innerHTML =
"❌ 사용 완료";


}

else if(data.approved){


result.innerHTML =
"✅ 승인 완료 사용 가능";


}

else{


result.innerHTML =
"⏳ 승인 대기";


}



};


}






// 사용 처리

if(useButton){


useButton.onclick =
async()=>{


const code =
couponInput.value.trim();



if(!code)
return;



try{


await setDoc(

doc(
db,
"coupon_issue",
code
),

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

collection(
db,
"coupon_history"
),

{

couponNumber:code,

action:"used",

usedTime:
serverTimestamp(),

staff:
auth.currentUser.email

}

);



alert(
"사용 완료"
);



couponInput.value="";



}

catch(error){


alert(
"사용 오류 : "
+error.message
);


}



};


}
