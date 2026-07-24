// ======================================
// JOKBALTlME ADMIN
// FIRESTORE SAVE TEST
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







function openAdmin(){


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









// 로그인

if(loginButton){


loginButton.onclick = async()=>{


const email =
document.getElementById(
"adminEmail"
)
.value.trim();



const password =
document.getElementById(
"adminPassword"
)
.value.trim();




try{


await signInWithEmailAndPassword(

auth,

email,

password

);



alert(
"로그인 성공"
);



openAdmin();



}

catch(error){


alert(
"로그인 실패 : "
+
error.code
);


console.log(error);


}


};


}








// 로그인 유지

onAuthStateChanged(

auth,

(user)=>{


if(user){


openAdmin();


}


}

);









// ======================
// 불러오기
// ======================


async function loadSetting(){



console.log(
"Firestore 불러오기 시작"
);



try{


const snap =
await getDoc(
couponRef
);




console.log(
"문서 존재:",
snap.exists()
);





if(snap.exists()){



const data =
snap.data();



console.log(
"저장 데이터:",
data
);





document.getElementById(
"title"
).value =
data.title || "";



document.getElementById(
"discount"
).value =
data.discount || "";



document.getElementById(
"notice"
).value =
data.notice || "";



}

else{


console.log(
"저장된 데이터 없음"
);


}



}

catch(error){


console.error(
"불러오기 실패",
error
);


}



}









// ======================
// 저장
// ======================


const saveButton =
document.getElementById(
"saveButton"
);



if(saveButton){



saveButton.onclick = async()=>{



const saveData = {


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



};



console.log(
"저장할 데이터:",
saveData
);






try{


await setDoc(

couponRef,

saveData

);



alert(
"저장 완료"
);



await loadSetting();



}

catch(error){



console.error(
"저장 실패",
error
);



alert(
"저장 실패 : "
+
error.code
);



}



};



}








// 로그아웃


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
