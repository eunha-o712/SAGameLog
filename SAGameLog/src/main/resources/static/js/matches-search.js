const nicknameInput = document.getElementById("nicknameInput");
const searchBtn = document.getElementById("searchBtn");
const loadingMsg = document.getElementById("loadingMsg");
const errorMsg = document.getElementById("errorMsg");

const searchResultArea = document.getElementById("searchResultArea");
const playerName = document.getElementById("playerName");

const filterArea = document.getElementById("filterArea");
const matchListArea = document.getElementById("matchListArea");
const paginationArea = document.getElementById("paginationArea");

const modeFilter = document.getElementById("modeFilter");
const typeFilter = document.getElementById("typeFilter");
const matchSearchBtn = document.getElementById("matchSearchBtn");
const resetBtn = document.getElementById("resetBtn");

const pageSize = 20;
let currentPage = 1;
let currentMatches = [];

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

function setLoading(show) {
    loadingMsg.style.display = show ? "block" : "none";
}

function setError(message) {
    errorMsg.innerText = message || "";
}

function renderMatchTypeOptions(mode) {
    const types = matchTypeMap[mode] || ["전체"];
    typeFilter.innerHTML = "";

    types.forEach(type => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        typeFilter.appendChild(option);
    });
}

function resetFilters() {
    modeFilter.value = "폭파미션";
    renderMatchTypeOptions("폭파미션");
    typeFilter.value = "전체";
}

function getResultText(result) {
    if (result === "1") return { text: "승리", color: "#2e86de" };
    if (result === "2") return { text: "패배", color: "#e74c3c" };
    if (result === "3") return { text: "무승부", color: "#95a5a6" };
    return { text: "기록 없음", color: "#7f8c8d" };
}

function goToMatchDetail(matchId) {
    location.href = `/page/match-detail.html?match_id=${encodeURIComponent(matchId)}`;
}

function filterMatchesWithinOneYear(matches) {
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    return matches.filter(match => {
        if (!match.date_match) return false;

        const matchDate = new Date(match.date_match);
        return matchDate >= oneYearAgo && matchDate <= now;
    });
}

function renderPagination() {
    paginationArea.innerHTML = "";

    const totalPages = Math.ceil(currentMatches.length / pageSize);

    if (totalPages <= 1) {
        return;
    }

    let html = "";

    if (currentPage > 1) {
        html += `<button type="button" onclick="changePage(${currentPage - 1})" style="margin:0 4px;">이전</button>`;
    }

    for (let i = 1; i <= totalPages; i++) {
        html += `
            <button
                type="button"
                onclick="changePage(${i})"
                style="margin:0 4px; ${i === currentPage ? "background:#162534;font-weight:bold;" : ""}"
            >${i}</button>
        `;
    }

    if (currentPage < totalPages) {
        html += `<button type="button" onclick="changePage(${currentPage + 1})" style="margin:0 4px;">다음</button>`;
    }

    paginationArea.innerHTML = html;
}

function renderMatchesPage(page) {
    currentPage = page;

    if (!currentMatches || currentMatches.length === 0) {
        matchListArea.innerHTML = `
            <h2>전적 목록</h2>
            <p>최근 1년 기준 조회 가능한 전적이 없습니다.</p>
        `;
        matchListArea.style.display = "block";
        paginationArea.innerHTML = "";
        return;
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pagedMatches = currentMatches.slice(startIndex, endIndex);

    let html = `
        <h2>전적 목록</h2>
        <div class="row" style="font-size:14px; color:#5b6b7b;">
            최근 1년 기준 전적만 제공합니다.
        </div>
    `;

    pagedMatches.forEach(match => {
        const result = getResultText(match.match_result);
        const dateText = match.date_match
            ? new Date(match.date_match).toLocaleString("ko-KR")
            : "-";

        html += `
            <div class="match-item"
                 onclick="goToMatchDetail('${match.match_id}')"
                 style="padding:16px 0; border-bottom:1px solid #e5e9ef; cursor:pointer;">
                <div class="row">
                    <b style="color:${result.color};">${result.text}</b>
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

    matchListArea.innerHTML = html;
    matchListArea.style.display = "block";
    renderPagination();
}

function changePage(page) {
    renderMatchesPage(page);
}

window.changePage = changePage;
window.goToMatchDetail = goToMatchDetail;

async function loadMatches() {
    const ouid = sessionStorage.getItem("playerOuid");

    if (!ouid) {
        setError("플레이어 정보가 없습니다. 다시 검색해주세요.");
        return;
    }

    const mode = modeFilter.value;
    const type = typeFilter.value;

    let url = `/api/sa/matches?ouid=${encodeURIComponent(ouid)}&match_mode=${encodeURIComponent(mode)}`;

    if (type && type !== "전체") {
        url += `&match_type=${encodeURIComponent(type)}`;
    }

    setLoading(true);
    setError("");
    matchListArea.style.display = "none";
    paginationArea.innerHTML = "";

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`전적 조회 실패 (${response.status})`);
        }

        const data = await response.json();

        const matches = data.match || [];
        currentMatches = filterMatchesWithinOneYear(matches);

        renderMatchesPage(1);

    } catch (error) {
        setError(error.message || "전적 조회 중 오류가 발생했습니다.");
        console.error(error);
    } finally {
        setLoading(false);
    }
}

async function searchPlayerForMatches() {
    const nickname = nicknameInput.value.trim();

    if (!nickname) {
        alert("닉네임을 입력해주세요.");
        return;
    }

    setLoading(true);
    setError("");
    searchResultArea.style.display = "none";
    filterArea.style.display = "none";
    matchListArea.style.display = "none";
    paginationArea.innerHTML = "";

    try {
        const response = await fetch(`/api/sa/profile?nickname=${encodeURIComponent(nickname)}`);

        if (!response.ok) {
            throw new Error(`플레이어 조회 실패 (${response.status})`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        if (!data.ouid || !data.basicInfo || !data.basicInfo.user_name) {
            throw new Error("플레이어 정보를 불러오지 못했습니다.");
        }

        sessionStorage.setItem("playerOuid", data.ouid);
        sessionStorage.setItem("playerNickname", data.basicInfo.user_name);

        playerName.innerText = data.basicInfo.user_name;
        searchResultArea.style.display = "block";
        filterArea.style.display = "block";

        resetFilters();
        await loadMatches();

    } catch (error) {
        setError(error.message || "전적 검색 준비 중 오류가 발생했습니다.");
        console.error(error);
    } finally {
        setLoading(false);
    }
}

searchBtn.addEventListener("click", searchPlayerForMatches);

nicknameInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        searchPlayerForMatches();
    }
});

modeFilter.addEventListener("change", () => {
    renderMatchTypeOptions(modeFilter.value);
});

matchSearchBtn.addEventListener("click", () => {
    loadMatches();
});

resetBtn.addEventListener("click", async () => {
    resetFilters();
    await loadMatches();
});

resetFilters();