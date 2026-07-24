// ======================================
// JOKBALTlME ADMIN LOGIN
// ======================================


import { auth } from "./firebase.js";


import {

signInWithEmailAndPassword,
onAuthStateChanged,
signOut

} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";





console.log(
"admin.js 시작"
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



}








if(loginButton){



loginButton.addEventListener(

"click",

async()=>{



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



console.log(
error
);



alert(

"로그인 실패 : "

+

error.code

);



}



}


);


}








onAuthStateChanged(

auth,

(user)=>{



if(user){



console.log(

"로그인 유지",

user.email

);



showAdmin();



}



}

);








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
