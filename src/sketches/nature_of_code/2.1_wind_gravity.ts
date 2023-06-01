import P5 from "p5";
import "../../styles.scss";
import { getSize } from "../../util";
import type { InputChangeHandler, SketchHolder } from "../../types";

const externals = {
  wind: {
    current: .01,
    max: .1,
    min: 0,
  },
  gravity: {
    current: 0.2,
    max: 1.0,
    min: 0,
  }
};

let gravity: P5.Vector;
let wind: P5.Vector;

const setWind: InputChangeHandler = (e) => {
  if (e.target.valueAsNumber !== undefined) {
    externals.wind.current = e.target.valueAsNumber;
    wind = new P5.Vector(externals.wind.current, 0);
  }
};

const setGravity: InputChangeHandler = (e) => {
  if (e.target.valueAsNumber !== undefined) {
    externals.gravity.current = e.target.valueAsNumber;
    gravity = new P5.Vector(0, externals.gravity.current);
  }
};

const sketch = (p5: P5) => {
  const WIDTH = 600;
  const HEIGHT = 340;
  const movers: Mover[] = [];

  p5.setup = () => {
    p5.createCanvas(640, 360);    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
    for (let i = 0; i < 10; i++) {
      movers.push(new Mover());
    }
    gravity = p5.createVector(0, externals.gravity.current);
    wind = p5.createVector(externals.wind.current, 0);
  }

  p5.draw = () => {
    p5.background(200);
    movers.forEach(mover => {
      mover.applyForce(P5.Vector.mult(gravity, mover.mass));
      mover.applyForce(wind);
      mover.update();
      mover.checkEdges();
      mover.display();
    })
  }

  p5.mouseClicked = () => {
    movers.push(new Mover(p5.mouseX, p5.mouseY));
  }

  p5.windowResized = () => {
    p5.resizeCanvas(getSize(WIDTH, HEIGHT).w, getSize(WIDTH, HEIGHT).h);
  };

  class Mover {
    location: P5.Vector;
    velocity: P5.Vector;
    acceleration: P5.Vector;
    color: P5.Color;
    mass: number;
    radius: number;

    constructor(x?: number, y?: number) {
      this.location =  x & y ? p5.createVector(x, y) : p5.createVector(p5.random(p5.width), p5.random(p5.height));
      this.velocity = p5.createVector(0, 0);
      this.acceleration = p5.createVector(.001, .001);
      this.color = p5.color(p5.random(0, 255), p5.random(0, 255), p5.random(0, 255), p5.random(0, 255))
      this.mass = p5.random(.75, 1.25);
      this.radius = this.mass * 16;
    }

    applyForce(force: P5.Vector) {
      const f = P5.Vector.div(force, this.mass);
      this.acceleration.add(f);
    }

    update() {
      this.velocity.add(this.acceleration);
      this.location.add(this.velocity);
      this.acceleration.mult(0);
    }

    display() {
      p5.stroke(0);
      p5.fill(this.color);
      p5.ellipse(this.location.x, this.location.y, this.radius);
    }

    checkEdges() {
      if (this.location.x + this.radius/2 > p5.width) {
        this.velocity.x = - this.velocity.x;
        this.location.x = p5.width - this.radius/2;
      }
  
      if (this.location.y + this.radius/2 > p5.height) {
        this.velocity.y = - this.velocity.y;
        this.location.y = p5.height - this.radius/2
      }
    }
  }
}

export const windGravitySketch: SketchHolder = {
  sketch,
  info: {
    title: "2.1 - Wind & Gravity",
    controls: 'click to add another ball',
    about: '',
  },
  inputs: [
    {
      type: "slider",
      name: "wind",
      initialValue: externals.wind.current,
      max: externals.wind.max,
      min: externals.wind.min,
      onChange: setWind,
    },
    {
      type: "slider",
      name: "gravity",
      initialValue: externals.gravity.current,
      max: externals.gravity.max,
      min: externals.gravity.min,
      onChange: setGravity,
    },
  ],
};
