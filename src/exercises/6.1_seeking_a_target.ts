import P5 from "p5";
import "../styles.scss";
import { getSize, Mover } from "../util";

export const seekingATargetSketch = (p5: P5) => {
  const WIDTH = 600;
  const HEIGHT = 340;
  let v: Vehicle;

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );

    v = new Vehicle(20, 20);
  };

  p5.draw = () => {
    p5.background(0, 0, 50);
    v.seek(new P5.Vector(p5.mouseX, p5.mouseY));
    v.update();
    v.display();
  };

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };

  class Vehicle extends Mover {
    maxSpeed: number;
    maxForce: number;

    constructor(x: number, y: number) {
      super({ p5, x, y, v: new P5.Vector(0, 0), r: 10, m: 10 });
      this.maxSpeed = 5;
      this.maxForce = 2;
    }

    seek(target: P5.Vector) {
      const desiredVelocity = P5.Vector.sub(target, this.location);
      const distance = desiredVelocity.mag();
      desiredVelocity.normalize();
      desiredVelocity.mult(Math.min(this.maxSpeed, distance));

      const steeringForce = P5.Vector.sub(desiredVelocity, this.velocity);
      steeringForce.limit(this.maxForce);
      this.applyForce(steeringForce);
    }

    draw() {
      this.angle = this.velocity.heading() + p5.PI/2;
      p5.fill(175);
      p5.beginShape();
      p5.vertex(0, -this.radius*2);
      p5.vertex(-this.radius, this.radius*2);
      p5.vertex(this.radius, this.radius*2);
      p5.endShape('close');

    }
  }
};
