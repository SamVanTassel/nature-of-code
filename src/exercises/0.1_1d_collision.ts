import p5 from "p5";
import P5 from "p5";
import "../styles.scss";
import { getSize } from "../util";

export const oneDimendionalCollisionSketch = (p5: P5) => {
  const WIDTH = 800;
  const HEIGHT = 200;
  const BLOCK_1_MASS = 100;
  const BLOCK_2_MASS = 10;
  const BLOCK_3_MASS = 50;
  const BLOCK_1_VELOCITY = 10;
  const BLOCK_2_VELOCITY = -20;
  const BLOCK_3_VELOCITY = -5;
  const BLOCK_HEIGHT = 60;

  let block1: Block;
  let block2: Block;
  let block3: Block;

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
      );
    block1 = new Block(BLOCK_1_MASS, BLOCK_1_MASS/2, BLOCK_1_VELOCITY, p5.color('dodgerBlue'));
    block2 = new Block(BLOCK_2_MASS, p5.width - BLOCK_2_MASS, BLOCK_2_VELOCITY, p5.color('teal'));
    // block3 = new Block(BLOCK_3_MASS, p5.width/2, BLOCK_3_VELOCITY, p5.color('orange'));
    p5.noStroke();
  };

  p5.draw = () => {
    p5.background(200, 200, 200);
    p5.rectMode('corner');
    p5.fill(p5.color(170, 170, 255));
    // draw ice
    p5.rect(0, p5.height * 3/4, p5.width, 100);
    block1.willCollide(block2);
    // block1.willCollide(block3);
    block2.willCollide(block1);
    // block2.willCollide(block3);
    // block3.willCollide(block1);
    // block3.willCollide(block2);
    block1.update();
    block2.update();
    // block3.update();
    p5.rectMode('center');
    block1.draw();
    block2.draw();
    // block3.draw();
    block1.checkWalls();
    block2.checkWalls();
    // block3.checkWalls();
    console.log(block1.hit, block2.hit);
  };

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };

  class Block {
    mass: number;
    location: number;
    velocity: number;
    color: P5.Color;
    width: number;
    hit: boolean;
  
    constructor (mass: number, location: number, velocity: number, color?: P5.Color) {
      this.mass = mass;
      this.location = location;
      this.velocity = velocity;
      if (color) this.color = color;
      this.hit = false;
      this.width = mass;
    }
  
    update () {
      this.location += this.velocity;
    }
  
    draw () {
      p5.fill(this.color);
      p5.rect(this.location, (p5.height * 3/4) - BLOCK_HEIGHT/2, this.width, BLOCK_HEIGHT);
    }

    willCollide (other: Block) {
      if (this.checkCollision(
        this.location + this.velocity,
        other.location + other.velocity,
        this.width, other.width)
      ) {
        this.hit = true;
        this.collide(other);
      } else {
        this.hit = false;
      }
    }

    checkWalls () {
      if (this.location - this.width/2 <= 0) {
        this.hit = true;
        this.collideWithWall();
      } else if (this.location + this.width/2 >= p5.width) {
        this.hit = true;
        this.collideWithWall();
      } 
    }
  
    checkCollision (l1: number, l2: number, w1: number, w2: number) {
      const thisLeft = l1 - w1/2;
      const thisRight = l1 + w1/2;
      const otherLeft = l2 - w2/2;
      const otherRight = l2 + w2/2;

      if (
        (l1 < l2 && thisRight >= otherLeft ||
        l1 > l2 && thisLeft <= otherRight) &&
        !this.hit
      ) {
        return true;
      }
      return false;
    }

    collide (other: Block) {
      this.velocity = getVelocity(this.mass, other.mass, this.velocity, other.velocity);
    }
    collideWithWall () {
      this.velocity = - this.velocity;
    }
  }

  const getVelocity = (m1: number, m2: number, v1: number, v2: number) => {
    return ((m1 - m2)/(m1 + m2)) * v1 + ((2 * m2)/(m1 + m2)) * v2;
  };
};
