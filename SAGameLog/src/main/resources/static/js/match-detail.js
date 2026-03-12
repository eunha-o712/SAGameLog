const params = new URLSearchParams(window.location.search);
const matchId = params.get("match_id");

const currentNickname = sessionStorage.getItem("playerNickname");

const matchSummaryArea = document.getElementById("matchSummaryArea");
const teamVsArea = document.getElementById("teamVsArea");
const teamBoardArea = document.getElementById("teamBoardArea");

function calculateWinningTeamMVP(players) {
    let mvp = null;
    let maxScore = -Infinity;

    players.forEach(player => {
        const score =
            (Number(player.kill || 0) * 3) +
            Number(player.assist || 0) +
            (Number(player.damage || 0) / 100) -
            Number(player.death || 0);

        if (score > maxScore) {
            maxScore = score;
            mvp = player.user_name;
        }
    });

    return mvp;
}

function getTeamGuildName(players) {
    const validGuilds = players
        .map(player => player.guild_name)
        .filter(name => name && name.trim() !== "" && name !== "-");

    if (validGuilds.length === 0) {
        return null;
    }

    const countMap = {};
    validGuilds.forEach(name => {
        countMap[name] = (countMap[name] || 0) + 1;
    });

    let topGuild = validGuilds[0];
    let topCount = 0;

    Object.keys(countMap).forEach(name => {
        if (countMap[name] > topCount) {
            topGuild = name;
            topCount = countMap[name];
        }
    });

    return topGuild;
}

function getTeamResult(players) {
    if (!players || players.length === 0) return "3";
    return players[0].match_result ?? "3";
}

function getTeamColorByResult(result) {
    if (result === "1") {
        return {
            border: "#e74c3c",
            bg: "#fff5f5",
            title: "#c0392b",
            label: "승리"
        };
    }
    if (result === "2") {
        return {
            border: "#2e86de",
            bg: "#f4f9ff",
            title: "#1f5fa8",
            label: "패배"
        };
    }
    return {
        border: "#95a5a6",
        bg: "#f8f9fa",
        title: "#7f8c8d",
        label: "무승부"
    };
}

function getDisplayTeamName(teamGuild, teamResult) {
    if (teamGuild) return teamGuild;

    if (teamResult === "1") return "승리팀";
    if (teamResult === "2") return "패배팀";
    return "무승부팀";
}

function togglePlayerDetail(detailId) {
    const detailEl = document.getElementById(detailId);
    if (!detailEl) return;

    if (detailEl.style.display === "none" || detailEl.style.display === "") {
        detailEl.style.display = "block";
    } else {
        detailEl.style.display = "none";
    }
}

function renderPlayerAccordion(player, teamStyle, teamGuild, mvpPlayer) {
    const isMe = currentNickname && player.user_name === currentNickname;
    const isMVP = player.user_name === mvpPlayer;

    const isMercenary =
        teamGuild &&
        player.guild_name &&
        player.guild_name !== "-" &&
        player.guild_name !== teamGuild;

    const detailId = `detail_${player.user_name}_${player.team_id}_${player.kill}_${player.death}`
        .replace(/[^a-zA-Z0-9_]/g, "");

    return `
        <div class="match-item"
             style="border:1px solid #e5e9ef; border-radius:10px; margin-bottom:10px; overflow:hidden; background:#fff;">

            <div onclick="togglePlayerDetail('${detailId}')"
                 style="
                    cursor:pointer;
                    padding:14px 16px;
                    background:${isMe ? '#fff8d9' : '#ffffff'};
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                 ">
                <div>
                    <strong style="color:${isMercenary ? '#9aa3af' : '#000'}">
                        ${player.user_name ?? "-"}
                    </strong>
                    ${isMe ? `<span style="margin-left:8px; font-size:12px; font-weight:bold; color:#b7791f;">ME</span>` : ``}
                    ${isMVP ? `<span style="margin-left:8px; font-size:12px; font-weight:bold; color:gold;">MVP</span>` : ``}
                </div>
                <div style="color:#666;">▼</div>
            </div>

            <div id="${detailId}" style="display:none; padding:14px 16px; background:${teamStyle.bg}; border-top:1px solid #e5e9ef;">
                <div class="row"><b>계급</b> : ${player.season_grade ?? "-"}</div>
                <div class="row"><b>길드명</b> : ${player.guild_name ?? "-"}</div>
                <div class="row"><b>킬/데스/어시</b> : ${player.kill ?? 0} / ${player.death ?? 0} / ${player.assist ?? 0}</div>
                <div class="row"><b>헤드샷</b> : ${player.headshot ?? 0}</div>
                <div class="row"><b>데미지</b> : ${player.damage ?? 0}</div>
            </div>
        </div>
    `;
}

