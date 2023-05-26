import P5 from "p5";
import "../../styles.scss";
import { getSize } from "../../util";
import type { SketchHolder } from "../../types";

const sketch = (p5: P5) => {
  const WIDTH = 600;
  const HEIGHT = 340;

  const walls: Boundary[] = [];
  const numWalls = 2;
  let particle: Particle;
  let p2: Particle;
  const p2Speed = 3;
  let xoff = p5.random();
  let yoff = p5.random();

  let newStart: P5.Vector | null;

  const viewStates = [
    'p1',
    'p2',
    'all'
  ] as const;
  let viewIndex = 0;

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
    for (let i = 0; i < numWalls; i++) {
      walls.push(
        new Boundary(
          p5.random(p5.width), p5.random(p5.height),
          p5.random(p5.width), p5.random(p5.height))
        );
    };
    walls.push(new Boundary(-1, -1, -1, p5.height +1));
    walls.push(new Boundary(-1, -1, p5.width +1, -1));
    walls.push(new Boundary(p5.width +1, -1, p5.width+1, p5.height +1));
    walls.push(new Boundary(p5.width +1, p5.height +1, -1, p5.height +1));
    particle = new Particle(p5.width/2, p5.height/2, p5.color(255, 100));
    p2 = new Particle(p5.width/2, p5.height/2, p5.color(255, 0, 0, 100));
  };

  p5.draw = () => {
    p5.background(0);
    if (p5.mouseIsPressed && newStart) {
      walls[walls.length - 1] = new Boundary(newStart.x, newStart.y, p5.mouseX, p5.mouseY);
    }

    walls.forEach(wall => {
      wall.display();
    });

    if (viewStates[viewIndex] === 'p1' || viewStates[viewIndex] === 'all') {
      particle.update(p5.noise(xoff)* p5.width, p5.noise(yoff) * p5.height);
      xoff += .005;
      yoff += .005;
      particle.look(walls);
    }
    if (viewStates[viewIndex] === 'p2' || viewStates[viewIndex] === 'all') {
      moveP2();
      p2.look(walls);
    }

  };

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };

  p5.mousePressed = () => {
    newStart = p5.createVector(p5.mouseX, p5.mouseY);
    walls.length++;
  }

  p5.mouseReleased = () => {
    newStart = null;
  }

  const moveP2 = () => {
    if (p5.keyIsDown(37)) { // left
      p2.p.x -= p2Speed;
    }
    if (p5.keyIsDown(39)) { // right
      p2.p.x += p2Speed;
    }
    if (p5.keyIsDown(38)) { // up
      p2.p.y -= p2Speed;
    }
    if (p5.keyIsDown(40)) { // down
      p2.p.y += p2Speed;
    }
  }

  p5.keyTyped = () => {
    if (p5.key === ' ') {
      viewIndex = (viewIndex + 1) % viewStates.length;
    }
    return false;
  }


  class Boundary {
    a: P5.Vector;
    b: P5.Vector;

    constructor(x1: number, y1: number, x2: number, y2: number) {
      this.a = p5.createVector(x1, y1);
      this.b = p5.createVector(x2, y2);
    }

    display() {
      p5.stroke(255);
      p5.line(this.a.x, this.a.y, this.b.x, this.b.y);
    }
  }

  class Ray {
    p: P5.Vector;
    dir: P5.Vector;

    constructor(p: P5.Vector, angle: number) {
      this.p = p;
      this.dir = P5.Vector.fromAngle(angle);
    }

    cast(wall: Boundary) {
      // detect intersection between line segments
      // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
      const x1 = wall.a.x;
      const y1 = wall.a.y;
      const x2 = wall.b.x;
      const y2 = wall.b.y;
      const x3 = this.p.x;
      const y3 = this.p.y;
      const x4 = this.p.x + this.dir.x;
      const y4 = this.p.y + this.dir.y;

      const den = (x1 - x2)*(y3 -y4) - (y1 - y2)*(x3 - x4);
      if (den == 0) return;
      const numT = (x1 - x3)*(y3 - y4) - (y1 -y3)*(x3 - x4);
      const numU = (x1 - x3)*(y1 - y2) - (y1 - y3)*(x1 - x2);

      const t = numT/den;
      const u = numU/den;

      if (t >= 0 && t <= 1 && u >= 0) {
        const px = x1 + t*(x2 - x1);
        const py = y1 + t*(y2 - y1);
        return p5.createVector(px, py);
      }
    }

    display() {
      p5.stroke(255);
      p5.push();
      p5.translate(this.p.x, this.p.y);
      p5.line(0, 0, this.dir.x * 10, this.dir.y * 10);
      p5.pop();
    }
  }

  class Particle {
    p: P5.Vector;
    rays: Ray[];
    c: P5.Color;

    constructor(x: number, y: number, c: P5.Color) {
      this.p = p5.createVector(x, y);
      this.rays = [];
      for (let i = 0; i < 360; i+= 1) {
        this.rays.push(new Ray(this.p, p5.radians(i)));
      }
      this.c = c;
    }

    look(walls: Boundary[]) {
      this.rays.forEach(ray => {
        let closest = null;
        let minDist = Infinity;
        walls.forEach(wall => {
          const pt = ray.cast(wall);
          if (pt) {
            const d = P5.Vector.dist(this.p, pt);
            if (d < minDist) {
              minDist = d;
              closest = pt;
            }
          }
        });
        if (closest) {
          p5.stroke(this.c ? this.c : p5.color(255, 0));
          p5.line(this.p.x, this.p.y, closest.x, closest.y);
        }
      });
    }

    update(x: number, y: number) {
      this.p.x = x;
      this.p.y = y;
    }
  }
};

export const rayCastingSketch: SketchHolder = {
  sketch,
  info: {
    title: "Ray Casting",
    controls: '- click and drag the mouse to add more walls <br/> - press space to change modes <br/> - the red star may be moved with the arrow keys',
    about: 'the stars project rays in all directions, between its location and whatever wall it encounters first. this creates a simulated "line of sight" of the star',
  }
};
