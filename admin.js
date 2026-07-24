// ======================================
// JOKBALTlME ADMIN
// FIREBASE AUTH VERSION v2
// ======================================


import {

    db,
    auth,
    doc,
    setDoc,
    getDoc,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut

} from "./firebase.js";





// =============================
// 쿠폰 설정 위치
// =============================


const couponRef =
doc(
    db,
    "coupon",
    "setting"
);







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
// 로그인
// =============================


if(loginButton){



loginButton.addEventListener(
"click",
async()=>{



    const email =
    document.getElementById(
        "adminEmail"
    ).value.trim();



    const password =
    document.getElementById(
        "adminPassword"
    ).value.trim();




    if(!email || !password){


        alert(
            "이메일과 비밀번호를 입력하세요."
        );


        return;


    }





    try{


        await signInWithEmailAndPassword(

            auth,

            email,

            password

        );




        showAdmin();



        await loadSetting();



    }


    catch(error){


        console.log(
            error
        );


        alert(
            "로그인 실패\n이메일 또는 비밀번호 확인"
        );


    }



});



}









// =============================
// 로그인 상태 확인
// =============================


onAuthStateChanged(

auth,

async(user)=>{



    if(user){


        showAdmin();


        await loadSetting();


    }


}

);









function showAdmin(){



    if(loginBox){


        loginBox.classList.add(
            "hidden"
        );


    }



    if(adminPanel){


        adminPanel.classList.remove(
            "hidden"
        );


    }


}









// =============================
// 쿠폰 설정 불러오기
// =============================


async function loadSetting(){



const snap =
await getDoc(
    couponRef
);





if(snap.exists()){



    const data =
    snap.data();




    const title =
    document.getElementById(
        "title"
    );



    const discount =
    document.getElementById(
        "discount"
    );



    const notice =
    document.getElementById(
        "notice"
    );




    if(title){

        title.value =
        data.title || "";

    }




    if(discount){

        discount.value =
        data.discount || 20;

    }




    if(notice){

        notice.value =
        data.notice || "";

    }



}



}









// =============================
// 저장
// =============================


const saveButton =
document.getElementById(
    "saveButton"
);





if(saveButton){



saveButton.addEventListener(
"click",
async()=>{



const data = {



    title:

    document.getElementById(
        "title"
    ).value,




    discount:

    Number(
        document.getElementById(
            "discount"
        ).value
    ),




    notice:

    document.getElementById(
        "notice"
    ).value



};





await setDoc(

    couponRef,

    data

);





alert(
"Firebase 저장 완료"
);




});
