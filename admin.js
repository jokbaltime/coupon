// ======================================
// JOKBALTlME ADMIN LOGIN TEST
// ======================================


import { auth } from "./firebase.js";


import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";



console.log("admin.js 시작");



const loginButton =
document.getElementById("loginButton");



if(loginButton){


    loginButton.addEventListener(
        "click",
        async function(){


            const email =
            document
            .getElementById("adminEmail")
            .value
            .trim();



            const password =
            document
            .getElementById("adminPassword")
            .value
            .trim();



            console.log("EMAIL:", email);
            console.log("PASSWORD LENGTH:", password.length);



            try{


                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


                alert("로그인 성공");


            }
            catch(error){


                console.log(error);


                alert(
                    "로그인 실패 : "
                    +
                    error.code
                );


            }


        }
    );


}
else{


    console.log(
        "loginButton 없음"
    );


}
