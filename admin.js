// ======================================
// JOKBALTlME ADMIN
// LOGIN + FIRESTORE SETTING
// ======================================


import {

auth,

db,

doc,

setDoc,

getDoc

} from "./firebase.js";



import {

signInWithEmailAndPassword,

onAuthStateChanged,

signOut

} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";




// Firestore 위치

const couponRef = doc(
    db,
    "coupon",
    "setting"
);




// 화면 요소

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
        );

    }


    loadSetting();


}








// =============================
// 로그인
// =============================


if(loginButton){


loginButton.onclick = async()=>{


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




    try{


        await signInWithEmailAndPassword(

            auth,

            email,

            password

        );



        alert(
            "로그인 성공"
        );



        showAdmin();



    }


    catch(error){


        console.error(
            error
        );


        alert(
            "로그인 실패 : "
            +
            error.code
        );


    }


};


}









// =============================
// 로그인 상태 유지
// =============================


onAuthStateChanged(

auth,

(user)=>{


    if(user){


        console.log(
            "로그인 사용자:",
            user.email
        );


        showAdmin();


    }


}

);









// =============================
// 설정 불러오기
// =============================


async function loadSetting(){


try{


console.log(
    "설정 불러오기"
);



const snap =

await getDoc(
    couponRef
);




console.log(
    "문서 존재:",
    snap.exists()
);





if(snap.exists()){


const data =
snap.data();



console.log(
    "Firebase 데이터:",
    data
);






const titleBox =
document.getElementById(
    "title"
);


const discountBox =
document.getElementById(
    "discount"
);


const noticeBox =
document.getElementById(
    "notice"
);





if(titleBox){

titleBox.value =
data.title || "";

}



if(discountBox){

discountBox.value =
data.discount || 0;

}



if(noticeBox){

noticeBox.value =
data.notice || "";

}




}



}

catch(error){


console.error(
    "불러오기 오류:",
    error
);


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



saveButton.onclick = async()=>{



try{



const saveData = {


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





console.log(
    "저장 데이터:",
    saveData
);






await setDoc(

    couponRef,

    saveData

);





alert(
    "저장 완료"
);




}



catch(error){



console.error(
    "저장 오류:",
    error
);



alert(
    "저장 실패 : "
    +
    error.code
);



}



};



}









// =============================
// 로그아웃
// =============================


const logoutButton =

document.getElementById(
    "logoutButton"
);



if(logoutButton){



logoutButton.onclick = async()=>{


await signOut(
    auth
);


location.reload();


};



}
