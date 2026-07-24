// ======================================
// JOKBALTlME ADMIN LOGIN TEST
// FIREBASE AUTH
// ======================================


import {

auth

} from "./firebase.js";



import {

signInWithEmailAndPassword,
onAuthStateChanged,
signOut

} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";







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







// =============================
// 로그인
// =============================


if(loginButton){


loginButton.onclick = async()=>{


const email =
document
.getElementById(
"adminEmail"
)
.value
.trim();



const password =
document
.getElementById(
"adminPassword"
)
.value
.trim();





console.log(
"입력 이메일:",
email
);



console.log(
"비밀번호 길이:",
password.length
);






if(!email || !password){


alert(
"이메일과 비밀번호를 입력하세요."
);


return;


}






try{


await signInWithEmailAndPassword(

auth,

email,

password

);



alert(
"로그인 성공"
);



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



}



catch(error){



console.log(
error
);



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



console.log(
"로그인 유지:",
user.email
);



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



}



});








// =============================
// 로그아웃
// =============================


const logoutButton =
document.getElementById(
"logoutButton"
);



if(logoutButton){


logoutButton.onclick =
async()=>{


await signOut(
auth
);



location.reload();



};


}
