// ==== EINSTELLUNGEN UND STATE ====
let currentTheme = "spring";
let currentBird = "Birdhead.png";
let birdImg = new Image();
birdImg.src = currentBird;

// ==== SPIEL-KONSTANTEN ====
const GAME_WIDTH = 320;
const GAME_HEIGHT = 480;
const BIRD_SIZE = 50;
const BIRD_X = 40;
const INITIAL_GAP = 210;
const MIN_GAP = 90;
const GAP_PER_POINT = 2.5;
const PIPE_WIDTH = 58;
const PIPE_SPEED = 1.9;
const SPRUNGKRAFT = -6.2;
const MAX_LIVES = 3;

// ==== CANVAS ====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let loopId = null;

// ==== DEKO-OBJEKTE ====
const clouds = [];
const flowers = [];
const stars = [];
const snowflakes = [];
const flames = [];
const leaves = [];
const heartPath = "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 1.01 4.5 2.09C13.09 4.01 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z";

// Sahara-Deko
const dunes = [
  {x: 30, w: 120, h: 20, c: "#e5bb63"},
  {x: 130, w: 110, h: 24, c: "#e9d387"},
  {x: 200, w: 60, h: 12, c: "#d8a23c"},
];
const pyramids = [
  {x: 70, y: 340, s: 56, c: "#d9bc67"},
  {x: 180, y: 370, s: 38, c: "#cfa04a"}
];

// ==== SPIELVARIABLEN ====
let birdY, birdVelocity, pipes, score, highscore, gap, lives, gameOver, started, frameCount, isBlinking;

// ==== SETUP OVERLAY ====
const setupOverlay = document.getElementById('setupOverlay');
const startBtn = document.getElementById('startBtn');
const themeRadios = document.querySelectorAll('input[name="theme"]');
const headRadios = document.querySelectorAll('input[name="birdhead"]');

// Theme-Auswahl-Karten: Visuelles Feedback auf Auswahl
document.querySelectorAll('.theme-card').forEach(card => {
  card.addEventListener('click', function() {
    setTimeout(() => {
      document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
      if (card.querySelector('input[type="radio"]').checked) card.classList.add('active');
    }, 30);
  });
});
// Aktivierungs-Status beim Laden setzen
window.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.theme-card input[type="radio"]:checked').parentElement.classList.add('active');
});

// Startknopf
startBtn.addEventListener('click', () => {
  themeRadios.forEach(radio => { if (radio.checked) currentTheme = radio.value; });
  headRadios.forEach(radio => { if (radio.checked) currentBird = radio.value; });
  birdImg.src = currentBird;
  setupOverlay.style.display = "none";
  initGame();
  loopId = requestAnimationFrame(gameLoop);
});

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

// ==== SPIEL-RESET ====
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
  stars.length = 0;
  snowflakes.length = 0;
  flames.length = 0;
  leaves.length = 0;
  spawnPipe();
  showJumpBtn(true);
  showNewGameBtn(false);
}

// ==== SPRINGEN ====
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