async function loadMatchDetail() {
    if (!matchId) {
        matchSummaryArea.innerHTML = `<p class="error">match_id가 없습니다.</p>`;
        teamVsArea.innerHTML = "";
        teamBoardArea.innerHTML = "";
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
            teamVsArea.innerHTML = `<p>팀 정보가 없습니다.</p>`;
            teamBoardArea.innerHTML = `<p>참가 유저 정보가 없습니다.</p>`;
            return;
        }

        const mePlayer = matchDetails.find(player => player.user_name === currentNickname);

        if (!mePlayer) {
            teamVsArea.innerHTML = `<p>기준 플레이어를 찾을 수 없습니다.</p>`;
            teamBoardArea.innerHTML = `<p>참가 유저 정보를 표시할 수 없습니다.</p>`;
            return;
        }

        const myTeamId = mePlayer.team_id;

        const myTeamPlayers = matchDetails.filter(player => player.team_id === myTeamId);
        const enemyTeamPlayers = matchDetails.filter(player => player.team_id !== myTeamId);

        if (myTeamPlayers.length === 0 || enemyTeamPlayers.length === 0) {
            teamVsArea.innerHTML = `<p>팀 정보를 구분할 수 없습니다.</p>`;
            teamBoardArea.innerHTML = `<p>참가 유저 정보가 부족합니다.</p>`;
            return;
        }

        const myTeamResult = getTeamResult(myTeamPlayers);
        const enemyTeamResult = getTeamResult(enemyTeamPlayers);

        const myTeamStyle = getTeamColorByResult(myTeamResult);
        const enemyTeamStyle = getTeamColorByResult(enemyTeamResult);

        const myTeamGuild = getTeamGuildName(myTeamPlayers);
        const enemyTeamGuild = getTeamGuildName(enemyTeamPlayers);

        const myTeamDisplayName = getDisplayTeamName(myTeamGuild, myTeamResult);
        const enemyTeamDisplayName = getDisplayTeamName(enemyTeamGuild, enemyTeamResult);

        // MVP는 승리팀에서만 계산
        const winningPlayers = myTeamResult === "1" ? myTeamPlayers
                            : enemyTeamResult === "1" ? enemyTeamPlayers
                            : [];
        const mvpPlayer = calculateWinningTeamMVP(winningPlayers);

        teamVsArea.innerHTML = `
            <h2 style="text-align:center; margin-bottom:0;">${myTeamDisplayName} VS ${enemyTeamDisplayName}</h2>
            <div class="row" style="text-align:center; margin-top:12px;">
                <span style="font-weight:bold; color:${myTeamStyle.title};">${myTeamDisplayName} (${myTeamStyle.label})</span>
                &nbsp;&nbsp;VS&nbsp;&nbsp;
                <span style="font-weight:bold; color:${enemyTeamStyle.title};">${enemyTeamDisplayName} (${enemyTeamStyle.label})</span>
            </div>
        `;

        const myTeamHtml = myTeamPlayers
            .map(player => renderPlayerAccordion(player, myTeamStyle, myTeamGuild, mvpPlayer))
            .join("");

        const enemyTeamHtml = enemyTeamPlayers
            .map(player => renderPlayerAccordion(player, enemyTeamStyle, enemyTeamGuild, mvpPlayer))
            .join("");

        teamBoardArea.innerHTML = `
            <div style="display:flex; gap:20px; flex-wrap:wrap;">

                <div style="
                    flex:1;
                    min-width:320px;
                    border:2px solid ${myTeamStyle.border};
                    border-radius:14px;
                    padding:18px;
                    background:${myTeamStyle.bg};
                ">
                    <h2 style="margin-top:0; color:${myTeamStyle.title};">${myTeamDisplayName}</h2>
                    ${myTeamHtml}
                </div>

                <div style="
                    flex:1;
                    min-width:320px;
                    border:2px solid ${enemyTeamStyle.border};
                    border-radius:14px;
                    padding:18px;
                    background:${enemyTeamStyle.bg};
                ">
                    <h2 style="margin-top:0; color:${enemyTeamStyle.title};">${enemyTeamDisplayName}</h2>
                    ${enemyTeamHtml}
                </div>

            </div>
        `;

    } catch (error) {
        matchSummaryArea.innerHTML = `<p class="error">매치 상세 조회 실패</p>`;
        teamVsArea.innerHTML = "";
        teamBoardArea.innerHTML = "";
        console.error(error);
    }
}

loadMatchDetail();