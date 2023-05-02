import P5 from "p5";
import "../styles.scss";
import { getSize } from "../util";

export const flockingSketch = (p5: P5) => {
  const WIDTH = 600;
  const HEIGHT = 600;

  let flock: Flock;
  const numBoids = 200;

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
    flock = new Flock();
    for (let i = 0; i < numBoids; i++) {
      flock.addBoid({});
    }
    p5.noStroke();
  };

  p5.draw = () => {
    p5.background(255);
    if (p5.mouseIsPressed) {
      flock.addBoid(new Boid({ p: p5.createVector(p5.mouseX, p5.mouseY)}))
    }
    flock.run();
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
    angle: number;
    mv: number;
    mf: number;
    desiredSeparation: number;
    neighborDistance: number;

    constructor({ p, v, a, c, m, r, mv, mf }: BoidConstrutor) {
      this.mv = mv ? mv : 6;
      this.mf = mf ? mf : 4;
      this.p = p ? p :p5.createVector(p5.random(p5.width), p5.random(p5.height));
      this.v = v ? v:  p5.createVector(p5.random(-this.mv, this.mv), p5.random(-this.mv, this.mv));
      this.a = a ? a : p5.createVector();
      this.c = c ? c : p5.color(255);
      this.m = m ? m : p5.random(10, 30);
      this.r = r ? r : this.m/5;
      this.angle = this.v.heading();
      this.desiredSeparation = this.r * 4;
      this.neighborDistance = this.r * 10;
    }

    run(boids: Boid[]) {
      this.applyBehaviors(boids);
      this.update();
      this.display();
    }

    applyBehaviors(boids: Boid[]) {
      const separate = this.separate(boids);
      const join = this.join(boids);
      const align = this.align(boids);

      separate.mult(2);
      align.mult(1);
      join.mult(1);

      this.applyForce(separate);
      this.applyForce(align);
      this.applyForce(join);
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
        steer.limit(this.mf);
        return steer;
      } return p5.createVector();
    }

    align(boids: Boid[]) {
      const sum = p5.createVector();
      let count = 0;
      boids.forEach(b => {
        if (this === b) return;
        const d = P5.Vector.dist(this.p, b.p);
        if (d < this.neighborDistance) {
          sum.add(b.v);
          count++;
        }
      });

      this.c = p5.color(p5.map(count * 2, 0, numBoids, 225, 0), 200);

      if (count > 0) {
        sum.div(count);
        sum.normalize();
        sum.mult(this.mv);
        const steer = P5.Vector.sub(sum, this.v);
        steer.limit(this.mf);
        return steer;
      } return p5.createVector();
    }

    join(boids: Boid[]) {
      const sum = p5.createVector();
      let count = 0;
      boids.forEach(b => {
        if (this === b) return;
        const d = P5.Vector.dist(this.p, b.p);
        if (d < this.neighborDistance) {
          sum.add(b.p);
          count++;
        }
      });

      if (count > 0) {
        sum.div(count);
        return this.seek(sum);
      } return p5.createVector();
    }

    seek(t: P5.Vector) {
      const desired = P5.Vector.sub(t, this.p);
      desired.normalize();
      desired.mult(this.mv);
 
      const steeringForce = P5.Vector.sub(desired, this.v);
      return steeringForce;
    }

    applyForce(f: P5.Vector) {
      f.div(this.m);
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
      this.angle = this.v.heading() + p5.PI/2;

      p5.push();
      p5.translate(this.p.x, this.p.y);
      p5.rotate(this.angle);
      this.draw();
      p5.pop();
    }

    draw() {
      p5.fill(this.c);
      p5.beginShape();
      p5.vertex(0, -this.r*2);
      p5.vertex(-this.r, this.r*2);
      p5.vertex(this.r, this.r*2);
      p5.endShape('close');
    }
  }

  class Flock {
    boids: Boid[];

    constructor() {
      this.boids = [];
    }

    run() {
      this.boids.forEach(b => {
        b.run(this.boids);
      })
    }

    addBoid(options?: BoidConstrutor) {
      this.boids.push(new Boid(options ? options : {}));
    }
  }
};
