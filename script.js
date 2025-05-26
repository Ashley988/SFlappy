// ==== SPIEL-KONSTANTEN ====
const GAME_WIDTH = 320;
const GAME_HEIGHT = 480;
const BIRD_SIZE = 50;
const BIRD_X = 40;
const INITIAL_GAP = 210;            // Start-Lücke
const MIN_GAP = 90;                 // Engste Lücke
const GAP_PER_POINT = 2.5;          // Pro Punkt verringert sich die Lücke um 2.5px
const PIPE_WIDTH = 58;
const PIPE_SPEED = 1.9;             // Rohr-Geschwindigkeit
const SPRUNGKRAFT = -6.2;           // Sprungkraft (fein)
const MAX_LIVES = 3;

// ==== CANVAS ====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let loopId = null;

// ==== BILDER ====
const birdImg = new Image();
birdImg.src = 'Images/Birdhead.png';

// ==== Deko-Arrays ====
const clouds = [];
const flowers = [];
const heartPath = "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 1.01 4.5 2.09C13.09 4.01 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z";

// ==== SPIELVARIABLEN ====
let birdY, birdVelocity, pipes, score, highscore, gap, lives, gameOver, started, frameCount, isBlinking;

// ==== INIT-FUNKTION ====
function initGame() {
  birdY = GAME_HEIGHT / 2 - BIRD_SIZE / 2;
  birdVelocity = 0;
  pipes = [];
  score = 0;
  gap = INITIAL_GAP;
  lives = MAX_LIVES;
  gameOver = false;
  started = false;
  frameCount = 0;
  isBlinking = false;
  document.getElementById('score').textContent = score;
  drawLives();
  clouds.length = 0;
  flowers.length = 0;
  spawnPipe();
  showJumpBtn(true);
  showNewGameBtn(false);
}

// ==== HIGHSCORE ====
if (localStorage.getItem('bird_highscore')) {
  highscore = Number(localStorage.getItem('bird_highscore'));
  document.getElementById('highscore').textContent = highscore;
} else {
  highscore = 0;
}

// ==== BUTTONS & EVENTS ====
const jumpBtn = document.getElementById('jumpBtn');
const newGameBtn = document.getElementById('newGameBtn');

jumpBtn.addEventListener('touchstart', function(e) {
  e.preventDefault();
  jump();
});
jumpBtn.addEventListener('mousedown', jump);

newGameBtn.addEventListener('click', function() {
  cancelAnimationFrame(loopId);
  initGame();
  loopId = requestAnimationFrame(gameLoop);
});

function showJumpBtn(show) {
  jumpBtn.style.display = show ? 'inline-block' : 'none';
}
function showNewGameBtn(show) {
  newGameBtn.style.display = show ? 'inline-block' : 'none';
}

// ==== SPRINGEN / RESET ====
function jump() {
  if (!started && !gameOver) {
    started = true;
  }
  if (!gameOver) {
    birdVelocity = SPRUNGKRAFT;
  } else {
    cancelAnimationFrame(loopId);
    initGame();
    loopId = requestAnimationFrame(gameLoop);
  }
}

// ==== DEKORATION ====
function spawnCloud() {
  clouds.push({
    x: GAME_WIDTH + Math.random() * 40,
    y: Math.random() * 120,
    size: 35 + Math.random() * 25,
    speed: 0.6 + Math.random() * 0.4,
    opacity: 0.62 + Math.random() * 0.33
  });
}
function spawnFlower() {
  flowers.push({
    x: GAME_WIDTH + Math.random() * 50,
    y: GAME_HEIGHT - 24 - Math.random() * 12,
    size: 14 + Math.random() * 10,
    speed: 1 + Math.random(),
    color: `hsl(${Math.random()*360},85%,65%)`
  });
}
function drawCloud(c) {
  ctx.save();
  ctx.globalAlpha = c.opacity;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(c.x, c.y, c.size, c.size * 0.6, 0, 0, 2 * Math.PI);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}
function drawFlower(f) {
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(Math.sin(frameCount / 25 + f.x / 44) * 0.3);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    ctx.rotate(Math.PI / 2.5);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -f.size);
  }
  ctx.strokeStyle = f.color;
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, f.size / 3.5, 0, 2 * Math.PI);
  ctx.fillStyle = "#ff0";
  ctx.fill();
  ctx.restore();
}

// ==== LEBEN ====
function drawLives() {
  const livesDiv = document.getElementById('lives');
  livesDiv.innerHTML = '';
  for (let i = 0; i < lives; i++) {
    livesDiv.innerHTML += `<svg width="26" height="24" viewBox="0 0 24 24"><path d="${heartPath}" fill="#ff2777" stroke="#fff" stroke-width="2"/></svg>`;
  }
}

// ==== ROHR-GENERIERUNG ====
function spawnPipe() {
  const topHeight = Math.floor(Math.random() * (GAME_HEIGHT - gap - 110)) + 35;
  pipes.push({
    x: GAME_WIDTH,
    top: topHeight,
    bottom: GAME_HEIGHT - topHeight - gap,
    scored: false
  });
}

