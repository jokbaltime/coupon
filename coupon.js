import {
    db,
    doc,
    getDoc
} from "./firebase.js";

const couponInput = document.getElementById("couponInput");
const searchBtn = document.getElementById("searchBtn");
const resultCard = document.getElementById("resultCard");

searchBtn.onclick = async () => {

    const number = couponInput.value.trim();

    if (!number) {
        alert("쿠폰번호를 입력하세요.");
        return;
    }

    try {

        const snap = await getDoc(
            doc(db, "coupons", number)
        );

        if (!snap.exists()) {

            resultCard.innerHTML = `
                <h3>❌ 쿠폰이 존재하지 않습니다.</h3>
            `;

            return;
        }

        const data = snap.data();

        let status = "";

        const today = new Date();

        if (data.endDate) {

            const end = new Date(data.endDate);

            if (
                today > end &&
                data.status !== "used"
            ) {

                status = "🔴 기간 만료";

            }

        }

        if (!status) {

            switch (data.status) {

                case "issued":
                    status = "✅ 사용 가능";
                    break;

                case "waiting":
                    status = "⏳ 승인 대기";
                    break;

                case "approved":
                    status = "✅ 승인 완료";
                    break;

                case "used":
                    status = "❌ 사용 완료";
                    break;

                case "expired":
                    status = "🔴 기간 만료";
                    break;

                default:
                    status = "알 수 없음";

            }

        }

        resultCard.innerHTML = `

            <h2>${data.title}</h2>

            <p><b>쿠폰번호</b></p>
            <p>${data.couponNumber}</p>

            <p><b>상태</b></p>
            <p>${status}</p>

            <p><b>할인</b></p>
            <p>${data.discount}%</p>

            <p><b>사용기간</b></p>

            <p>
            ${data.startDate}
            <br>
            ~
            <br>
            ${data.endDate}
            </p>

            <hr>

            <b>
            직원에게 이 화면을 보여주세요.
            </b>

        `;

    } catch (e) {

        console.error(e);

        resultCard.innerHTML = `
            <h3>오류가 발생했습니다.</h3>
        `;

    }

};
