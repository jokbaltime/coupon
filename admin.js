// ======================================
// JOKBALTlME ADMIN
// FIREBASE AUTH LOGIN TEST v1
// ======================================


import {

    auth

} from "./firebase.js";



import {

    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut

} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";





// =============================
// 화면 요소
// =============================


const loginButton =
document.getElementById(
    "loginButton"
);



const loginBox =
document.querySelector(
    ".login-box"
);



const adminPanel =
document.getElementById(
    "adminPanel"
);









// =============================
// 로그인 버튼
// =============================


if(loginButton){


loginButton.addEventListener(

"click",

async()=>{



    const email =
    document.getElementById(
        "adminEmail"
    )
    .value
    .trim();





    const password =
    document.getElementById(
        "adminPassword"
    )
    .value
    .trim();







    console.log(
        "입력 이메일:",
        email
    );



    console.log(
        "비밀번호 길이:",
        password.length
    );







    if(!email || !password){


        alert(
            "이메일과 비밀번호를 입력하세요."
        );


        return;


    }








    try{


        const result =

        await signInWithEmailAndPassword(

            auth,

            email,

            password

        );




        console.log(
            "로그인 성공",
            result.user.email
        );




        alert(
            "로그인 성공"
        );




        showAdmin();



    }



    catch(error){



        console.log(
            "Firebase 오류:",
            error
        );



        alert(

            "로그인 실패\n\n" +

            error.code +

            "\n\n" +

            error.message

        );



    }



}


);


}









// =============================
// 로그인 상태 확인
// =============================


onAuthStateChanged(

auth,

(user)=>{



    if(user){



        console.log(

            "현재 로그인:",
            user.email

        );



        showAdmin();



    }



}

);









// =============================
// 관리자 화면 표시
// =============================


function showAdmin(){



    if(loginBox){


        loginBox.classList.add(
            "hidden"
        );


    }





    if(adminPanel){


        adminPanel.classList.remove(
            "hidden"
  
