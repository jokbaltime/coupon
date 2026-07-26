// firebase.js FULL CHECK VERSION
// FIREBASE CONFIG / EXPORT ONLY


import {
initializeApp
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


import {
getFirestore,
doc,
getDoc,
setDoc,
addDoc,
getDocs,
collection,
query,
where,
onSnapshot,
updateDoc,
deleteDoc,
orderBy,
serverTimestamp
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



import {
getAuth
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";




// Firebase 설정

const firebaseConfig = {


apiKey:
"YOUR_API_KEY",


authDomain:
"YOUR_AUTH_DOMAIN",


projectId:
"YOUR_PROJECT_ID",


storageBucket:
"YOUR_STORAGE_BUCKET",


messagingSenderId:
"YOUR_MESSAGING_SENDER_ID",


appId:
"YOUR_APP_ID"


};





const app =
initializeApp(firebaseConfig);



const db =
getFirestore(app);



const auth =
getAuth(app);





export {


db,

auth,


doc,

getDoc,

setDoc,

addDoc,

getDocs,

collection,

query,

where,

onSnapshot,

updateDoc,

deleteDoc,

orderBy,

serverTimestamp


};
