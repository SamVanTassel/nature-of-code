import P5 from "p5";
import "../../styles.scss";
import { getSize } from "../../util";
import type { SketchHolder } from "../../types";

const sketch = (p5: P5) => {
  const WIDTH = 600;
  const HEIGHT = 340;
  const movers: Mover[] = [];
  let gravity: P5.Vector;
  let wind: P5.Vector;
  const c = .05;
  const normal_ = 1;
  const frictionMag = c * normal_;

  p5.setup = () => {
    p5.createCanvas(640, 360);    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
    for (let i = 0; i < 10; i++) {
      movers.push(new Mover());
    }
    gravity = p5.createVector(0, .2);
    wind = p5.createVector(.01, 0);
  }

  p5.draw = () => {
    p5.background(200);
    movers.forEach(mover => {
      const specificGravity = P5.Vector.mult(gravity, mover.mass);
      mover.applyForce(specificGravity);

      movers.forEach(other => {
        if (other === mover) return;
        mover.willCollide(other);
        const hit = mover.checkCollision(other);
        if (hit) mover.collide(other)
      })
      const friction = mover.velocity.copy().normalize().mult(-1);
      if (mover.location.y >= (p5.height - mover.radius)) {
        friction.mult(.05);
      } else {
        friction.mult(.01);
      }
      mover.applyForce(friction);

      mover.applyForce(wind);
      mover.update();
      mover.checkEdges();
      mover.display();
    })
  }

  p5.mouseClicked = () => {
    movers.push(new Mover(p5.mouseX, p5.mouseY));
  }

  p5.windowResized = () => {
    p5.resizeCanvas(getSize(WIDTH, HEIGHT).w, getSize(WIDTH, HEIGHT).h);
  };

  class Mover {
    location: P5.Vector;
    velocity: P5.Vector;
    acceleration: P5.Vector;
    color: P5.Color;
    mass: number;
    radius: number;

    constructor(x?: number, y?: number) {
      this.location =  x & y ? p5.createVector(x, y) : p5.createVector(p5.random(p5.width), p5.random(p5.height));
      this.velocity = p5.createVector(0, 0);
      this.acceleration = p5.createVector(.001, .001);
      this.color = p5.color(p5.random(0, 255), p5.random(0, 255), p5.random(0, 255), p5.random(0, 255))
      this.mass = p5.random(.75, 1.25);
      this.radius = this.mass * 16;
    }

    applyForce(force: P5.Vector) {
      const f = P5.Vector.div(force, this.mass);
      this.acceleration.add(f);
    }

    update() {
      this.velocity.add(this.acceleration);
      this.location.add(this.velocity);
      this.acceleration.mult(0);
    }

    display() {
      p5.stroke(0);
      p5.fill(this.color);
      p5.ellipse(this.location.x, this.location.y, this.radius);
    }

    checkEdges() {
      if (this.location.x + this.radius/2 > p5.width) {
        this.velocity.x = - this.velocity.x;
        this.location.x = p5.width - this.radius/2;
      }
  
      if (this.location.y + this.radius/2 > p5.height) {
        this.velocity.y = - this.velocity.y;
        this.location.y = p5.height - this.radius/2
      }
    }

    willCollide(other: Mover) {
      const thisNext = P5.Vector.add(this.location, P5.Vector.add(this.velocity, this.acceleration));
      const otherNext = P5.Vector.add(other.location, P5.Vector.add(other.velocity, other.acceleration));

      // if they will be within each other
      if (p5.dist(thisNext.x, thisNext.y, otherNext.x, otherNext.y) < this.radius/2 + other.radius/2) {
        this.setAdjacent(other);
      }
    }

    setAdjacent(other: Mover) {
      // const vecBetween = P5.Vector.sub(other.location, this.location);
      // const dist = P5.Vector.dist(other.location, this.location);
      // vecBetween.setMag(dist);
      // this.location = P5.Vector.sub(other.location, vecBetween);
    }

    checkCollision(other: Mover) {
      const distance = p5.dist(this.location.x, this.location.y, other.location.x, other.location.y);
      return distance <= this.radius/2 + other.radius/2;
    }

    collide(other: Mover) {
      // formula from stackoverflow: 
      // https://stackoverflow.com/questions/35211114/2d-elastic-ball-collision-physics
      const massPart = (2 * other.mass) / (this.mass + other.mass);
      const posPart = P5.Vector.sub(this.location, other.location);
      const dotProduct = P5.Vector.dot(
        P5.Vector.sub(this.velocity, other.velocity),
        P5.Vector.sub(this.location, other.location)
      );
      const norm =P5.Vector.mag(
        P5.Vector.sub(this.location, other.location),
      );
      const normSquared = Math.pow(norm, 2);
      const rightPart = P5.Vector.mult(posPart, massPart * (dotProduct/normSquared));

      this.velocity = P5.Vector.sub(this.velocity, rightPart);
    }
  }
}

export const windGravityFrictionCollisionSketch: SketchHolder = {
  sketch,
  info: {
    title: "2.2b - Wind, Gravity, Friction, Collision",
    controls: '',
    about: '',
  }
};
