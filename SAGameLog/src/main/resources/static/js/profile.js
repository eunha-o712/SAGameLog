const nicknameInput = document.getElementById("nicknameInput");
const loadingMsg = document.getElementById("loadingMsg");
const errorMsg = document.getElementById("errorMsg");
const profileCard = document.getElementById("profileCard");
const profileContent = document.getElementById("profileContent");
const recentMatchArea = document.getElementById("recentMatchArea");

async function loadRecentMatches(ouid) {
    try {
        const response = await fetch(
            `/api/sa/recent-matches?ouid=${encodeURIComponent(ouid)}`
        );

        if (!response.ok) {
            throw new Error(`전적 조회 실패 (${response.status})`);
        }

        const data = await response.json();
        const matches = data.match || [];

        if (matches.length === 0) {
            recentMatchArea.innerHTML = `
                <h2>최근 전적</h2>
                <p>조회 가능한 최근 전적이 없습니다.</p>
                <div class="row" style="font-size:14px; color:#5b6b7b;">
                    더 자세한 기록 검색은 전적 검색을 이용해주세요.
                </div>
            `;
            recentMatchArea.style.display = "block";
            return;
        }

        let html = `
            <h2>최근 전적</h2>
            <div class="row" style="font-size:14px; color:#5b6b7b;">
                전체 모드 기준 최근 20개 경기만 표시됩니다.
            </div>
        `;

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

        html += `
            <div class="row" style="font-size:14px; color:#5b6b7b; margin-top:18px;">
                더 자세한 기록 검색은 전적 검색을 이용해주세요.
            </div>
        `;

        recentMatchArea.innerHTML = html;
        recentMatchArea.style.display = "block";

    } catch (error) {
        recentMatchArea.innerHTML = `
            <h2>최근 전적</h2>
            <p>최근 전적을 불러오지 못했습니다.</p>
        `;
        recentMatchArea.style.display = "block";
        console.error(error);
    }
}

async function searchProfile() {
    const nickname = nicknameInput.value.trim();

    if (!nickname) {
        alert("닉네임을 입력해주세요.");
        return;
    }

    loadingMsg.style.display = "block";
    errorMsg.innerText = "";
    profileCard.style.display = "none";
    profileContent.innerHTML = "";
    recentMatchArea.style.display = "none";
    recentMatchArea.innerHTML = "";

    try {
        const res = await fetch(`/api/sa/profile?nickname=${encodeURIComponent(nickname)}`);
        const data = await res.json();

        loadingMsg.style.display = "none";

        if (data.error) {
            errorMsg.innerText = data.error;
            return;
        }

        const basic = data.basicInfo;
        const trend = data.recentTrend;

        sessionStorage.setItem("playerOuid", data.ouid);
        sessionStorage.setItem("playerNickname", basic.user_name);

        profileContent.innerHTML = `
            <h2>${basic.user_name}</h2>

            <div class="row"><b>클랜</b> : ${basic.clan_name ?? "없음"}</div>
            <div class="row"><b>칭호</b> : ${basic.title_name ?? "-"}</div>
            <div class="row"><b>매너등급</b> : ${basic.manner_grade ?? "-"}</div>

            <hr>

            <div class="row"><b>최근 승률</b> : ${Number(trend.recent_win_rate ?? 0).toFixed(1)}%</div>
            <div class="row"><b>K/D</b> : ${Number(trend.recent_kill_death_rate ?? 0).toFixed(1)}%</div>

            <br>

            <button type="button" class="btn" id="goMatchesBtn">전적 검색</button>
        `;

        const goMatchesBtn = document.getElementById("goMatchesBtn");
        goMatchesBtn.addEventListener("click", function () {
            location.href = "/page/matches-search.html";
        });

        profileCard.style.display = "block";

        await loadRecentMatches(data.ouid);

    } catch (e) {
        loadingMsg.style.display = "none";
        errorMsg.innerText = "서버 오류";
        console.error(e);
    }
}

function goToMatchDetail(matchId) {
    location.href = `/page/match-detail.html?match_id=${encodeURIComponent(matchId)}`;
}

window.goToMatchDetail = goToMatchDetail;

nicknameInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        searchProfile();
    }
});