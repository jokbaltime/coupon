// ======================================
// JOKBALTlME CUSTOMER APP
// COUPON STATUS CHECK
// ======================================


import {

db,
doc,
setDoc,
getDoc,
onSnapshot

} from "./firebase.js";





// =============================
// 쿠폰 설정 반영
// =============================


const settingRef =
doc(
db,
"coupon",
"setting"
);



onSnapshot(

settingRef,

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
(data.discount || 20)
+
"%";

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


}

);









// =============================
// 쿠폰번호 생성 / 유지
// =============================


function createNumber(){


const now =
new Date();



return (

"JT-"

+

String(now.getFullYear())
.slice(2)

+

String(now.getMonth()+1)
.padStart(2,"0")

+

String(now.getDate())
.padStart(2,"0")

+

"-"

+

Math.floor(
Math.random()*9000
+
1000
)

);


}









async function loadCoupon(){



let number =
localStorage.getItem(
"JT_COUPON_NUMBER"
);




if(!number){



number =
createNumber();



localStorage.setItem(

"JT_COUPON_NUMBER",

number

);




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






document.getElementById(
"couponNumber"
).textContent =
number;





checkStatus(number);



}









// =============================
// 사용 상태 확인
// =============================


async function checkStatus(number){



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




const discount =
document.querySelector(
".discount"
);



if(snap.exists()){


const data =
snap.data();




if(data.used===true){



const body =
document.querySelector(
".coupon-body"
);



if(body){


body.innerHTML =

`

<h2>

사용 완료된 쿠폰입니다.

</h2>

<p>

사용일 :
${data.usedTime?.toDate?.()
.toLocaleString("ko-KR")
||""}

</p>

`;



}



}


}



}









// 실행

loadCoupon();









// =============================
// 시계
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
