import P5 from "p5";
import "../../styles.scss";
import { getSize, QuadTree, Rectangle } from "../../util";
import type { SketchHolder } from "../../types";

const sketch = (p5: P5) => {
  const WIDTH = 600;
  const HEIGHT = 600;

  let quadTree: QuadTree;

  let flock: Flock;
  const numBoids = 200;

  let frameRates = [];
  let showData = false;

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
    quadTree = new QuadTree(new Rectangle({
      x: p5.width/2,
      y: p5.height/2,
      w: p5.width/2,
      h: p5.height/2,
    }), 10);

    flock = new Flock(quadTree);
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
    showData && showFrameRateData();
  };

  p5.keyPressed = () => {
    if (p5.keyCode === 32) showData = !showData;
  }

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };

  const showFrameRateData = () => {
    frameRates[p5.frameCount % 10] = p5.frameRate();
    const averageFrameRate = frameRates.reduce((a, b) => a +b)/frameRates.length;
    const frameRateHeight = p5.map(averageFrameRate, 0, 75, p5.height, 0);
    p5.stroke(255, 0, 0);
    p5.strokeWeight(3);
    p5.line(0, frameRateHeight, 20, frameRateHeight);
    p5.noStroke();
    p5.fill(0);
    p5.text(flock.boids.length, p5.width - 40, p5.height - 10);
    p5.text(Math.round(p5.frameRate()), 2, frameRateHeight - 10);
  }

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
    quadTree: QuadTree;

    constructor(quadTree: QuadTree) {
      this.boids = [];
      this.quadTree = quadTree;
    }

    constructQuadTree() {
      this.quadTree.clear();
      this.boids.forEach(b => {
        this.quadTree.insert({ object: b, x: b.p.x, y: b.p.y })
      });
      p5.noStroke();
    }

    getClosestBoids(b: Boid) {
      const area = new Rectangle({ x: b.p.x, y: b.p.y, w: b.r * 20, h: b.r * 20 });
      return this.quadTree.query(area, []);
    }

    run() {
      this.constructQuadTree();
      this.boids.forEach(b => {
        // b.run(this.boids);
        b.run(this.getClosestBoids(b).map(p => p.object));
      })
    }

    addBoid(options?: BoidConstrutor) {
      this.boids.push(new Boid(options ? options : {}));
    }
  }
};

export const flockingSketch: SketchHolder = {
  sketch,
  info: {
    title: "6.13 - Flocking",
    controls: 'hold the mouse button to add more boids',
    about: 'this is why i wanted to do this book. each boid tries to stay separate from nearby boids, tries to stay in a group with nearby boids, and tries to fly in the same direction as nearby boids',
  }
};
