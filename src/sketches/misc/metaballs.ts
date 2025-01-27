import P5 from "p5";
import "../../styles.scss";
import { getSize } from "../../util";
import { InputChangeHandler, SketchHolder } from "../../types";
import { Hsluv } from "../../../node_modules/hsluv/dist/hsluv.mjs";
import { marchingSquares } from "./marching_squares";

const externals = {
  glow: {
    current: 100,
    max: 200,
    min: 20,
    step: 10,
  },
};

const setGlow: InputChangeHandler = (e) => {
  if (e.target.valueAsNumber !== undefined) {
    externals.glow.current = e.target.valueAsNumber;
  }
};

const sketch = (p5: P5) => {
  const WIDTH = 600;
  const HEIGHT = 340;

  const NUM_BALLS = p5.floor(p5.random(3, 5));
  const metaballs: Metaball[] = []; 

  let field: number[][];
  const RES = 5;
  let MAX_DIST: number = 1;
  let renderMode: 'GLOW'|'MARCHING_SQUARES' = 'GLOW';

  p5.keyPressed = () => {
    if (p5.key === ' ') renderMode = renderMode === 'GLOW' ? 'MARCHING_SQUARES' : 'GLOW';
  }

  const hsluv = new Hsluv();

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
    for (let i = 0; i < NUM_BALLS; i++) {
      metaballs.push(new Metaball(
        p5.random(0, p5.width),
        p5.random(0, p5.height),
        p5.random(p5.width / 12, p5.width / 5)));
    }

    MAX_DIST = p5.dist(0, 0, p5.width, p5.height);

    p5.pixelDensity(1);
  };

  p5.draw = () => {
    p5.background(0);
    for (let i = 0; i < NUM_BALLS; i++) {
      metaballs[i].update();
    }
    switch (renderMode) {
      case 'GLOW':
        drawPixels();
        break;
      case 'MARCHING_SQUARES':
        setNumberField(field, RES);
        marchingSquares(p5, RES, field, p5.color(255), 1);
        break;
    }
  };

  const setNumberField = (current: number[][]|undefined, res: number) => {
    if (!current) field = new Array(Math.floor(p5.width/res) + 1).fill(0).map(_ => new Array(Math.floor(p5.height/res) + 1).fill(0));
    for (let i = 0; i < field.length; i++) {
      for (let j = 0; j < field[j].length; j++) {
        const y = j * res;
        const x = i * res;
        field[j][i] = 0;
        for (let b of metaballs) {
          field[j][i] += (b.r/p5.dist(x, y, b.pos.x, b.pos.y) * externals.glow.current) / MAX_DIST;
        }
      }
    }
  }

  const drawPixels = () => {
    p5.loadPixels();
    for (let x = 0; x < p5.width; x++) {
      for (let y = 0; y < p5.height; y++) {
        let rd = 0;
        let gd = 0;
        let bd = 0;
        let d = 0;
        for (let b of metaballs) {
          const dist = b.r/p5.dist(x, y, b.pos.x, b.pos.y) * externals.glow.current;
          rd += dist * b.color.r;
          gd += dist * b.color.g;
          bd += dist * b.color.b;
        }
        const i = x + y * p5.width;
        p5.pixels[i * 4] = rd;
        p5.pixels[i * 4 + 1] = gd;
        p5.pixels[i * 4 + 2] = bd;
        p5.pixels[i * 4 + 3] = 255;
      }
    }
    p5.updatePixels();
  };

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };

  class Metaball {
    pos: P5.Vector;
    velocity: P5.Vector;
    r: number;
    color: { r: number, b: number, g: number } = { r: 0, g: 0, b: 0 };
  
    constructor(x: number, y: number, radius: number) {
      this.pos = p5.createVector(x, y);
      this.velocity = p5.createVector(p5.random(-4, 4), p5.random(-4, 4));
      this.r = radius;
      if (this.pos.x <= this.r/2) this.pos.x = this.r/2 + 1;
      if (this.pos.x >= p5.width - this.r/2) this.pos.x = p5.width - this.r/2 - 1;
      if (this.pos.y <= this.r/2) this.pos.y = this.r/2 + 1;
      if (this.pos.y >= p5.height - this.r/2) this.pos.y = p5.height - this.r/2 - 1;
      this.setColor();
    }

    setColor() {
      hsluv.hsluv_h = p5.random(0, 360);
      hsluv.hsluv_s = 100;
      hsluv.hsluv_l = p5.random(30, 60);
      hsluv.hsluvToRgb();
      this.color.r = hsluv.rgb_r;
      this.color.g = hsluv.rgb_g;
      this.color.b = hsluv.rgb_b;
    }

    update() {
      this.pos.add(this.velocity);
      if (this.pos.x < this.r/2 || this.pos.x > p5.width - this.r/2) this.velocity.x *= -1;
      if (this.pos.y < this.r/2 || this.pos. y> p5.height -this.r/2) this.velocity.y *= -1;
    }

    draw() {
      p5.stroke('white');
      p5.strokeWeight(2);
      p5.noFill();
      p5.circle(this.pos.x, this.pos.y, this.r);
    }
  }
};

export const metaballsSketch: SketchHolder = {
  sketch,
  info: {
    title: 'Metaballs',
    controls: 'press space to switch between glow and marching squares render modes',
    about: 'simple visualzation of distance from moving points. fun, glowy, globby results',
  },
  inputs: [
    {
      type: "slider",
      name: "glow",
      initialValue: externals.glow.current,
      max: externals.glow.max,
      min: externals.glow.min,
      step: externals.glow.step,
      onChange: setGlow,
    },
  ]
}
