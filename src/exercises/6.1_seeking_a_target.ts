import P5, { Vector } from "p5";
import "../styles.scss";
import { getSize, Mover } from "../util";

export const seekingATargetSketch = (p5: P5) => {
  const WIDTH = 1000;
  const HEIGHT = 1000;
  const vList: Vehicle[] = [];
  // greater than 1
  const numVehicles = 3;

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );

    for (let i = 0; i < numVehicles; i++) {
      vList.push(new Vehicle(p5.random(0, p5.width), p5.random(0, p5.height)));
    }
  };

  p5.draw = () => {
    p5.background(0, 0, 50);
    vList.forEach(v1 => {
      let nearest: { dist: number, t?: Vector} = {
        dist: Infinity,
        t: undefined,
      }
      if (!p5.mouseIsPressed) {
        vList.forEach(v2 => {
          if (v1 === v2) return;
          const v2NextLocation = P5.Vector.add(v2.location, v2.velocity)
          const dist = P5.Vector.dist(v1.location, v2NextLocation);
          if (nearest.dist > dist) {
            nearest.dist = dist;
            nearest.t = v2NextLocation;
          };
        });
      }
      const mouseLocation = p5.createVector(p5.mouseX, p5.mouseY);
      const dToM = P5.Vector.dist(v1.location, mouseLocation);
      if (nearest.dist > dToM) {
        nearest.dist = dToM;
        nearest.t = mouseLocation;
      };
      v1.seek(nearest.t);
    });
    vList.forEach(v => {
      v.update();
      v.display();
    });
  };

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };

  p5.mouseReleased = () => {
    vList.forEach(v => v.velocity = p5.createVector(p5.random(-10, 10), p5.random(-10, 10)));
  }

  class Vehicle extends Mover {
    maxSpeed: number;
    maxForce: number;
    stopRadius: number;
    isWandering: boolean;
    perlinSeed: number;

    constructor(x: number, y: number) {
      super({ p5, x, y, v: new P5.Vector(0, 0), r: 10, m: 10 });
      this.maxSpeed = 8;
      this.maxForce = 3;
      this.stopRadius = 40;
      this.perlinSeed = p5.random();
    }

    seek(target: P5.Vector) {
      const desiredVelocity = P5.Vector.sub(target, this.location);
      const distance = desiredVelocity.mag();
      desiredVelocity.normalize();
      if (distance < this.stopRadius) {
        const m = p5.map(distance, 0, this.stopRadius, 0, this.maxSpeed);
        desiredVelocity.mult(m);
      }
      else desiredVelocity.mult(this.maxSpeed);
 
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
