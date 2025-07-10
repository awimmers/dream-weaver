
const intro = document.getElementById("introScreen");
const canvas = document.getElementById("gameCanvas");
const music = document.getElementById("bgMusic");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

let stars = [];
for (let i = 0; i < 100; i++) {
  stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 2, speed: Math.random() });
}

let player = { x: 400, y: 300, radius: 15 };
let mousePos = { x: player.x, y: player.y };

let showRiddle = true;
let portalVisible = false;
let portalUsed = false;

let inStillwater = false;
let inEchoGarden = false;
let gardenPortal = { x: 150, y: 150, radius: 40 };
let gardenPortalVisible = false;

let memoryMessage = "";
let memoryTimer = 0;

let npcMessage = "";
let npcTimer = 0;
let npcActive = false;
let npcAnswered = false;

let memories = {
  stillwater: { x: 500, y: 350, found: false, text: "The scent of rain on stone..." },
  garden: { x: 250, y: 200, found: false, text: "A song you once knew, hummed by no one..." }
};

let answers = [
  { text: "A Star", x: 200, y: 450, correct: true },
  { text: "A Thought", x: 300, y: 450, correct: false },
  { text: "A Tear", x: 400, y: 450, correct: false },
  { text: "A Shadow", x: 500, y: 450, correct: false }
];

let npc = { x: 400, y: 300, radius: 20, visited: false };

let npcChoices = [
  { text: "An Echo", x: 250, y: 300, correct: false },
  { text: "Silence", x: 350, y: 300, correct: true },
  { text: "A Secret", x: 450, y: 300, correct: false }
];

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawStars() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  stars.forEach(star => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
    star.y += star.speed;
    if (star.y > canvas.height) star.y = 0;
  });
}

function drawMemory(memory) {
  if (memory.found) return;
  ctx.beginPath();
  ctx.arc(memory.x, memory.y, 10, 0, Math.PI * 2);
  ctx.fillStyle = "aqua";
  ctx.fill();

  const dx = player.x - memory.x;
  const dy = player.y - memory.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < player.radius + 10) {
    memory.found = true;
    memoryMessage = memory.text;
    memoryTimer = 180;
  }
}

function drawNPC() {
  if (npc.visited) return;
  ctx.beginPath();
  ctx.arc(npc.x, npc.y, npc.radius, 0, Math.PI * 2);
  ctx.fillStyle = "orchid";
  ctx.fill();

  const dx = player.x - npc.x;
  const dy = player.y - npc.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < player.radius + npc.radius) {
    npc.visited = true;
    npcMessage = "I am the Echo Keeper. Solve me this: 'I vanish the moment you speak my name. What am I?'";
    npcTimer = 300;
  }
}

function drawNPCChoices() {
  if (npcAnswered) return;
  npcChoices.forEach(choice => {
    const boxWidth = 100;
    const boxHeight = 40;
    const boxX = choice.x - boxWidth / 2;
    const boxY = choice.y - boxHeight / 2;
    drawRoundedRect(ctx, boxX, boxY, boxWidth, boxHeight, 10);
    ctx.shadowColor = "lightblue";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "black";
    ctx.font = "16px serif";
    ctx.fillText(choice.text, choice.x - ctx.measureText(choice.text).width / 2, choice.y + 5);
  });
}

