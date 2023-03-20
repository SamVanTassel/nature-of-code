import P5 from "p5";
import "../styles.scss";
import { Mover, getSize } from '../util';

export const cannonballSketch = (p5: P5) => {
  const WIDTH = 8000;
  const HEIGHT = 4000;
  let cannonballs: Cannonball[] = [];

  p5.setup = () => {
    p5.createCanvas(640, 360);    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };

  p5.draw = () => {
    p5.background(150, 200, 255);

    if ((p5.frameCount  - 1) % 10 === 0) {
      cannonballs.push(new Cannonball({ x: p5.width, y: p5.height}));
      const force = p5.random(-getSize(WIDTH, HEIGHT).w / 125
      , -getSize(WIDTH, HEIGHT).w /200);
      cannonballs[cannonballs.length - 1].applyForce(new P5.Vector(force, force));
    }
    
    if (cannonballs.length > 20) cannonballs = cannonballs.slice(1);

    cannonballs.forEach(cannonball => {
      const gravity = P5.Vector.mult(new P5.Vector(0, .1), cannonball.mass);
      cannonball.applyForce(gravity);
      cannonball.update();
      cannonball.display();
    });
    p5.push();
    p5.translate(p5.width, p5.height);
    p5.rectMode(p5.CENTER);
    p5.rotate(p5.PI/4);
    p5.rect(0, 0, 60, 60);
    p5.pop();
  };

  p5.windowResized = () => {
    p5.resizeCanvas(getSize(WIDTH, HEIGHT).w, getSize(WIDTH, HEIGHT).h);
  };

  class Cannonball extends Mover {
    constructor({ x, y, c, m, r }: {x?: number, y?: number, c?: P5.Color, m?: number, r?: number }) {
      super({ p5, x: x, y: y, c, m , r});
    }
    
    override update() {
      this.velocity.add(this.acceleration);
      this.location.add(this.velocity);
  
      this.angularMomentum = this.p5.constrain(this.acceleration.y, -.5, .01);
      this.angularVelocity += this.angularMomentum;
      this.angle += this.angularVelocity;
  
      this.acceleration.mult(0);
    }

    draw() {
      p5.strokeWeight(1);
      p5.stroke(0);
      p5.fill(this.color);
      p5.ellipse(0, 0, this.radius * 2);
      p5.strokeWeight(2);
      p5.stroke(0);
      p5.line(0, 0, 0, this.radius);
    }
  }
}
