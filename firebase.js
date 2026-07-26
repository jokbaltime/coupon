// ======================================
// FIREBASE.JS FULL REPLACEMENT
// REAL CONFIG REQUIRED
// ======================================


import {

initializeApp

}

from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";



import {

getFirestore,

doc,

getDoc,

setDoc,

deleteDoc,

addDoc,

getDocs,

collection,

query,

where,

onSnapshot,

orderBy,

serverTimestamp

}

from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



import {

getAuth

}

from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";




// ======================================
// Firebase Console
// 프로젝트 설정 → 웹 앱 설정값 입력
// ======================================


const firebaseConfig = {


apiKey:
"여기에 실제 API KEY 입력",



authDomain:
"여기에 실제 AUTH DOMAIN 입력",



projectId:
"여기에 실제 PROJECT ID 입력",



storageBucket:
"여기에 실제 STORAGE BUCKET 입력",



messagingSenderId:
"여기에 실제 MESSAGING SENDER ID 입력",



appId:
"여기에 실제 APP ID 입력"



};





// Firebase 시작

const app =

initializeApp(firebaseConfig);





// Firestore

const db =

getFirestore(app);





// Authentication

const auth =

getAuth(app);








export {


db,

auth,


doc,

getDoc,

setDoc,

deleteDoc,

addDoc,

getDocs,

collection,

query,

where,

onSnapshot,

orderBy,

serverTimestamp


};
