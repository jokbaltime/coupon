// ======================================
// JOKBALTlME CUSTOMER APP
// COUPON FIX VERSION
// ======================================


import {

db,
doc,
setDoc,
onSnapshot

} from "./firebase.js";





// =============================
// Firebase 쿠폰 설정 반영
// =============================


const couponRef =
doc(
db,
"coupon",
"setting"
);



onSnapshot(
couponRef,
(snapshot)=>{


if(snapshot.exists()){


const data =
snapshot.data();



const title =
document.getElementById(
"couponTitle"
);



const discount =
document.getElementById(
"discountValue"
);



const notice =
document.getElementById(
"couponNotice"
);




if(title){

title.textContent =
data.title || "메인메뉴";

}



if(discount){

discount.textContent =
(data.discount || 20) + "%";

}



if(notice){

notice.innerHTML =
(data.notice || "")
.replace(
/\n/g,
"<br>"
);

}



}


});









// =============================
// 쿠폰번호 생성
// =============================


function createCouponNumber(){


const now =
new Date();



const date =

String(now.getFullYear())
.slice(2)

+

String(now.getMonth()+1)
.padStart(2,"0")

+

String(now.getDate())
.padStart(2,"0");



const random =

Math.floor(
Math.random()*9000
)+1000;



return "JT-" + date + "-" + random;


}









// =============================
// 쿠폰번호 고정
// =============================


async function loadCouponNumber(){


let number =
localStorage.getItem(
"JT_COUPON_NUMBER"
);




// 처음 방문

if(!number){


number =
createCouponNumber();



localStorage.setItem(
"JT_COUPON_NUMBER",
number
);



// Firebase 저장

await setDoc(

doc(

db,

"coupon_issue",

number

),

{


couponNumber:number,


used:false,


createdTime:new Date()


}

);



}





const couponNumber =
document.getElementById(
"couponNumber"
);



if(couponNumber){

couponNumber.textContent =
number;

}



}





loadCouponNumber();









// =============================
// 시간 표시
// =============================


function clock(){


const el =
document.getElementById(
"clock"
);



if(el){


el.textContent =
new Date()
.toLocaleString(
"ko-KR"
);


}



}



setInterval(
clock,
1000
);


clock();
