// ======================================
// JOKBALTIME FIREBASE CONFIG v2
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
addDoc,
getDoc,
getDocs,
updateDoc,
deleteDoc,

collection,

query,

where,

orderBy,

limit,

onSnapshot,

serverTimestamp

}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



import {

getAuth

}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";




// ===============================
// Firebase Config
// ===============================

const firebaseConfig={

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




// ===============================
// Firebase Start
// ===============================

const app=
initializeApp(
firebaseConfig
);



// ===============================
// Firestore
// ===============================

const db=
getFirestore(
app
);



// ===============================
// Auth
// ===============================

const auth=
getAuth(
app
);




// ===============================
// Export
// ===============================

export{

db,

auth,

doc,

setDoc,

addDoc,

getDoc,

getDocs,

updateDoc,

deleteDoc,

collection,

query,

where,

orderBy,

limit,

onSnapshot,

serverTimestamp

};
