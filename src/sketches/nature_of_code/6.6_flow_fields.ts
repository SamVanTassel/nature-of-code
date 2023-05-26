import P5 from "p5";
import "../../styles.scss";
import { getSize } from "../../util";
import type { SketchHolder } from "../../types";

const sketch = (p5: P5) => {
  const WIDTH = 1000;
  const HEIGHT = 800;
  let ff: FlowField;
  let ps: ParticleSystem;
  const yoffBase = p5.random(0, 1);
  const xoffBase = p5.random(0, 1);
  let zoff = 0;

  // fun constants to change
  const offInc = .01;             // less than 1
  const zOffInc = .003;           // less than 1
  const maxSpeedMin = 2;          // greater than 0
  const maxSpeedMax = 6;          // greater than above
  const mass = 1;                 // 1 is 'no effect'
  const numParticles = 300;

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
    ff = new FlowField();
    ps = new ParticleSystem(ff);
    ps.createSystem(numParticles);
    p5.background(255, 230, 210);
  };

  p5.draw = () => {
    // p5.background(255);
    // p5.strokeWeight(6);
    // ff.drawField(); //
    ff.setField();
    ps.update();
    ps.display();
    zoff += zOffInc;
  };

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };

  class FlowField {
    field: P5.Vector[];
    cols: number;
    rows: number;
    res: number;

    constructor() {
      this.res = 10;
      this.cols = Math.floor(p5.width/this.res);
      this.rows = Math.floor(p5.height/this.res);
      this.field = new Array(this.rows * this.cols);
    }

    setField() {
      let yoff = yoffBase;
      for (let y = 0; y < this.rows; y++) {
        let xoff = xoffBase;
        for (let x = 0; x < this.cols; x++) {
          const i = x + y * this.cols;
          const theta = p5.noise(xoff, yoff, zoff)* 4 * p5.TWO_PI;
          const v = p5.createVector(p5.cos(theta), p5.sin(theta));
          v.normalize();
          v.mult(4);
          this.field[i] = v;
          xoff += offInc;
        }
        yoff += offInc;
      }
    }

    drawField() {
      this.field.forEach((cell, i) => {
        const x = i % this.cols;
        const y = Math.floor(i / this.cols);
        p5.push();
        p5.translate(this.res * x, this.res * y);
        p5.rotate(cell.heading());
        p5.line(0, 0, 0, this.res);
        p5.line(0, this.res, -this.res/5, this.res * 4/5);
        p5.line(0, this.res, this.res/5, this.res * 4/5);
        p5.pop();
      });
    }
  }

  class Particle {
    p: P5.Vector;
    v: P5.Vector;
    a: P5.Vector;
    maxspeed: number;
    prevPos: P5.Vector;
    m: number;

    constructor({ p, v, a }: { p: P5.Vector, v: P5.Vector, a: P5.Vector }) {
      this.p = p;
      this.v = v;
      this.a = a;
      this.maxspeed = p5.random(maxSpeedMin, maxSpeedMax);
      this.prevPos = this.p.copy();
      this.m = mass;
    }

    update() {
      this.v.add(this.a);
      this.v.limit(this.maxspeed);
      this.p.add(this.v);
      this.a.mult(0);
    }

    follow(ff: FlowField) {
      const x = Math.min(Math.floor(this.p.x / ff.res), ff.cols - 1);
      const y = Math.min(Math.floor(this.p.y / ff.res), ff.rows - 1);
      const i = x + y * ff.cols;
      const ffv = ff.field[i];
      this.applyForce(ffv);
    }

    applyForce(force: P5.Vector) {
      const f = force.div(this.m);
      this.a.add(f);
    }

    checkWalls() {
      if (this.p.x < 0) this.p.x = p5.width;
      if (this.p.x > p5.width) this.p.x = 0;
      if (this.p.y < 0) this.p.y = p5.height;
      if (this.p.y > p5.height) this.p.y = 0;
      this.prevPos = this.p.copy();
    }

    setPrevPos() {
      this.prevPos = this.p.copy();
    }

    display() {
      p5.line(this.p.x, this.p.y, this.prevPos.x, this.prevPos.y);
      this.setPrevPos();
    }
  }

  class ParticleSystem {
    particles: Particle[];
    ff:FlowField;

    constructor(ff: FlowField) {
      this.ff = ff;
    }

    createSystem(n: number) {
      const particles:Particle[] = [];
      for (let i = 0; i < n; i++) {
        const p = p5.createVector(p5.random(p5.width), p5.random(p5.height));
        const v = p5.createVector();
        const a = p5.createVector();
        particles.push(new Particle({ p, v, a }))
      }
      this.particles = particles;
    }

    display() {
      p5.stroke(40, 0, 0, 25);
      this.particles.forEach(p => p.display());
    }

    update() {
      this.particles.forEach(p => {
        p.checkWalls();
        p.follow(this.ff);
        p.update();
      });
    }
  }
};

export const flowFieldsSketch: SketchHolder = {
  sketch,
  info: {
    title: "6.6 - Flow Fields",
    controls: '',
    about: 'it\'s like throwing sand onto a grid of moving arrows, and each grain of sand follows the arrows while tracing its path... looks like hair',
  }
};
