// ======================================
// JOKBALTlME FIREBASE CONFIG
// ======================================


import {

    initializeApp

}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";



import {

    getFirestore,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    collection,
    getDocs,
    query,
    where,
    orderBy,
    onSnapshot

}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";





// =============================
// Firebase 설정
// =============================


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
    "1:1077568919018:web:2205193cae7848ec518e93",


    measurementId:
    "G-BEHR2WZR0F"


};






// =============================
// Firebase 시작
// =============================


const app =
initializeApp(
firebaseConfig
);




const db =
getFirestore(
app
);







// =============================
// 외부 사용 전달
// =============================


export {


    db,


    doc,


    setDoc,


    getDoc,


    updateDoc,


    deleteDoc,


    collection,


    getDocs,


    query,


    where,


    orderBy,


    onSnapshot


};
