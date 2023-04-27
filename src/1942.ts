const canvas: HTMLCanvasElement = document.querySelector("canvas")!;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
const spriteSheet: HTMLImageElement = new Image();
const SPRITE_SCALE: number = 2.5;
const PLAYER_SPEED: number = 7;
const keySet = new Set<string>();
let lastBulletFired: number = Date.now();
let lastEnemySpawned: number = Date.now();

spriteSheet.src = "./images/1942_sprite_sheet.png";

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "a":
    case "d":
    case "w":
    case "s":
    case " ":
    case "0":
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
    case "0":
      keySet.delete(key);
      break;
  }
});

class Entity {
  private velocity: { x: number; y: number };
  private width: number;
  private height: number;
  private sx: number;
  private sy: number;
  private swidth: number;
  private sheight: number;
  private position: { x: number; y: number }
  protected isDying: boolean = false;
  private isDead: boolean = false;
  private deathTimestamp: number = 0;

  constructor(
    sx: number,
    sy: number,
    swidth: number,
    sheight: number,
    position: { x: number; y: number }
  ) {
    // set the private variables
    this.sx = sx;
    this.sy = sy;
    this.swidth = swidth;
    this.sheight = sheight;
    this.position = position;
    this.velocity = { x: 0, y: 0 };
    this.width = this.swidth * SPRITE_SCALE;
    this.height = this.sheight * SPRITE_SCALE;
  }

