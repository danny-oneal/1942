const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const spriteSheet = new Image();
const SPRITE_SCALE = 2.5;
const PLAYER_SPEED = 7;

spriteSheet.src = "./images/1942_sprite_sheet.png";

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

console.log(spriteSheet);
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

const player = new Player();

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
  handleInput();
}

function handleInput() {
  if (keys.a.pressed && player.position.x >= 0) {
    player.velocity.x = -PLAYER_SPEED;
  } else if (keys.d.pressed && player.position.x + player.width <= canvas.width) {
    player.velocity.x = PLAYER_SPEED;
  } else {
    player.velocity.x = 0;
  }

  if (keys.w.pressed) {
    player.velocity.y = -PLAYER_SPEED;
  } else if (keys.s.pressed) {
    player.velocity.y = PLAYER_SPEED;
  } else {
    player.velocity.y = 0;
  }
}

animate();

addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "a":
      console.log("left");
      keys.a.pressed = true;
      break;
    case "d":
      console.log("right");
      keys.d.pressed = true;
      break;
    case "w":
      console.log("up");
      keys.w.pressed = true;
      break;
    case "s":
      console.log("down");
      keys.s.pressed = true;
      break;
    case " ":
      console.log("space");
      keys.space.pressed = true;
      break;
  }
});

addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "a":
      console.log("left");
      keys.a.pressed = false;
      break;
    case "d":
      console.log("right");
      keys.d.pressed = false;
      break;
    case "w":
      console.log("up");
      keys.w.pressed = false;
      break;
    case "s":
      console.log("down");
      keys.s.pressed = false;
      break;
    case " ":
      console.log("space");
      keys.space.pressed = false;
      break;
  }
});
