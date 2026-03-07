const CAMERAS = ["cam01", "cam10"];
const THRESHOLD_MED = 10;
const THRESHOLD_HIGH = 20;

const grid = document.getElementById("grid");

async function loadData() {
  grid.innerHTML = "";

  for (const cam of CAMERAS) {
    const res = await fetch(`/api/camera/${cam}/latest`);
    const data = await res.json();

    if (!data) continue;

    const [camera, count, time] = data;

    let level = "low";
    if (count >= THRESHOLD_HIGH) level = "high";
    else if (count >= THRESHOLD_MED) level = "medium";

    const card = document.createElement("div");
    card.className = `card ${level}`;

    card.innerHTML = `
      <h2>${camera}</h2>
      <div class="count">${count}</div>
      <div class="time">${time}</div>
    `;

    grid.appendChild(card);
  }
}
// โหลดครั้งแรก
loadData();
// รีเฟรชทุก 5 วินาที
setInterval(loadData, 5000);
