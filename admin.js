// ======================================
// admin.js
// JOKBAL TIME COUPON ADMIN SYSTEM
// FIX VERSION
// PART 1
// ======================================

import {

db,
auth,
collection,
doc,
getDoc,
getDocs,
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

const searchTitle =
document.getElementById("searchTitle");

const searchTitleBtn =
document.getElementById("searchTitleBtn");


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

const expiredCouponBtn =
document.getElementById("expiredCouponBtn");

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

let currentUserRole="";


// ================================
// AUTH
// ================================


onAuthStateChanged(auth, async(user)=>{


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

currentUserRole =
userData.role;

if(
userData.role !== "staff" &&
userData.role !== "admin"
){

alert("관리자 권한이 없습니다.");

await signOut(auth);

return;

}



adminBox.classList.remove("hidden");

// 먼저 기간 만료 검사
await checkExpiredCoupons();

// 기존 쿠폰 token 자동 보정
await fixOldCouponTokens();
    
// 화면 로드
loadDashboard();

loadCouponList();

loadHistory();

loadRequests();


if(currentUserRole==="staff"){

    if(saveCouponBtn)
    saveCouponBtn.style.display="none";

    if(bulkCreateBtn)
    bulkCreateBtn.style.display="none";

}    
}

else{


location.href="login.html";


}


});



logoutBtn.onclick = async()=>{

await signOut(auth);

};

// ================================
// EXPIRED COUPON CHECK
// ================================

async function checkExpiredCoupons(){

    const snapshot = await getDocs(collection(db,"coupons"));

    const today = new Date();

    for(const item of snapshot.docs){

        const data = item.data();

        if(
            !data.endDate ||
            data.status === "used" ||
            data.status === "expired"
        ){
            continue;
        }

        const endDate = new Date(data.endDate);

        if(today > endDate){

            await updateDoc(
                doc(db,"coupons",item.id),
                {
                    status:"expired",
                    expiredAt:serverTimestamp()
                }
            );

            console.log(
                "기간 만료 처리:",
                data.couponNumber
            );

        }

    }

}

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

        snapshot.forEach((item)=>{

            const data = item.data();

            if(data.status==="waiting"){
                waiting++;
            }

            if(data.status==="approved"){
                approved++;
            }

            if(data.status==="used"){
                used++;
            }

            if(data.status==="expired"){
                expired++;
                
            if(expiredCount)
            expiredCount.innerText = expired;
                
            }
            issued++;

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
    }

    );

}



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


const sortedList =
[...couponSnapshotData]

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

case "expired":

statusText="🔴 기간 만료";

break;
        
default:
statusText=data.status || "-";

}

const div =
document.createElement("div");


div.className="coupon-card";


div.innerHTML=

