import P5 from "p5";
import { getSize, Mover } from "../../util";
import type { SketchHolder } from "../../types";

const sketch = (p5: P5) => {
  const WIDTH = 800;
  const HEIGHT = WIDTH;
  let s: Spaceship;
  const boosterOff = p5.color('white');
  const boosterOn = p5.color('red');

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
    s = new Spaceship();
  }
  
  p5.draw = () => {
    p5.background(0);
    checkKeys();
    s.laserSystem.showLasers();
    s.update();
    s.display();
  }

  const checkKeys = () => {
    if (p5.keyIsDown(37)) { // left
      s.angularMomentum -= .001;
    }
    if (p5.keyIsDown(39)) { // right
      s.angularMomentum += .001;
    }
    if (p5.keyIsDown(38)) { // up
      s.boosterColor = boosterOn;
      const boost = p5.createVector(0, .1);
      boost.setHeading(s.angle + p5.PI/2);
      s.applyForce(boost);
    } else s.boosterColor = boosterOff;
    if (p5.keyIsDown(32)) { // space bar
       s.shoot();
    }
  }

  p5.windowResized = () => {
    p5.resizeCanvas(getSize(WIDTH, HEIGHT).w, getSize(WIDTH, HEIGHT).h);
  };

  class Spaceship extends Mover {
    boosterColor: P5.Color;
    maxSpeed: number;
    laserSystem: LaserSystem;

    constructor() {
      super({ p5, v: new P5.Vector(0, 0)});
      this.angle = p5.random(2 * p5.PI);
      this.velocity.setHeading(this.angle);
      this.acceleration.setHeading(this.angle);
      this.boosterColor = boosterOff;
      this.maxSpeed = 5;
      this.laserSystem = new LaserSystem(this);
    }

    override update(): void {
      this.velocity.add(this.acceleration);
      this.velocity.limit(this.maxSpeed);
      this.location.add(this.velocity);
      this.checkEdges();

      this.angularMomentum = p5.constrain(this.angularMomentum, -.1, 1);
      this.angularVelocity += this.angularMomentum;
      this.angularVelocity = p5.constrain(this.angularVelocity, -2, 2);
      this.angle += this.angularVelocity;
      this.angularMomentum = 0;
  
      this.acceleration.mult(0);
    }

    checkEdges() {
      if (this.location.x < 0) this.location.x = p5.width;
      if (this.location.y < 0) this.location.y = p5.height;
      if (this.location.x > p5.width) this.location.x = 0;
      if (this.location.y > p5.height) this.location.y = 0;
    }

    draw() {
      p5.stroke('black');
      p5.strokeWeight(1);
      p5.push();
      p5.translate(-10, -5);
      p5.triangle(0, 0, 20, 0, 10, 30);
      p5.fill(this.boosterColor);
      p5.rect(2.5, 0, 5, -5);
      p5.rect(12.5, 0, 5, -5);
      p5.pop();
    }

    shoot() {
      this.laserSystem.addLaser();
      const boost = p5.createVector(0, .015);
      boost.setHeading(s.angle - p5.PI/2);
      this.applyForce(boost);
    }
  }

  class LaserSystem {
    lasers: Laser[];
    source: Spaceship;
    maxLasers: number;

    constructor(s: Spaceship) {
      this.lasers = [];
      this.source = s;
      this.maxLasers = 100;
    }
    addLaser() {
      const origin = this.source.location.copy();
      const ship = p5.createVector(0, 20);
      ship.setHeading(this.source.angle + p5.PI/2);
      origin.add(ship);
      this.lasers.push(new Laser(origin.x, origin.y, this.source.angle));
      if (this.lasers.length > this.maxLasers) {
        this.lasers.splice(0, 1);
      }
    }

    showLasers() {
      p5.strokeWeight(2);
      this.lasers.forEach(l => {
        l.update();
        l.display();
      })
    }
  }

  class Laser {
    location: P5.Vector;
    previousLocation: P5.Vector;
    velocity: P5.Vector;
    angle: number;
    lifeSpan: number;
  
    constructor(x: number, y: number, angle: number) {
      this.location = p5.createVector(x, y);
      this.previousLocation = this.location.copy();
      this.angle = angle + p5.PI/2;
      this.velocity = P5.Vector.fromAngle(this.angle);
      this.velocity.setMag(8);
      this.lifeSpan = 100;
    }

    update() {
      if (this.lifeSpan <= 0) return;
      this.previousLocation = this.location.copy();
      this.location.add(this.velocity);
      this.checkEdges();
      this.lifeSpan--;
    }

    checkEdges() {
      if (this.location.x < 0) {
        this.location.x = p5.width;
        this.previousLocation.x = p5.width;
      }
      if (this.location.y < 0) {
        this.location.y = p5.height;
        this.previousLocation.y = p5.height;
      }
      if (this.location.x > p5.width) {
        this.location.x = 0;
        this.previousLocation.x = 0;
      }
      if (this.location.y > p5.height) {
        this.location.y = 0;
        this.previousLocation.y = 0;
      }
    }

    display() {
      if (this.lifeSpan <= 0) return;
      p5.stroke(255, 0, 0, this.lifeSpan * 2);
      p5.line(this.previousLocation.x, this.previousLocation.y, this.location.x, this.location.y);
    }
  }
}

export const spaceshipSketch: SketchHolder = {
  sketch,
  info: {
    title: "3.5b - Spaceship",
    controls: '',
    about: '',
  }
};
