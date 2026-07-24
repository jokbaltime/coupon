// ======================================
// JOKBALTlME ADMIN
// COUPON MANAGEMENT
// ======================================


import {

db,
doc,
setDoc,
getDoc,
updateDoc

} from "./firebase.js";




// 쿠폰 설정

const couponRef =
doc(
db,
"coupon",
"setting"
);





// =============================
// 로그인
// =============================


const loginButton =
document.getElementById(
"loginButton"
);


const loginBox =
document.querySelector(
".login-box"
);


const adminPanel =
document.getElementById(
"adminPanel"
);



loginButton.onclick = async()=>{


const pin =
document.getElementById(
"adminPin"
).value;



if(pin==="7812"){


loginBox.classList.add(
"hidden"
);


adminPanel.classList.remove(
"hidden"
);


await loadSetting();


}
else{


alert(
"PIN이 올바르지 않습니다."
);


}



};









// =============================
// 설정 불러오기
// =============================


async function loadSetting(){


const snap =
await getDoc(
couponRef
);



if(snap.exists()){


const data =
snap.data();



document.getElementById(
"title"
).value =
data.title || "";



document.getElementById(
"discount"
).value =
data.discount || 20;



document.getElementById(
"notice"
).value =
data.notice || "";



}


}









// =============================
// 설정 저장
// =============================


document
.getElementById(
"saveButton"
)
.onclick = async()=>{


await setDoc(

couponRef,

{


title:
document.getElementById(
"title"
).value,


discount:
Number(
document.getElementById(
"discount"
).value
),


notice:
document.getElementById(
"notice"
).value


}

);



alert(
"저장 완료"
);


};









// =============================
// 쿠폰 조회
// =============================


async function findCoupon(){


const number =
document
.getElementById(
"useCouponNumber"
)
.value
.trim();



const result =
document.getElementById(
"useResult"
);



if(!number){


result.innerHTML =
"쿠폰번호 입력";


return null;


}




const ref =
doc(

db,

"coupon_issue",

number

);



const snap =
await getDoc(
ref
);



if(!snap.exists()){


result.innerHTML =
"❌ 쿠폰 없음";


return null;


}



return {

ref:ref,

data:snap.data()

};


}









// =============================
// 사용 확인
// =============================


document
.getElementById(
"checkUseButton"
)
.onclick = async()=>{


const coupon =
await findCoupon();



if(!coupon)
return;




if(coupon.data.used===true){


document.getElementById(
"useResult"
)
.innerHTML =
"❌ 이미 사용됨";


}
else{


document.getElementById(
"useResult"
)
.innerHTML =
"✅ 사용 가능";


}



};









// =============================
// 사용 완료
// =============================


document
.getElementById(
"completeUseButton"
)
.onclick = async()=>{


const coupon =
await findCoupon();



if(!coupon)
return;




await updateDoc(

coupon.ref,

{


used:true,


usedTime:
new Date()


}

);



document.getElementById(
"useResult"
)
.innerHTML =
"✅ 사용 완료 처리";


};









// =============================
// 사용 취소
// =============================


document
.getElementById(
"cancelUseButton"
)
.onclick = async()=>{


const coupon =
await findCoupon();



if(!coupon)
return;



await updateDoc(

coupon.ref,

{


used:false,


cancelTime:
new Date()


}

);



document.getElementById(
"useResult"
)
.innerHTML =
"♻️ 사용 취소 완료";


};
