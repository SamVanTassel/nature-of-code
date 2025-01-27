import P5 from "p5";
import "../../styles.scss";
import { getSize } from "../../util";
import { InputChangeHandler, SketchHolder } from "../../types";
import { Hsluv } from "../../../node_modules/hsluv/dist/hsluv.mjs";
import { logMap } from "../../util/math";

const externals = {
  res: {
    current: 50,
    max: 100,
    min: 1,
    step: 1,
  },
  t: {
    current: 0.01,
    max: 0.05,
    min: 0,
    step: 0.001,
  },
};

const setRes: InputChangeHandler = (e) => {
  if (e.target.valueAsNumber !== undefined) {
    externals.res.current = e.target.valueAsNumber;
    resetFieldParams();
  }
};

const setT: InputChangeHandler = (e) => {
  if (e.target.valueAsNumber !== undefined) {
    externals.t.current = e.target.valueAsNumber;
  }
};

let p5Handler: P5;
const hsluv = new Hsluv();
let viewIndex: number = 0;
const viewStyles = ["RECT", "POINT", "NONE"];
const GRADIENT_DEPTH = 50;
const MIN_RES = 4;
const MAX_RES = 60;

// COLOR
let present: number[];
let absent: number[];
let border: P5.Color;
let background: P5.Color;

function resetColorScheme() {
  [present, absent, border, background] = setColorScheme();
  setGradient(GRADIENT_DEPTH);
}

function setColorScheme(): [number[], number[], P5.Color, P5.Color] {
  if (!p5Handler) return;
  const randomHue = Math.floor(Math.random() * 360);
  const contrastingHue = (randomHue + 180) % 360;
  // present
  hsluv.hsluv_h = randomHue;
  hsluv.hsluv_s = 90;
  hsluv.hsluv_l = 50;
  hsluv.hsluvToRgb();
  const present = [hsluv.rgb_r * 255, hsluv.rgb_g * 255, hsluv.rgb_b * 255];
  // absent
  hsluv.hsluv_h = randomHue;
  hsluv.hsluv_s = 20;
  hsluv.hsluv_l = 10;
  hsluv.hsluvToRgb();
  const absent = [hsluv.rgb_r * 255, hsluv.rgb_g * 255, hsluv.rgb_b * 255];
  // border
  hsluv.hsluv_h = contrastingHue;
  hsluv.hsluv_s = 100;
  hsluv.hsluv_l = 90;
  hsluv.hsluvToRgb();
  const border = p5Handler.color(
    hsluv.rgb_r * 255,
    hsluv.rgb_g * 255,
    hsluv.rgb_b * 255
  );
  // background
  hsluv.hsluv_h = contrastingHue;
  hsluv.hsluv_s = 20;
  hsluv.hsluv_l = 5;
  hsluv.hsluvToRgb();
  const background = p5Handler.color(
    hsluv.rgb_r * 255,
    hsluv.rgb_g * 255,
    hsluv.rgb_b * 255
  );
  return [present, absent, border, background];
}
// interpolated colors precalculated and stored here
// to reduce calculations during draw
let gradient: P5.Color[] = [];
function setGradient(numValues: number) {
  gradient.length = 0;
  for (let i = 0; i < numValues; i++) {
    gradient.push(
      p5Handler.color(
        p5Handler.lerp(present[0], absent[0], i / numValues),
        p5Handler.lerp(present[1], absent[1], i / numValues),
        p5Handler.lerp(present[2], absent[2], i / numValues)
      )
    );
  }
}

function getColor(n: number) {
  return gradient[Math.floor(gradient.length - n * gradient.length)];
}

// FIELD DIMENSIONS
let res: number;
let field: number[][];
let rows: number, cols: number;
function resetFieldParams() {
  if (!p5Handler) return;
  res = logMap(externals.res.current, 1, 100, MAX_RES, MIN_RES, 0.0000005);
  rows = Math.floor(p5Handler.height / res) + 2;
  cols = Math.floor(p5Handler.width / res) + 2;
  field = new Array(rows).fill(0).map((el) => new Array(cols).fill(0));
}

