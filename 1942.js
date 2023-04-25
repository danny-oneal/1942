const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const spriteSheet = new Image();
const SPRITE_SCALE = 2.5;
const PLAYER_SPEED = 7;

spriteSheet.src = "./images/1942_sprite_sheet.png";

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.drawImage(spriteSheet, 200, 200);

class Player {
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

const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  w: {
    pressed: false
  },
  s: {
    pressed: false
  },
  space: {
    pressed: false
  }
};

function animate() {
  requestAnimationFrame(animate);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  bullets.forEach((bullet, index) => {
    if (bullet.position.y + bullet.height <= 0) {
      bullets.shift();
    } else {
      bullet.update();
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
}

addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "a":
    case "d":
    case "w":
    case "s":
      keySet.add(key);
      break;
    case " ":
      bullets.push(new Bullet());
      console.log(bullets);
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

const player = new Player();
const bullets = [];
const keySet = new Set();
animate();
