const params = new URLSearchParams(window.location.search);
const matchId = params.get("match_id");

const matchIdText = document.getElementById("matchIdText");
const matchSummaryArea = document.getElementById("matchSummaryArea");
const matchDetailArea = document.getElementById("matchDetailArea");

if (matchIdText) {
    matchIdText.innerText = matchId ?? "없음";
}

async function loadMatchDetail() {
    if (!matchId) {
        matchSummaryArea.innerHTML = `<p class="error">match_id가 없습니다.</p>`;
        matchDetailArea.innerHTML = "";
        return;
    }

    try {
        const response = await fetch(`/api/sa/match-detail?match_id=${encodeURIComponent(matchId)}`);
        const data = await response.json();

        const dateText = data.date_match
            ? new Date(data.date_match).toLocaleString("ko-KR")
            : "-";

        matchSummaryArea.innerHTML = `
            <h2>경기 정보</h2>
            <div class="row"><b>게임 모드</b> : ${data.match_mode ?? "-"}</div>
            <div class="row"><b>매치 유형</b> : ${data.match_type ?? "-"}</div>
            <div class="row"><b>맵</b> : ${data.match_map ?? "-"}</div>
            <div class="row"><b>일시</b> : ${dateText}</div>
        `;

        const matchDetails = data.match_detail || [];

        if (matchDetails.length === 0) {
            matchDetailArea.innerHTML = `<p>참가 유저 정보가 없습니다.</p>`;
            return;
        }

        let html = `<h2>참가 유저 정보</h2>`;

        matchDetails.forEach(player => {
            let resultText = "기록 없음";
            let resultColor = "#7f8c8d";

            if (player.match_result === "1") {
                resultText = "승리";
                resultColor = "#2e86de";
            } else if (player.match_result === "2") {
                resultText = "패배";
                resultColor = "#e74c3c";
            } else if (player.match_result === "3") {
                resultText = "무승부";
                resultColor = "#95a5a6";
            }

            html += `
                <div class="match-item" style="padding:16px 0; border-bottom:1px solid #e5e9ef;">
                    <div class="row">
                        <b>${player.user_name ?? "-"}</b>
                        &nbsp;|&nbsp;
                        <span style="color:${resultColor}; font-weight:bold;">${resultText}</span>
                    </div>

                    <div class="row"><b>팀</b> : ${player.team_id ?? "-"}</div>
                    <div class="row"><b>시즌 계급</b> : ${player.season_grade ?? "-"}</div>
                    <div class="row"><b>클랜명</b> : ${player.clan_name ?? "-"}</div>
                    <div class="row"><b>킬/데스/어시</b> : ${player.kill ?? 0} / ${player.death ?? 0} / ${player.assist ?? 0}</div>
                    <div class="row"><b>헤드샷</b> : ${player.headshot ?? 0}</div>
                    <div class="row"><b>데미지</b> : ${player.damage ?? 0}</div>
                </div>
            `;
        });

        matchDetailArea.innerHTML = html;

    } catch (error) {
        matchSummaryArea.innerHTML = `<p class="error">매치 상세 조회 실패</p>`;
        matchDetailArea.innerHTML = "";
        console.error(error);
    }
}

loadMatchDetail();