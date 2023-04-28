const canvas: HTMLCanvasElement = document.querySelector("canvas")!;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
const spriteSheet: HTMLImageElement = new Image();
const SPRITE_SCALE: number = 2.5;
const PLAYER_SPEED: number = 7;
const keySet = new Set<string>();
const lives = document.querySelector("#lives")!;
const score = document.querySelector("#score")!;
const highScore = document.querySelector("#high-score")!;
let lastBulletFired: number = Date.now();
let lastEnemySpawned: number = Date.now();
let paused = false;

spriteSheet.src = "./images/1942_sprite_sheet.png";

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

function changeNumber(element: Element, increment: number): void {
  element.textContent = (parseInt(element.textContent!) + increment).toString();
}

addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "a":
    case "d":
    case "w":
    case "s":
    case " ":
    case "0":
    case "Enter":
      keySet.add(key);
      break;
  }
});

addEventListener("keypress", ({ key }) => {
  switch (key) {
    case "Enter":
      paused = !paused;
      console.log(paused);
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
    case "Enter":
      keySet.delete(key);
      break;
  }
});

class Entity {
  private velocity: { x: number; y: number; };
  private width: number;
  private height: number;
  private sx: number;
  private sy: number;
  private swidth: number;
  private sheight: number;
  private position: { x: number; y: number; };
  protected isDying: boolean = false;
  private isDead: boolean = false;
  private deathTimestamp: number = 0;