function drawGame() {
  if (inEchoGarden) {
    ctx.fillStyle = "#013220";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "plum";
    ctx.font = "24px serif";
    ctx.fillText("🌸 Echo Garden 🌸", 300, 200);
    ctx.fillStyle = "lavender";
    ctx.font = "18px serif";
    ctx.fillText("The flowers remember you...", 290, 250);
    drawMemory(memories.garden);
    drawNPC();
    drawNPCChoices();
  } else if (inStillwater) {
    ctx.fillStyle = "#001f3f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "lightcyan";
    ctx.font = "22px serif";
    ctx.fillText("✨ You have entered the Stillwater Dream ✨", 180, 200);
    ctx.fillText("A soft whisper welcomes you forward...", 220, 240);
    drawMemory(memories.stillwater);
    if (!gardenPortalVisible) gardenPortalVisible = true;
    if (gardenPortalVisible) {
      ctx.beginPath();
      ctx.arc(gardenPortal.x, gardenPortal.y, gardenPortal.radius, 0, Math.PI * 2);
      ctx.strokeStyle = "lightgreen";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = "white";
      ctx.fillText("To Echo Garden", gardenPortal.x - 55, gardenPortal.y - 50);
      let dx = player.x - gardenPortal.x;
      let dy = player.y - gardenPortal.y;
      if (Math.sqrt(dx * dx + dy * dy) < player.radius + gardenPortal.radius) {
        inEchoGarden = true;
      }
    }
  } else {
    drawStars();
    ctx.fillStyle = "white";
    ctx.font = "18px serif";
    if (showRiddle) {
      ctx.fillText("What shines in silence, drifts alone, and never truly sets?", 50, 50);
      answers.forEach(a => {
        const boxWidth = 100;
        const boxHeight = 40;
        const boxX = a.x - boxWidth / 2;
        const boxY = a.y - boxHeight / 2;
        drawRoundedRect(ctx, boxX, boxY, boxWidth, boxHeight, 10);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.font = "16px serif";
        ctx.fillText(a.text, a.x - ctx.measureText(a.text).width / 2, a.y + 5);
      });
    }
    if (portalVisible && !portalUsed) {
      ctx.beginPath();
      ctx.arc(600, 150, 40, 0, Math.PI * 2);
      ctx.strokeStyle = "violet";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = "white";
      ctx.fillText("Enter the Portal", 545, 100);
      let dx = player.x - 600;
      let dy = player.y - 150;
      if (Math.sqrt(dx * dx + dy * dy) < player.radius + 40) {
        portalUsed = true;
        inStillwater = true;
      }
    }
  }

  const dx = mousePos.x - player.x;
  const dy = mousePos.y - player.y;
  if (Math.sqrt(dx * dx + dy * dy) > 1) {
    player.x += dx * 0.05;
    player.y += dy * 0.05;
  }

  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = "gold";
  ctx.fill();

  if (memoryTimer > 0) {
    ctx.fillStyle = "white";
    ctx.font = "20px serif";
    ctx.fillText(memoryMessage, canvas.width / 2 - 120, 550);
    memoryTimer--;
  }

  if (npcMessage) {
    ctx.fillStyle = "white";
    ctx.font = "18px serif";
    ctx.fillText(npcMessage, 80, 520);
    npcTimer--;
  }
}

canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  mousePos.x = e.clientX - rect.left;
  mousePos.y = e.clientY - rect.top;
});

canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  if (showRiddle) {
    answers.forEach(a => {
      const w = 100, h = 40;
      if (mx > a.x - w/2 && mx < a.x + w/2 && my > a.y - h/2 && my < a.y + h/2) {
        if (a.correct) {
          showRiddle = false;
          setTimeout(() => {
            portalVisible = true;
          }, 300);
          alert("Correct. A portal appears.");
        } else {
          alert("That is not the answer.");
        }
      }
    });
  }

  if (!npcAnswered) {
    npcChoices.forEach(choice => {
      const w = 100, h = 40;
      if (mx > choice.x - w/2 && mx < choice.x + w/2 && my > choice.y - h/2 && my < choice.y + h/2) {
        if (choice.correct) {
          npcMessage = "You are wise. The garden hums in agreement...";
          npcTimer = 300;
          npcAnswered = true;
        } else {
          npcMessage = "Not quite. Try to listen more closely...";
          npcTimer = 180;
        }
      }
    });
  }
});

intro.addEventListener("click", () => {
  intro.style.display = "none";
  document.getElementById("goalMessage").style.display = "flex";
});
document.getElementById("goalMessage").addEventListener("click", () => {
  document.getElementById("goalMessage").style.display = "none";
  canvas.style.display = "block";
  music.volume = 0.5;
  music.play().catch(() => {});
  loop();
});

function loop() {
  drawGame();
  requestAnimationFrame(loop);
}
