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

let statusText = "";

if ((data.useCount || 0) >= (data.maxUseCount || 1)) {

    statusText = "❌ 사용 완료";

} else {

    switch (data.status) {

        case "issued":
            statusText = "📄 발급 완료";
            break;

        case "waiting":
            statusText = "⏳ 승인 대기";
            break;

        case "approved":
            statusText = "✅ 승인 완료";
            break;

        case "used":
            statusText = "❌ 사용 완료";
            break;

        default:
            statusText = data.status;
    }

}



couponInfo.innerHTML = `

<div class="coupon-detail">

<h3>${data.title || "-"}</h3>

<hr>

<p><b>쿠폰번호</b> : ${number}</p>

<p><b>상태</b> : ${statusText}</p>

<p><b>할인율</b> : ${data.discount}%</p>

<p><b>사용횟수</b> : ${data.useCount || 0} / ${data.maxUseCount || 1}</p>

<p><b>사용기간</b><br>

${data.startDate || "-"}

~

${data.endDate || "-"}

</p>

<p><b>승인시간</b><br>

${data.approvedAt ? data.approvedAt.toDate().toLocaleString() : "-"}

</p>

<p><b>사용시간</b><br>

${data.usedAt ? data.usedAt.toDate().toLocaleString() : "-"}

</p>

</div>

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

fps: 20,

qrbox: {

width:300,

height:300

}

},

(decodedText) => {

    useCouponNumber.value = decodedText;

    html5QrCode.stop().then(() => {

        reader.innerHTML = "";

        checkBtn.click();

    }).catch(err => {

        console.error(err);

    });

},

(errorMessage) => {

    // 무시

}

);

};
