// ======================================
// JOKBALTlME STAFF SYSTEM
// AUTH + COUPON REQUEST
// ======================================


import {

db,
auth,
doc,
getDoc,
updateDoc,
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




// =============================
// 화면 요소
// =============================


const loginArea =
document.getElementById(
"loginArea"
);


const staffArea =
document.getElementById(
"staffArea"
);



const loginButton =
document.getElementById(
"loginButton"
);



const logoutButton =
document.getElementById(
"logoutButton"
);





// =============================
// 로그인
// =============================


if(loginButton){


loginButton.onclick =
async()=>{


const email =
document.getElementById(
"email"
).value.trim();



const password =
document.getElementById(
"password"
).value.trim();




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
+
error.code
);


}



};


}









// =============================
// 로그인 상태 확인
// =============================


onAuthStateChanged(

auth,

(user)=>{


if(user){


loginArea.style.display =
"none";


staffArea.style.display =
"block";


startRequestListener();



}

else{


loginArea.style.display =
"block";


staffArea.style.display =
"none";


}



}

);









// =============================
// 로그아웃
// =============================


if(logoutButton){


logoutButton.onclick =
async()=>{


await signOut(auth);


alert(
"로그아웃 되었습니다."
);



};


}









// =============================
// 고객 요청 실시간
// =============================


function startRequestListener(){



const list =
document.getElementById(
"requestList"
);




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





const box =
document.createElement(
"div"
);



box.className =
"request-box";




box.innerHTML =

`

<h2>
🔔 새 요청
</h2>


<p>

쿠폰번호

<br>

<b>
${data.couponNumber}
</b>

</p>


<button>
승인
</button>

`;





const button =
box.querySelector(
"button"
);





button.onclick =
async()=>{



const requestRef =
doc(

db,

"coupon_request",

item.id

);





const requestSnap =
await getDoc(
requestRef
);





if(
requestSnap.data().status
!==
"waiting"

){


alert(
"이미 처리된 요청입니다."
);


return;


}





await updateDoc(

doc(

db,

"coupon_issue",

data.couponNumber

),

{


used:true,


usedTime:new Date()


}

);





await updateDoc(

requestRef,

{


status:"approved",


approvedTime:new Date(),


approvedBy:
auth.currentUser.email


}

);





alert(
"사용 완료 처리되었습니다."
);



};







list.appendChild(
box
);





}

);



}

);



}









// =============================
// 쿠폰 직접 확인
// =============================


const checkButton =
document.getElementById(
"checkButton"
);



if(checkButton){


checkButton.onclick =
async()=>{


const number =
document.getElementById(
"couponNumber"
).value.trim();



const result =
document.getElementById(
"result"
);




if(!number){


result.innerHTML =
"쿠폰번호 입력";


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
"❌ 없는 쿠폰";


return;


}





const data =
snap.data();




result.innerHTML =

data.used

?

"❌ 사용 완료 쿠폰"

:

"✅ 사용 가능 쿠폰";



};


}

// =============================
// QR 스캔
// =============================

const scanButton =

async(decodedText)=>{

document.getElementById(
"couponNumber"
).value =
decodedText;

await html5QrCode.stop();

reader.style.display="none";

document.getElementById(
"checkButton"
).click();

},

(error)=>{

// 계속 스캔 중이라 무시

}

);

};

}