`

<p><b>${data.couponNumber}</b></p>

<p>${data.title || "-"}</p>

<p>
상태 :
${
data.status==="issued"
?"✅ 사용 가능"
:
data.status==="used"
?"❌ 사용 완료"
:
data.status==="approved"
?"✅ 승인 완료"
:
data.status==="waiting"
?"⏳ 승인 대기"
:
data.status==="expired"
?"🔴 기간 만료"
:
"-"
}
</p>

<p>
할인 :
${data.discount || 0}%
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



div.querySelector(".selectCoupon").onclick=()=>{

searchCoupon.value =
data.couponNumber;

searchBtn.click();


setTimeout(()=>{

couponResult.scrollIntoView({

behavior:"smooth",

block:"start"

});

},200);


};


div.querySelector(".quickEditCoupon").onclick=()=>{

searchCoupon.value =
data.couponNumber;

searchBtn.click();


setTimeout(()=>{

const section =
document.querySelector("#couponEditSection");


if(section){

section.scrollIntoView({

behavior:"smooth",

block:"start"

});

}


},200);


};


div.querySelector(".quickDeleteCoupon").onclick=async()=>{

    if(!confirm("삭제하시겠습니까?")){
        return;
    }


    const ref =
    doc(
        db,
        "coupons",
        data.id
    );


    const snap =
    await getDoc(ref);


    if(!snap.exists()){

        alert("쿠폰을 찾을 수 없습니다.");

        return;

    }


    const couponData =
    snap.data();



    if(couponData.status==="used"){

        alert(
            "사용 완료 쿠폰은 삭제할 수 없습니다."
        );

        return;

    }



    await deleteDoc(ref);



    await addDoc(

        collection(
            db,
            "coupon_history"
        ),

        {

            couponNumber:
            couponData.couponNumber,

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

// ================================
// SAVE COUPON
// ================================

saveCouponBtn.onclick = async()=>{

const number =
couponNumber.value.trim();


if(!number){

alert("쿠폰번호 입력");

return;

}

const token =
crypto.randomUUID();

await setDoc(

doc(
db,
"coupons",
number
),

{

couponNumber:number,

title:
couponTitle.value.trim(),

discount:
Number(discount.value),

maxUseCount:
Number(maxUseCount.value),

useCount:0,

status:"issued",

notice:
notice.value.trim(),

image:
imageUrl.value.trim(),

startDate:
startDate.value,

endDate:
endDate.value,

createdAt:
serverTimestamp(),

token:
crypto.randomUUID(),

token:
token,
    
updatedAt:
serverTimestamp()

}

);


alert("쿠폰 저장 완료");


// ================================
// ADMIN QR 생성
// ================================

const qrBox =
document.getElementById("adminQRCode");


if(qrBox){

    qrBox.innerHTML="";

console.log(
"ADMIN QR",
number + "|" + token
);

qrBox.innerHTML = "";
    
    new QRCode(

        qrBox,

        {

        text:
        number + "|" + token,

        width:300,

        height:300,

        correctLevel:
        QRCode.CorrectLevel.H    
        }

    );

}


};

// ================================
// SEARCH COUPON
// ================================


searchBtn.onclick = async()=>{


const keyword =
searchCoupon.value.trim();



if(!keyword){

alert("검색어 입력");

return;

}



let snap = null;



// 1. 쿠폰번호 전체 검색

const couponRef =
doc(
db,
"coupons",
keyword
);



const couponSnap =
await getDoc(couponRef);



if(couponSnap.exists()){

snap = couponSnap;

}



// 2. 쿠폰번호 뒷자리 검색

if(!snap){

const result =
await getDocs(collection(db,"coupons"));

result.forEach((docItem)=>{

const coupon =
docItem.data();

if(
coupon.couponNumber &&
coupon.couponNumber.endsWith(keyword)
){

snap = docItem;

}

});

}

// 3. 쿠폰명 검색

if(!snap){


const q =
query(

collection(db,"coupons"),

where(
"title",
">=",
keyword
),

where(
"title",
"<=",
keyword + "\uf8ff"
)

);



const titleSnap =
await getDocs(q);



if(!titleSnap.empty){

snap =
titleSnap.docs[0];

}


}





// 결과 없음

if(!snap){


couponResult.innerHTML =
"❌ 쿠폰 없음";


return;


}





// ⭐ 중요
// 여기서 data 선언 한번만 사용

const data =
snap.data();


let statusText = "";


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

statusText =
data.status || "-";


}


}





const today =
new Date();



const checkEndDate =
data.endDate
?
new Date(data.endDate)
:
null;



if(

checkEndDate &&
today > checkEndDate &&
data.status !== "used"

){


statusText =
"🔴 기간 만료";


}






couponResult.innerHTML =


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



const qrActionBox =
document.createElement("div");


if(
data.status==="used" ||
(data.useCount || 0) >= (data.maxUseCount || 1)
){

qrActionBox.innerHTML =
"❌ 이미 사용 완료된 쿠폰";

}
else{

qrActionBox.innerHTML =
`
<div style="
background:#fff3cd;
padding:15px;
border-radius:10px;
margin-top:20px;
">

<p style="
font-weight:bold;
color:#856404;
">
⚠️ 사용 처리 후 되돌릴 수 있습니다.
</p>


<button id="qrUseBtn"
style="
width:100%;
padding:15px;
background:#8B0000;
color:white;
border:none;
border-radius:10px;
font-size:18px;
">

✅ 쿠폰 사용 처리

</button>

</div>
`;

qrActionBox
.querySelector("#qrUseBtn")
.onclick=()=>{

useCouponBtn.click();

};

}


couponResult.appendChild(qrActionBox);




};

// ================================
// SEARCH COUPON TITLE
// ================================

searchTitleBtn.onclick = async()=>{


const title =
searchTitle.value.trim();


if(!title){

alert("쿠폰명 입력");

return;

}


const q =
query(
collection(db,"coupons"),
where("title","==",title)
);



const snap =
await getDocs(q);



if(snap.empty){

couponResult.innerHTML =
"❌ 쿠폰 없음";

return;

}



couponResult.innerHTML="";



snap.forEach((item)=>{


const data =
item.data();



couponResult.innerHTML +=

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

<hr>

`;



});


};

// ================================
// USE COUPON
// ================================


