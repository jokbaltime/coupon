// ======================================
// JOKBALTlME FIREBASE CONFIG
// ======================================


import {

initializeApp

} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";



import {

getFirestore,
doc,
setDoc,
getDoc,
updateDoc,
deleteDoc,
collection,
query,
where,
getDocs

} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



import {

getAuth

} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";





// Firebase 설정값
// 기존 본인의 설정값 그대로 유지하세요


const firebaseConfig = {


    apiKey: "기존값",

    authDomain: "기존값",

    projectId: "기존값",

    storageBucket: "기존값",

    messagingSenderId: "기존값",

    appId: "기존값"


};





const app =
initializeApp(
firebaseConfig
);





// Firestore

const db =
getFirestore(
app
);





// Authentication

const auth =
getAuth(
app
);






export {


db,

auth,

doc,

setDoc,

getDoc,

updateDoc,

deleteDoc,

collection,

query,

where,

getDocs


};
