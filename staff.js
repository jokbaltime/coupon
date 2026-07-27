// ======================================
// staff.js
// JOKBAL TIME STAFF SYSTEM
// ======================================


import {

db,

auth,

doc,

getDoc,

updateDoc,

collection,

query,

where,

onSnapshot,

addDoc,

serverTimestamp

} from "./firebase.js";



import {

signInWithEmailAndPassword,

signOut,

onAuthStateChanged

} from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";






// ================================
// ELEMENT
// ================================


const loginBox =
document.getElementById("loginBox");


const staffBox =
document.getElementById("staffBox");


const loginBtn =
document.getElementById("loginBtn");


const logoutBtn =
document.getElementById("logoutBtn");


const requestList =
document.getElementById("requestList");


const useCouponNumber =
document.getElementById("useCouponNumber");


const checkBtn =
document.getElementById("checkBtn");


const couponInfo =
document.getElementById("couponInfo");


const useBtn =
document.getElementById("useBtn");

const scanQRBtn =
document.getElementById("scanQRBtn");

const reader =
document.getElementById("reader");





// ================================
// LOGIN
// ================================


loginBtn.onclick = async()=>{


const email =
document.getElementById("staffEmail").value.trim();


const password =
document.getElementById("staffPassword").value.trim();



try{


await signInWithEmailAndPassword(

auth,

email,

password

);



}

catch(e){


alert(
"로그인 실패 : "
+
e.message
);


}


};









onAuthStateChanged(auth,(user)=>{


if(user){


loginBox.classList.add("hidden");


staffBox.classList.remove("hidden");


loadRequests();


}

else{


loginBox.classList.remove("hidden");


staffBox.classList.add("hidden");


}


});







logoutBtn.onclick = async()=>{


await signOut(auth);


};









// ================================
// REQUEST LIST
// ================================


function loadRequests(){



const q =

query(

collection(
db,
"coupon_requests"
),

where(
"status",
"==",
"waiting"
)

);





onSnapshot(q,async(snapshot)=>{


requestList.innerHTML="";



for(const item of snapshot.docs){



const data =
item.data();



const div =
document.createElement("div");



const couponSnap =
await getDoc(

doc(
db,
"coupons",
data.couponNumber
)

);



let couponData = {};



if(couponSnap.exists()){


couponData =
couponSnap.data();


}




div.className =
"request-item";



div.innerHTML =

`

<p>
쿠폰번호 :
<b>${data.couponNumber}</b>
</p>


<p>
쿠폰명 :
${couponData.title || "-"}
</p>


<p>
할인 :
${couponData.discount || 0}%
</p>


<p>
요청시간 :
${
data.createdAt
?
data.createdAt.toDate().toLocaleString()
:
""
}
</p>


<button>
승인
</button>

`;





div.querySelector("button")
.onclick = ()=>{


approveCoupon(
data.couponNumber
);


};





requestList.appendChild(div);



}



});


}









// ================================
// APPROVE
// ================================


async function approveCoupon(number){



const couponRef =
doc(
db,
"coupons",
number
);



await updateDoc(

couponRef,

{


status:"approved",


approvedAt:
serverTimestamp()


}

);





await updateDoc(

doc(
db,
"coupon_requests",
number
),

{


status:"approved"


}

);






await addDoc(

collection(
db,
"coupon_history"
),

{


couponNumber:number,


action:"approved",


time:
serverTimestamp()


}

);





alert(
"승인 완료"
);



}









// ================================
// CHECK COUPON
// ================================


checkBtn.onclick = async()=>{


const number =
useCouponNumber.value.trim();



if(!number){

alert(
"쿠폰번호 입력"
);

return;

}





const snap =

await getDoc(

doc(
db,
"coupons",
number
)

);





if(!snap.exists()){


couponInfo.innerHTML =
"❌ 쿠폰 없음";


return;


}





const data =
snap.data();





couponInfo.innerHTML =

`

<p>
상태 :
${data.status}
</p>


<p>
쿠폰명 :
${data.title || "-"}
</p>


<p>
할인 :
${data.discount || 0}%
</p>


<p>
사용횟수 :
${data.useCount || 0}
/
${data.maxUseCount || 1}
</p>

`;



};









// ================================
// USE COMPLETE
// ================================


useBtn.onclick = async()=>{


const number =
useCouponNumber.value.trim();



if(!number){

alert(
"쿠폰번호 입력"
);

return;

}





const snap =

await getDoc(

doc(
db,
"coupons",
number
)

);





if(!snap.exists()){


alert(
"쿠폰 없음"
);


return;


}





const data =
snap.data();





if(data.status !== "approved"){


alert(
"승인 완료된 쿠폰만 사용 가능합니다."
);


return;


}





const useCount =
data.useCount || 0;


const maxUseCount =
data.maxUseCount || 1;





if(useCount >= maxUseCount){


alert(
"사용 횟수를 초과한 쿠폰입니다."
);


return;


}






await updateDoc(

doc(
db,
"coupons",
number
),

{


status:"used",


useCount:
useCount + 1,


usedAt:
serverTimestamp()


}

);








await addDoc(

collection(
db,
"coupon_use"
),

{


couponNumber:number,


usedAt:
serverTimestamp()


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


time:
serverTimestamp()


}

);





alert(
"사용 완료 처리"
);



};

// ================================
// QR SCANNER
// ================================

scanQRBtn.onclick = () => {

reader.innerHTML = "";

const html5QrCode = new Html5Qrcode("reader");

html5QrCode.start(

{ facingMode: "environment" },

{

fps: 10,

qrbox: {

width:300,

height:300

}

},

(decodedText) => {

// QR에서 읽은 쿠폰번호 입력
useCouponNumber.value = decodedText;

// 카메라 종료
html5QrCode.stop();

// 기존 조회 기능 실행
checkBtn.click();

},

(errorMessage) => {

// 무시
}

);

};