  private draw(): void {
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
  // setters for velocities
  public setVelocityX(velocity: number): void {
    this.velocity.x = velocity;
  }

  public setVelocityY(velocity: number): void {
    this.velocity.y = velocity;
  }

  public getX(): number {
    return this.position.x;
  }

  public getY(): number {
    return this.position.y;
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  protected setDeathTimestamp(timestamp: number): void {
    this.deathTimestamp = timestamp;
  }

  protected getDeathTimestamp(): number {
    return this.deathTimestamp;
  }

  protected setIsDead(isDead: boolean): void {
    this.isDead = isDead;
  }

  public getIsDead(): boolean {
    return this.isDead;
  }

  public getIsDying(): boolean {
    return this.isDying;
  }

  die(): void {
    this.isDying = true;
    this.deathTimestamp = Date.now();
  }

  public update(): void {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  public isCollidingWith(entity: Entity): boolean {
    if (
      this.position.x < entity.position.x + entity.width &&
      this.position.x + this.width > entity.position.x &&
      this.position.y < entity.position.y + entity.height &&
      this.position.y + this.height > entity.position.y
    ) {
      return true;
    } else {
      return false;
    }
  }

}

interface Shooter {
  bulletArray: Bullet[];
  bulletTimeStamp: number;
  shoot(): void;
}

interface Exploder {
  explosionIdx: number;
  explosionFrames: { sx: number, sy: number, swidth: number, sheight: number }[];
}

class Hero extends Entity implements Shooter {
  private lives = 3;
  private score = 0;
  private isInvincible = false;
  bulletArray: Bullet[] = [];
  bulletTimeStamp = 0;

  constructor() {
    super(4, 6, 27, 17, {
      x: canvas.width / 2,
      y: canvas.height / 2,
    })
  }

  shoot(): void {
    if (Date.now() - this.bulletTimeStamp > 100) {
      const bullet = new Bullet({ x: this.getX() + this.getWidth() / 2, y: this.getY() });
      bullet.setVelocityY(-10);
      this.bulletArray.push(bullet);
      this.bulletTimeStamp = Date.now();
    }
  }

  public getBullets(): Bullet[] {
    return this.bulletArray;
  }

  public update(): void {
    super.update();
    this.bulletArray.forEach((bullet, index) => {
      bullet.update();
      if (bullet.getY() < 0) {
        this.bulletArray.splice(index, 1);
      }
    });
  }


}

class Bullet extends Entity {
  constructor(position: { x: number; y: number }) {
    super(91, 84, 4, 11, position)
  }
}

class Enemy extends Entity implements Shooter, Exploder {
  bulletArray: Bullet[] = [];
  bulletTimeStamp = 0;
  explosionIdx: number = 0;
  explosionFrames = [
    { sx: 163, sy: 80, swidth: 15, sheight: 13 },
    { sx: 180, sy: 80, swidth: 15, sheight: 14 },
    { sx: 196, sy: 78, swidth: 19, sheight: 17 },
    { sx: 215, sy: 77, swidth: 20, sheight: 18 },
    { sx: 237, sy: 78, swidth: 18, sheight: 17 },
    { sx: 256, sy: 78, swidth: 18, sheight: 17 }
  ];
  constructor(position: { x: number; y: number }) {
    super(4, 199, 17, 17, position)
  }

  shoot(): void {
    if (Date.now() - this.bulletTimeStamp > 100) {
      const bullet = new Bullet({ x: this.getX() + this.getWidth() / 2, y: this.getY() });
      bullet.setVelocityY(-10);
      this.bulletArray.push(bullet);
      this.bulletTimeStamp = Date.now();
    }
  }

  public update() {
    if (!this.isDying) {
      super.update();
    } else {
      if (this.explosionIdx < this.explosionFrames.length) {
        const explosionFrame = this.explosionFrames[this.explosionIdx];
        ctx.drawImage(
          spriteSheet,
          explosionFrame.sx,
          explosionFrame.sy,
          explosionFrame.swidth,
          explosionFrame.sheight,
          this.getX(),
          this.getY(),
          this.getWidth(),
          this.getHeight()
        );

        if (Date.now() - this.getDeathTimestamp() > 200) {
          this.explosionIdx++;
          this.setDeathTimestamp(Date.now());
        }
      } else {
        this.setIsDead(true);
      }
    }
  }
}

class World {
  private player: Hero = new Hero();
  private enemies: Enemy[] = [];

  private handleInput(): void {
    if (keySet.has("a") && this.player.getX() >= 0) {
      this.player.setVelocityX(-PLAYER_SPEED);
    } else if (keySet.has("d") && this.player.getX() + this.player.getWidth() <= canvas.width) {
      this.player.setVelocityX(PLAYER_SPEED);
    } else {
      this.player.setVelocityX(0);
    }

    if (keySet.has("w")) {
      this.player.setVelocityY(-PLAYER_SPEED);
    } else if (keySet.has("s")) {
      this.player.setVelocityY(PLAYER_SPEED);
    } else {
      this.player.setVelocityY(0);
    }

    if (keySet.has(" ")) {
      this.player.shoot();
    }

    if (keySet.has("0")) {
      if (Date.now() - lastEnemySpawned > 100) {
        const enemy = new Enemy({
          x: canvas.width / 2,
          y: 0
        });
        enemy.setVelocityY(5);
        this.enemies.push(enemy);
        lastEnemySpawned = Date.now();
      }
    }
  }

  public update(deltaTime: number): void {
    this.player.update();
    this.enemies.forEach((enemy, index) => {
      if (enemy.getIsDead()) {
        this.enemies.splice(index, 1);
      } else {
        enemy.update();
      }
    });
    this.handleInput();
    this.handleCollisions();
    // this.handleEnemySpawning();
  }

  private handleCollisions() {
    this.enemies.forEach((enemy, enemyIndex) => {
      this.player.getBullets().some((bullet, bulletIndex) => {
        if (enemy.isCollidingWith(bullet)) {
          // allow bullet to pass through enemy if it's already dying
          if (!enemy.getIsDying()) {
            this.player.getBullets().splice(bulletIndex, 1);
            enemy.die();
          }
          return true;
        }
      })
    });
  }
}

const world = new World();
let lastTime = 0;
function gameLoop(timestamp: number): void {
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  world.update(deltaTime);
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);