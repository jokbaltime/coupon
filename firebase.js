// ======================================
// FIREBASE.JS FULL REPLACEMENT
// ======================================

import {
initializeApp
} from
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
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


import {
getAuth
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";



// ======================================
// 여기에 Firebase 콘솔 실제 설정값 입력
// ======================================

const firebaseConfig = {

apiKey:
"YOUR_REAL_API_KEY",

authDomain:
"YOUR_PROJECT.firebaseapp.com",

projectId:
"YOUR_PROJECT_ID",

storageBucket:
"YOUR_PROJECT.appspot.com",

messagingSenderId:
"YOUR_MESSAGING_SENDER_ID",

appId:
"YOUR_APP_ID"

};



// Firebase 초기화

const app =
initializeApp(firebaseConfig);



// Firestore 연결

const db =
getFirestore(app);



// 로그인 연결

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
