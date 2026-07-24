// ======================================
// JOKBALTIME ADMIN
// FIREBASE COUPON MANAGER v4
// ======================================


import {

    db,
    doc,
    setDoc,
    getDoc,
    deleteDoc,
    collection,
    query,
    where,
    getDocs

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
// 로그인
// =============================


const loginButton =
document.getElementById("loginButton");


const loginBox =
document.querySelector(".login-box");


const adminPanel =
document.getElementById("adminPanel");




loginButton.onclick = async()=>{


    const pin =
    document.getElementById("adminPin").value;



    if(pin === "7812"){


        loginBox.classList.add(
            "hidden"
        );


        adminPanel.classList.remove(
            "hidden"
        );


        await loadData();


    }
    else{


        alert(
            "PIN이 올바르지 않습니다."
        );


    }


};








// =============================
// 쿠폰 설정 불러오기
// =============================


async function loadData(){


    const snap =
    await getDoc(
        couponRef
    );



    if(snap.exists()){


        const data =
        snap.data();



        document.getElementById(
            "title"
        ).value =
        data.title ?? "메인메뉴";



        document.getElementById(
            "discount"
        ).value =
        data.discount ?? 20;



        document.getElementById(
            "notice"
        ).value =
        data.notice ?? 
        "매장 내 식사만 가능\n포장 · 배달 제외";


    }


}








// =============================
// 쿠폰 설정 저장
// =============================


document
.getElementById("saveButton")
.onclick = async()=>{


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
        "쿠폰 설정 저장 완료"
    );


};









// =============================
// 쿠폰 사용 확인
// =============================


document
.getElementById("checkUseButton")
.onclick = async()=>{


    const number =
    document.getElementById(
        "useCouponNumber"
    )
    .value
    .trim();



    const result =
    document.getElementById(
        "useResult"
    );




    if(!number){


        result.innerHTML =
        "❌ 쿠폰번호 입력 필요";


        return;


    }




    const q =
    query(

        collection(
            db,
            "coupon_use"
        ),

        where(
            "couponNumber",
            "==",
            number
        )

    );



    const snap =
    await getDocs(q);




    if(snap.empty){


        result.innerHTML =
        "❌ 사용 기록 없음";


    }
    else{


        result.innerHTML =
        "✅ 이미 사용 처리된 쿠폰";


    }



};









// =============================
// 쿠폰 사용 완료 처리
// =============================


document
.getElementById("completeUseButton")
.onclick = async()=>{


    const number =
    document.getElementById(
        "useCouponNumber"
    )
    .value
    .trim();



    if(!number){


        alert(
            "쿠폰번호 입력하세요"
        );


        return;


    }




    const useRef =
    doc(

        db,

        "coupon_use",

        number

    );




    await setDoc(

        useRef,

        {


            couponNumber:number,


            used:true,


            usedTime:
            new Date()


        }

    );



    document.getElementById(
        "useResult"
    )
    .innerHTML =

    "✅ 사용 완료 처리됨";


};









// =============================
// 쿠폰 사용 취소
// =============================


document
.getElementById("cancelUseButton")
.onclick = async()=>{


    const number =
    document.getElementById(
        "useCouponNumber"
    )
    .value
    .trim();



    if(!number){


        alert(
            "쿠폰번호 입력하세요"
        );


        return;


    }




    const useRef =
    doc(

        db,

        "coupon_use",

        number

    );



    await deleteDoc(
        useRef
    );



    document.getElementById(
        "useResult"
    )
    .innerHTML =

    "♻️ 사용 취소 완료";


};
