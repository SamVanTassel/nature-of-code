import P5 from "p5";
import "../../styles.scss";
import { getSize } from "../../util";
import type { SketchHolder } from "../../types";

const sketch = (p5: P5) => {
  const WIDTH = 1000;
  const HEIGHT = 600;
  let path: Path;
  let vs: Vehicle[] = [];

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
    path = new Path();
    vs.push(new Vehicle());
    p5.background(255);
    path.display();
  };

  p5.draw = () => {
    p5.noStroke();
    vs.forEach(v => {
      v.follow();
      v.update();
      v.display();
    });
    if (p5.frameCount % 50 === 0) {
      vs.push(new Vehicle());
      if (vs.length > 10) vs = vs.slice(1);
    }
  };

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };

  class Vehicle {
    p: P5.Vector;
    v: P5.Vector;
    a: P5.Vector;
    maxSpeed: number;
    maxForce: number;
    angle: number;
    radius: number;
    color: P5.Color;
    lifeSpan: number = 0;
  
    constructor() {
      this.p = p5.createVector(0, p5.random(0, p5.height));
      this.v = p5.createVector(p5.random(10, 20), p5.random(-10, 10));
      this.a = p5.createVector(.05, .05);
      this.maxSpeed = 8;
      this.maxForce = .4;
      this.angle = this.v.heading();
      this.radius = 10;
      this.color = p5.color(p5.random(50, 150), p5.random(50, 150), p5.random(50, 150))
    }

    follow() {
      // predict future location
      const predict = this.v.copy();
      predict.normalize();
      predict.mult(25);
      const predictLoc = P5.Vector.add(this.p, predict);
      // find normal point along path
      let closestDist = Infinity;
      let closestNormalPoint: P5.Vector;
      let closestStart: P5.Vector;
      let closestEnd: P5.Vector;
      // iterate over all segments in path
      for (let i = 0; i < path.points.length - 1; i++) {
        const start = path.points[i];
        const end = path.points[i + 1];
        let normalPoint = this.getNormalPoint(predictLoc, start, end);
        if (normalPoint.x < start.x || normalPoint.x > end.x) {
                normalPoint = end.copy();
             }
        if (P5.Vector.dist(predictLoc, normalPoint) < closestDist) {
          closestNormalPoint = normalPoint;
          closestDist = P5.Vector.dist(predictLoc, normalPoint);
          closestStart = start;
          closestEnd = end;
        }
      }
      // move further along the path and set a target
      const dir = P5.Vector.sub(closestEnd, closestStart);
      dir.normalize();
      dir.mult(10);
      const target = P5.Vector.add(closestNormalPoint, dir);
      // if off the path, seek the target point to get back on track
      const distance = closestDist;
      if (distance > path.radius) {
        this.seek(target);
      }
    }

    getNormalPoint(p: P5.Vector, a: P5.Vector, b: P5.Vector) {
      const ap = P5.Vector.sub(p, a);
      const ab = P5.Vector.sub(b, a);

      ab.normalize();
      ab.mult(ap.dot(ab));

      return P5.Vector.add(a, ab);
    }

    seek(t: P5.Vector) {
      const desired = P5.Vector.sub(t, this.p);
      desired.normalize();
      desired.mult(this.maxSpeed);
 
      const steeringForce = P5.Vector.sub(desired, this.v);
      this.applyForce(steeringForce);
    }

    applyForce(f: P5.Vector) {
      f.limit(this.maxForce);
      this.a.add(f);
    }

    update() {
      this.v.add(this.a);
      this.v.limit(this.maxSpeed);
      if (this.v.x < 0) this.v.x = -this.v.x;
      this.p.add(this.v);
      this.a.mult(0);
      this.lifeSpan += 2;
      this.color.setAlpha(this.lifeSpan);
    }

    display() {
      p5.push();
      p5.translate(this.p.x, this.p.y);
      p5.rotate(this.angle);
      this.draw();
      p5.pop();
    }

    draw() {
      this.angle = this.v.heading() + p5.PI/2;
      p5.fill(this.color);
      p5.ellipse(0, 0, 4);
      // p5.beginShape();
      // p5.vertex(0, -this.radius*2);
      // p5.vertex(-this.radius, this.radius*2);
      // p5.vertex(this.radius, this.radius*2);
      // p5.endShape('close');
    }
  }

  class Path {
    radius: number;
    points: P5.Vector[] = [];

    constructor() {
      this.radius = 20;
      const numPoints = 5;

      const xps = [0];
      for (let i = 0; i < numPoints - 2; i++) xps.push(p5.random(xps[xps.length -1], p5.width * (i + 1)/(numPoints - 2)));
      xps.push(p5.width);
      const yps = [];
      let off = p5.random();
      for (let i = 0; i < numPoints; i++) {
        yps.push(p5.noise(off * 100) * p5.height);
        off += .1;
      }

      for (let i = 0; i < xps.length; i++) {
        this.points.push(p5.createVector(xps[i], yps[i]));
      }
      // circle track
      // this.points.push(
      //   // p5.createVector(p5.width/5, p5.height/5),
      //   // p5.createVector(p5.width/2, p5.height/8),
      //   // p5.createVector(p5.width/5 *4, p5.height/5),
      //   // p5.createVector(p5.width/8 *7, p5.height/2),
      //   // p5.createVector(p5.width/5 * 4, p5.height/5 * 4),
      //   // p5.createVector(p5.width/2, p5.height/8 *7),
      //   // p5.createVector(p5.width/5, p5.height/5 * 4),
      //   // p5.createVector(p5.width/8, p5.height/2),
      // )
    }

    display() {
      // p5.stroke(50, 50);
      // p5.strokeWeight(this.radius * 2);
      // this.drawLine();
      p5.stroke(0, 20);
      p5.strokeWeight(1);
      this.drawLine();
    }

    drawLine() {
      p5.beginShape();
      p5.noFill();
      for (const p of this.points) {
        p5.vertex(p.x, p.y);
      }
      p5.endShape();
    }
  }
};

export const linearPathFollowingSketch: SketchHolder = {
  sketch,
  info: {
    title: "6.8 - Linear Path Following",
    controls: '',
    about: 'movers try to follow the path, with different starting positions and velocities',
  }
};
