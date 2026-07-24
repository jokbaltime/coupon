// ======================================
// JOKBALTlME ADMIN
// LOGIN + COUPON SETTING
// ======================================


import {

auth,

db,

doc,

setDoc,

getDoc

} from "./firebase.js";



import {

signInWithEmailAndPassword,
onAuthStateChanged,
signOut

} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";




// Firestore 위치

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






function showAdmin(){


if(loginBox){

loginBox.classList.add(
"hidden"
);

}



if(adminPanel){

adminPanel.classList.remove(
"hidden"
);

}


loadSetting();


}








// =============================
// 로그인
// =============================


if(loginButton){



loginButton.onclick = async()=>{



const email =

document.getElementById(
"adminEmail"
)
.value
.trim();




const password =

document.getElementById(
"adminPassword"
)
.value
.trim();






try{


await signInWithEmailAndPassword(

auth,

email,

password

);



alert(
"로그인 성공"
);



showAdmin();



}



catch(error){



alert(

"로그인 실패 : "

+

error.code

);



}



};


}








// =============================
// 로그인 유지
// =============================


onAuthStateChanged(

auth,

(user)=>{


if(user){


showAdmin();


}


}

);









// =============================
// 쿠폰 설정 불러오기
// =============================


async function loadSetting(){



const snap =

await getDoc(
couponRef
);



if(snap.exists()){



const data = snap.data();




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
// 저장
// =============================


const saveButton =

document.getElementById(
"saveButton"
);




if(saveButton){



saveButton.onclick = async()=>{



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



}









// =============================
// 로그아웃
// =============================


const logoutButton =

document.getElementById(
"logoutButton"
);



if(logoutButton){



logoutButton.onclick = async()=>{


await signOut(
auth
);


location.reload();



};



}
