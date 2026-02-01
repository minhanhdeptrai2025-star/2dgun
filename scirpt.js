// ===== CANVAS =====
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

// ===== GAME STATE =====
let gameRunning = false;
let currentLevel = 1;
let money = 0;

// ===== SPEED =====
const PLAYER_BULLET_SPEED = 10;
const ENEMY_BULLET_SPEED = PLAYER_BULLET_SPEED / 2;

// ===== PLAYER =====
const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  r: 15,
  speed: 4,
  angle: 0,
  hp: 10,
  maxAmmo: 10,
  ammo: 10,
  reloading: false
};

// ===== DATA =====
let bullets = [];
let enemyBullets = [];
let enemies = [];

// ===== INPUT =====
const keys = {};
addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ===== MOUSE AIM =====
canvas.addEventListener("mousemove", e => {
  const r = canvas.getBoundingClientRect();
  const mx = e.clientX - r.left;
  const my = e.clientY - r.top;
  player.angle = Math.atan2(my - player.y, mx - player.x);
});

// ===== SHOOT =====
canvas.addEventListener("mousedown", e => {
  if (e.button === 0) shootPlayer();
});

function shootPlayer() {
  if (player.ammo <= 0 || player.reloading) return;

  bullets.push({
    x: player.x,
    y: player.y,
    vx: Math.cos(player.angle) * PLAYER_BULLET_SPEED,
    vy: Math.sin(player.angle) * PLAYER_BULLET_SPEED
  });

  player.ammo--;
}

// ===== AUTO RELOAD =====
function reload() {
  if (player.reloading) return;
  player.reloading = true;

  setTimeout(() => {
    player.ammo = player.maxAmmo;
    player.reloading = false;
  }, 500);
}

// ===== MOVE PLAYER =====
function movePlayer() {
  if (keys["w"]) player.y -= player.speed;
  if (keys["s"]) player.y += player.speed;
  if (keys["a"]) player.x -= player.speed;
  if (keys["d"]) player.x += player.speed;
}

// ===== SPAWN ENEMY =====
function spawnEnemies(n) {
  for (let i = 0; i < n; i++) {
    enemies.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 15,
      hp: 4
    });
  }
}

// ===== ENEMY AIMBOT =====
setInterval(() => {
  if (!gameRunning) return;

  enemies.forEach(e => {
    const angle = Math.atan2(player.y - e.y, player.x - e.x);
    enemyBullets.push({
      x: e.x,
      y: e.y,
      vx: Math.cos(angle) * ENEMY_BULLET_SPEED,
      vy: Math.sin(angle) * ENEMY_BULLET_SPEED
    });
  });
}, 5000);

// ===== RESET GAME =====
function resetGame() {
  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  player.hp = 10;
  player.ammo = player.maxAmmo;

  bullets = [];
  enemyBullets = [];
  enemies = [];

  spawnEnemies(currentLevel * 3);
}

// ===== MENU =====
function startGame() {
  document.getElementById("menu").style.display = "none";
  canvas.style.display = "block";
  gameRunning = true;
  resetGame();
  gameLoop();
}

function startLevel(lv) {
  currentLevel = lv;
  startGame();
}

function openShop() {
  alert("SHOP\nRPG (100$)\nShotgun (60$)\nSMG (40$)");
}

// ===== WIN =====
function winLevel() {
  gameRunning = false;
  money += currentLevel * 50;

  alert("WIN LEVEL " + currentLevel + "\n+" + (currentLevel * 50) + "$");
  document.getElementById("menu").style.display = "flex";
  canvas.style.display = "none";
}

// ===== GAME LOOP =====
function gameLoop() {
  if (!gameRunning) return;
  requestAnimationFrame(gameLoop);

  ctx.fillStyle = "#deb887";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  movePlayer();
  if (player.ammo <= 0) reload();

  // PLAYER
  ctx.fillStyle = "#8b5a2b";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fill();

  // BULLETS
  ctx.fillStyle = "#e6c28b";
  bullets.forEach((b, i) => {
    b.x += b.vx;
    b.y += b.vy;
    ctx.fillRect(b.x, b.y, 4, 4);
  });

  // ENEMY BULLETS
  ctx.fillStyle = "#5a3a1a";
  enemyBullets.forEach(b => {
    b.x += b.vx;
    b.y += b.vy;
    ctx.fillRect(b.x, b.y, 4, 4);
  });

  // ENEMIES
  ctx.fillStyle = "#a47148";
  enemies.forEach((e, ei) => {
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
    ctx.fill();

    bullets.forEach((b, bi) => {
      const d = Math.hypot(b.x - e.x, b.y - e.y);
      if (d < e.r) {
        e.hp--;
        bullets.splice(bi, 1);
        if (e.hp <= 0) enemies.splice(ei, 1);
      }
    });
  });

  // UI
  ctx.fillStyle = "#4b2e14";
  ctx.font = "18px Arial";
  ctx.fillText("HP: " + player.hp, 20, 30);
  ctx.fillText("Ammo: " + player.ammo, 20, 55);
  ctx.fillText("Money: $" + money, 20, 80);

  if (enemies.length === 0) winLevel();
}
