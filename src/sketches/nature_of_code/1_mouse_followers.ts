import P5 from "p5";
import "../../styles.scss";
import { getSize } from "../../util";
import { InputChangeHandler, SketchHolder } from "../../types";
import { inbounds } from "../../util/click_helpers";

const externals = {
  speed: {
    current: 10,
    max: 50,
    min: 0,
  },
  attraction: {
    current: 0.5,
    max: 1.0,
    min: 0.05,
  }
};

const setTopSpeed: InputChangeHandler = (e) => {
  if (e.target.valueAsNumber !== undefined) {
    externals.speed.current = e.target.valueAsNumber;
  }
};

const setAttraction: InputChangeHandler = (e) => {
  if (e.target.valueAsNumber !== undefined) {
    externals.attraction.current = e.target.valueAsNumber;
  }
};

const sketch = (p5: P5) => {
  const movers: Mover[] = [];
  const WIDTH = 600;
  const HEIGHT = 340;

  p5.setup = () => {
    p5.createCanvas(getSize(WIDTH, HEIGHT).w, getSize(WIDTH, HEIGHT).h);
    for (let i = 0; i < 10; i++) {
      movers.push(new Mover());
    }
  };

  p5.draw = () => {
    p5.background(200);
    movers.forEach((mover) => {
      mover.update();
      mover.checkEdges();
      mover.display();
    });
  };

  p5.mouseClicked = () => {
    if (inbounds(p5)) movers.push(new Mover(p5.mouseX, p5.mouseY));
  };

  p5.windowResized = () => {
    p5.resizeCanvas(getSize(WIDTH, HEIGHT).w, getSize(WIDTH, HEIGHT).h);
  };

  class Mover {
    location: P5.Vector;
    velocity: P5.Vector;
    acceleration: P5.Vector;
    color: P5.Color;

    constructor(x?: number, y?: number) {
      this.location =
        x & y
          ? p5.createVector(x, y)
          : p5.createVector(p5.random(p5.width), p5.random(p5.height));
      this.velocity = p5.createVector(p5.random(-2, 2), p5.random(-2, 2));
      this.acceleration = p5.createVector(-0.001, 0.01);
      this.color = p5.color(
        p5.random(0, 255),
        p5.random(0, 255),
        p5.random(0, 255),
        p5.random(0, 255)
      );
    }

    update() {
      const mouse = p5.createVector(p5.mouseX, p5.mouseY);
      const dir = P5.Vector.sub(mouse, this.location).normalize();

      dir.mult(externals.attraction.current);

      this.acceleration = dir;

      this.velocity.add(this.acceleration);
      this.velocity.limit(externals.speed.current);
      this.location.add(this.velocity);
    }

    display() {
      p5.stroke(0);
      p5.fill(this.color);
      p5.ellipse(this.location.x, this.location.y, 16, 16);
    }

    checkEdges() {
      if (this.location.x > p5.width) {
        this.location.x = 0;
      } else if (this.location.x < 0) {
        this.location.x = p5.width;
      }

      if (this.location.y > p5.height) {
        this.location.y = 0;
      } else if (this.location.y < 0) {
        this.location.y = p5.height;
      }
    }
  }
};

export const mouseFollowersSketch: SketchHolder = {
  sketch,
  info: {
    title: "1 - Mouse Followers",
    controls: "click to add another follower",
    about: "",
  },
  inputs: [
    {
      type: "slider",
      name: "top speed",
      initialValue: externals.speed.current,
      max: externals.speed.max,
      min: externals.speed.min,
      onChange: setTopSpeed,
    },
    {
      type: "slider",
      name: "attraction",
      initialValue: externals.attraction.current,
      max: externals.attraction.max,
      min: externals.attraction.min,
      onChange: setAttraction,
    },
  ],
};
