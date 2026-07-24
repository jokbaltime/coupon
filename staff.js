// ======================================
// JOKBALTlME STAFF REQUEST SYSTEM
// ======================================


import {

db,
doc,
getDoc,
updateDoc,
collection,
query,
where,
onSnapshot

} from "./firebase.js";





// =============================
// 고객 요청 실시간 감시
// =============================


const requestList =
document.getElementById(
"requestList"
);




const requestQuery =
query(

collection(
db,
"coupon_request"
),

where(
"status",
"==",
"waiting"
)

);





onSnapshot(

requestQuery,

(snapshot)=>{


if(!requestList)
return;




requestList.innerHTML = "";





snapshot.forEach(

(item)=>{



const data =
item.data();





const box =
document.createElement(
"div"
);



box.style.background =
"#333";


box.style.margin =
"20px 0";


box.style.padding =
"20px";


box.style.borderRadius =
"15px";





box.innerHTML =

`

<h2>
🔔 새 요청
</h2>

<p>
쿠폰번호
<br>
<b>
${data.couponNumber}
</b>
</p>


<button>
✅ 승인
</button>

`;






const button =
box.querySelector(
"button"
);





button.onclick =
async()=>{



const ref =
doc(

db,

"coupon_issue",

data.couponNumber

);





await updateDoc(

ref,

{

used:true,

usedTime:new Date()

}

);






const requestRef =
doc(
db,
"coupon_request",
item.id
);


const requestSnap =
await getDoc(
requestRef
);


if(
requestSnap.data().status !== "waiting"
){

alert(
"이미 처리된 요청입니다."
);

return;

}




await updateDoc(

requestRef,

{

status:"approved",

approvedTime:new Date()

}

);





alert(
"사용 처리 완료"
);



};







requestList.appendChild(
box
);





}

);



}

);
