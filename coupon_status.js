// ======================================
// 전체 코드 검수용 - coupon_status.js
// (신규 파일)
// 쿠폰 상태 공통 관리 로직
// ======================================


import {

db,

doc,

getDoc,

updateDoc,

addDoc,

collection,

serverTimestamp

} from "./firebase.js";





// ======================================
// 쿠폰 상태 확인
// ======================================


export async function getCouponStatus(number){


const snap =

await getDoc(

doc(

db,

"coupons",

number

)

);



if(!snap.exists()){

return null;

}



return snap.data();


}








// ======================================
// 쿠폰 승인 처리
// ======================================


export async function approveCoupon(number){



await updateDoc(

doc(

db,

"coupons",

number

),

{


status:"approved",


approvedAt:

serverTimestamp()


}

);






await addDoc(

collection(

db,

"coupon_history"

),

{


couponNumber:number,


action:"approved",


time:

serverTimestamp()


}

);



}








// ======================================
// 쿠폰 사용 처리
// ======================================


export async function useCoupon(number){



await updateDoc(

doc(

db,

"coupons",

number

),

{


status:"used",


usedAt:

serverTimestamp()


}

);






await addDoc(

collection(

db,

"coupon_history"

),

{


couponNumber:number,


action:"used",


time:

serverTimestamp()


}

);



}








// ======================================
// 사용 취소 복구
// ======================================


export async function cancelUse(number){



await updateDoc(

doc(

db,

"coupons",

number

),

{


status:"approved",


cancelledAt:

serverTimestamp()


}

);







await addDoc(

collection(

db,

"coupon_history"

),

{


couponNumber:number,


action:"cancelled",


time:

serverTimestamp()


}

);



}