  constructor(
    sx: number,
    sy: number,
    swidth: number,
    sheight: number,
    position: { x: number; y: number; }
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

  public setIsDying(isDying: boolean): void {
    this.isDying = isDying;
  }

  public setPosition(position: { x: number; y: number; }): void {
    this.position = position;
  }

  die(): void {
    this.isDying = true;
    this.deathTimestamp = Date.now();
  }

  public update(deltaTime: number): void {
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
  shoot(entity: Entity): void;
}

interface Exploder {
  explosionIdx: number;
  explosionFrames: { sx: number, sy: number, swidth: number, sheight: number; }[];
}

class Hero extends Entity implements Shooter, Exploder {
  private lives = 3;
  private isInvincible = false;
  bulletArray: Bullet[] = [];
  bulletTimeStamp = 0;
  explosionIdx: number = 0;
  explosionFrames = [
    { sx: 5, sy: 104, swidth: 27, sheight: 23 },
    { sx: 35, sy: 103, swidth: 32, sheight: 28 },
    { sx: 69, sy: 100, swidth: 34, sheight: 32 },
    { sx: 105, sy: 100, swidth: 32, sheight: 33 },
    { sx: 140, sy: 101, swidth: 32, sheight: 31 },
    { sx: 175, sy: 103, swidth: 31, sheight: 26 }
  ];

  constructor() {
    super(4, 6, 27, 17, {
      x: canvas.width / 2,
      y: canvas.height / 2,
    });
  }

  shoot(): void {
    if (Date.now() - this.bulletTimeStamp > 100) {
      const bullet = new Bullet(91, 84, 4, 11, { x: this.getX() + this.getWidth() / 2, y: this.getY() });
      bullet.setVelocityY(-10);
      this.bulletArray.push(bullet);
      this.bulletTimeStamp = Date.now();
    }
  }

  public getBullets(): Bullet[] {
    return this.bulletArray;
  }

  public getLives(): number {
    return this.lives;
  }

  public getIsInvincible(): boolean {
    return this.isInvincible;
  }

  public die(): void {
    if (!this.isInvincible) {
      super.die();
      this.lives--;
    }
  }

  public bringBackToLife(): void {
    this.setIsDying(false);
    this.setIsDead(false);
    this.setDeathTimestamp(0);
    this.setPosition({ x: canvas.width / 2, y: canvas.height / 2 });
    this.explosionIdx = 0;
    this.isInvincible = true;
    setTimeout(() => {
      this.isInvincible = false;
    }, 2000);
  }

  public update(deltaTime: number): void {
    if (!this.isDying) {
      super.update(deltaTime);
      this.bulletArray.forEach((bullet, index) => {
        bullet.update(deltaTime);
        if (bullet.getY() < 0) {
          this.bulletArray.splice(index, 1);
        }
      });
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

class Bullet extends Entity {
  constructor(sx: number, sy: number, swidth: number, sheight: number, position: { x: number; y: number; }) {
    super(sx, sy, swidth, sheight, position);
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
  constructor(position: { x: number; y: number; }) {
    super(4, 199, 17, 17, position);
  }

  shoot(hero: Entity): void {
    if (Date.now() - this.bulletTimeStamp > 1000 && !hero.getIsDead()) {
      const bullet = new Bullet(74, 90, 6, 4, { x: this.getX() + this.getWidth() / 2, y: this.getY() });
      const dx = hero.getX() - this.getX();
      const dy = hero.getY() - this.getY();
      const magnitude = Math.sqrt(dx * dx + dy * dy);
      const unitVector = { x: dx / magnitude, y: dy / magnitude };
      const bulletVelocity = 10;
      const bulletVector = { x: unitVector.x * bulletVelocity, y: unitVector.y * bulletVelocity };
      const bulletVelocityX = bulletVector.x;
      const bulletVelocityY = bulletVector.y;
      bullet.setVelocityX(bulletVelocityX);
      bullet.setVelocityY(bulletVelocityY);
      this.bulletArray.push(bullet);
      this.bulletTimeStamp = Date.now();
    }
  }

  public getBullets(): Bullet[] {
    return this.bulletArray;
  }

  public update(deltaTime: number) {
    if (!this.isDying) {
      super.update(deltaTime);
      this.bulletArray.forEach((bullet, index) => {
        bullet.update(deltaTime);
        // if (bullet.getY() < 0) {
        //   this.bulletArray.splice(index, 1);
        // }
      });
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
  private strayBullets: Bullet[] = []; // Bullets that live after death or off screen entity

  private handleInput(): void {
    if (keySet.has("a") && this.player.getX() >= 0) {
      this.player.setVelocityX(-PLAYER_SPEED);
    } else if (keySet.has("d") && this.player.getX() + this.player.getWidth() <= canvas.width) {
      this.player.setVelocityX(PLAYER_SPEED);
    } else {
      this.player.setVelocityX(0);
    }

    if (keySet.has("w") && this.player.getY() >= 0) {
      this.player.setVelocityY(-PLAYER_SPEED);
    } else if (keySet.has("s") && this.player.getY() + this.player.getHeight() <= canvas.height) {
      this.player.setVelocityY(PLAYER_SPEED);
    } else {
      this.player.setVelocityY(0);
    }

    if (keySet.has(" ")) {
      this.player.shoot();
    }

    if (keySet.has("Enter")) {
      console.log("enter");
      if (Date.now() - lastEnemySpawned > 100) {

        const enemy = new Enemy({
          x: canvas.width / 2,
          y: 0
        });
        enemy.setVelocityY(5);
        enemy.setVelocityX(getRandInt(-5, 5));
        this.enemies.push(enemy);
        lastEnemySpawned = Date.now();
      }
    }
  }



  public update(deltaTime: number): void {
    this.player.update(deltaTime);
    this.enemies.forEach((enemy, index) => {
      if (enemy.getIsDead() || !isInBounds(enemy)) {
        this.strayBullets.push(...enemy.getBullets());
        // console.log(this.strayBullets, enemy);
        this.enemies.splice(index, 1);
      } else {
        enemy.update(deltaTime);
        enemy.shoot(this.player);
      }
    });
    this.strayBullets.forEach((bullet, index) => {
      if (isInBounds(bullet)) {
        bullet.update(deltaTime);
      } else {
        this.strayBullets.splice(index, 1);
      }
    });
    this.handleInput();
    this.handleCollisions();
    this.handleEnemySpawning();
  }

  handleEnemySpawning() {
    if (Date.now() - lastEnemySpawned > getRandInt(500, 2000) && this.enemies.length < 2) {
      const enemy = new Enemy({
        x: getRandInt(0, canvas.width),
        y: 0
      });
      enemy.setVelocityY(getRandInt(5, 7));
      enemy.setVelocityX(getRandInt(-5, 5));
      this.enemies.push(enemy);
      lastEnemySpawned = Date.now();
    }
  }

  private handleCollisions() {
    this.enemies.forEach((enemy, enemyIndex) => {
      this.player.getBullets().some((bullet, bulletIndex) => {
        if (enemy.isCollidingWith(bullet)) {
          // allow bullet to pass through enemy if it's already dying
          if (!enemy.getIsDying()) {
            this.player.getBullets().splice(bulletIndex, 1);
            enemy.die();
            changeNumber(score, 100);
            if (parseInt(highScore.textContent!, 0) < parseInt(score.textContent!, 0)) {
              highScore.textContent = score.textContent;
            }
          }
          return true;
        }
      });

      enemy.getBullets().some((bullet, bulletIndex) => {
        if (this.player.isCollidingWith(bullet) && !this.player.getIsDying() && !this.player.getIsInvincible()) {
          // allow bullet to pass through player if it's already dying
          enemy.getBullets().splice(bulletIndex, 1);
          this.player.die();
          if (this.player.getLives() === 0) {
            changeNumber(lives, -1);
            console.log("game over");
          } else {
            changeNumber(lives, -1);
            console.log("player died");
            setTimeout(() => {
              this.player.bringBackToLife();
            }, 2000);
          }
          return true;
        }
      });
    });
  }
}

const world = new World();
let lastTime = 0;
function gameLoop(timestamp: number): void {
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  if (!paused) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    world.update(deltaTime);
  }
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

function isInBounds(entity: Entity): boolean {
  return (
    entity.getX() >= 0 &&
    entity.getX() + entity.getWidth() <= canvas.width &&
    entity.getY() >= 0 &&
    entity.getY() + entity.getHeight() <= canvas.height
  );
}

function getRandInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}