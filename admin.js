// ======================================
// admin.js
// JOKBAL TIME COUPON ADMIN SYSTEM
// FIX VERSION PART 1
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
serverTimestamp,
runTransaction
    
} from "./firebase.js";


import {

signInWithEmailAndPassword,
signOut,
onAuthStateChanged

}

from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";



// ================================
// ELEMENT
// ================================


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


const useCouponBtn =
document.getElementById("useCouponBtn");

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

const issuedCouponBtn =
document.getElementById("issuedCouponBtn");

const allCouponBtn =
document.getElementById("allCouponBtn");


const waitingCouponBtn =
document.getElementById("waitingCouponBtn");


const approvedCouponBtn =
document.getElementById("approvedCouponBtn");


const usedCouponBtn =
document.getElementById("usedCouponBtn");

const totalCoupon =
document.getElementById("totalCoupon");

const waitingCount =
document.getElementById("waitingCount");

const approvedCount =
document.getElementById("approvedCount");

const usedCount =
document.getElementById("usedCount");

const expiredCount =
document.getElementById("expiredCount");

const todayIssued =
document.getElementById("todayIssued");

const todayUsed =
document.getElementById("todayUsed");

const scanQrBtn =
document.getElementById("scanQrBtn");


const reader =
document.getElementById("reader");

let couponFilter="all";

let couponSnapshotData=[];






// ================================
// AUTH
// ================================

onAuthStateChanged(auth, async (user)=>{


if(user){


const userSnap =
await getDoc(
doc(db,"users",user.uid)
);



if(!userSnap.exists()){

alert("사용자 권한 정보가 없습니다.");

await signOut(auth);

return;

}



const userData =
userSnap.data();



if(
userData.role !== "staff" &&
userData.role !== "admin"
){

alert("관리자 권한이 없습니다.");

await signOut(auth);

return;

}



adminBox.classList.remove("hidden");


loadDashboard();

loadCouponList();

loadHistory();

loadRequests();


}

else{


location.href="login.html";


}


});


logoutBtn.onclick = async()=>{

await signOut(auth);

};

// ================================
// COUPON LIST
// ================================

