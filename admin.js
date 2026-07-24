// ======================================
// JOKBALTlME ADMIN
// FIREBASE AUTH VERSION
// ======================================


import {

db,
auth,
doc,
setDoc,
getDoc,
signInWithEmailAndPassword,
onAuthStateChanged,
signOut

} from "./firebase.js";





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





// =============================
// 로그인
// =============================


if(loginButton){


loginButton.addEventListener(
"click",
async()=>{


const email =
document.getElementById(
"adminEmail"
).value.trim();



const password =
document.getElementById(
"adminPassword"
).value.trim();




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



showAdmin();



await loadSetting();



}

catch(error){


console.log(error);


alert(
"로그인 실패"
);


}



});


}







// =============================
// 로그인 상태 유지
// =============================


onAuthStateChanged(

auth,

(user)=>{


if(user){


showAdmin();


loadSetting();


}


}

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









// =============================
// 설정 불러오기
// =============================


async function loadSetting(){



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


saveButton.addEventListener(
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


}









// =============================
// 로그아웃
// =============================


const logoutButton =
document.getElementById(
"logoutButton"
);



if(logoutButton){


logoutButton.addEventListener(
"click",
async()=>{


await signOut(
auth
);



location.reload();



});


}