// ==== DEKO-FUNKTIONEN ====
// Frühling
function spawnCloud() {
  clouds.push({
    x: GAME_WIDTH + Math.random() * 40,
    y: Math.random() * 120,
    size: 35 + Math.random() * 25,
    speed: 0.6 + Math.random() * 0.4,
    opacity: 0.62 + Math.random() * 0.33
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
function spawnFlower() {
  flowers.push({
    x: GAME_WIDTH + Math.random() * 50,
    y: GAME_HEIGHT - 24 - Math.random() * 12,
    size: 14 + Math.random() * 10,
    speed: 1 + Math.random(),
    color: `hsl(${Math.random()*360},85%,65%)`
  });
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

// Galaxy
function spawnStar() {
  let isShooting = Math.random() < 0.11;
  stars.push({
    x: GAME_WIDTH + (isShooting ? Math.random()*60 : 0),
    y: Math.random() * (GAME_HEIGHT - 100),
    radius: isShooting ? 2 : 1 + Math.random() * 2,
    speed: isShooting ? 4.5 + Math.random()*3 : 0.8 + Math.random() * 1.2,
    color: isShooting ? "#fffbe3" : (Math.random()<0.5 ? "#fff" : "#ffe47a"),
    shooting: isShooting,
    tail: isShooting ? 32 + Math.random()*18 : 0
  });
}
function drawStar(s) {
  ctx.save();
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.arc(s.x, s.y, s.radius, 0, 2 * Math.PI);
  ctx.fillStyle = s.color;
  ctx.shadowBlur = 9;
  ctx.shadowColor = s.color;
  ctx.fill();
  ctx.shadowBlur = 0;
  if (s.shooting) {
    ctx.globalAlpha = 0.46;
    ctx.strokeStyle = "#ffe";
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - s.tail, s.y + s.tail * 0.17);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

// Winter
function spawnSnowflake() {
  snowflakes.push({
    x: Math.random() * GAME_WIDTH,
    y: -8,
    radius: 2.2 + Math.random() * 2.7,
    speedY: 1.2 + Math.random() * 1.3,
    speedX: Math.random() * 1.1 - 0.5
  });
}
function drawSnowflake(s) {
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(s.x, s.y, s.radius, 0, 2 * Math.PI);
  ctx.fillStyle = "#fff";
  ctx.shadowBlur = 8;
  ctx.shadowColor = "#fff";
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

// Feuer (Flammen)
function spawnFlame() {
  flames.push({
    x: Math.random() * GAME_WIDTH,
    y: GAME_HEIGHT - 30,
    height: 24 + Math.random() * 30,
    speed: 1.7 + Math.random(),
    opacity: 0.35 + Math.random() * 0.4
  });
}
function drawFlame(f) {
  ctx.save();
  ctx.globalAlpha = f.opacity;
  let grd = ctx.createLinearGradient(f.x, f.y, f.x, f.y - f.height);
  grd.addColorStop(0, "#ffd200");
  grd.addColorStop(0.4, "#ff9300");
  grd.addColorStop(0.7, "#ff4b1f");
  grd.addColorStop(1, "#3d0900");
  ctx.beginPath();
  ctx.ellipse(f.x, f.y, 16, f.height, 0, 0, 2 * Math.PI);
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

// Herbst (Blätter)
function spawnLeaf() {
  leaves.push({
    x: Math.random() * GAME_WIDTH,
    y: -12,
    speedY: 1.1 + Math.random() * 1.5,
    speedX: Math.random() * 1.2 - 0.6,
    size: 14 + Math.random() * 8,
    color: ["#ff9900", "#e58c35", "#f8c65f", "#ad5800", "#fd8d36"][Math.floor(Math.random()*5)],
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.09
  });
}
function drawLeaf(l) {
  ctx.save();
  ctx.translate(l.x, l.y);
  ctx.rotate(l.angle);
  ctx.beginPath();
  ctx.ellipse(0, 0, l.size*0.42, l.size*0.24, 0, 0, 2*Math.PI);
  ctx.fillStyle = l.color;
  ctx.shadowBlur = 4;
  ctx.shadowColor = "#b33";
  ctx.fill();
  ctx.restore();
}

// Sahara (Sand, Pyramiden)
function drawSaharaBackground() {
  ctx.fillStyle = "#fef6b0";
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  dunes.forEach(d => {
    ctx.beginPath();
    ctx.moveTo(d.x, GAME_HEIGHT);
    ctx.lineTo(d.x + d.w, GAME_HEIGHT);
    ctx.lineTo(d.x + d.w / 2, GAME_HEIGHT - d.h);
    ctx.closePath();
    ctx.fillStyle = d.c;
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;
  });
  pyramids.forEach(p => {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y + p.s);
    ctx.lineTo(p.x + p.s / 2, p.y);
    ctx.lineTo(p.x + p.s, p.y + p.s);
    ctx.closePath();
    ctx.fillStyle = p.c;
    ctx.strokeStyle = "#bb9833";
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.93;
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
  ctx.fillStyle = "#fff7b7";
  ctx.globalAlpha = 0.76;
  ctx.fillRect(0, GAME_HEIGHT - 45, GAME_WIDTH, 45);
  ctx.globalAlpha = 1;
}

// ==== LEBEN ====
function drawLives() {
  const livesDiv = document.getElementById('lives');
  livesDiv.innerHTML = '';
  for (let i = 0; i < lives; i++) {
    livesDiv.innerHTML += `<svg width="26" height="24" viewBox="0 0 24 24"><path d="${heartPath}" fill="#ff2777" stroke="#fff" stroke-width="2"/></svg>`;
  }
}

// ==== ROHR-GENERIERUNG (Lücke immer mittig & exakt!) ====
function spawnPipe() {
  const playArea = GAME_HEIGHT - gap - 60;
  const offset = (Math.random() - 0.5) * Math.min(playArea * 0.7, 130);
  const holeCenter = GAME_HEIGHT / 2 + offset;
  const topHeight = Math.max(30, holeCenter - gap / 2);
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

// ==== KOPF UND FLÜGEL ====
function drawBirdWithWings(x, y) {
  let flap = Math.sin(frameCount * 0.26) * 13;
  ctx.save();
  ctx.globalAlpha = 0.93;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + 6, y + 26);
  ctx.lineTo(x - 24, y + 22 + flap);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + BIRD_SIZE - 6, y + 26);
  ctx.lineTo(x + BIRD_SIZE + 24, y + 22 + flap);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();
  ctx.drawImage(birdImg, x, y, BIRD_SIZE, BIRD_SIZE);
}

// ==== GAME LOOP ====
function gameLoop() {
  loopId = requestAnimationFrame(gameLoop);

  // ==== HINTERGRUND je nach Theme ====
  if (currentTheme === "spring") {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = "#7ecfff";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    if (frameCount % 46 === 0) spawnCloud();
    clouds.forEach(c => { drawCloud(c); c.x -= c.speed; });
    while (clouds.length && clouds[0].x + clouds[0].size < 0) clouds.shift();
    if (frameCount % 33 === 0) spawnFlower();
    flowers.forEach(f => { drawFlower(f); f.x -= f.speed; });
    while (flowers.length && flowers[0].x + flowers[0].size < 0) flowers.shift();
  } else if (currentTheme === "galaxy") {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = "#0a1846";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    if (frameCount % 12 === 0) spawnStar();
    stars.forEach(s => {
      drawStar(s);
      s.x -= s.speed;
      if (s.shooting) s.y += 0.17 * s.tail;
    });
    while (stars.length && (stars[0].x + stars[0].radius < 0 || stars[0].y > GAME_HEIGHT + 40)) stars.shift();
  } else if (currentTheme === "winter") {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = "#aee5ff";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    if (frameCount % 2 === 0) spawnSnowflake();
    snowflakes.forEach(s => {
      drawSnowflake(s);
      s.x += s.speedX;
      s.y += s.speedY;
    });
    while (snowflakes.length && snowflakes[0].y > GAME_HEIGHT + 10) snowflakes.shift();
  } else if (currentTheme === "fire") {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = "#3d0900";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    if (frameCount % 5 === 0) spawnFlame();
    flames.forEach(f => { drawFlame(f); f.y -= f.speed; });
    while (flames.length && flames[0].y + flames[0].height < 0) flames.shift();
  } else if (currentTheme === "autumn") {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = "#fbe3c3";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    if (frameCount % 6 === 0) spawnLeaf();
    leaves.forEach(l => {
      drawLeaf(l);
      l.x += l.speedX;
      l.y += l.speedY;
      l.angle += l.spin;
    });
    while (leaves.length && leaves[0].y > GAME_HEIGHT + 14) leaves.shift();
  } else if (currentTheme === "sahara") {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    drawSaharaBackground();
  }

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