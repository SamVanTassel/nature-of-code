import P5 from "p5";
import "../../styles.scss";
import { getSize } from "../../util";
import type { SketchHolder } from "../../types";

const sketch = (p5: P5) => {
  const WIDTH = 800;
  const HEIGHT = 200;

  const BLOCK_HEIGHT = 60;
  const blocksSettings = [
    {
      mass: 100,
      initialVelocity: 10,
      position: 50,
      color: 'dodgerBlue',
    },
    {
      mass: 50,
      initialVelocity: -10,
      position: 400,
      color: 'orange'
    },
    // {
    //   mass: 50,
    //   initialVelocity: -10,
    //   position: 750,
    //   color: 'teal'
    // },
  ]

  const FRICTION = 0;

  const blocks: Block[] = [];

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
      );
    blocksSettings.forEach(config => {
      blocks.push(new Block(config.mass, config.position, config.initialVelocity, p5.color(config.color), config.color));
    });
    p5.noStroke();
  };

  p5.draw = () => {
    p5.background(200, 200, 200);
    p5.rectMode('corner');
    p5.fill(p5.color(170, 170, 255));
    // draw ice
    p5.rect(0, p5.height * 3/4, p5.width, 100);
    blocks.forEach(b => {
      // b.applyFriction();
      blocks.forEach(o => {
        if (b === o) return;
        b.willCollide(o);
      });
    });
    p5.rectMode('center');
    blocks.forEach(b => {
      b.update();
      b.draw();
      b.checkWalls();
    })
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
    acceleration: number;
    name: string;
    hits: { wall: boolean };
  
    constructor (mass: number, location: number, velocity: number, color: P5.Color, name: string) {
      this.mass = mass;
      this.location = location;
      this.velocity = velocity;
      if (color) this.color = color;
      this.hit = false;
      this.width = mass;
      this.acceleration = 0;
      this.name = name;
      this.hits = { wall: false };
    }
  
    update () {
      this.velocity += this.acceleration;
      this.location += this.velocity;
    }
  
    draw () {
      p5.fill(this.color);
      p5.rect(this.location, (p5.height * 3/4) - BLOCK_HEIGHT/2, this.width, BLOCK_HEIGHT);
    }

    willCollide (other: Block) {
      if (!this.hits[other.name] && this.checkCollision(
        this.location + this.velocity,
        other.location + other.velocity,
        this.width, other.width)
      ) {
        console.log(`${this.name} hit ${other.name}`);
        this.hits[other.name] = true;
        this.collide(other);
      } else {
        this.hits[other.name] = false;
      }
    }

    checkWalls () {
      if (this.location - this.width/2 <= 0) {
        this.hits.wall = true;
        this.collideWithWall();
      } else if (this.location + this.width/2 >= p5.width) {
        this.hits.wall = true;
        console.log(`${this.name} hit the wall`);
        this.collideWithWall();
      } 
    }
  
    checkCollision (l1: number, l2: number, w1: number, w2: number) {
      const thisLeft = l1 - w1/2;
      const thisRight = l1 + w1/2;
      const otherLeft = l2 - w2/2;
      const otherRight = l2 + w2/2;

      if (
        l1 < l2 && thisRight >= otherLeft ||
        l1 > l2 && thisLeft <= otherRight
      ) {
        return true;
      }
      return false;
    }

    private collide (other: Block) {
      this.velocity = getVelocity(this.mass, other.mass, this.velocity, other.velocity);
      if (this.location < other.location) {
        this.location = other.location - (this.width/2 + other.width/2);
      } else {
        this.location = other.location + this.width/2 + other.width/2
      };
    }

    private collideWithWall () {
      this.velocity = - this.velocity;
      if (this.location < this.width/2) this.location = this.width/2;
      if (this.location > p5.width) this.location = p5.width -this.width/2;
    }

    applyFriction () {
      const frictionForce = Math.sign(this.velocity) * FRICTION;
      this.acceleration = - frictionForce / this.mass;
    }
  }

  const getVelocity = (m1: number, m2: number, v1: number, v2: number) => {
    return ((m1 - m2)/(m1 + m2)) * v1 + ((2 * m2)/(m1 + m2)) * v2;
  };
};

export const oneDimendionalCollisionSketch: SketchHolder = {
  sketch,
  info: {
    title: "1D Collision",
    controls: '',
    about: 'about as basic as it gets, inelastic collision between two objects in one dimension',
  }
};
