import P5 from "p5";
import "../../styles.scss";
import { getSize } from "../../util";
import type { SketchHolder } from "../../types";

const sketch = (p5: P5) => {
  const WIDTH = 1000;
  const HEIGHT = 1000;
  let path: Path;
  let vs: Vehicle[] = [];
  const maxVehicles = 100;
  let displayPath = false;

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
    path = new Path();
    vs.push(new Vehicle());
    p5.noStroke();
  };

  p5.draw = () => {
    p5.background(255);
    if (displayPath) path.display();
    vs.forEach(v => {
      v.applyBehaviors(vs);
      v.update();
      v.display();
    });
    if (p5.frameCount % 50 === 0) {
      vs.push(new Vehicle());
      if (vs.length > maxVehicles) vs = vs.slice(1);
    }
    if (p5.frameCount < 300) {
      p5.text('press spacebar to see the path', p5.width/8*5, p5.height/20 * 19);
    }
  };

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };

  p5.keyPressed = () => {
    if (p5.keyCode === 32) {
      displayPath = !displayPath; 
      return false;
    }
  }

  p5.mouseClicked = () => {
    vs.push(new Vehicle(p5.createVector(p5.mouseX, p5.mouseY)));
  }

  class Vehicle {
    p: P5.Vector;
    v: P5.Vector;
    a: P5.Vector;
    maxSpeed: number;
    maxForce: number;
    angle: number;
    radius: number;
    color: P5.Color;
    desiredSeparation: number;
  
    constructor(p?: P5.Vector) {
      this.p =  p ? p : p5.createVector(0, p5.random(0, p5.height));
      this.v = p5.createVector(p5.random(10, 20), p5.random(-10, 10));
      this.a = p5.createVector(.05, .05);
      this.maxSpeed = p5.random(6, 10);
      this.maxForce = p5.random(.2, .8);
      this.angle = this.v.heading();
      this.radius = 6;
      this.color = p5.color(p5.random(50, 150), p5.random(50, 150), p5.random(50, 150));
      this.desiredSeparation = this.radius * 4;
    }

    applyBehaviors(vehicles: Vehicle[]) {
      const follow = this.follow();
      const separate = this.separate(vehicles);

      follow.mult(.5);
      separate.mult(3);
      this.applyForce(follow);
      this.applyForce(separate);
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
      for (let i = 0; i < path.points.length; i++) {
        let start = path.points[i];
        let end = path.points[(i + 1) % path.points.length];
        let normalPoint = this.getNormalPoint(predictLoc, start, end);

        if (
          normalPoint.x < Math.min(start.x, end.x) || 
          normalPoint.x > Math.max(start.x, end.x) ||
          normalPoint.y < Math.min(start.y, end.y) ||
          normalPoint.y > Math.max(start.y, end.y)
        ) {
          normalPoint = end.copy();
          // If we're at the end we really want the next line segment for looking ahead
          start = path.points[(i + 1) % path.points.length];
          end = path.points[(i + 2) % path.points.length]; // Path wraps around
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
        return this.seek(target);
      } else return p5.createVector();
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
      return steeringForce;
    }

    separate(boids: Vehicle[]) {
      const sum = p5.createVector();
      let count = 0;
      boids.forEach(b => {
        if (this === b) return;
        const d = P5.Vector.dist(this.p, b.p);
        if (d < this.desiredSeparation) {
          const away = P5.Vector.sub(this.p, b.p);
          away.normalize();
          away.div(d);
          sum.add(away);
          count++;
        }
      });

      if (count > 0) {
        sum.div(count);
        sum.setMag(this.maxSpeed);
        const steer = P5.Vector.sub(sum, this.v);
        return steer;
      } else return p5.createVector();
    }

    applyForce(f: P5.Vector) {
      f.limit(this.maxForce);
      this.a.add(f);
    }

    update() {
      this.v.add(this.a);
      this.v.limit(this.maxSpeed);
      this.p.add(this.v);
      this.a.mult(0);
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
      p5.beginShape();
      p5.vertex(0, -this.radius*2);
      p5.vertex(-this.radius, this.radius*2);
      p5.vertex(this.radius, this.radius*2);
      p5.endShape('close');
    }
  }

  class Path {
    radius: number;
    points: P5.Vector[] = [];

    constructor() {
      this.radius = 20;
      // circle track
      this.points.push(
        p5.createVector(p5.width/5, p5.height/5),
        p5.createVector(p5.width/2, p5.height/8),
        p5.createVector(p5.width/5 *4, p5.height/5),
        p5.createVector(p5.width/8 *7, p5.height/2),
        p5.createVector(p5.width/5 * 4, p5.height/5 * 4),
        p5.createVector(p5.width/2, p5.height/8 *7),
        p5.createVector(p5.width/5, p5.height/5 * 4),
        p5.createVector(p5.width/8, p5.height/2),
      )
    }

    display() {
      p5.stroke(50, 20);
      p5.strokeWeight(this.radius * 2);
      this.drawLine();
      p5.stroke(0, 100);
      p5.strokeWeight(1);
      this.drawLine();
      p5.noStroke();
    }

    drawLine() {
      p5.beginShape();
      p5.noFill();
      for (const p of this.points) {
        p5.vertex(p.x, p.y);
      }
      p5.endShape('close');
    }
  }
};

export const circularPathFollowingSketch: SketchHolder = {
  sketch,
  info: {
    title: "6.8b - Circular Path Following",
    controls: '',
    about: '',
  }
};
