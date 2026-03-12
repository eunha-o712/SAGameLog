const ouid = sessionStorage.getItem("playerOuid");
const nickname = sessionStorage.getItem("playerNickname");

const playerName = document.getElementById("playerName");
const matchArea = document.getElementById("matchArea");
const matchModeSelect = document.getElementById("matchModeSelect");
const matchTypeSelect = document.getElementById("matchTypeSelect");
const searchBtn = document.getElementById("searchBtn");
const resetBtn = document.getElementById("resetBtn");

const matchTypeMap = {
    "폭파미션": [
        "전체",
        "일반전",
        "클랜전",
        "퀵매치 클랜전",
        "클랜 랭크전",
        "랭크전 솔로",
        "랭크전 파티",
        "토너먼트"
    ],
    "개인전": [
        "전체",
        "일반전",
        "랭크전 솔로"
    ],
    "데스매치": [
        "전체",
        "일반전"
    ],
    "진짜를 모아라": [
        "전체",
        "일반전"
    ]
};

if (!ouid) {
    alert("잘못된 접근입니다. 홈에서 다시 검색해주세요.");
    location.href = "/";
}

if (playerName) {
    playerName.innerText = nickname ? nickname : "알 수 없음";
}

function renderMatchTypeOptions(mode) {
    const types = matchTypeMap[mode] || ["전체"];
    matchTypeSelect.innerHTML = "";

    types.forEach(type => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        matchTypeSelect.appendChild(option);
    });
}

function resetFilters() {
    matchModeSelect.value = "폭파미션";
    renderMatchTypeOptions("폭파미션");
    matchTypeSelect.value = "전체";
}

async function loadMatches() {
    if (!ouid) {
        matchArea.innerHTML = `<p class="error">OUID 정보가 없습니다.</p>`;
        return;
    }

    const matchMode = matchModeSelect.value;
    const matchType = matchTypeSelect.value;

    let url = `/api/sa/matches?ouid=${encodeURIComponent(ouid)}&match_mode=${encodeURIComponent(matchMode)}`;

    if (matchType && matchType !== "전체") {
        url += `&match_type=${encodeURIComponent(matchType)}`;
    }

    matchArea.innerHTML = `<p>전적 불러오는 중...</p>`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const matches = data.match || [];

        if (matches.length === 0) {
            matchArea.innerHTML = `<p>해당 조건의 전적이 없습니다.</p>`;
            return;
        }

        let html = "";

        matches.forEach(match => {
            let resultText = "기록 없음";
            let resultColor = "#7f8c8d";

            if (match.match_result === "1") {
                resultText = "승리";
                resultColor = "#2e86de";
            } else if (match.match_result === "2") {
                resultText = "패배";
                resultColor = "#e74c3c";
            } else if (match.match_result === "3") {
                resultText = "무승부";
                resultColor = "#95a5a6";
            }

            const dateText = match.date_match
                ? new Date(match.date_match).toLocaleString("ko-KR")
                : "-";

            html += `
                <div class="match-item"
                     onclick="goToMatchDetail('${match.match_id}')"
                     style="padding:16px 0; border-bottom:1px solid #e5e9ef; cursor:pointer;">
                    <div class="row">
                        <b style="color:${resultColor};">${resultText}</b>
                        &nbsp;|&nbsp;
                        ${match.match_mode ?? "-"}
                        ${match.match_type ? ` / ${match.match_type}` : ""}
                    </div>

                    <div class="row">
                        <b>킬/데스/어시</b> :
                        ${match.kill ?? 0} / ${match.death ?? 0} / ${match.assist ?? 0}
                    </div>

                    <div class="row">
                        <b>일시</b> : ${dateText}
                    </div>
                </div>
            `;
        });

        matchArea.innerHTML = html;

    } catch (error) {
        matchArea.innerHTML = `<p class="error">전적 조회 실패</p>`;
        console.error(error);
    }
}

function goToMatchDetail(matchId) {
    location.href = `/page/match-detail.html?match_id=${encodeURIComponent(matchId)}`;
}

matchModeSelect.addEventListener("change", () => {
    renderMatchTypeOptions(matchModeSelect.value);
});

searchBtn.addEventListener("click", () => {
    loadMatches();
});

resetBtn.addEventListener("click", () => {
    resetFilters();
    loadMatches();
});

resetFilters();
loadMatches();