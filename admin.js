import {
    auth
} from "./firebase.js";


import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";



const loginButton =
document.getElementById("loginButton");



loginButton.addEventListener(
"click",
async()=>{


    const email =
    document.getElementById("adminEmail").value;



    const password =
    document.getElementById("adminPassword").value;



    try{


        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );


        alert(
            "로그인 성공"
        );


    }


    catch(error){


        console.log(error);


        alert(
            "로그인 실패"
        );


    }


});