useCouponBtn.onclick = async()=>{


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





if(
data.status==="used" ||
data.status==="expired" ||

(data.useCount || 0)
>=
(data.maxUseCount || 1)

){

alert(
"사용할 수 없는 쿠폰입니다."
);

return;

}




await runTransaction(

db,

async(transaction)=>{


const couponRef =
doc(
db,
"coupons",
number
);



const couponSnap =
await transaction.get(couponRef);



if(!couponSnap.exists()){

throw new Error(
"쿠폰 없음"
);

}



const couponData =
couponSnap.data();



transaction.update(

couponRef,

{

status:"used",

useCount:
(couponData.useCount || 0)+1,

usedAt:
serverTimestamp()

}

);


}

);





await addDoc(

collection(
db,
"coupon_history"
),

{


action:"used",

admin:
auth.currentUser.email,

time:
serverTimestamp()


}

);



couponResult.innerHTML =

`
<div style="
background:#e8f5e9;
padding:25px;
border-radius:15px;
text-align:center;
">

<h2 style="
color:#2e7d32;
">
✅ 사용 완료
</h2>


<hr>


<p>
<b>쿠폰번호</b>
</p>

<p>
${number}
</p>


<p>
<b>처리시간</b>
</p>

<p>
${new Date().toLocaleString()}
</p>


<hr>


<h3>
직원 확인 완료
</h3>


</div>
`;



alert(
"쿠폰 사용 완료"
);



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

token:
crypto.randomUUID(),
    
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
"사용 취소 완료"
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



if(

data.status==="used"

){

alert(
"사용 완료 쿠폰은 삭제 불가"
);

return;

}





if(
!confirm(
"삭제하시겠습니까?"
)
){

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
"삭제 완료"
);



};




// ================================
// UPDATE COUPON
// ================================


if(editCouponBtn){


editCouponBtn.onclick=()=>{


const section =
document.querySelector(
"#couponEditSection"
);



if(section){

section.scrollIntoView({

behavior:"smooth"

});

}


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



if(data.status==="used"){

alert(
"사용 완료 쿠폰 수정 불가"
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
"수정 완료"
);



};

// ================================
// REQUEST LIST
// ================================


function loadRequests(){


const q =
query(

collection(db,"coupon_requests"),

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



div.innerHTML=

`

<p>
쿠폰번호 :
${data.couponNumber}
</p>

<button>
승인
</button>

`;



div.querySelector("button").onclick=async()=>{


await approveCoupon(
data.couponNumber
);


};



requestList.appendChild(div);



});


});


}





async function approveCoupon(number){


const ref =
doc(
db,
"coupons",
number
);



const snap =
await getDoc(ref);



if(!snap.exists()){

alert(
"쿠폰 없음"
);

return;

}



await updateDoc(

ref,

{

status:"approved",

approvedAt:
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



historyList.innerHTML +=


`

<div class="history-card">


<p>
쿠폰 :
${data.couponNumber}
</p>


<p>
처리 :
${data.action}
</p>

<p>
관리자 :
${data.admin || "-"}
</p>

<p>
시간 :
${
data.time
?
data.time.toDate().toLocaleString()
:
"-"
}
</p>


</div>


`;



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

expiredCouponBtn.onclick=()=>{

couponFilter="expired";

renderCouponList();

};




// ================================
// BULK CREATE
// ================================


bulkCreateBtn.onclick=async()=>{

bulkCreateBtn.disabled = true;

const title =
bulkCouponTitle.value.trim();


const count =
Number(
bulkCount.value
);



if(!title){

alert(
"쿠폰명 입력"
);

return;

}



if(!count){

alert(
"수량 입력"
);

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

discount:
Number(bulkDiscount.value),

maxUseCount:1,

useCount:0,

status:"issued",

notice:
bulkNotice.value.trim(),

startDate:
bulkStartDate.value,

endDate:
bulkEndDate.value,

createdAt:
serverTimestamp(),

updatedAt:
serverTimestamp()


}

);



}

bulkCreateBtn.disabled = false;

alert(
"생성 완료"
);



};


// ================================
// OLD COUPON TOKEN FIX
// ================================

async function fixOldCouponTokens(){


const snapshot =
await getDocs(
collection(db,"coupons")
);



for(const item of snapshot.docs){


const data =
item.data();



if(!data.token){


await updateDoc(

doc(
db,
"coupons",
item.id
),

{

token:
crypto.randomUUID(),

updatedAt:
serverTimestamp()

}

);


console.log(
"기존 쿠폰 token 추가:",
data.couponNumber
);


}


}


}



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


// QR 데이터 분리

const qrData =
decodedText.split("|");


const couponNumber =
qrData[0];


const token =
qrData[1];


// 쿠폰번호 입력

searchCoupon.value =
couponNumber;


// 쿠폰 조회

searchBtn.click();



// token 확인

const snap =
await getDoc(
doc(
db,
"coupons",
couponNumber
)
);


if(!snap.exists()){

alert(
"등록되지 않은 쿠폰입니다."
);

return;

}



const data =
snap.data();



if(
!data.token ||
data.token !== token
){

alert(
"❌ QR 인증 실패"
);


return;

}



console.log(
"QR 인증 성공",
couponNumber
);


}


);


}

catch(error){


console.error(error);


alert(
"QR 카메라 실행 실패"
);


}


};
