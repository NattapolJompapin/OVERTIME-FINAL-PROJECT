const API_URL = "/api/camera/cam07/latest";

async function loadData() {
  const res = await fetch(API_URL);
  const data = await res.json();

  if (!data) {
    document.getElementById("count").innerText = "No data";
    return;
  }

  const [cam, count, time] = data;

  document.getElementById("count").innerText = count + " คน";
  document.getElementById("time").innerText = time;
}

// โหลดครั้งแรก
loadData();

// รีเฟรชทุก 5 วินาที
setInterval(loadData, 5000);
