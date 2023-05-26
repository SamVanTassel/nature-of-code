import P5 from "p5";
import "../../styles.scss";
import { getSize, Mover } from "../../util";
import type { SketchHolder } from "../../types";

const sketch = (p5: P5) => {
  const WIDTH = 600;
  const HEIGHT = 600;
  const vList: Vehicle[] = [];
  const numVehicles = 15;

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
    p5.background(200);
    vList.forEach(v => {
      v.wander();
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

  p5.mouseClicked = () => {
    vList.push(new Vehicle(p5.mouseX, p5.mouseY));
  }

  class Vehicle extends Mover {
    maxSpeed: number;
    maxForce: number;
    stopRadius: number;
    wanderDistance: number;
    wanderRadius: number;
    perlinSeed: number;

    constructor(x: number, y: number) {
      super({ p5, x, y, v: p5.createVector(), r: 5, m: 5 });
      const val = p5.random(10);
      this.maxSpeed = p5.map(val, 0, 10, 5, 2);
      this.maxForce = p5.map(val, 0, 10, 4, 2);
      this.radius = p5.map(val, 0, 10, 3, 8);
      this.color = p5.color(p5.map(val, 0, 10, 55, 175));
      this.stopRadius = p5.map(val, 0, 10, 100, 50);
      this.perlinSeed = p5.random();
      this.angle = this.velocity.heading();
      this.wanderDistance = p5.map(val, 0, 10, 3, 50);
      this.wanderRadius = this.wanderDistance * .3;
    }
    
    wander() {
      this.checkWalls();
      const theta = p5.noise(this.perlinSeed) * 4 * p5.TWO_PI;
      this.perlinSeed += .01;
      const x = this.wanderRadius * p5.cos(theta);
      const y = this.wanderRadius * p5.sin(theta);
      const centerPoint = P5.Vector.add(this.location, this.velocity.copy().normalize().mult(this.wanderDistance));
      const desiredLocation = P5.Vector.add(centerPoint, p5.createVector(x, y));

      // view wander circle
      // p5.fill(0, 0)
      // p5.ellipse(centerPoint.x, centerPoint.y, this.wanderRadius * 2)
      // p5.line(this.location.x, this.location.y, centerPoint.x, centerPoint.y);
      // p5.line(centerPoint.x, centerPoint.y, desiredLocation.x, desiredLocation.y)

      const desiredVelocity = P5.Vector.sub(desiredLocation, this.location);
      desiredVelocity.normalize();
      desiredVelocity.mult(this.maxSpeed);
      const steeringForce = P5.Vector.sub(desiredVelocity, this.velocity);
      steeringForce.limit(this.maxForce);
      this.applyForce(steeringForce);
    }

    checkWalls() {
      let prox = false;
      let desiredV: P5.Vector;
      if (this.location.x < 25) {
        desiredV = p5.createVector(this.maxSpeed, this.velocity.y);
        prox = true;
      }
      if (this.location.x > p5.width - 25) {
        desiredV = p5.createVector(-this.maxSpeed, this.velocity.y);
        prox = true;
      }
      if (this.location.y < 25) {
        desiredV = p5.createVector(this.velocity.x, this.maxSpeed);
        prox = true;
      } 
      if (this.location.y > p5.height - 25) {
        desiredV = p5.createVector(this.velocity.x, -this.maxSpeed);
        prox = true;
      }
      if (prox && desiredV) {
        const steer = P5.Vector.sub(desiredV, this.velocity);
        steer.limit(this.maxForce);
        this.applyForce(steer);
        this.perlinSeed += .5;
      }
      return prox;
    }

    draw() {
      this.angle = this.velocity.heading() + p5.PI/2;
      const log = Math.floor(this.velocity.heading() * 100) / 100;
      if (Math.abs(log) < .5) console.log(log);
      p5.fill(this.color);
      p5.beginShape();
      p5.vertex(0, -this.radius*2);
      p5.vertex(-this.radius, this.radius*2);
      p5.vertex(this.radius, this.radius*2);
      p5.endShape('close');
    }
  }
};

export const wanderersSketch: SketchHolder = {
  sketch,
  info: {
    title: "6.4 - Wanderers",
    controls: 'click to add a wanderer',
    about: 'the wanderers avoid the walls and move in a semi-random way',
  }
};
