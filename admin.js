// ======================================
// JOKBALTIME ADMIN FIREBASE
// ADMIN PANEL
// ======================================


import {

    db,
    doc,
    setDoc,
    getDoc,
    collection,
    onSnapshot

} from "./firebase.js";



// ======================================
// 쿠폰 설정 위치
// ======================================


const couponRef = doc(

    db,

    "coupon",

    "setting"

);




// ======================================
// 관리자 로그인
// ======================================


const loginButton =
document.getElementById("loginButton");


const loginBox =
document.querySelector(".login-box");


const adminPanel =
document.getElementById("adminPanel");




loginButton.addEventListener(

"click",

async function(){



    const pin =

    document.getElementById("adminPin").value;



    if(pin === "7812"){


        loginBox.classList.add("hidden");


        adminPanel.classList.remove("hidden");


        await loadCoupon();


        loadUsedCoupons();


    }


    else{


        alert(
            "PIN이 올바르지 않습니다."
        );


    }


});





// ======================================
// 쿠폰 설정 불러오기
// ======================================


async function loadCoupon(){



    const snapshot =

    await getDoc(couponRef);



    if(snapshot.exists()){


        const data =

        snapshot.data();




        document.getElementById("discount").value =

        data.discount ?? 20;



        document.getElementById("title").value =

        data.title ?? "메인메뉴";



        document.getElementById("notice").value =

        data.notice ??

        "매장 내 식사만 가능\n포장 · 배달 제외";


    }



}






// ======================================
// 쿠폰 설정 저장
// ======================================


const saveButton =

document.getElementById("saveButton");



saveButton.addEventListener(

"click",

async function(){



    const couponData = {



        title:

        document.getElementById("title").value,



        discount:

        Number(
            document.getElementById("discount").value
        ),



        notice:

        document.getElementById("notice").value



    };




    await setDoc(

        couponRef,

        couponData

    );



    alert(
        "Firebase 저장 완료"
    );



});






// ======================================
// 사용 완료 쿠폰 목록
// ======================================



function loadUsedCoupons(){



    const list =

    document.getElementById("usedCoupons");



    const useCollection =

    collection(

        db,

        "coupon_use"

    );




    onSnapshot(

        useCollection,

        (snapshot)=>{



            if(snapshot.empty){


                list.innerHTML =

                "사용된 쿠폰이 없습니다.";


                return;


            }





            let html = "";




            snapshot.forEach((doc)=>{



                const data =

                doc.data();




                let time =

                "시간 확인중";




                if(data.usedTime){


                    time =

                    data.usedTime
                    .toDate()
                    .toLocaleString();


                }




                html += `

                <div class="coupon-history">


                    <h3>

                    ${data.couponNumber}

                    </h3>


                    <p>

                    상태 :
                    ${data.status}

                    </p>


                    <p>

                    사용시간 :
                    ${time}

                    </p>


                </div>

                `;



            });





            list.innerHTML = html;



        }


    );



}
