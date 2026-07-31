// ======================================
// firebase.js
// JOKBAL TIME COUPON SYSTEM
// ======================================


import {
    initializeApp
} from 
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    runTransaction
} from 
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


import {

getAuth,
signInWithEmailAndPassword

}

from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ======================================
// Firebase 실제 설정
// ======================================


const firebaseConfig = {

    apiKey:
    "AIzaSyAykACgg1IqU-8tawPLRAfP2pKYST-PWjQ",

    authDomain:
    "jokbaltime-coupon.firebaseapp.com",

    projectId:
    "jokbaltime-coupon",

    storageBucket:
    "jokbaltime-coupon.firebasestorage.app",

    messagingSenderId:
    "1077568919018",

    appId:
    "1:1077568919018:web:2205193cae7848ec518e93"

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

    collection,

    doc,

    getDoc,

    getDocs,

    setDoc,

    updateDoc,

    deleteDoc,

    addDoc,

    query,

    where,

    orderBy,

    onSnapshot,

    serverTimestamp,

    signInWithEmailAndPassword,

    runTransaction

};
