import P5, { GRID } from "p5";
import "../../styles.scss";
import { getI, getSize, getXY, swap } from "../../util";
import { InputChangeHandler, SketchHolder } from "../../types";
import { inbounds } from "../../util/click_helpers";

const externals = {
  feedRateA: {
    current: 0.044,
    max: 0.064,
    min: 0.028,
    step: 0.001,
  },
  killRateB: {
    current: 0.061,
    max: 0.066,
    min: 0.056,
    step: 0.0005,
  },
};

const setFeedRateA: InputChangeHandler = (e) => {
  if (e.target.valueAsNumber !== undefined) {
    externals.feedRateA.current = e.target.valueAsNumber;
  }
};

const setKillRateB: InputChangeHandler = (e) => {
  if (e.target.valueAsNumber !== undefined) {
    externals.killRateB.current = e.target.valueAsNumber;
  }
};

const sketch = (p5: P5) => {
  const WIDTH = 600;
  const HEIGHT = 600;

  type Pixel = {
    a: number;
    b: number;
    sumA?: number;
    sumB?: number;
  };

  type Grid = Pixel[];

  type Neighbor = {
    index: number;
    weight: number;
  };

  // grid setup
  let gridWidth: number;
  let gridHeight: number;
  let grid: Grid = [];
  let next: Grid = [];
  let neighborInfo: Neighbor[][];

  // user interaction variables
  let startTime = 0;
  let mouseIsStill = false;

  // color
  let colors = ['r', 'g', 'b', 'y', 'p', 'c'];
  let brightnesses = [10, 25, 50, 100, 125, 150, 200, 225];
  let color: (typeof colors)[number];
  let brightness: number;
  const colorScheme: {
    r: boolean,
    g: boolean,
    b: boolean;
  } = { r: true, g: true, b: true };

  // debugging
  let debugView = false;
  let w: number;

  // REACTION-DIFFUSION CONSTANTS
  const dA = 1;
  const dB = 0.5;
  let feedRateA = externals.feedRateA.current;
  let killRateB = externals.killRateB.current;

  p5.setup = () => {
    p5.createCanvas(getSize(WIDTH, HEIGHT).w, getSize(WIDTH, HEIGHT).h);

    p5.pixelDensity(0.3);
    const d = p5.pixelDensity();
    gridWidth = Math.floor(p5.width * d);
    gridHeight = Math.floor(p5.height * d);

    if (debugView) {
      gridWidth = 20;
      gridHeight = 20;
      w = p5.width / gridWidth;
    }

    // create some seed points for chemical B
    const seeds = [];
    for (let i = 0; i < p5.random(5); i++) {
      const seedX = Math.floor(gridWidth / p5.random(1.1, 3));
      const seedY = Math.floor(gridHeight / p5.random(1.1, 3));
      const seedRadius = debugView ? 2 : p5.random(10, 30);
      seeds.push([seedX, seedY, seedRadius]);
    }

    // populate grid with chemical A
    for (let i = 0; i < gridWidth * gridHeight; i++) {
      grid[i] = { a: 1, b: 0 };
      next[i] = { a: 1, b: 0 };
    }

    // add chemical B at the created points
    for (let i = 0; i < gridWidth * gridHeight; i++) {
      const [x, y] = getXY(i, gridWidth);
      for (let seed of seeds) {
        const [seedX, seedY, seedRadius] = seed;
        const drip = getDrip(x, y, seedX, seedY, seedRadius);
        if (drip) {
          grid[i].b += drip;
          next[i].b += drip;
        }
      }
    }

    // set a color scheme
    color = colors[Math.floor(p5.random(colors.length))];
    brightness = brightnesses[Math.floor(p5.random(brightnesses.length))];
    while (color === 'y' && (brightness === 125 || brightness === 150)) {
      brightness = brightnesses[Math.floor(p5.random(brightnesses.length))];
    }
    colorScheme.r = color === 'r' || color === 'y' || color === 'p';
    colorScheme.g = color === 'g' || color === 'c' || color === 'y';
    colorScheme.b = color === 'b' || color === 'p' || color === 'c';

    neighborInfo = getNeighborInfo();
    if (debugView) drawCells();
    else drawPixels();
  };

  p5.draw = () => {
    p5.background(255);
    feedRateA = externals.feedRateA.current;
    killRateB = externals.killRateB.current;

    if (p5.mouseIsPressed) {
      if (inbounds(p5)) {
        if (p5.mouseX === p5.pmouseX && p5.mouseY === p5.pmouseY) {
          mouseIsStill = true;
        } else {
          mouseIsStill = false;
          startTime = p5.millis();
        }

        const seedX = Math.floor((gridWidth * p5.mouseX) / p5.width);
        const seedY = Math.floor((gridHeight * p5.mouseY) / p5.height);
        const seedRadius = mouseIsStill ? (p5.millis() - startTime) / 1000 : 1;
        for (let i = 0; i < gridWidth * gridHeight; i++) {
          const [x, y] = getXY(i, gridWidth);
          const drip = getDrip(x, y, seedX, seedY, seedRadius);
          if (drip) {
            grid[i].b = p5.constrain(grid[i].b + drip, 0, 1);
            next[i].b = p5.constrain(grid[i].b + drip, 0, 1);
          }
        }
      }
    }

    const laplace = (chemical: "a" | "b", i: number) => {
      let sum = 0;
      for (let neighbor of neighborInfo[i]) {
        sum += neighbor.weight * grid[neighbor.index][chemical];
      }
      return sum;
    };

    for (let i = 0; i < grid.length; i++) {
      const A = grid[i].a;
      const B = grid[i].b;

      next[i].a = A + dA * laplace("a", i) - A * B * B + feedRateA * (1 - A);
      next[i].b = B + dB * laplace("b", i) + A * B * B - (killRateB + feedRateA) * B;

      next[i].a = p5.constrain(next[i].a, 0, 1);
      next[i].b = p5.constrain(next[i].b, 0, 1);
    }

    if (debugView) drawCells();
    else drawPixels();

    [grid, next] = swap(grid, next);
  };

  p5.mousePressed = () => {
    startTime = p5.millis();
  };

  const getDrip = (
    x: number,
    y: number,
    seedX: number,
    seedY: number,
    seedRadius: number
  ) => {
    const distance = p5.dist(x, y, seedX, seedY);
    if (distance < seedRadius) {
      return 1 - distance / seedRadius;
    } else return 0;
  };

  const drawPixels = () => {
    p5.loadPixels();
    for (let i = 0; i < grid.length; i++) {
      const a = Math.floor(grid[i].a * 255);
      const b = Math.floor(grid[i].b * 255);
      const c = p5.constrain(a - b, 0, 255);
      let dark = p5.map(c, 0, 255, brightness - 150, brightness);
      let bright = p5.map(c, 0, 255, brightness, 150);
      p5.pixels[i * 4] = colorScheme.r ? bright : dark;
      p5.pixels[i * 4 + 1] = colorScheme.g ? bright : dark;
      p5.pixels[i * 4 + 2] = colorScheme.b ? bright : dark;
      p5.pixels[i * 4 + 3] = 255;
    }
    p5.updatePixels();
  };

  const drawCells = () => {
    p5.noStroke();
    for (let i = 0; i < grid.length; i++) {
      const [x, y] = getXY(i, gridWidth);
      const a = p5.constrain(Math.floor(grid[i].a * 255), 0, 255);
      const b = p5.constrain(Math.floor(grid[i].b * 255), 0, 255);
      p5.fill(a, 0, b);
      p5.stroke(a, 0, b);
      p5.rect(x * w, y * w, w);
    }
  };

  const getNeighborInfo = (): Neighbor[][] => {
    /*
      laplace weights
      .05 .2 .05
      .2  -1  .2
      .05 .2 .05
    */
    const neighborInfo: Neighbor[][] = [];
    for (let i = 0; i < grid.length; i++) {
      const [x, y] = getXY(i, gridWidth);
      const neighbors = [];
      for (let m = -1; m <= 1; m++) {
        let neighborX = m + x;
        if (neighborX < 0) neighborX = gridWidth - 1;
        if (neighborX >= gridWidth) neighborX = 0;
        // if (neighborX < 0 || neighborX >= gridWidth) continue;
        for (let n = -1; n <= 1; n++) {
          let neighborY = n + y;
          if (neighborY < 0) neighborY = gridHeight - 1;
          if (neighborY >= gridHeight) neighborY = 0;
          // if (neighborY < 0 || neighborY >= gridHeight) continue;
          const weight = !m && !n ? -1 : (!m && n) || (m && !n) ? 0.2 : 0.05;
          neighbors.push({
            index: getI({ x: neighborX, y: neighborY }, gridWidth),
            weight,
          });
        }
      }
      neighborInfo.push(neighbors);
    }
    return neighborInfo;
  };
};

export const reactionDiffusionSketch: SketchHolder = {
  sketch,
  info: {
    title: "Reaction Diffusion",
    controls: "Click and drag to add more substance B. Use the sliders to adjust how much substance A is fed back into the system and the rate at which B disappears.",
    about: "The Gray-Scott model of a reaction between two substances (A and B). Each substance diffuses across the system, while also reacting with the other substance. The reaction consumes A and produces B. To balance this, substance A is fed into the system over time while substance B is eliminated.",
  },
  inputs: [
    {
      type: "slider",
      name: "feed rate A",
      initialValue: externals.feedRateA.current,
      max: externals.feedRateA.max,
      min: externals.feedRateA.min,
      step: externals.feedRateA.step,
      onChange: setFeedRateA,
    },
    {
      type: "slider",
      name: "kill rate B",
      initialValue: externals.killRateB.current,
      max: externals.killRateB.max,
      min: externals.killRateB.min,
      step: externals.killRateB.step,
      onChange: setKillRateB,
    },
  ],
};
