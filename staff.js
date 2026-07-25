// ======================================
// JOKBALTIME STAFF SYSTEM (최종 수정본)
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
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 요소 가져오기
const loginArea = document.getElementById("loginArea");
const staffArea = document.getElementById("staffArea");
const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");

const couponInput = document.getElementById("couponNumber");
const checkButton = document.getElementById("checkButton");
const useButton = document.getElementById("useButton");
const cancelButton = document.getElementById("cancelButton");
const scanButton = document.getElementById("scanButton");
const resultDiv = document.getElementById("result");
const reader = document.getElementById("reader");

let html5QrCode = null;

// 1. 로그인 / 로그아웃
if (loginButton) {
    loginButton.onclick = async () => {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        if (!email || !password) return alert("이메일과 비밀번호를 입력하세요.");

        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert("로그인 성공");
        } catch (error) {
            alert("로그인 실패: " + error.message);
        }
    };
}

if (logoutButton) {
    logoutButton.onclick = async () => {
        await stopScanner();
        await signOut(auth);
        alert("로그아웃 되었습니다.");
    };
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        if (loginArea) loginArea.style.display = "none";
        if (staffArea) staffArea.style.display = "block";
        startRequestListener();
    } else {
        if (loginArea) loginArea.style.display = "block";
        if (staffArea) staffArea.style.display = "none";
        stopScanner();
    }
});

// 2. 실시간 요청 수신
function startRequestListener() {
    const list = document.getElementById("requestList");
    if (!list) return;

    const q = query(collection(db, "coupon_request"), where("status", "==", "waiting"));

    onSnapshot(q, (snapshot) => {
        list.innerHTML = "";
        if (snapshot.empty) {
            list.innerHTML = "<p style='color:#888; text-align:center;'>대기 중인 요청이 없습니다.</p>";
            return;
        }

        snapshot.forEach((item) => {
            const data = item.data();
            const box = document.createElement("div");
            box.className = "store-item";
            box.style.marginBottom = "10px";
            box.innerHTML = `
                <div style="display:flex; justify-between; align-items:center;">
                    <div>
                        <h3 style="color:var(--gold); margin:0;">🔔 새 승인 요청</h3>
                        <p style="margin:5px 0 0 0;">쿠폰번호: <b>${data.couponNumber}</b></p>
                    </div>
                    <button class="approve-btn" style="padding:8px 16px; background:var(--gold); color:#111; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">승인</button>
                </div>
            `;

            box.querySelector(".approve-btn").onclick = async () => {
                try {
                    const requestRef = doc(db, "coupon_request", item.id);
                    await updateDoc(doc(db, "coupon_issue", data.couponNumber), {
                        used: true,
                        usedTime: serverTimestamp()
                    });
                    await updateDoc(requestRef, {
                        status: "approved",
                        approvedTime: serverTimestamp(),
                        approvedBy: auth.currentUser?.email || "staff"
                    });
                    alert("승인 처리되었습니다.");
                } catch (e) {
                    alert("처리 실패: " + e.message);
                }
            };
            list.appendChild(box);
        });
    });
}

// 3. 직접 조회 / 사용 / 취소
if (checkButton) {
    checkButton.onclick = async () => {
        const number = couponInput.value.trim();
        if (!number) return (resultDiv.innerHTML = "쿠폰 번호를 입력하세요.");

        try {
            const snap = await getDoc(doc(db, "coupon_issue", number));
            if (!snap.exists()) {
                resultDiv.style.color = "#ff5252";
                resultDiv.innerHTML = "❌ 유효하지 않거나 없는 쿠폰입니다.";
                return;
            }

            if (snap.data().used) {
                resultDiv.style.color = "#ff9800";
                resultDiv.innerHTML = "⚠️ 이미 사용 완료된 쿠폰입니다.";
            } else {
                resultDiv.style.color = "#4caf50";
                resultDiv.innerHTML = "✅ 사용 가능한 쿠폰입니다.";
            }
        } catch (e) {
            resultDiv.innerHTML = "조회 오류: " + e.message;
        }
    };
}

if (useButton) {
    useButton.onclick = async () => {
        const number = couponInput.value.trim();
        if (!number) return alert("쿠폰 번호를 입력하세요.");

        try {
            await updateDoc(doc(db, "coupon_issue", number), {
                used: true,
                usedTime: serverTimestamp()
            });
            alert("사용 완료 처리되었습니다.");
            checkButton.click();
        } catch (e) {
            alert("처리 오류: " + e.message);
        }
    };
}

if (cancelButton) {
    cancelButton.onclick = async () => {
        const number = couponInput.value.trim();
        if (!number) return alert("쿠폰 번호를 입력하세요.");

        try {
            await updateDoc(doc(db, "coupon_issue", number), {
                used: false,
                usedTime: null
            });
            alert("사용 취소(복원) 되었습니다.");
            checkButton.click();
        } catch (e) {
            alert("처리 오류: " + e.message);
        }
    };
}

// 4. QR 스캐너 카메라 제어 (오류 방지)
if (scanButton) {
    scanButton.onclick = async () => {
        if (reader && reader.style.display === "block") {
            await stopScanner();
        } else {
            await startScanner();
        }
    };
}

async function startScanner() {
    if (typeof Html5Qrcode === "undefined") {
        alert("QR 스캐너 라이브러리가 로드되지 않았습니다.");
        return;
    }

    reader.style.display = "block";

    if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("reader");
    }

    // 1. QR 인식 영역 및 프레임 설정
   const config = {
    fps: 10,
    aspectRatio: 1.0
};

    const onScanSuccess = async (decodedText) => {
        alert(decodedText);
        console.log("QR 스캔 성공:", decodedText);
        couponInput.value = decodedText;
        await stopScanner();
        if (checkButton) checkButton.click();
    };

    // 2. 해상도 강제 지정 (선명한 초점을 위해 필수)
    const cameraConstraints = {
    facingMode:"environment"
};
    try {
        // 해상도 옵션을 포함하여 카메라 실행
        await html5QrCode.start(
            cameraConstraints, 
            config, 
            onScanSuccess, 
            () => {}
        );
    } catch (err1) {
        console.warn("해상도 지정 후면 카메라 실패, 기본 설정으로 재시도:", err1);
        try {
            // 실패 시 기본 후면 카메라인 옵션으로 fallback
            await html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess, () => {});
        } catch (err2) {
            console.error("카메라 최종 실행 실패:", err2);
            alert("카메라를 켤 수 없습니다. https 접속 여부 및 브라우저 권한을 확인하세요.");
            await stopScanner();
        }
    }
}
