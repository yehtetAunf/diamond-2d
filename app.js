const times = [
  ["5:00 PM","#1477dc"],["6:00 PM","#e0a400"],["7:00 PM","#0caa65"],
  ["8:00 PM","#7227d6"],["9:00 PM","#e52b32"],["10:00 PM","#1477dc"]
];
const slots = document.getElementById("slots");
slots.innerHTML = times.map(([time,color]) => `
  <article class="slot" style="--c:${color}">
    <h3>${time}</h3>
    <div class="slot-body">
      <div class="gem">◆</div>
      <div class="num">--</div>
      <button class="buy" onclick="alert('Diamond Buy: ${time}')">🛒 DIAMOND<br>BUY</button>
    </div>
  </article>`).join("");

const history = document.getElementById("history");
function toggleHistory(){history.classList.toggle("hidden")}
document.getElementById("historyBtn").addEventListener("click",toggleHistory);
document.getElementById("navHistory").addEventListener("click",toggleHistory);
