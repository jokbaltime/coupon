// ======================================
// ADMIN.JS FULL REPLACEMENT
// ADMIN SETTING / HISTORY VERSION
// ======================================


import {
db,
auth,
doc,
getDoc,
setDoc,
getDocs,
collection,
query,
orderBy,
serverTimestamp
} from "./firebase.js";


import {

signInWithEmailAndPassword,
signOut,
onAuthStateChanged

}

from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";





const ADMIN_EMAIL =
"admin@jokbaltime.com";



const loginButton =
document.getElementById("loginButton");


const logoutButton =
document.getElementById("logoutButton");


const loginBox =
document.querySelector(".login-box");


const adminPanel =
document.getElementById("adminPanel");



const saveButton =
document.getElementById("saveButton");


const titleInput =
document.getElementById("title");


const discountInput =
document.getElementById("discount");


const noticeInput =
document.getElementById("notice");



let adminMode=false;









// 로그인

if(loginButton){


loginButton.onclick =
async()=>{


const email =
document.getElementById("adminEmail").value.trim();


const password =
document.getElementById("adminPassword").value.trim();




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
+error.message
);


}



};


}









// 관리자 인증

onAuthStateChanged(

auth,

(user)=>{


if(!user){


if(loginBox)
loginBox.style.display="block";


if(adminPanel)
adminPanel.classList.add("hidden");


return;


}




if(user.email!==ADMIN_EMAIL){


alert(
"관리자 권한 없음"
);


signOut(auth);


return;


}





adminMode=true;



if(loginBox)
loginBox.style.display="none";


if(adminPanel)
adminPanel.classList.remove("hidden");



loadSetting();



loadHistory();



}

);









// 로그아웃

if(logoutButton){


logoutButton.onclick =
()=>{


signOut(auth);


};


}









// 설정 저장

if(saveButton){


saveButton.onclick =
async()=>{


if(!adminMode)
return;



await setDoc(

doc(
db,
"system",
"coupon"
),

{

title:
titleInput.value,


discount:
Number(discountInput.value),


notice:
noticeInput.value,


updateTime:
serverTimestamp()


}

);



alert(
"저장 완료"
);



};


}









// 설정 불러오기

async function loadSetting(){



const snap =
await getDoc(

doc(
db,
"system",
"coupon"
)

);



if(!snap.exists())
return;




const data =
snap.data();



if(titleInput)

titleInput.value =
data.title || "";



if(discountInput)

discountInput.value =
data.discount || 0;



if(noticeInput)

noticeInput.value =
data.notice || "";



}









// 기록 불러오기

async function loadHistory(){



const historyBox =
document.getElementById("adminHistory");


const stats =
document.getElementById("adminStats");



if(!historyBox)
return;



const q =
query(

collection(
db,
"coupon_history"
),

orderBy(
"approvedTime",
"desc"
)

);



const snapshot =
await getDocs(q);




let html="";


let approved=0;


let used=0;






snapshot.forEach(

(item)=>{


const data =
item.data();





if(data.action==="approved")
approved++;



if(data.action==="used")
used++;





html +=

`

<div style="
padding:12px;
border-bottom:1px solid #444;
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






if(stats){


stats.innerHTML=

`

<h3>
쿠폰 현황
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


`;



}





historyBox.innerHTML=

`

<h3>
처리 기록
</h3>

${html}

`;



}
