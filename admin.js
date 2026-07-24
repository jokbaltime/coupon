// ======================================
// JOKBaltime ADMIN LOGIN TEST
// ======================================


import {

db,
doc,
setDoc,
getDoc

} from "./firebase.js";




// Firebase 위치

const couponRef =
doc(
db,
"coupon",
"setting"
);





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




// 로그인 확인

loginButton.addEventListener(
"click",
async()=>{


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



await loadData();



}
else{


alert(
"PIN이 올바르지 않습니다."
);


}



});








// 데이터 불러오기


async function loadData(){


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
data.title || "메인메뉴";



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








// 저장


document
.getElementById(
"saveButton"
)
.addEventListener(
"click",
async()=>{


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



});
