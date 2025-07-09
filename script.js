
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
}