function loadCouponList(){


onSnapshot(

collection(db,"coupons"),

(snapshot)=>{


couponSnapshotData=[];


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


const sortedList = [...couponSnapshotData]

.sort((a,b)=>{


const aTime =
a.updatedAt?.seconds ||
a.createdAt?.seconds ||
0;


const bTime =
b.updatedAt?.seconds ||
b.createdAt?.seconds ||
0;


return bTime-aTime;


})

.slice(0,20);




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

statusText="✅ 발급됨";

break;


case "waiting":

statusText="⏳ 승인 대기";

break;


case "approved":

statusText="✅ 사용 가능";

break;


case "used":

statusText="❌ 사용 완료";

break;


default:

statusText=data.status || "-";


}

const today = new Date();

const endDate = data.endDate
? new Date(data.endDate)
: null;

if(
    endDate &&
    today > endDate &&
    data.status !== "used" &&
    data.status !== "expired"
){

    statusText = "🔴 기간 만료";

}


const div =
document.createElement("div");


div.className="coupon-card";

if(statusText==="🔴 기간 만료"){

div.style.border =
"2px solid #f44336";

}

div.innerHTML=

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


<button type="button" class="selectCoupon">
조회
</button>

<button type="button" class="quickEditCoupon">
수정
</button>

<button class="quickDeleteCoupon">
삭제
</button>

`;




// ================================
// 조회 버튼 수정
// ================================

const selectBtn =
div.querySelector(".selectCoupon");


if(selectBtn){

selectBtn.onclick=()=>{

console.log("조회 클릭", data.couponNumber);

searchCoupon.value =
data.couponNumber;

searchBtn.click();

   setTimeout(() => {
        document.getElementById("couponResult").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }, 200);
};

}    
// ================================
// 수정 버튼 수정
// ================================

const editBtn =
div.querySelector(".quickEditCoupon");


if(editBtn){

editBtn.onclick = () => {

if(
data.status==="used" ||
(data.useCount || 0)>=
(data.maxUseCount || 1)
){

alert(
"사용 완료된 쿠폰은 수정할 수 없습니다."
);

return;

}

searchCoupon.value =
data.couponNumber;

searchBtn.click();

    setTimeout(() => {
        document.getElementById("couponEditSection").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }, 200);

};




// ================================
// 빠른 삭제
// ================================
const selectBtn =
div.querySelector(".selectCoupon");


if(selectBtn){

selectBtn.onclick=()=>{

searchCoupon.value =
data.couponNumber;

searchBtn.click();

};

}



const editBtn =
div.querySelector(".quickEditCoupon");


if(editBtn){

editBtn.onclick=()=>{

searchCoupon.value =
data.couponNumber;

searchBtn.click();

};

}



const deleteBtn =
div.querySelector(".quickDeleteCoupon");


if(deleteBtn){

deleteBtn.onclick=async()=>{


const ok =
confirm(
"이 쿠폰을 삭제하시겠습니까?"
);


if(!ok){

return;

}


await deleteDoc(

doc(
db,
"coupons",
data.couponNumber
)

);


alert(
"삭제 완료"
);


};


}



couponList.appendChild(div);

// ================================
// DASHBOARD
// ================================

function loadDashboard(){

onSnapshot(

collection(db,"coupons"),

(snapshot)=>{


let issued=0;

let waiting=0;

let approved=0;

let used=0;

let expired=0;
    
let todayIssuedCount = 0;

let todayUsedCount = 0;    

const today = new Date();

today.setHours(0,0,0,0);



snapshot.forEach((item)=>{


const data = item.data();

const endDate =
data.endDate
?
new Date(data.endDate)
:
null;


if(
endDate &&
new Date() > endDate &&
data.status !== "used"
){

expired++;

}    

// 전체 발급
issued++;

// 오늘 발급
if(
    data.createdAt &&
    data.createdAt.toDate() >= today
){
    todayIssuedCount++;
}

// 승인 대기

if(
data.status === "waiting"
){

waiting++;

}


// 오늘 승인 완료

if(
data.approvedAt &&
data.approvedAt.toDate() >= today
){

approved++;

}


// 오늘 사용 완료

if(
data.usedAt &&
data.usedAt.toDate() >= today
){

used++;

}

// 오늘 사용 통계

if(
data.usedAt &&
data.usedAt.toDate() >= today
){

todayUsedCount++;

}

});



if(totalCoupon)

totalCoupon.innerText = issued;


if(waitingCount)

waitingCount.innerText = waiting;


if(approvedCount)

approvedCount.innerText = approved;


if(usedCount)

usedCount.innerText = used;

if(expiredCount)

expiredCount.innerText = expired;
    
if(todayIssued)

todayIssued.innerText = todayIssuedCount;


if(todayUsed)

todayUsed.innerText = todayUsedCount;

}

);

}


// ================================
// SAVE COUPON
// ================================


saveCouponBtn.onclick=async()=>{


const number =
couponNumber.value.trim();



if(!number){

alert("쿠폰번호 입력");

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


saveData.status="issued";


saveData.useCount=0;


saveData.createdAt=
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
// SEARCH COUPON
// ================================


searchBtn.onclick=async()=>{

console.log("검색버튼 실행", searchCoupon.value);

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

console.log("쿠폰 조회 완료");
console.log(snap.exists());

if(!snap.exists()){


couponResult.innerHTML=
"❌ 쿠폰 없음";


return;

}




const data =
snap.data();

console.log("데이터 표시 시작", data);


// 입력창 채우기

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





if(editButtons){

editButtons.classList.remove("hidden");

}




let statusText="";



if(

(data.useCount || 0)
>=
(data.maxUseCount || 1)

){

statusText="❌ 사용 완료";


}

else{


switch(data.status){


case "issued":

statusText="✅ 사용 가능";

break;


case "waiting":

statusText="⏳ 승인 대기";

break;


case "approved":

statusText="✅ 승인 완료";

break;


case "used":

statusText="❌ 사용 완료";

break;


default:

statusText=data.status || "-";


}



}


const today = new Date();

const checkEndDate = data.endDate
? new Date(data.endDate)
: null;


if(
    checkEndDate &&
    today > checkEndDate &&
    data.status !== "used"
){

    statusText = "🔴 기간 만료";

}


couponResult.innerHTML=

`

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


`;



if(

data.status==="used" ||

(data.useCount || 0)
>=
(data.maxUseCount || 1)

){

useCouponBtn.classList.add("hidden");


}

else{


useCouponBtn.classList.remove("hidden");


}

setTimeout(()=>{

couponResult.scrollIntoView({
    behavior:"smooth",
    block:"start"
});

},100);

  
console.log("검색 함수 끝");

};



// ENTER 검색

searchCoupon.addEventListener("keydown",(e)=>{


if(e.key==="Enter"){

searchBtn.click();

}


});

// ================================
// USE COUPON
// ================================

useCouponBtn.onclick = async()=>{

if(useCouponBtn.disabled){

    return;

}

useCouponBtn.disabled = true;

useCouponBtn.innerText = "처리중...";



const number =
searchCoupon.value.trim();



if(!number){

alert("쿠폰번호 입력");

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

alert("쿠폰 없음");

return;

}



const data =
snap.data();

const couponEndDate =
data.endDate
?
new Date(data.endDate)
:
null;


if(
couponEndDate &&
new Date() > couponEndDate
){

alert(
"기간이 만료된 쿠폰입니다."
);

return;

}


const today = new Date();

const endDate = data.endDate
? new Date(data.endDate)
: null;



if(
    endDate &&
    today > endDate
){

alert(
"쿠폰 사용 기간이 만료되었습니다."
);

return;

}


if(

data.status==="used" ||

(data.useCount || 0)
>=
(data.maxUseCount || 1)

){

alert(
"이미 사용 완료된 쿠폰입니다."
);

return;

}


await runTransaction(db, async (transaction)=>{

    const couponRef = doc(db,"coupons",number);

    const couponSnap = await transaction.get(couponRef);

    if(!couponSnap.exists()){

        throw new Error("쿠폰이 존재하지 않습니다.");

    }

    const couponData = couponSnap.data();

    if(
        couponData.status==="used" ||
        (couponData.useCount || 0) >= (couponData.maxUseCount || 1)
    ){

        throw new Error("이미 사용된 쿠폰입니다.");

    }

    transaction.update(couponRef,{

        status:"used",

        useCount:(couponData.useCount || 0)+1,

        usedAt:serverTimestamp()

    });

});

await addDoc(

collection(
db,
"coupon_history"

),

{

couponNumber:number,

action:"used",

staffUid:
auth.currentUser.uid,

staffEmail:
auth.currentUser.email,

time:
serverTimestamp()

}

);



alert(
"쿠폰 사용 처리 완료"
);

useCouponBtn.innerText = "사용 완료";

searchBtn.click();

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


status:"issued",


useCount:0,


usedAt:null,


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



const couponData =
check.data();





if(

couponData.status==="used" ||

(couponData.useCount || 0)
>=
(couponData.maxUseCount || 1)

){

alert(
"사용 완료된 쿠폰은 삭제할 수 없습니다."
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



couponResult.innerHTML="";



alert(
"쿠폰 삭제 완료"
);



};






// ================================
// UPDATE COUPON
// ================================

if(editCouponBtn){

editCouponBtn.onclick = ()=>{

document.querySelector("#couponEditSection").scrollIntoView({

behavior:"smooth",

block:"start"

});
};

}

updateCouponBtn.onclick = async()=>{


const number =
couponNumber.value.trim();



if(!number){

alert(
"쿠폰번호 입력"
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



const data =
check.data();




if(

data.status==="used" ||

(data.useCount || 0)
>=
(data.maxUseCount || 1)

){

alert(
"사용 완료된 쿠폰은 수정할 수 없습니다."
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



div.innerHTML=

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
.onclick=async()=>{


await approveCoupon(
data.couponNumber
);



};



requestList.appendChild(div);



});



});


}





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

adminUid:
auth.currentUser.uid,

adminEmail:
auth.currentUser.email,

time:
serverTimestamp()

}

);






alert(
"승인 완료"
);



}






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



div.innerHTML=

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
// FILTER
// ================================


allCouponBtn.onclick=()=>{

couponFilter="all";

renderCouponList();

};


issuedCouponBtn.onclick=()=>{

couponFilter="issued";

renderCouponList();

};



waitingCouponBtn.onclick=()=>{


couponFilter="waiting";


renderCouponList();


};



approvedCouponBtn.onclick=()=>{


couponFilter="approved";


renderCouponList();


};



usedCouponBtn.onclick=()=>{


couponFilter="used";


renderCouponList();


};







// ================================
// BULK CREATE
// ================================


bulkCreateBtn.onclick=async()=>{



const title =
bulkCouponTitle.value.trim();



const discountValue =
Number(bulkDiscount.value);



const count =
Number(bulkCount.value);



const start =
bulkStartDate.value;



const end =
bulkEndDate.value;



const noticeText =
bulkNotice.value.trim();





if(!title){

alert(
"쿠폰명을 입력하세요"
);

return;

}




if(!count || count<1){

alert(
"생성 수량 입력"
);

return;

}





const ok =
confirm(
`${count}개 쿠폰 생성하시겠습니까?`
);



if(!ok){

return;

}




for(
let i=1;
i<=count;
i++
){



const number =

"JBT-" +

Date.now()
.toString()
.slice(-6)

+

"-"

+

String(i)
.padStart(4,"0");





await setDoc(

doc(
db,
"coupons",
number

),

{


couponNumber:number,


title:title,


discount:discountValue,


maxUseCount:1,


useCount:0,


status:"issued",


notice:noticeText,


startDate:start,


endDate:end,


createdAt:
serverTimestamp(),


updatedAt:
serverTimestamp()


}

);



}




alert(
`${count}개 쿠폰 생성 완료`
);



};







// ================================
// QR SCANNER
// ================================


scanQrBtn.onclick=async()=>{


const scanner =
new Html5Qrcode("reader");



try{


await scanner.start(

{

facingMode:"environment"

},


{

fps:10,

qrbox:250

},


async(decodedText)=>{


await scanner.stop();



reader.innerHTML="";



searchCoupon.value =
decodedText;



searchBtn.click();



}

);



}

catch(error){


alert(
"카메라 실행 실패"
);


console.error(error);


}



};
