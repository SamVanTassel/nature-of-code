import P5 from "p5";
import "../styles.scss";
import { getSize } from "../util";

export const groupBehaviorSketch = (p5: P5) => {
  const WIDTH = 600;
  const HEIGHT = 600;

  const boids: Boid[] = [];
  const numBoids = 200;

  const bg = 0;

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
    for (let i = 0; i < numBoids; i++) {
      boids.push(new Boid({}));
    }
    p5.noStroke();
  };

  p5.draw = () => {
    p5.background(bg);
    if (p5.mouseIsPressed) boids.push(new Boid({ p: p5.createVector(p5.mouseX, p5.mouseY)}));
    boids.forEach(b => {
      b.applyBehaviors(boids);
      b.update();
      b.display();
    });
  };

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };

  interface BoidConstrutor {
    p?: P5.Vector
    v?: P5.Vector;
    a?: P5.Vector;
    c?: P5.Color;
    m?: number;
    r?: number;
    mv?: number;
    mf?: number;
  }

  class Boid {
    p: P5.Vector;
    v: P5.Vector;
    a: P5.Vector;
    c: P5.Color;
    m: number;
    r: number;
    mv: number;
    mf: number;
    desiredSeparation: number;
    desiredCohesion: number;

    constructor({ p, v, a, c, m, r, mv, mf }: BoidConstrutor) {
      this.mv = mv ? mv : 4;
      this.mf = mf ? mf : 4;
      this.p = p ? p :p5.createVector(p5.random(p5.width), p5.random(p5.height));
      this.v = v ? v:  p5.createVector(p5.random(-this.mv, this.mv), p5.random(-this.mv, this.mv));
      this.a = a ? a : p5.createVector();
      this.c = c ? c : p5.color(255);
      this.m = m ? m : p5.random(10, 40);
      this.r = r ? r : this.m/2;
      this.desiredSeparation = this.r * 2;
      this.desiredCohesion = this.r * 2.5;
    }

    applyBehaviors(boids: Boid[]) {
      const separate = this.separate(boids);
      const join = this.join(boids);
      const seek = this.seek(p5.createVector(p5.mouseX, p5.mouseY));

      separate.mult(2);
      join.mult(.75);
      seek.mult(1);

      this.applyForce(separate);
      this.applyForce(join);
      this.applyForce(seek);
    }

    separate(boids: Boid[]) {
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
        sum.setMag(this.mv);
        const steer = P5.Vector.sub(sum, this.v);
        return steer;
      } return p5.createVector();
    }

    join(boids: Boid[]) {
      const sum = p5.createVector();
      let count = 0;
      boids.forEach(b => {
        if (this === b) return;
        const d = P5.Vector.dist(this.p, b.p);
        if (d > this.desiredCohesion) {
          const toward = P5.Vector.sub(b.p, this.p);
          toward.normalize();
          toward.mult(d);
          sum.add(toward);
          count++;
        }
      });

      if (count > 0) {
        sum.div(count);
        sum.setMag(this.mv);
        const steer = P5.Vector.sub(sum, this.v);
        return steer;
      } return p5.createVector();
    }

    seek(t: P5.Vector) {
      const desired = P5.Vector.sub(t, this.p);
      this.c = p5.color(p5.map(desired.mag(), 0, p5.width/2, 255, bg + 25, true));
      desired.normalize();
      desired.mult(20/this.r)
      desired.limit(this.mv);
 
      const steeringForce = P5.Vector.sub(desired, this.v);
      return steeringForce;
    }

    applyForce(f: P5.Vector) {
      f.div(this.m);
      f.limit(this.mf);
      this.a.add(f);
    }

    update() {
      this.v.add(this.a);
      this.v.limit(this.mv);
      this.p.add(this.v);
      this.checkEdges();
      this.a.mult(0);
    }

    checkEdges() {
      if (this.p.x < -this.r) this.p.x = p5.width +this.r;
      if (this.p.x > p5.width + this.r) this.p.x = -this.r;
      if (this.p.y < -this.r) this.p.y = p5.height + this.r;
      if (this.p.y > p5.height + this.r) this.p.y = -this.r;
    }

    display() {
      p5.fill(this.c);
      p5.ellipse(this.p.x, this.p.y, this.r);
    }
  }
};
