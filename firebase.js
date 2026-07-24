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

getAuth,
signInWithEmailAndPassword,
onAuthStateChanged,
signOut

} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";









// =============================
// Firebase 설정
// =============================


const firebaseConfig = {


    apiKey: "기존값",

    authDomain: "기존값",

    projectId: "기존값",

    storageBucket: "기존값",

    messagingSenderId: "기존값",

    appId: "기존값"


};









// =============================
// Firebase 시작
// =============================


const app =
initializeApp(
firebaseConfig
);







// =============================
// Firestore
// =============================


const db =
getFirestore(
app
);







// =============================
// Authentication
// =============================


const auth =
getAuth(
app
);









// =============================
// Export
// =============================


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

getDocs,


signInWithEmailAndPassword,

onAuthStateChanged,

signOut


};
