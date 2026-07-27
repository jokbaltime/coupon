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

const couponList =
document.getElementById("couponList");

const allCouponBtn =
document.getElementById("allCouponBtn");

const waitingCouponBtn =
document.getElementById("waitingCouponBtn");

const approvedCouponBtn =
document.getElementById("approvedCouponBtn");

const usedCouponBtn =
document.getElementById("usedCouponBtn");

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

const bulkCouponTitle =
document.getElementById("bulkCouponTitle");


const bulkDiscount =
document.getElementById("bulkDiscount");


const bulkCount =
document.getElementById("bulkCount");


const bulkStartDate =
document.getElementById("bulkStartDate");


const bulkEndDate =
document.getElementById("bulkEndDate");


const bulkNotice =
document.getElementById("bulkNotice");


const bulkCreateBtn =
document.getElementById("bulkCreateBtn");

// ===== Dashboard =====

const totalCoupon =
document.getElementById("totalCoupon");

const waitingCount =
document.getElementById("waitingCount");

const approvedCount =
document.getElementById("approvedCount");

const usedCount =
document.getElementById("usedCount");

let couponFilter = "all";

let couponSnapshotData = [];

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

loadCouponList();
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

// ================================
// COUPON LIST
// ================================

function loadCouponList(){


onSnapshot(

collection(db,"coupons"),

(snapshot)=>{


couponSnapshotData = [];


snapshot.forEach((item)=>{

couponSnapshotData.push({

id:item.id,

...item.data()

});

});


renderCouponList();


}

);


}




function renderCouponList(){


couponList.innerHTML="";


const sortedList = [...couponSnapshotData].sort((a,b)=>{


const aTime =
a.updatedAt?.seconds ||
a.createdAt?.seconds ||
0;


const bTime =
b.updatedAt?.seconds ||
b.createdAt?.seconds ||
0;


return bTime - aTime;


});



sortedList.forEach((data)=>{


if(
couponFilter !== "all" &&
data.status !== couponFilter
){

return;

}



let statusText="";


switch(data.status){


case "issued":

statusText="📄 발급";

break;


case "waiting":

statusText="⏳ 승인대기";

break;


case "approved":

statusText="✅ 승인완료";

break;


case "used":

statusText="❌ 사용완료";

break;


default:

statusText=data.status;

}



const div =
document.createElement("div");



div.className =
"coupon-card";



div.innerHTML =

`

<p>
<b>${data.couponNumber}</b>
</p>

<p>
${data.title || "-"}
</p>

<p>
상태 :
${statusText}
</p>

<p>
할인 :
${data.discount || 0}%
</p>

<p>
사용 :
${data.useCount || 0}
/
${data.maxUseCount || 1}
</p>

<p>
최근 사용 :
${
data.usedAt
?
data.usedAt.toDate().toLocaleString()
:
"-"
}
</p>


<button class="selectCoupon">

조회

</button>


<button class="quickEditCoupon">

수정

</button>


<button class="quickDeleteCoupon">

삭제

</button>

`;



div.querySelector(".quickEditCoupon")
.onclick = ()=>{


if(
data.status === "used" ||
(data.useCount || 0) >= (data.maxUseCount || 1)
){

alert(
"사용 완료된 쿠폰은 수정할 수 없습니다."
);

return;

}


searchCoupon.value =
data.couponNumber;


searchBtn.click();


window.scrollTo({

top:0,

behavior:"smooth"

});


};

div.querySelector(".quickDeleteCoupon")
.onclick = async()=>{

if(
data.status === "used" ||
(data.useCount || 0) >= (data.maxUseCount || 1)
){

alert(
"사용 완료된 쿠폰은 삭제할 수 없습니다."
);

return;

}  

const result =
confirm(
"이 쿠폰을 삭제하시겠습니까?"
);


if(!result){

return;

}



await deleteDoc(

doc(
db,
"coupons",
data.couponNumber
)

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
"deleted",


time:
serverTimestamp()


}

);



alert(
"삭제 완료"
);


};

couponList.appendChild(div);



});


}

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


if(
data.status==="approved" &&
(data.useCount || 0) < (data.maxUseCount || 1)
){

approved++;

}


if(
data.status==="used" ||
(data.useCount || 0) >= (data.maxUseCount || 1)
){

used++;

}

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


// ================================
// 입력창 표시
// ================================

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



// ================================
// 상태 표시
// ================================

let statusText="";


if(
(data.useCount || 0)
>=
(data.maxUseCount || 1)
){

statusText =
"❌ 사용 완료";

}

else{


switch(data.status){


case "issued":

statusText =
"📄 발급 완료";

break;


case "waiting":

statusText =
"⏳ 승인 대기";

break;


case "approved":

statusText =
"✅ 승인 완료";

break;


case "used":

statusText =
"❌ 사용 완료";

break;


default:

statusText =
data.status || "-";

}


}



// ================================
// 수정 버튼 표시
// ================================

if(editButtons){

editButtons.classList.remove("hidden");

}



// ================================
// 결과 표시
// ================================

couponResult.innerHTML =

`

${
data.image
?
`
<img 
src="${data.image}"
style="
width:200px;
border-radius:10px;
margin:10px 0;
">
`
:
""
}


<p>
안내 :
${data.notice || "-"}
</p>


<p>
번호 :
${data.couponNumber || "-"}
</p>


<p>
제목 :
${data.title || "-"}
</p>


<p>
상태 :
${statusText}
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


<p>
사용기간 :
${data.startDate || "-"}
~
${data.endDate || "-"}
</p>


<p>
승인시간 :
${
data.approvedAt && data.approvedAt.toDate
?
data.approvedAt.toDate().toLocaleString()
:
"-"
}
</p>


<p>
사용시간 :
${
data.usedAt && data.usedAt.toDate
?
data.usedAt.toDate().toLocaleString()
:
"-"
}
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

const couponData =
check.data();


if(
couponData.status === "used" ||
(couponData.useCount || 0) >= (couponData.maxUseCount || 1)
){

alert(
"사용 완료된 쿠폰은 삭제할 수 없습니다."
);

return;

}
  
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

// ================================
// UPDATE COUPON
// ================================

// ================================
// COUPON FILTER
// ================================

allCouponBtn.onclick = ()=>{

couponFilter = "all";

renderCouponList();

};



waitingCouponBtn.onclick = ()=>{

couponFilter = "waiting";

renderCouponList();

};



approvedCouponBtn.onclick = ()=>{

couponFilter = "approved";

renderCouponList();

};



usedCouponBtn.onclick = ()=>{

couponFilter = "used";

renderCouponList();

};

updateCouponBtn.onclick = async()=>{


const number =
couponNumber.value.trim();


const check =
await getDoc(
doc(
db,
"coupons",
number
)
);


if(check.exists()){

const data =
check.data();


if(
data.status === "used" ||
(data.useCount || 0) >= (data.maxUseCount || 1)
){

alert(
"사용 완료된 쿠폰은 수정할 수 없습니다."
);

return;

}

}



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


}

);





await addDoc(

collection(
db,
"coupon_history"
),

{


couponNumber:number,


action:"updated",


time:
serverTimestamp()


}

);





alert(
"쿠폰 수정 완료"
);



};
