import P5 from "p5";
import { getSize, Mover } from "../util";

export const spaceshipSketch = (p5: P5) => {
  const WIDTH = 800;
  const HEIGHT = WIDTH;
  let s: Spaceship;
  let boosterRed = 255;

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
      boosterRed = 0;
      const boost = new P5.Vector(0, .1);
      boost.setHeading(s.angle);
      s.applyForce(boost);
    } else boosterRed =255;
  }

  p5.windowResized = () => {
    p5.resizeCanvas(getSize(WIDTH, HEIGHT).w, getSize(WIDTH, HEIGHT).h);
  };

  class Spaceship extends Mover {
    constructor() {
      super({ p5, v: new P5.Vector(0, 0)});
      this.angle = p5.random(2 * p5.PI);
    }

    override update(): void {
      this.velocity.add(this.acceleration);
      this.location.add(this.velocity);

      this.angularVelocity += this.p5.constrain(this.angularMomentum, -.1, .1);
      this.angle += this.angularVelocity;
      this.angularMomentum = 0;
  
      this.acceleration.mult(0);
    }

    draw() {
      p5.push();
      p5.rotate(this.angle);
      p5.push();
      p5.translate(-10, -5);
      p5.triangle(0, 0, 20, 0, 10, 30);
      p5.fill(255, boosterRed, boosterRed);
      p5.rect(2.5, 0, 5, -5);
      p5.rect(12.5, 0, 5, -5);
      p5.pop();
      p5.pop();
    }
  }
}