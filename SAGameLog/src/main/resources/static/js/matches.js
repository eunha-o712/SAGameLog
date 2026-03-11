const params = new URLSearchParams(window.location.search);
const ouid = params.get("ouid");

document.getElementById("ouidText").innerText = ouid ?? "없음";

const matchArea = document.getElementById("matchArea");

if (!ouid) {
    matchArea.innerHTML = `<p class="error">OUID가 없습니다. 프로필 페이지에서 다시 들어와주세요.</p>`;
}