import P5 from "p5";
import "../../styles.scss";
import { getSize } from "../../util";
import { InputChangeHandler, SketchHolder } from "../../types";

const externals = {
  res: {
    current: 10,
    max: 50,
    min: 4,
    step: 1,
  },
};

const setRes: InputChangeHandler = (e) => {
  if (e.target.valueAsNumber !== undefined) {
    externals.res.current = e.target.valueAsNumber;
  }
};

const sketch = (p5: P5) => {
  const WIDTH = 600;
  const HEIGHT = 600;

  const bgColor = '#444444'
  const wallColor = '#23241f';
  const pathColor = '#e1e3e1';
  const makerColor = '#eb0004';

  const grid: Cell[] = [];
  let res: number;
  let current: Cell;
  let rows: number;
  let cols: number;
  const stack: Cell[] = [];

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
    res = p5.width/externals.res.current;
    rows = p5.floor(externals.res.current);
    cols = p5.floor(externals.res.current);
    for (let i = 0; i < rows * cols; i++) {
        grid.push(new Cell(i%cols, Math.floor(i/cols)));
    };
    current = grid[0];
    current.visited = true;
    p5.strokeWeight(2);
  };

  p5.draw = () => {
    p5.background(bgColor);
    grid.forEach(cell => cell.display());

    // break condition
    if (!grid.filter(cell => !cell.visited).length) {
      current = undefined;
      p5.background(bgColor);
      grid.forEach(cell => cell.display());
      p5.noLoop();
      return;
    }
    
    const [dir, next] = current.checkNeighbors();
    if (next) {
      next.visited = true;
      current.removeBoundary(dir, next);
      stack.push(current);
      current = next;
    } else if (stack.length) {
      current = stack.pop();
    }
  };

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };

  const index = (x: number, y: number) => {
    if (y < 0 || x < 0 || y >= rows || x >= cols) return -1;
    const index = rows * y + x;
    return index;
  };

  interface WallData {
    t: boolean
    l: boolean
    b: boolean
    r: boolean
  }

  class Cell {
    x: number;
    y: number;
    walls: WallData;
    visited: boolean;

    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
      this.walls = { t: true, l: true, b: true, r: true};
      this.visited = false;
    }

    checkNeighbors() {
      const neighbors = [];

      const left = grid[index(this.x - 1, this.y)];
      if (left && !left.visited) neighbors.push(['left', left]);
      const right = grid[index(this.x + 1, this.y)];
      if (right && !right.visited) neighbors.push(['right', right]);
      const top = grid[index(this.x, this.y - 1)];
      if (top && !top.visited) neighbors.push(['top', top]);
      const bottom = grid[index(this.x, this.y + 1)];
      if (bottom && !bottom.visited) neighbors.push(['bottom', bottom]);

      const r = p5.floor(p5.random(0, neighbors.length));
      return neighbors[r] || [undefined];
    }

    removeBoundary(dir: 'left'|'right'|'top'|'bottom', neighbor: Cell) {
      switch (dir) {
        case 'left':
          neighbor.walls.r = false;
          this.walls.l = false;
          break;
        case 'right':
          neighbor.walls.l = false;
          this.walls.r = false;
          break;
        case 'top':
          neighbor.walls.b = false;
          this.walls.t = false;
          break;
        case 'bottom':
          neighbor.walls.t = false;
          this.walls.b = false;
          break;
      }
    }

    display() {
      const x = this.x * res;
      const y = this.y * res;

      if (this.visited) {
        p5.noStroke();
        p5.fill(pathColor);
        p5.rect(x, y, res);

        p5.stroke(wallColor);
        if (this.walls.t) p5.line(x, y, x + res, y);
        if (this.walls.r) p5.line(x + res, y + res, x + res, y);
        if (this.walls.b) p5.line(x + res, y + res, x, y + res);
        if (this.walls.l) p5.line(x, y, x, y + res);
      }

      if (this === current) {
        p5.noStroke();
        p5.fill(makerColor);
        p5.rect(x, y, res);
      }
    }
  }
};

export const mazeGeneratorSketch: SketchHolder = {
  sketch,
  info: {
    title: 'Maze Generator',
    controls: '',
    about: 'Recursive backtracking maze generator algorithm',
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
  ]
}