// ==== MARIO-ROHRZEICHNUNG ====
function drawPipe(x, top, bottom) {
  drawMarioPipe(x, 0, PIPE_WIDTH, top, true);
  drawMarioPipe(x, GAME_HEIGHT - bottom, PIPE_WIDTH, bottom, false);
}
function drawMarioPipe(x, y, width, height, isTop) {
  ctx.save();
  ctx.fillStyle = "#22b43b";
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = "#32e368";
  ctx.fillRect(x + 6, y + (isTop ? 6 : height - 22), width - 12, 16);
  ctx.beginPath();
  if (isTop) {
    ctx.ellipse(x + width / 2, y + height, width * 0.65, 12, 0, Math.PI, 2 * Math.PI);
  } else {
    ctx.ellipse(x + width / 2, y, width * 0.65, 12, 0, 0, Math.PI);
  }
  ctx.fillStyle = "#19862c";
  ctx.fill();
  ctx.restore();
}

// ==== KOPF UND FLÜGEL (ohne Maske, ohne Kreis, ohne Viereck) ====
function drawBirdWithWings(x, y) {
  // Flügel hinter dem Kopf, KEINE Maske!
  let flap = Math.sin(frameCount * 0.26) * 13;
  ctx.save();
  ctx.globalAlpha = 0.93;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  // Linker Flügel
  ctx.beginPath();
  ctx.moveTo(x + 6, y + 26);
  ctx.lineTo(x - 24, y + 22 + flap);
  ctx.stroke();
  // Rechter Flügel
  ctx.beginPath();
  ctx.moveTo(x + BIRD_SIZE - 6, y + 26);
  ctx.lineTo(x + BIRD_SIZE + 24, y + 22 + flap);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();

  // Nur den Kopf, wie er ist – KEIN Kreis, KEIN Viereck!
  ctx.drawImage(birdImg, x, y, BIRD_SIZE, BIRD_SIZE);
}

// ==== GAME LOOP ====
function gameLoop() {
  loopId = requestAnimationFrame(gameLoop);

  // Himmel-Hintergrund
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.fillStyle = "#7ecfff";
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Wolken
  if (frameCount % 46 === 0) spawnCloud();
  clouds.forEach(c => { drawCloud(c); c.x -= c.speed; });
  while (clouds.length && clouds[0].x + clouds[0].size < 0) clouds.shift();

  // Blumen
  if (frameCount % 33 === 0) spawnFlower();
  flowers.forEach(f => { drawFlower(f); f.x -= f.speed; });
  while (flowers.length && flowers[0].x + flowers[0].size < 0) flowers.shift();

  // Weißer Rahmen
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Rohre
  for (let i = pipes.length - 1; i >= 0; i--) {
    let p = pipes[i];
    drawPipe(p.x, p.top, p.bottom);
    p.x -= PIPE_SPEED;
    if (!p.scored && p.x + PIPE_WIDTH < BIRD_X) {
      score++;
      document.getElementById('score').textContent = score;
      if (score > highscore) {
        highscore = score;
        document.getElementById('highscore').textContent = highscore;
        localStorage.setItem('bird_highscore', highscore);
      }
      p.scored = true;

      // Gap wird mit jedem Punkt etwas kleiner:
      let newGap = INITIAL_GAP - score * GAP_PER_POINT;
      gap = Math.max(MIN_GAP, newGap);
    }
    if (p.x + PIPE_WIDTH < 0) pipes.splice(i, 1);
  }
  if (started && !gameOver && frameCount % 88 === 0) {
    spawnPipe();
  }

  // Bird Bewegung
  if (started && !gameOver && !isBlinking) {
    birdVelocity += 0.34;
    birdY += birdVelocity;
  }

  // Bird mit Flügeln, nur Bild
  if (birdImg.complete && birdImg.naturalHeight > 0) {
    drawBirdWithWings(BIRD_X, birdY);
  } else {
    // Platzhalter, falls Bild nicht da
    ctx.fillStyle = "#fff";
    ctx.fillRect(BIRD_X, birdY, BIRD_SIZE, BIRD_SIZE);
  }

  // Kollision prüfen
  let hit = false;
  if (started && !gameOver && !isBlinking) {
    if (birdY > GAME_HEIGHT - BIRD_SIZE || birdY < 0) hit = true;
    for (let p of pipes) {
      if (
        BIRD_X + BIRD_SIZE > p.x && BIRD_X < p.x + PIPE_WIDTH &&
        (birdY < p.top || birdY + BIRD_SIZE > GAME_HEIGHT - p.bottom)
      ) hit = true;
    }
  }

  // Leben abziehen & Blinken
  if (hit && !gameOver && !isBlinking) {
    lives--;
    drawLives();
    if (lives <= 0) {
      gameOver = true;
      showJumpBtn(true);
      showNewGameBtn(true);
    } else {
      isBlinking = true;
      let blink = 10;
      function blinkBird() {
        if (blink % 2 === 0) {
          ctx.save();
          ctx.globalAlpha = 0.14;
          ctx.fillStyle = "#fff";
          ctx.fillRect(0,0,GAME_WIDTH,GAME_HEIGHT);
          ctx.restore();
        }
        blink--;
        if (blink > 0) setTimeout(blinkBird, 65);
        else {
          birdY = GAME_HEIGHT / 2 - BIRD_SIZE / 2;
          birdVelocity = 0;
          isBlinking = false;
        }
      }
      blinkBird();
      return;
    }
  }

  // Game Over Anzeige
  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, GAME_HEIGHT / 2 - 60, GAME_WIDTH, 120);
    ctx.font = "bold 27px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10);
    ctx.font = "17px Arial";
    ctx.fillText("Tippe auf Springen oder Neues Spiel!", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 23);
    showJumpBtn(true);
    showNewGameBtn(true);
  } else {
    showNewGameBtn(false);
  }

  frameCount++;
}

// ==== SPIEL START ====
initGame();
loopId = requestAnimationFrame(gameLoop);
