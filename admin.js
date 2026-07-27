// ======================================
// admin.js
// JOKBAL TIME COUPON ADMIN SYSTEM
// PART 1
// ======================================

import {

db,
auth,
collection,
doc,
getDoc,
setDoc,
updateDoc,
addDoc,
deleteDoc,
query,
where,
orderBy,
onSnapshot,
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

const adminBox =
document.getElementById("adminBox");

const loginBtn =
document.getElementById("loginBtn");

const logoutBtn =
document.getElementById("logoutBtn");

const couponNumber =
document.getElementById("couponNumber");

const couponTitle =
document.getElementById("couponTitle");

const discount =
document.getElementById("discount");

const maxUseCount =
document.getElementById("maxUseCount");

const notice =
document.getElementById("notice");

const imageUrl =
document.getElementById("imageUrl");

const startDate =
document.getElementById("startDate");

const endDate =
document.getElementById("endDate");

const saveCouponBtn =
document.getElementById("saveCouponBtn");

const requestList =
document.getElementById("requestList");

const searchCoupon =
document.getElementById("searchCoupon");

const searchBtn =
document.getElementById("searchBtn");

const couponResult =
document.getElementById("couponResult");

const cancelUseBtn =
document.getElementById("cancelUseBtn");

const deleteCouponBtn =
document.getElementById("deleteCouponBtn");

const editButtons =
document.getElementById("editButtons");

const editCouponBtn =
document.getElementById("editCouponBtn");

const updateCouponBtn =
document.getElementById("updateCouponBtn");

const historyList =
document.getElementById("historyList");


// ===== Dashboard =====

const totalCoupon =
document.getElementById("totalCoupon");

const waitingCount =
document.getElementById("waitingCount");

const approvedCount =
document.getElementById("approvedCount");

const usedCount =
document.getElementById("usedCount");



// ================================
// LOGIN
// ================================

loginBtn.onclick = async()=>{

const email =
document.getElementById("adminEmail").value.trim();

const password =
document.getElementById("adminPassword").value.trim();

try{

await signInWithEmailAndPassword(

auth,
email,
password

);

}

catch(error){

alert(
"로그인 실패 : " +
error.message
);

}

};



// ================================
// LOGIN STATE
// ================================

onAuthStateChanged(auth,(user)=>{

if(user){

loginBox.classList.add("hidden");

adminBox.classList.remove("hidden");

loadDashboard();

loadRequests();

loadHistory();

}

else{

loginBox.classList.remove("hidden");

adminBox.classList.add("hidden");

}

});



logoutBtn.onclick = async()=>{

await signOut(auth);

};



// ================================
// DASHBOARD
// ================================

function loadDashboard(){

onSnapshot(

collection(db,"coupons"),

(snapshot)=>{

let total=0;
let waiting=0;
let approved=0;
let used=0;

snapshot.forEach((item)=>{

total++;

const data =
item.data();

if(data.status==="waiting")
waiting++;

if(data.status==="approved")
approved++;

if(data.status==="used")
used++;

});

if(totalCoupon)
totalCoupon.innerText=total;

if(waitingCount)
waitingCount.innerText=waiting;

if(approvedCount)
approvedCount.innerText=approved;

if(usedCount)
usedCount.innerText=used;

});

}



// ================================
// SAVE COUPON
// ================================

saveCouponBtn.onclick = async()=>{

const number =
couponNumber.value.trim();

if(!number){

alert(
"쿠폰번호 입력"
);

return;

}

const couponRef =
doc(
db,
"coupons",
number
);

const oldCoupon =
await getDoc(couponRef);

let saveData={

couponNumber:number,

title:
couponTitle.value.trim(),

discount:
Number(discount.value),

maxUseCount:
Number(maxUseCount.value),

notice:
notice.value.trim(),

image:
imageUrl.value.trim(),

startDate:
startDate.value,

endDate:
endDate.value,

updatedAt:
serverTimestamp()

};

if(oldCoupon.exists()){

const oldData =
oldCoupon.data();

saveData.status =
oldData.status;

saveData.createdAt =
oldData.createdAt;

saveData.useCount =
oldData.useCount || 0;

}

else{

saveData.status =
"issued";

saveData.useCount =
0;

saveData.createdAt =
serverTimestamp();

}

await setDoc(

couponRef,

saveData,

{

merge:true

}

);

alert(
"쿠폰 저장 완료"
);
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

onSnapshot(q,(snapshot)=>{

requestList.innerHTML="";

snapshot.forEach((item)=>{

const data =
item.data();

const div =
document.createElement("div");

div.className =
"request-card";

div.innerHTML =

`

<p>
쿠폰번호 :
<b>${data.couponNumber}</b>
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
.onclick = async()=>{

await approveCoupon(
data.couponNumber
);

};

requestList.appendChild(div);

});

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

const couponSnap =
await getDoc(couponRef);

if(!couponSnap.exists()){

alert(
"쿠폰 데이터를 찾을 수 없습니다."
);

return;

}

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
// SEARCH COUPON
// ================================

searchBtn.onclick = async()=>{

const number =
searchCoupon.value.trim();

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

couponResult.innerHTML =
"❌ 쿠폰 없음";

return;

}

const data =
snap.data();


// 조회한 쿠폰 정보 입력창 표시
couponNumber.value =
data.couponNumber || "";

couponTitle.value =
data.title || "";

discount.value =
data.discount || 0;

maxUseCount.value =
data.maxUseCount || 1;

notice.value =
data.notice || "";

imageUrl.value =
data.image || "";

startDate.value =
data.startDate || "";

endDate.value =
data.endDate || "";


// 수정 버튼 표시
if(editButtons){

editButtons.classList.remove("hidden");

}


couponResult.innerHTML =
`

<p>
번호 :
${data.couponNumber}
</p>

<p>
제목 :
${data.title}
</p>

<p>
상태 :
${data.status}
</p>

<p>
할인 :
${data.discount}%
</p>

<p>
사용횟수 :
${data.useCount || 0}
/
${data.maxUseCount || 1}
</p>

<p>
사용기간 :
${data.startDate || "-"}
~
${data.endDate || "-"}
</p>

`;

};



// ================================
// CANCEL USE
// ================================

cancelUseBtn.onclick = async()=>{

const number =
searchCoupon.value.trim();

if(!number){

alert(
"쿠폰번호 입력"
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

status:"approved",

cancelledAt:
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

action:"cancelled",

time:
serverTimestamp()

}

);

alert(
"사용 취소 복구 완료"
);

  };



// ================================
// HISTORY
// ================================

function loadHistory(){

const q =

query(

collection(
db,
"coupon_history"
),

orderBy(
"time",
"desc"
)

);

onSnapshot(q,(snapshot)=>{

historyList.innerHTML="";

snapshot.forEach((item)=>{

const data =
item.data();

const div =
document.createElement("div");

div.className =
"history-card";

div.innerHTML =

`

<p>
쿠폰번호 :
<b>${data.couponNumber}</b>
</p>

<p>
처리 :
${data.action}
</p>

<p>
시간 :
${
data.time
?
data.time.toDate().toLocaleString()
:
"처리 시간 없음"
}
</p>

`;

historyList.appendChild(div);

});

});

}



// ================================
// DELETE COUPON
// ================================

deleteCouponBtn.onclick = async()=>{

const number =
searchCoupon.value.trim();

if(!number){

alert(
"삭제할 쿠폰번호 입력"
);

return;

}

const check =
await getDoc(

doc(
db,
"coupons",
number
)

);

if(!check.exists()){

alert(
"쿠폰 없음"
);

return;

}

const confirmDelete =
confirm(
"이 쿠폰을 삭제하시겠습니까?"
);

if(!confirmDelete){

return;

}

await deleteDoc(

doc(
db,
"coupons",
number
)

);

await addDoc(

collection(
db,
"coupon_history"
),

{

couponNumber:number,

action:"deleted",

time:
serverTimestamp()

}

);

couponResult.innerHTML = "";

alert(
"쿠폰 삭제 완료"
);

};
