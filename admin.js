// ======================================
// admin.js
// JOKBAL TIME COUPON ADMIN SYSTEM
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


const notice =
document.getElementById("notice");


const imageUrl =
document.getElementById("imageUrl");


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



const historyList =
document.getElementById("historyList");









// ================================
// LOGIN
// ================================


loginBtn.onclick = async()=>{


const email =
document.getElementById("adminEmail").value;


const password =
document.getElementById("adminPassword").value;



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
+
error.message
);


}


};







onAuthStateChanged(auth,(user)=>{


if(user){


loginBox.classList.add("hidden");

adminBox.classList.remove("hidden");


loadRequests();

loadHistory();


}

else{


loginBox.classList.remove("hidden");

adminBox.classList.add("hidden");


}



});








logoutBtn.onclick = ()=>{


signOut(auth);


};









// ================================
// COUPON SAVE
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




await setDoc(

doc(
db,
"coupons",
number
),

{


couponNumber:number,


title:
couponTitle.value,


discount:
Number(discount.value),


notice:
notice.value,


image:
imageUrl.value,


status:"issued",


createdAt:
serverTimestamp()


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



div.className="request-card";



div.innerHTML=

`

<p>

쿠폰번호 :
<b>${data.couponNumber}</b>

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



await updateDoc(

doc(
db,
"coupons",
number
),

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




couponResult.innerHTML=

`

<p>
번호 :
${data.couponNumber}
</p>


<p>
상태 :
${data.status}
</p>


<p>
할인 :
${data.discount}%
</p>

`;



};









// ================================
// CANCEL USE
// ================================


cancelUseBtn.onclick = async()=>{


const number =
searchCoupon.value.trim();



if(!number)
return;




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



alert(
"사용 취소 복구 완료"
);



};









// ================================
// HISTORY
// ================================


async function loadHistory(){



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

<p>

${data.couponNumber}

-

${data.action}

</p>

`;



});


});



}
