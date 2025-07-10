
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
let inEmberHollows = false;

let gardenPortal = { x: 150, y: 150, radius: 40 };
let emberPortal = { x: 100, y: 100, radius: 40 };
let gardenPortalVisible = false;
let emberPortalVisible = false;

let memoryMessage = "";
let memoryTimer = 0;

let npcMessage = "";
let npcTimer = 0;
let npcActive = false;

let npcAnswered = false;

let memories = {
  stillwater: { x: 500, y: 350, found: false, text: "The scent of rain on stone..." },
  garden: { x: 250, y: 200, found: false, text: "A song you once knew, hummed by no one..." },
  ember: { x: 300, y: 300, found: false, text: "The warmth of a forgotten fire..." }
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

let emberChoices = [
  { text: "Time", x: 200, y: 450, correct: true },
  { text: "Wind", x: 300, y: 450, correct: false },
  { text: "Wood", x: 400, y: 450, correct: false },
  { text: "Shadow", x: 500, y: 450, correct: false }
];

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

function drawGame() {
  if (inEmberHollows) {
    ctx.fillStyle = "#330000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "orange";
    ctx.font = "24px serif";
    ctx.fillText("🔥 Ember Hollows 🔥", 300, 200);
    ctx.fillStyle = "salmon";
    ctx.font = "18px serif";
    ctx.fillText("The heat remembers what you tried to forget...", 220, 250);
    drawMemory(memories.ember);
    emberChoices.forEach(choice => {
      ctx.beginPath();
      ctx.roundRect(choice.x - 60, choice.y - 25, 120, 40, 10);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.fillStyle = "black";
      ctx.fillText(choice.text, choice.x - 20, choice.y);
    });
  } else if (inEchoGarden) {
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

    if (!emberPortalVisible) emberPortalVisible = true;
    if (emberPortalVisible) {
      ctx.beginPath();
      ctx.arc(emberPortal.x, emberPortal.y, emberPortal.radius, 0, Math.PI * 2);
      ctx.strokeStyle = "orange";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = "white";
      ctx.fillText("To Ember Hollows", emberPortal.x - 60, emberPortal.y - 50);
      let dx = player.x - emberPortal.x;
      let dy = player.y - emberPortal.y;
      if (Math.sqrt(dx * dx + dy * dy) < player.radius + emberPortal.radius) {
        inEmberHollows = true;
      }
    }

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
        ctx.beginPath();
        ctx.arc(a.x, a.y, 25, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.fillText(a.text, a.x - 20, a.y + 5);
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

CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
  this.beginPath();
  this.moveTo(x + radius, y);
  this.lineTo(x + width - radius, y);
  this.quadraticCurveTo(x + width, y, x + width, y + radius);
  this.lineTo(x + width, y + height - radius);
  this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  this.lineTo(x + radius, y + height);
  this.quadraticCurveTo(x, y + height, x, y + height - radius);
  this.lineTo(x, y + radius);
  this.quadraticCurveTo(x, y, x + radius, y);
  this.closePath();
};

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
      if (Math.sqrt((mx - a.x) ** 2 + (my - a.y) ** 2) < 25) {
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

  if (inEmberHollows) {
    emberChoices.forEach(choice => {
      if (mx > choice.x - 60 && mx < choice.x + 60 && my > choice.y - 25 && my < choice.y + 15) {
        if (choice.correct) {
          alert("🔥 Correct. The embers glow brighter...");
        } else {
          alert("That answer fades into the ash...");
        }
      }
    });
  }

  if (!npcAnswered && inEchoGarden) {
    npcChoices.forEach(choice => {
      if (Math.sqrt((mx - choice.x) ** 2 + (my - choice.y) ** 2) < 30) {
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

function loop() {
  drawGame();
  requestAnimationFrame(loop);
}

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
