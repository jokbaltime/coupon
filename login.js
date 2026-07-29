// ======================================
// login.js
// JOKBAL TIME ADMIN LOGIN
// ======================================


import {

auth

} from "./firebase.js";


import {

signInWithEmailAndPassword

} from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";




const email =
document.getElementById("email");


const password =
document.getElementById("password");


const loginBtn =
document.getElementById("loginBtn");


const result =
document.getElementById("result");





loginBtn.onclick = async()=>{


try{


await signInWithEmailAndPassword(

auth,

email.value,

password.value

);



result.innerHTML =
"✅ 로그인 성공";



location.href =
"admin.html";



}

catch(error){


console.error(error);


result.innerHTML =
"❌ 로그인 실패";


}



};
