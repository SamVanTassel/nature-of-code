import P5 from "p5";
import "../../styles.scss";
import { getSize } from "../../util";
import { InputChangeHandler, SketchHolder } from "../../types";
import p5 from "p5";

const externals = {
  res: {
    current: 10,
    max: 50,
    min: 4,
    step: 1,
  },
  swiss: {
    current: 0,
    max: 100,
    min: 0,
    step: 1,
  },
};

const setSwiss: InputChangeHandler = (e) => {
  if (e.target.valueAsNumber !== undefined) {
    externals.swiss.current = e.target.valueAsNumber;
  }
};

const setResolution: InputChangeHandler = (e) => {
  if (e.target.valueAsNumber !== undefined) {
    externals.res.current = e.target.valueAsNumber;
  }
};

const sketch = (p5: P5) => {
  const WIDTH = 600;
  const HEIGHT = 600;

  let openSet: Cell[] = [];
  let closedSet: Cell[] = [];
  let start: Cell;
  let end: Cell;
  let path: Cell[] = [];
  const prevPaths = [];
  let w: number;

  const grid: Cell[] = [];
  let res: number;
  let current: Cell;
  let rows: number;
  let cols: number;
  const stack: Cell[] = [];

  const pathColor = '#eb0004';
  const wallColor = '#23241f';
  const oldPathColor = '#E3BDBC';
  const bgColor = '#e1e3e1';
  const startColor= '#5c82f7';
  const endColor = '#41b56c';

  const wallWidth = .1;

  const index = (x: number, y: number) => {
    if (y < 0 || x < 0 || y >= rows || x >= cols) return -1;
    const index = rows * y + x;
    return index;
  };

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

    // break condition for maze generation
    while (grid.filter(cell => !cell.visited).length) {
      const [dir, next] = current.checkNeighbors();
      if (next) {
        next.visited = true;
        current.removeBoundary(dir, next);
        stack.push(current);
        current = next;
      } else if (stack.length) {
        current = stack.pop();
      }
      if (p5.random(100) < externals.swiss.current) {
        const [dir, next] = current.checkNeighbors(true);
        current.removeBoundary(dir, next);
      };
    }

    grid.forEach(cell => cell.addNeighbors(grid));

    w = p5.width/externals.res.current;
    const startArea = externals.res.current * 1/4;
    const startQuad = p5.floor(p5.random(4));
    const getStartCoord = () => p5.floor(p5.random(startArea));
    const sx = startQuad < 2 ? getStartCoord() : externals.res.current - 1 - getStartCoord();
    const sy = startQuad % 2 === 1 ? getStartCoord() : externals.res.current - 1 - getStartCoord();
    const ex = startQuad >= 2 ? getStartCoord() : externals.res.current - 1 - getStartCoord();
    const ey = startQuad % 2 === 0 ? getStartCoord() : externals.res.current - 1 - getStartCoord();
    start = grid[index(sx, sy)];
    end = grid[index(ex, ey)];
    openSet.push(start);
  };

  p5.draw = () => {
    p5.background(bgColor);
    grid.forEach(cell => {
      cell.drawBG(cell === start ? p5.color(startColor) :
        cell === end ? p5.color(endColor) :
        undefined)
    });
    grid.forEach(cell => cell.drawWalls());

    if (openSet.length > 0) {
      openSet.sort((a, b) => {
        if (a.f < b.f) return -1;
        if (a.f > b.f) return 1;
        else return 0;
      });
      const [current] = openSet.splice(0, 1);
      if (current === end) {
        createPath(current);
        closedSet.push(current);
        drawPaths();
        console.log('done');
        p5.noLoop();
      }

      createPath(current);
      closedSet.push(current);

      current.neighbors.forEach(n => {
        if (closedSet.includes(n)) return;
        const tempG = current.g + 1;
        let newPath = false;
        if (openSet.includes(n)) {
          if (tempG < n.g) {
            n.g = tempG;
            newPath = true;
          }
        } else {
          n.g = tempG;
          newPath = true;
          openSet.push(n);
        }
        n.h = heuristic(n, end);
        n.f = n.g + 2 *n.h;
        console.log(n.h, n.g, n.f);
        if (newPath) n.prev = current;
      });
    } else {
      console.log('impossible');
      p5.noLoop();
    };
    drawPaths();
  };

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };

  const heuristic = (a: Cell, b: Cell) => {
    // return p5.abs(a.x -b.x) + p5.abs(a.y - b.y);
    return p5.dist(a.x, a.y, b.x, b.y);
  }

  const drawPaths = () => {
    p5.strokeJoin('round');
    p5.stroke(oldPathColor)
    p5.strokeWeight(wallWidth * w * .8);
    prevPaths.forEach(p => showPath(p));
    p5.strokeWeight(wallWidth * w * 1.6);
    p5.stroke(pathColor);
    showPath(path);
  }
  
  const createPath = (current: Cell) => {
    path = [];
    let temp = current;
    while (temp.prev) {
      path.push(temp);
      temp = temp.prev;
    }
    path.push(temp);
    prevPaths.push(path);
  }

  const showPath = (path: Cell[]) => {
    p5.noFill();
    p5.beginShape();
    path.forEach(s => {
      p5.vertex(s.x * w + w/2, s.y * w + w/2);
    });
    p5.endShape();
  }

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
    neighbors: Cell[];
    f: number;
    g: number;
    h: number;
    prev?: Cell;
  
    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
      this.walls = { t: true, l: true, b: true, r: true};
      this.visited = false;
      this.g = 0;
      this.neighbors = [];
    }

    addNeighbors(grid: Cell[]) {
      const top = grid[index(this.x, this.y - 1)];
      if (!this.walls.t && top) this.neighbors.push(top);
      const bottom = grid[index(this.x, this.y + 1)];
      if (!this.walls.b && bottom) this.neighbors.push(bottom);
      const left = grid[index(this.x - 1, this.y)];
      if (!this.walls.l && left) this.neighbors.push(left);
      const right = grid[index(this.x + 1, this.y)]
      if (!this.walls.r && right) this.neighbors.push(right);
    }
  
    checkNeighbors(includeUnvisited?: boolean) {
      const neighbors = [];
  
      const left = grid[index(this.x - 1, this.y)];
      if (left && (!left.visited || includeUnvisited)) neighbors.push(['left', left]);
      const right = grid[index(this.x + 1, this.y)];
      if (right && (!right.visited || includeUnvisited)) neighbors.push(['right', right]);
      const top = grid[index(this.x, this.y - 1)];
      if (top && (!top.visited || includeUnvisited)) neighbors.push(['top', top]);
      const bottom = grid[index(this.x, this.y + 1)];
      if (bottom && (!bottom.visited || includeUnvisited)) neighbors.push(['bottom', bottom]);
  
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
  
    drawBG(color?: P5.Color) {
      const x = this.x * res;
      const y = this.y * res;

      p5.noStroke();
      p5.fill(bgColor);
      p5.rect(x, y, res);

      if (color) {
        p5.noStroke();
        p5.fill(color);
        p5.rect(x, y, res);
      }
    }

    drawWalls() {
      const x = this.x * res;
      const y = this.y * res;
      p5.stroke(wallColor);
      if (this.walls.t) p5.line(x, y, x + res, y);
      if (this.walls.r) p5.line(x + res, y + res, x + res, y);
      if (this.walls.b) p5.line(x + res, y + res, x, y + res);
      if (this.walls.l) p5.line(x, y, x, y + res);
    }
  }
};

export const AStarMazeSketch: SketchHolder = {
  sketch,
  info: {
    title: 'Maze generation and A* Pathfinding',
    controls: '',
    about: `Combining maze generation and pathfinding algorithms.
    <br><br>
    A* is not very effective when there is only one solution, but as the 'swiss' value (amount of holes in the walls & potential other solutions)
    increases, A* functions better at finding the shortest route.`,
  },
  inputs: [
    {
      type: "slider",
      name: "resolution",
      initialValue: externals.res.current,
      max: externals.res.max,
      min: externals.res.min,
      step: externals.res.step,
      onChange: setResolution,
    },
    {
      type: "slider",
      name: "swiss",
      initialValue: externals.swiss.current,
      max: externals.swiss.max,
      min: externals.swiss.min,
      step: externals.swiss.step,
      onChange: setSwiss,
    },
  ]
}
