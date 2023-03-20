import P5 from "p5";
import "../styles.scss";
import { getSize } from "../util";

export const oneDellularAutomationSketch = (p5: P5) => {
  const WIDTH = 1000;
  const HEIGHT = 1000;

  const CELL_WIDTH = 5;
  const DENSITY = .05;
  let cells: number[] = [];
  let nextCells: number[] = [];

  const colorMap = {
    0: 'white',
    1: 'black',
    // 2: 'red',
  }

  const states = Object.keys(colorMap).map(key => Number.parseInt(key, 10));

// 111, 110, 101, 100, 011, 010, 001, 000
  generateRulesets(states);

  let y = 0;
  let ri = Math.floor(Math.random()* 256);
  let startingCells: number[];

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
    const NUM_CELLS = Math.floor(p5.width/CELL_WIDTH);
    for (let i = 0; i < NUM_CELLS; i++) {
      cells.push(p5.random() < DENSITY ? 1 : 0);
    };
    const middleIndex = Math.floor(p5.width / (2 * CELL_WIDTH));
    console.log(NUM_CELLS, middleIndex);
    cells[middleIndex] = 1;
    startingCells = [...cells];
    p5.frameRate(100);
    p5.noStroke();
    p5.background('white');
  };

  p5.draw = () => {
    cells.forEach((_, i) => {
      const left = cells[i - 1] === undefined ? cells[cells.length - 1] :cells[i - 1];
      const current = cells[i];
      const right = cells[i + 1] === undefined ? cells[0] : cells[i + 1];

      nextCells[i] = rules(left, current, right);
    });

    cells.forEach((cell, x) => {
      p5.fill(colorMap[cell] || 'blue');
      p5.rect(x * CELL_WIDTH, y * CELL_WIDTH, CELL_WIDTH, CELL_WIDTH);
    });
    y ++;
  
    if (y * CELL_WIDTH>= p5.height) {
      y = 0;
      cells = [...startingCells];
      ri = (ri + 1) % r.length;
      // p5.background('white');
    } else {
      cells = [...nextCells];
    }
  };

  const rules = (left: number, current: number, right: number) => {
    // convert cell pattern to string of numbers, eg left: 0, current: 1, right: 1 -> '001'
    // 021 -> 1 + 6 -> 7
    // 222 -> 3 + 6 + 9 -> 18
    const s = "" + left + current + right;
    // parse string as binary, eg '001' -> 1
    const i = Number.parseInt(s, states.length);

    const ruleset = r[ri];
    // access ruleset in reverse at binary index, eg 7 for 001
    // corresponds to ruleset definition because definition is a bianry state.
    // same could be done for rules with more states with different radix values for parseInt
    console.log(ruleset[ruleset.length - 1 - i]);
    return ruleset[ruleset.length - 1 - i];
  }

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };
};

const r = [];
const generateRulesets = (states: number[], ruleset = []) => {
  if (ruleset.length === Math.pow(states.length, 3)) {
    console.log(ruleset);
    r.push(ruleset);
    return;
  };

  states.forEach(state => {
    generateRulesets(states, [...ruleset, state]);
  })
};
