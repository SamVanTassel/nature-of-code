import P5 from "p5";
import "../../styles.scss";
import { getSize, getContrastingColors } from "../../util";
import type { SketchHolder } from "../../types";

const sketch = (p5: P5) => {
  const WIDTH = 600;
  const HEIGHT = 600;

  const colors = getContrastingColors();
  const colorMap = {
    0: p5.color(colors.c1),
    1: p5.color(colors.c2),
  }

  // between 5 and 20
  const CELL_WIDTH = 10
  // number between 4 and 10
  const FILL_AMOUNT = 9

  let grid: Cell[][] = [];
  let nextGrid: Cell[][] = [];
  let numCells: number;

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
    p5.noStroke();

    numCells = Math.floor(p5.width / CELL_WIDTH);
    for (let i = 0; i < numCells; i++) {
      const row = [];
      const nextRow = [];
      for(let i = 0; i < numCells; i++) {
        const zeroOrOne = 0
        // p5.random(0, 10) > FILL_AMOUNT ? 1 : 0
        const cell = new Cell(p5, zeroOrOne);
        row.push(cell);
        nextRow.push(cell.copy());
      }
      grid.push(row);
      nextGrid.push(nextRow);
    };
    // drawGlider(grid, 
    //   p5.floor(p5.random(0, numCells - 3)), 
    //   p5.floor(p5.random(0, numCells - 3)),
    // );
    drawRPentonimo(grid, 
      p5.floor(p5.random(0, numCells - 3)), 
      p5.floor(p5.random(0, numCells - 3)),
    );
    // p5.frameRate(.5);
  };

  p5.draw = () => {
    grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        p5.fill(cell.color);
        p5.rect(x * CELL_WIDTH, y * CELL_WIDTH, CELL_WIDTH, CELL_WIDTH);
        nextGrid[y][x] = cell.copy().update(generate(x, y, cell));
      });
    });
    grid = nextGrid;
    nextGrid = [];
    grid.forEach(row => nextGrid.push([]));
  };

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };

  const generate = (x: number, y: number, cell: Cell) => {
    const l = x === 0 ? grid[0].length - 1 : x - 1;
    const r = x === grid[0].length - 1 ? 0 : x + 1;
    const u = y === 0 ? grid.length - 1 : y - 1;
    const d = y === grid.length - 1 ? 0 : y + 1;

    const neighbors = [
      grid[u][l], grid[u][x], grid[u][r],
      grid[y][l],             grid[y][r],
      grid[d][l], grid[d][x], grid[d][r],
    ];

    const total = neighbors
      .map(cell => cell.timeOn > 0 ? 1 : 0 as number)
      .reduce((a, b) => a + b, 0);

    const alive = cell.timeOn > 0;

    if (alive && (total <= 1 || total >= 4)) return 0;
    else if (alive) return 1;
    else if (!alive && total === 3) return 1;
    else return 0;
  }

  class Cell {
    timeOn: number;
    color: P5.Color;

    constructor(p5: P5, timeOn: number) {
      this.timeOn = timeOn;
      this.color = colorMap[0];
    }

    update(on: 0 | 1) {
      this.timeOn = this.timeOn * on + on;
      this.color = p5.lerpColor(colorMap[0], colorMap[1], this.timeOn * .33333);
      return this;
    }

    copy() {
      return new Cell(p5, this.timeOn);
    }
  }

  const drawGlider = (grid: Cell[][], x: number, y: number) => {
    // o X o
    // o o X
    // X X X
    if (grid.length <= x + 3) return;
    if (grid[0].length <= y + 3) return;
    
    grid[y    ][x + 1].update(1);
    grid[y + 1][x + 2].update(1);
    grid[y + 2][x    ].update(1);
    grid[y + 2][x + 1].update(1);
    grid[y + 2][x + 2].update(1);
  };

  const drawRPentonimo = (grid: Cell[][], x: number, y: number) => {
    // o X X
    // X X o
    // o X o
    if (grid.length <= x + 3) return;
    if (grid[0].length <= y + 3) return;
    
    grid[y    ][x + 1].update(1);
    grid[y    ][x + 2].update(1);
    grid[y + 1][x    ].update(1);
    grid[y + 1][x + 1].update(1);
    grid[y + 2][x + 1].update(1);
  };
};

export const gameOfLifeSketch: SketchHolder = {
  sketch,
  info: {
    title: "7.7 - Game of Life",
    controls: '',
    about: 'John Conway\'s Game of Life is a 2d cellular automation. each cell lives or dies from one frame to the next based on the number of neighbors around it. it\'s a classic thing. read more about it <a href="https://playgameoflife.com/" target="_blank">here</a>. or look it up on google for a fun surprise',
  }
};
