const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// FULLSCREEN
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// PLAYER
const player = {
  x: canvas.width / 2,
  y: canvas.height - 100,
  size: 40,
  speed: 7,
  bulletSpeed: 12
};

// DATA
let bullets = [];
let enemyBullets = [];
let enemies = [];
let score = 0;
let level = 1;

let moveLeft = false;
let moveRight = false;
let mouseX = canvas.width / 2;
let mouseY = 0;

// TOUCH CONTROL (MOBILE)
const leftBtn = document.getElementById("left");
const rightBtn = document.getElementById("right");
const shootBtn = document.getElementById("shoot");

if (leftBtn) {
  leftBtn.ontouchstart = () => moveLeft = true;
  leftBtn.ontouchend   = () => moveLeft = false;
}
if (rightBtn) {
  rightBtn.ontouchstart = () => moveRight = true;
  rightBtn.ontouchend   = () => moveRight = false;
}
if (shootBtn) {
  shootBtn.ontouchstart = shootPlayer;
}

// MOUSE AIM (PC)
canvas.addEventListener("mousemove", e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});
canvas.addEventListener("click", shootPlayer);

// SHOOT PLAYER
function shootPlayer() {
  const dx = mouseX - player.x;
  const dy = mouseY - player.y;
  const len = Math.hypot(dx, dy) || 1;

  bullets.push({
    x: player.x,
    y: player.y,
    vx: (dx / len) * player.bulletSpeed,
    vy: (dy / len) * player.bulletSpeed
  });
}

// SPAWN ENEMY
function spawnEnemy() {
  enemies.push({
    x: Math.random() * (canvas.width - 60) + 30,
    y: -40,
    size: 35,
    speed: 2 + level * 0.3,
    shootCooldown: 0
  });
}

setInterval(() => {
  spawnEnemy();
}, 1000);

// UPDATE
function update() {
  if (moveLeft)  player.x -= player.speed;
  if (moveRight) player.x += player.speed;

  player.x = Math.max(player.size / 2,
    Math.min(canvas.width - player.size / 2, player.x)
  );

  bullets.forEach(b => {
    b.x += b.vx;
    b.y += b.vy;
  });

  enemyBullets.forEach(b => {
    b.y += b.speed;
  });

  enemies.forEach(e => {
    e.y += e.speed;
    e.shootCooldown--;

    if (e.shootCooldown <= 0) {
      enemyBullets.push({
        x: e.x,
        y: e.y,
        speed: player.bulletSpeed * 0.75 // 3/4 speed
      });
      e.shootCooldown = 60;
    }
  });

  // COLLISION PLAYER BULLET -> ENEMY
  enemies.forEach((e, ei) => {
    bullets.forEach((b, bi) => {
      if (
        b.x > e.x - e.size &&
        b.x < e.x + e.size &&
        b.y > e.y &&
        b.y < e.y + e.size
      ) {
        enemies.splice(ei, 1);
        bullets.splice(bi, 1);
        score++;
      }
    });
  });

  // COLLISION ENEMY BULLET -> PLAYER
  enemyBullets.forEach(b => {
    if (
      b.x > player.x - player.size &&
      b.x < player.x + player.size &&
      b.y > player.y &&
      b.y < player.y + player.size
    ) {
      alert("Game Over\nScore: " + score);
      location.reload();
    }
  });

  // LEVEL UP
  if (score > level * 10) {
    level++;
  }
}

// DRAW
function draw() {
  ctx.fillStyle = "#0b0b0b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // PLAYER
  ctx.fillStyle = "#00ffff";
  ctx.fillRect(
    player.x - player.size / 2,
    player.y,
    player.size,
    player.size
  );

  // PLAYER BULLETS
  ctx.fillStyle = "yellow";
  bullets.forEach(b => {
    ctx.fillRect(b.x - 3, b.y - 3, 6, 6);
  });

  // ENEMIES
  ctx.fillStyle = "red";
  enemies.forEach(e => {
    ctx.fillRect(e.x - e.size / 2, e.y, e.size, e.size);
  });

  // ENEMY BULLETS
  ctx.fillStyle = "orange";
  enemyBullets.forEach(b => {
    ctx.fillRect(b.x - 3, b.y, 6, 12);
  });

  // HUD
  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.fillText("Score: " + score, 10, 25);
  ctx.fillText("Level: " + level, 10, 45);
}

// LOOP
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
