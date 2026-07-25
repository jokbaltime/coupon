// ======================================
// JOKBALTIME STAFF SYSTEM
// ======================================


import {

db,
auth,
doc,
getDoc,
updateDoc,
collection,
query,
where,
onSnapshot,
serverTimestamp

} from "./firebase.js";


import {

signInWithEmailAndPassword,
signOut,
onAuthStateChanged

} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";



// 요소

const loginArea =
document.getElementById("loginArea");

const staffArea =
document.getElementById("staffArea");


const loginButton =
document.getElementById("loginButton");


const logoutButton =
document.getElementById("logoutButton");


const couponInput =
document.getElementById("couponNumber");


const checkButton =
document.getElementById("checkButton");


const useButton =
document.getElementById("useButton");


const cancelButton =
document.getElementById("cancelButton");


const scanButton =
document.getElementById("scanButton");


const resultDiv =
document.getElementById("result");


const reader =
document.getElementById("reader");



let html5QrCode = null;



// ======================
// 로그인
// ======================


loginButton.onclick = async()=>{


const email =
document.getElementById("email").value.trim();


const password =
document.getElementById("password").value.trim();



try{


await signInWithEmailAndPassword(

auth,

email,

password

);


alert("로그인 성공");


}

catch(e){


alert(
"로그인 실패 : "
+ e.message
);


}


};





// ======================
// 로그인 상태
// ======================


onAuthStateChanged(

auth,

(user)=>{


if(user){


loginArea.style.display="none";

staffArea.style.display="block";


startRequestListener();


}

else{


loginArea.style.display="block";

staffArea.style.display="none";


}


}

);





// ======================
// 로그아웃
// ======================


logoutButton.onclick = async()=>{


await stopScanner();


await signOut(auth);


};





// ======================
// 요청 확인
// ======================


function startRequestListener(){


const list =
document.getElementById("requestList");


const q =
query(

collection(db,"coupon_request"),

where(
"status",
"==",
"waiting"
)

);



onSnapshot(q,(snap)=>{


list.innerHTML="";



snap.forEach((item)=>{


const data=item.data();



const div =
document.createElement("div");


div.innerHTML=`

<h3>🔔 요청</h3>

쿠폰번호 :
<b>
${data.couponNumber}
</b>

<button>
승인
</button>

`;



div.querySelector("button").onclick =
async()=>{


await updateDoc(

doc(
db,
"coupon_issue",
data.couponNumber
),

{

used:true,

usedTime:serverTimestamp()

}

);



await updateDoc(

doc(
db,
"coupon_request",
item.id
),

{

status:"approved",

approvedTime:serverTimestamp()

}

);


alert("승인 완료");


};



list.appendChild(div);



});



});



}







// ======================
// 쿠폰 조회
// ======================


checkButton.onclick = async()=>{


const number =
couponInput.value.trim();



if(!number){

resultDiv.innerHTML=
"쿠폰번호 입력";

return;

}



const snap =
await getDoc(

doc(
db,
"coupon_issue",
number

)

);



if(!snap.exists()){


resultDiv.innerHTML=
"❌ 없는 쿠폰";


return;


}



const data =
snap.data();



if(data.used){


resultDiv.innerHTML=
"❌ 사용 완료 쿠폰";


}

else{


resultDiv.innerHTML=
"✅ 사용 가능 쿠폰";


}



};







// ======================
// QR 시작
// ======================


scanButton.onclick = async()=>{


if(html5QrCode){


await stopScanner();


}

else{


await startScanner();


}



};







async function startScanner(){



reader.style.display="block";



html5QrCode =
new Html5Qrcode("reader");



const config={


fps:10,


qrbox:250


};





await html5QrCode.start(

{

facingMode:"environment"

},

config,

(decodedText)=>{


// QR 성공

const onScanSuccess = async (decodedText) => {

    console.log(
        "QR 스캔 성공:",
        decodedText
    );


    // QR 번호 입력
    couponInput.value = decodedText;


    // 카메라 종료
    await stopScanner();


    // 자동 조회
    const snap = await getDoc(
        doc(
            db,
            "coupon_issue",
            decodedText
        )
    );


    if(!snap.exists()){

        resultDiv.innerHTML =
        "❌ 없는 쿠폰";

        return;

    }


    const data = snap.data();


    if(data.used){

        resultDiv.innerHTML =
        "❌ 이미 사용한 쿠폰";

    }
    else{

        resultDiv.innerHTML =
        "✅ 사용 가능한 쿠폰";

    }

async function stopScanner(){

    if(html5QrCode){

        try{

            await html5QrCode.stop();

            html5QrCode.clear();

        }
        catch(e){

            console.log(e);

        }

    }


    if(reader){

        reader.style.display="none";

    }

}
};



}







// ======================
// QR 종료
// ======================


