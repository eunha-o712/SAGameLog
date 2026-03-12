async function searchProfile() {
    const nickname = document.getElementById("nicknameInput").value.trim();
    const loadingMsg = document.getElementById("loadingMsg");
    const errorMsg = document.getElementById("errorMsg");
    const card = document.getElementById("profileCard");
    const content = document.getElementById("profileContent");

    if (!nickname) {
        alert("닉네임을 입력해주세요.");
        return;
    }

    loadingMsg.style.display = "block";
    errorMsg.innerText = "";
    card.style.display = "none";
    content.innerHTML = "";

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

        content.innerHTML = `
            <h2>${basic.user_name}</h2>

            <div class="row"><b>클랜</b> : ${basic.clan_name ?? "없음"}</div>
            <div class="row"><b>칭호</b> : ${basic.title_name ?? "-"}</div>
            <div class="row"><b>매너등급</b> : ${basic.manner_grade ?? "-"}</div>

            <hr>

            <div class="row"><b>최근 승률</b> : ${Number(trend.recent_win_rate ?? 0).toFixed(1)}%</div>
            <div class="row"><b>K/D</b> : ${Number(trend.recent_kill_death_rate ?? 0).toFixed(1)}%</div>

            <br>

            <button type="button" class="btn" id="goMatchesBtn">전적 보기</button>
        `;

        const goMatchesBtn = document.getElementById("goMatchesBtn");
        goMatchesBtn.addEventListener("click", function () {
            sessionStorage.setItem("playerOuid", data.ouid);
            sessionStorage.setItem("playerNickname", basic.user_name);
            location.href = "/page/matches.html";
        });

        card.style.display = "block";

    } catch (e) {
        loadingMsg.style.display = "none";
        errorMsg.innerText = "서버 오류";
        console.error(e);
    }
}