const sketch = (p5: P5) => {
  const WIDTH = 800;
  const HEIGHT = 500;

  let off: number;

  p5.keyPressed = () => {
    if (p5.key === " ") viewIndex = (viewIndex + 1) % viewStyles.length;
  };

  p5.setup = () => {
    p5.createCanvas(getSize(WIDTH, HEIGHT).w, getSize(WIDTH, HEIGHT).h);
    p5Handler = p5;

    resetFieldParams();
    resetColorScheme();

    off = p5.random(0, 100);
  };

  p5.draw = () => {
    p5.background(background);
    // update nosie values for data array
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        field[i][j] = p5.noise(
          (i * res) / 100 + off,
          (j * res) / 100 + off,
          off
        );
      }
    }
    off += externals.t.current;
    // draw data points
    if (viewStyles[viewIndex] !== "NONE") {
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const x = j * res;
          const y = i * res;
          const color = getColor(field[i][j]);
          if (viewStyles[viewIndex] === "POINT") {
            p5.stroke(color);
            p5.strokeWeight(res * field[i][j]);
            p5.point(x, y);
          }
          if (viewStyles[viewIndex] === "RECT") {
            p5.fill(color);
            p5.noStroke();
            p5.rect(x - 0.5 * res, y - 0.5 * res, res, res);
          }
        }
      }
    }
    // draw outlines
    marchingSquares(p5, res, field, border);
  };

  p5.windowResized = () => {
    p5.resizeCanvas(getSize(WIDTH, HEIGHT).w, getSize(WIDTH, HEIGHT).h);
  };
};

export function marchingSquares(p5: P5, res: number, field: number[][], color: P5.Color, weight?: number) {
  const rows = field.length;
  if (!field[0]) return;
  const cols = field[0].length;
  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < cols - 1; j++) {
      const x = j * res;
      const y = i * res;
      const I = field[i][j];
      const II = field[i][j + 1];
      const III = field[i + 1][j];
      const IV = field[i + 1][j + 1];
      const aOffset = p5.createVector(p5.map(I - II, -1, 1, x, x + res), y);
      const bOffset = p5.createVector(
        x + res,
        p5.map(II - IV, -1, 1, y, y + res)
      );
      const cOffset = p5.createVector(
        p5.map(III - IV, -1, 1, x, x + res),
        y + res
      );
      const dOffset = p5.createVector(x, p5.map(I - III, -1, 1, y, y + res));
      const a = aOffset;
      const b = bOffset;
      const c = cOffset;
      const d = dOffset;
      p5.strokeWeight(res * (weight ? weight : 0.1));
      p5.stroke(color);
      const n = conv(I, II, III, IV);
      switch (n) {
        case 0:
          break;
        case 1:
          p5.line(a.x, a.y, d.x, d.y);
          break;
        case 2:
          p5.line(a.x, a.y, b.x, b.y);
          break;
        case 3:
          p5.line(d.x, d.y, b.x, b.y);
          break;
        case 4:
          p5.line(c.x, c.y, d.x, d.y);
          break;
        case 5:
          p5.line(a.x, a.y, c.x, c.y);
          break;
        case 6:
          p5.line(a.x, a.y, b.x, b.y);
          p5.line(d.x, d.y, c.x, c.y);
          break;
        case 7:
          p5.line(b.x, b.y, c.x, c.y);
          break;
        case 8:
          p5.line(b.x, b.y, c.x, c.y);
          break;
        case 9:
          p5.line(a.x, a.y, d.x, d.y);
          p5.line(b.x, b.y, c.x, c.y);
          break;
        case 10:
          p5.line(a.x, a.y, c.x, c.y);
          break;
        case 11:
          p5.line(d.x, d.y, c.x, c.y);
          break;
        case 12:
          p5.line(b.x, b.y, d.x, d.y);
          break;
        case 13:
          p5.line(a.x, a.y, b.x, b.y);
          break;
        case 14:
          p5.line(a.x, a.y, d.x, d.y);
          break;
        case 15:
          break;
      }
    }
  }
  function conv(a: number, b: number, c: number, d: number): number {
    a = Math.round(a);
    b = Math.round(b);
    c = Math.round(c);
    d = Math.round(d);
    return a + b * 2 + c * 4 + d * 8;
  }
}

export const marchingSquaresSketch: SketchHolder = {
  sketch,
  info: {
    title: "Marching Squares",
    controls: "Press space bar to change how the underlying data is rendered",
    about: "",
  },
  inputs: [
    {
      type: "slider",
      name: "res",
      initialValue: externals.res.current,
      max: externals.res.max,
      min: externals.res.min,
      step: externals.res.step,
      onChange: setRes,
    },
    {
      type: "slider",
      name: "t",
      initialValue: externals.t.current,
      max: externals.t.max,
      min: externals.t.min,
      step: externals.t.step,
      onChange: setT,
    },
    {
      type: "button",
      name: "change colors",
      onClick: resetColorScheme,
    },
  ],
};
