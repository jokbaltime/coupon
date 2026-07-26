// ======================================
// firebase.js
// JOKBAL TIME COUPON SYSTEM
// ======================================


import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


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
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


import {
    getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";



// ======================================
// Firebase 설정값 입력
// Firebase Console
// 프로젝트 설정 → 웹 앱
// ======================================


const firebaseConfig = {

    apiKey: "YOUR_API_KEY",

    authDomain: "YOUR_AUTH_DOMAIN",

    projectId: "YOUR_PROJECT_ID",

    storageBucket: "YOUR_STORAGE_BUCKET",

    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",

    appId: "YOUR_APP_ID"

};



// Firebase 시작

const app = initializeApp(firebaseConfig);



// Firestore

const db = getFirestore(app);



// Authentication

const auth = getAuth(app);





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

    serverTimestamp

};
