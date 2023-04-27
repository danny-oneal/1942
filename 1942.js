const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const spriteSheet = new Image();
const SPRITE_SCALE = 2.5;
const PLAYER_SPEED = 7;
let lastBulletFired = Date.now();
let lastEnemySpawned = Date.now();

spriteSheet.src = "./images/1942_sprite_sheet.png";

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Entity {
  constructor(sx, sy, swidth, sheight, position) {
    this.sx = sx;
    this.sy = sy;
    this.swidth = swidth;
    this.sheight = sheight;
    this.position = position;
    this.width = this.swidth * SPRITE_SCALE;
    this.height = this.sheight * SPRITE_SCALE;

    this.velocity = {
      x: 0,
      y: 0
    };
  }

  #draw() {
    ctx.drawImage(
      spriteSheet,
      this.sx,
      this.sy,
      this.swidth,
      this.sheight,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update() {
    this.#draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}
class Hero extends Entity {
  sx = 4;
  sy = 6;
  swidth = 27;
  sheight = 17;
  width = this.swidth * SPRITE_SCALE;
  height = this.sheight * SPRITE_SCALE;

  position = {
    x: canvas.width / 2,
    y: canvas.height / 2
  };

  velocity = {
    x: 0,
    y: 0
  };

  draw() {
    // ctx.drawImage(spriteSheet, this.position.x, this.position.y);
    ctx.drawImage(
      spriteSheet,
      this.sx,
      this.sy,
      this.swidth,
      this.sheight,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Bullet {
  sx = 91;
  sy = 84;
  swidth = 4;
  sheight = 11;
  width = this.swidth * SPRITE_SCALE;
  height = this.sheight * SPRITE_SCALE;

  position = {
    x: player.position.x + player.width / 2,
    y: player.position.y
  };

  velocity = {
    x: 0,
    y: -10
  };

  draw() {
    // ctx.drawImage(spriteSheet, this.position.x, this.position.y);
    ctx.drawImage(
      spriteSheet,
      this.sx,
      this.sy,
      this.swidth,
      this.sheight,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update() {
    this.draw();
    this.position.y += this.velocity.y;
  }
}

class Enemy {
  sx = 4;
  sy = 199;
  swidth = 17;
  sheight = 17;
  width = this.swidth * SPRITE_SCALE;
  height = this.sheight * SPRITE_SCALE;
  alive = true;
  dying = false;
  deathTimeStamp;
  explosionFrames = [
    { sx: 163, sy: 80, swidth: 15, sheight: 13 },
    { sx: 180, sy: 80, swidth: 15, sheight: 14 },
    { sx: 196, sy: 78, swidth: 19, sheight: 17 },
    { sx: 215, sy: 77, swidth: 20, sheight: 18 },
    { sx: 237, sy: 78, swidth: 18, sheight: 17 },
    { sx: 256, sy: 78, swidth: 18, sheight: 17 }
  ];
  explosionIdx = 0;

  position = {
    x: canvas.width / 2,
    y: 0 - this.height
  };

  velocity = {
    x: 0,
    y: 5
  };

  draw() {
    // ctx.drawImage(spriteSheet, this.position.x, this.position.y);
    ctx.drawImage(
      spriteSheet,
      this.sx,
      this.sy,
      this.swidth,
      this.sheight,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  drawExplosion() {
    if (this.explosionIdx < this.explosionFrames.length) {
      const explosionFrame = this.explosionFrames[this.explosionIdx];
      ctx.drawImage(
        spriteSheet,
        explosionFrame.sx,
        explosionFrame.sy,
        explosionFrame.swidth,
        explosionFrame.sheight,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );

      if (Date.now() - this.deathTimeStamp > 200) {
        this.explosionIdx++;
        this.deathTimeStamp = Date.now();
      }
    } else {
      this.alive = false;
    }
  }

  die() {
    this.dying = true;
    this.deathTimeStamp = Date.now();
  }

  update() {
    if (!this.dying) {
      this.draw();
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    } else {
      this.drawExplosion();
    }
  }
}

function isColliding(
  { position: { x: x1, y: y1 }, width: w1, height: h1 },
  { position: { x: x2, y: y2 }, width: w2, height: h2 }
) {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && h1 + y1 > y2;
}

function animate() {
  requestAnimationFrame(animate);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  bullets.forEach((bullet, index) => {
    const enemyHitIdx = enemies.findIndex((enemy) => {
      return isColliding(bullet, enemy);
    });

    if (enemyHitIdx >= 0 && !enemies[enemyHitIdx].dying) {
      bullets.splice(index, 1);
      enemies[enemyHitIdx].die();
    } else if (bullet.position.y + bullet.height <= 0) {
      bullets.splice(index, 1);
    } else {
      bullet.update();
    }
  });
  enemies.forEach((enemy, index) => {
    if (enemy.position.y - enemy.height > canvas.height || !enemy.alive) {
      enemies.splice(index, 1);
    } else {
      enemy.update();
    }
  });
  handleInput();
}

function handleInput() {
  if (keySet.has("a") && player.position.x >= 0) {
    player.velocity.x = -PLAYER_SPEED;
  } else if (keySet.has("d") && player.position.x + player.width <= canvas.width) {
    player.velocity.x = PLAYER_SPEED;
  } else {
    player.velocity.x = 0;
  }

  if (keySet.has("w")) {
    player.velocity.y = -PLAYER_SPEED;
  } else if (keySet.has("s")) {
    player.velocity.y = PLAYER_SPEED;
  } else {
    player.velocity.y = 0;
  }

  if (keySet.has(" ")) {
    if (Date.now() - lastBulletFired > 100) {
      bullets.push(new Bullet());
      lastBulletFired = Date.now();
    }
  }

  if (keySet.has("0")) {
    if (Date.now() - lastEnemySpawned > 100) {
      enemies.push(new Enemy());
      lastEnemySpawned = Date.now();
    }
  }
}

addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "a":
    case "d":
    case "w":
    case "s":
    case " ":
      keySet.add(key);
      break;
  }
});

addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "a":
    case "d":
    case "w":
    case "s":
    case " ":
      keySet.delete(key);
      break;
  }
});

const player = new Hero extends Entity();
const bullets = [];
const enemies = [];
const keySet = new Set();
animate();
