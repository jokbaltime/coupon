// admin.js FULL REPLACEMENT
// ADMIN APPROVAL / COUPON STATUS MANAGEMENT VERSION


import {
db,
auth,
doc,
getDoc,
setDoc,
getDocs,
addDoc,
collection,
query,
orderBy,
serverTimestamp
} from "./firebase.js";


import {
onAuthStateChanged
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";



const ADMIN_EMAIL =
"admin@jokbaltime.com";



const adminArea =
document.getElementById("adminArea");


const adminStats =
document.getElementById("adminStats");


const adminHistory =
document.getElementById("adminHistory");



let isAdmin = false;



// 관리자 확인

onAuthStateChanged(

auth,

(user)=>{


if(!user){

if(adminArea)
adminArea.style.display="none";


return;

}



if(
user.email === ADMIN_EMAIL
){


isAdmin=true;


if(adminArea)
adminArea.style.display="block";


loadAdminData();


}

else{


isAdmin=false;


if(adminArea)
adminArea.style.display="none";


}



}

);






// 관리자 데이터

async function loadAdminData(){


if(!isAdmin)
return;



const q = query(

collection(
db,
"coupon_history"
),

orderBy(
"approvedTime",
"desc"
)

);



const snap =
await getDocs(q);



let used=0;

let cancel=0;

let approved=0;


let html="";




snap.forEach(

(item)=>{


const data =
item.data();



if(
data.action==="used"
)
used++;



if(
data.action==="cancel"
)
cancel++;



if(
data.action==="approved"
)
approved++;




html +=

`

<div style="
border-bottom:1px solid #444;
padding:10px;
">


<b>
${data.couponNumber}
</b>

<br>


처리 :
${data.action}


<br>


직원 :
${data.staff || ""}


</div>


`;



}

);




if(adminStats){


adminStats.innerHTML =

`

<h3>
관리자 현황
</h3>


<p>
승인 :
${approved}
건
</p>


<p>
사용 :
${used}
건
</p>


<p>
취소 :
${cancel}
건
</p>

`;

}



if(adminHistory){


adminHistory.innerHTML =

`

<h3>
최근 처리 내역
</h3>

${html}

`;

}



}





// 관리자 강제 승인 기능

window.adminApproveCoupon =
async function(couponNumber){



if(!isAdmin){


alert(
"관리자 권한 필요"
);


return;


}



try{


await setDoc(

doc(
db,
"coupon_issue",
couponNumber
),

{

approved:true,

approvedTime:
serverTimestamp()

},

{

merge:true

}

);





await addDoc(

collection(
db,
"coupon_history"
),

{

couponNumber:couponNumber,

action:"approved",

approvedTime:
serverTimestamp(),

staff:
auth.currentUser.email

}

);



alert(
"승인 완료"
);



loadAdminData();



}

catch(error){


alert(
"관리자 승인 오류 : "
+error.message
);


}



};
