import P5 from "p5";
import "../../styles.scss";
import { getSize } from "../../util";
import type { InputChangeHandler, SketchHolder } from "../../types";

const externals = {
  res: {
    current: 1,
    max: 10,
    min: .25,
    step: .5,
  },
  fov: {
    current: 60,
    max: 360,
    min: 10,
    step: 10,
  },
};

const setRes: InputChangeHandler = (e) => {
  if (e.target.valueAsNumber !== undefined) {
    externals.res.current = e.target.valueAsNumber;
  }
};

const setFov: InputChangeHandler = (e) => {
  if (e.target.valueAsNumber !== undefined) {
    externals.fov.current = e.target.valueAsNumber;
  }
};

const sketch = (p5: P5) => {
  const WIDTH = 1000;
  const HEIGHT = 500;

  const walls: Boundary[] = [];
  const numWalls = 2;
  let p2: Particle;
  const p2Speed = 3;
  let fishEye = false;

  let newStart: P5.Vector | null;

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
    for (let i = 0; i < numWalls; i++) {
      walls.push(
        new Boundary(
          p5.random(p5.width/2), p5.random(p5.height/2),
          p5.random(p5.width/2), p5.random(p5.height/2))
        );
    };
    // enclose right side with walls
    walls.push(new Boundary(-1, -1, -1, p5.height+1, p5.color(255)));
    walls.push(new Boundary(-1, -1, p5.width/2 + 1, -1, p5.color(255)));
    walls.push(new Boundary(p5.width/2 +1, -1, p5.width/2 +1, p5.height+1, p5.color(255)));
    walls.push(new Boundary(p5.width/2 +1, p5.height+1, -1, p5.height+1, p5.color(255)));
    p2 = new Particle(p5.width/4, p5.height/2, p5.color(255, 100));
  };

  p5.draw = () => {
    p5.background(0);
    if (p5.mouseIsPressed && newStart && p5.mouseX <= p5.width/2) {
      walls[walls.length - 1] = new Boundary(newStart.x, newStart.y, p5.mouseX, p5.mouseY);
    }

    walls.forEach(wall => {
      wall.display();
    });

    p2.setRes();
    p2.setFov();

    if (p5.keyIsDown(p5.LEFT_ARROW)) {
      p2.rotate(-.05);
    }
    if (p5.keyIsDown(p5.RIGHT_ARROW)) {
      p2.rotate(.05);
    }
    if (p5.keyIsDown(87)) {
      p2.move('forward');
    }
    if (p5.keyIsDown(83)) {
      p2.move('backward');
    }
    if (p5.keyIsDown(65)) {
      p2.move('left');
    }
    if (p5.keyIsDown(68)) {
      p2.move('right');
    }
    p2.look(walls);

  };

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };

  p5.mousePressed = () => {
    if (p5.mouseX < p5.width/2) {
      newStart = p5.createVector(p5.mouseX, p5.mouseY);
      walls.length++;
    }
  }

  p5.mouseReleased = () => {
    newStart = null;
  }

  p5.keyTyped = () => {
    if (p5.key === 'f') {
      fishEye = !fishEye;
    }
  }

  class Boundary {
    a: P5.Vector;
    b: P5.Vector;
    c: P5.Color;

    constructor(x1: number, y1: number, x2: number, y2: number, c?: P5.Color) {
      this.a = p5.createVector(x1, y1);
      this.b = p5.createVector(x2, y2);
      this.c = c ? c : p5.color(`hsb(${p5.floor(p5.random(360))}, ${p5.floor(p5.random(30, 100))}%, 100%)`);
    }

    display() {
      p5.stroke(255);
      p5.stroke(this.c);
      p5.line(this.a.x, this.a.y, this.b.x, this.b.y);
    }
  }

  class Ray {
    p: P5.Vector;
    dir: P5.Vector;
    heading: number;
    c: P5.Color;

    constructor(p: P5.Vector, angle: number) {
      this.p = p;
      this.dir = P5.Vector.fromAngle(angle);
      this.heading = angle;
      this.c = p5.color(255);
    }

    setAngle(angle: number) {
      this.dir = P5.Vector.fromAngle(angle);
      this.heading = angle;
    }

    setColor(c: P5.Color) {
      this.c = c;
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
  }

  class Particle {
    fov: number;
    p: P5.Vector;
    rays: Ray[];
    c: P5.Color;
    heading: number;
    res: number;

    constructor(x: number, y: number, c: P5.Color) {
      this.p = p5.createVector(x, y);
      this.rays = [];
      this.fov = externals.fov.current;
      this.res = externals.res.current;
      for (let i = -this.fov/2; i < this.fov/2; i+= 1/this.res) {
        this.rays.push(new Ray(this.p, p5.radians(i)));
      }
      this.c = c;
      this.heading = 0;
    }

    setRes() {
      if (this.res !== externals.res.current) {
        this.res = externals.res.current;
        this.rays = [];
        for (let i = -this.fov/2; i < this.fov/2; i+= 1/this.res) {
          this.rays.push(new Ray(this.p, p5.radians(i)));
          this.rays.forEach((ray, i) => {
            ray.setAngle(this.heading - p5.radians(this.fov/2) + p5.radians(i/this.res));
          })
        }
      }
    }

    setFov() {
      if (this.fov !== externals.fov.current) {
        this.fov = externals.fov.current;
        this.rays = [];
        for (let i = -this.fov/2; i < this.fov/2; i+= 1/this.res) {
          this.rays.push(new Ray(this.p, p5.radians(i)));
          this.rays.forEach((ray, i) => {
            ray.setAngle(this.heading - p5.radians(this.fov/2) + p5.radians(i/this.res));
          });
        }
      }
    }

    rotate(angle: number) {
      this.heading += angle;
      this.rays.forEach((ray, i) => {
        ray.setAngle(this.heading - p5.radians(this.fov/2) + p5.radians(i/this.res));
      })
    }

    look(walls: Boundary[]) {
      const scene: { c: P5.Color, num: number }[] = [];
      this.rays.forEach((ray, i) => {
        let closest = null;
        let minDist = Infinity;
        walls.forEach(wall => {
          const pt = ray.cast(wall);
          if (pt) {
            let d = P5.Vector.dist(this.p, pt);
            if (!fishEye) {
              const a = ray.heading - this.heading;
              d *= p5.cos(a);
            }
            if (d < minDist) {
              minDist = d;
              closest = pt;
              ray.setColor(wall.c);
            }
          }
        });
        if (closest) {
          p5.stroke(ray.c);
          p5.line(this.p.x, this.p.y, closest.x, closest.y);
          scene[i] = { c: p5.color(ray.c.toString()), num: minDist };
        }
      });
      this.renderScene(scene);
    }

    renderScene(scene: { c: P5.Color, num: number }[]) {
      const maxWallHeight = p5.height * 1.1;
      p5.push();
      p5.translate(p5.width/2, p5.height/2);
      scene.forEach((obj, i) => {
        const lineWidth = p5.width/ (2 * this.rays.length);
        const maxView = p5.width/2;
        const brightness = p5.map(obj.num, 0, maxView, 255, 0, true)
        obj.c.setAlpha(brightness);
        p5.stroke(obj.c);
        const wallHeight = p5.map(obj.num, 0, maxView, maxWallHeight, 0);
        p5.line(lineWidth * i, -wallHeight * 1/2, lineWidth * i, wallHeight * 1/2);
      });
      p5.pop();
    }

    checkWalls() {
      if (this.p.x < 0) this.p.x = 0;
      if (this.p.y < 0) this.p.y = 0;
      if (this.p.x > p5.width/2) this.p.x = p5.width/2;
      if (this.p.y > p5.height) this.p.y = p5.height;
    }

    move(direction: 'forward'|'backward'|'left'|'right') {
      const map = {
        forward: 0,
        backward: p5.PI,
        left: -p5.PI/2,
        right: p5.PI/2,
      };
      this.p.add(P5.Vector.fromAngle(this.heading + map[direction]).mult(p2Speed));
      this.checkWalls();
      this.update(this.p.x, this.p.y);
    }

    update(x: number, y: number) {
      this.p.x = x;
      if (x > p5.width/2) this.p.x = 0
      if (x < 0) this.p.x = p5.width/2;
      this.p.y = y;
      if (y > p5.height) this.p.y = 0;
      if (y < 0) this.p.y = p5.height;
    }
  }
};

export const rayCastingPlusSketch: SketchHolder = {
  sketch,
  info: {
    title: "Ray Casting Plus",
    controls: '- click and drag the mouse to add more walls <br/> - use the arrow keys to rotate camera <br/> - use wasd to move <br/> - press f to enable fisheye view',
    about: 'each ray cast to a wall corresponds to a vertical line on the right half of the screen. the height and brightness of the line are determined by the length of the ray. shorter rays create taller, brighter lines, which together create a simulated first person view',
  },
  inputs: [
    {
      type: "slider",
      name: "resolution",
      initialValue: externals.res.current,
      max: externals.res.max,
      min: externals.res.min,
      step: externals.res.step,
      onChange: setRes,
    },
    {
      type: "slider",
      name: "field of vision",
      initialValue: externals.fov.current,
      max: externals.fov.max,
      min: externals.fov.min,
      step: externals.fov.step,
      onChange: setFov,
    },
  ],
};
