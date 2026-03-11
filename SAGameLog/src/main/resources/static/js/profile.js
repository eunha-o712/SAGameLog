async function searchProfile(){

const nickname = document.getElementById("nicknameInput").value;

if(!nickname){

alert("닉네임 입력");

return;

}

const loadingMsg = document.getElementById("loadingMsg");
const errorMsg = document.getElementById("errorMsg");
const card = document.getElementById("profileCard");
const content = document.getElementById("profileContent");

loadingMsg.style.display="block";
errorMsg.innerText="";
card.style.display="none";

try{

const res = await fetch(`/api/sa/profile?nickname=${encodeURIComponent(nickname)}`);

const data = await res.json();

loadingMsg.style.display="none";

if(data.error){

errorMsg.innerText=data.error;

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

<div class="row"><b>최근 승률</b> : ${trend.recent_win_rate.toFixed(1)}%</div>
<div class="row"><b>K/D</b> : ${trend.recent_kill_death_rate.toFixed(1)}%</div>

<br>

<a href="/page/matches.html?ouid=${data.ouid}" class="btn">전적 보기</a>

`;

card.style.display="block";

}catch(e){

loadingMsg.style.display="none";

errorMsg.innerText="서버 오류";

}

}