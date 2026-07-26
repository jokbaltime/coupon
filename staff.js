// staff.js FULL REPLACEMENT
// STAFF APPROVAL / USE PROCESS SYNC VERSION


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



let isAdmin=false;





// 로그인

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



}

catch(error){


alert(
"로그인 실패 : "
+error.message
);


}



};


}







// 인증 상태

onAuthStateChanged(

auth,

(user)=>{


if(user){


loginArea.style.display="none";


staffArea.style.display="block";



isAdmin =
user.email === ADMIN_EMAIL;



startRequestListener();


}

else{


loginArea.style.display="block";


staffArea.style.display="none";


}



}

);






// 로그아웃

if(logoutButton){


logoutButton.onclick =
()=>{


signOut(auth);


};


}









// 고객 요청 표시

function startRequestListener(){



if(!requestList)
return;



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


requestList.innerHTML="";



snapshot.forEach(

(item)=>{


const data =
item.data();



if(
data.requestClosed===true
)
return;





const div =
document.createElement("div");



div.innerHTML=

`

<p>

쿠폰번호 :

<b>

${data.couponNumber}

</b>

</p>


<button>

✅ 승인

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



const number =
data.couponNumber;




try{



// 1. 쿠폰 승인 상태 변경

await setDoc(

doc(
db,
"coupon_issue",
number
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







// 2. 고객 요청 종료

await setDoc(

doc(
db,
"coupon_request",
number
),

{

status:"approved",

requestClosed:true,

approvedTime:
serverTimestamp()


},

{

merge:true

}

);







// 3. 승인 기록

await addDoc(

collection(
db,
"coupon_history"
),

{

couponNumber:number,

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


const number =
couponInput.value.trim();



if(!number)
return;



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
"✅ 승인 완료 / 사용 가능";


}

else{


result.innerHTML =
"⏳ 승인 전";


}



};


}









// 사용 처리

if(useButton){


useButton.onclick =
async()=>{


const number =
couponInput.value.trim();



if(!number)
return;




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


alert(
"없는 쿠폰"
);


return;


}




const data =
snap.data();



if(!data.approved){


alert(
"승인되지 않은 쿠폰"
);


return;


}



if(data.used){


alert(
"이미 사용 완료"
);


return;


}






await setDoc(

doc(
db,
"coupon_issue",
number
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

couponNumber:number,

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
