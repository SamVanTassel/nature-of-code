import P5 from "p5";
import "../../styles.scss";
import { getSize } from "../../util";
import { InputChangeHandler, SketchHolder } from "../../types";
import p5 from "p5";

const externals = {
  resolution: {
    current: 25,
    max: 70,
    min: 5,
    step: 1,
  },
  wallDensity: {
    current: .3,
    max: .6,
    min: 0,
    step: .02,
  },
};

const setResolution: InputChangeHandler = (e) => {
  if (e.target.valueAsNumber !== undefined) {
    externals.resolution.current = e.target.valueAsNumber;
  }
};

const setWallDensity: InputChangeHandler = (e) => {
  if (e.target.valueAsNumber !== undefined) {
    externals.wallDensity.current = e.target.valueAsNumber;
  }
};

const sketch = (p5: P5) => {
  const WIDTH = 600;
  const HEIGHT = 600;

  let grid: Spot[][] = [];
  const numRows = externals.resolution.current;
  
  let openSet: Spot[] = [];
  let closedSet: Spot[] = [];
  let start: Spot;
  let end: Spot;
  let path: Spot[] = [];
  const prevPaths = [];
  let w: number;

  const pathColor = '#eb0004';
  const oldPathColor = '#db7f82';
  const bgColor = '#e1e3e1';
  const obstacleColor = '#23241f';
  const startColor= '#5c82f7';
  const endColor = '#41b56c';

  const wallWidth = .5;

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
    for (let i = 0; i < numRows; i++) {
      const row = [];
      for (let j = 0; j < numRows; j++) {
        row.push(new Spot(i, j));
      }
      grid.push(row);
    }

    grid.forEach(row => {
      row.forEach(spot => spot.addNeighbors(grid));
    })

    w = p5.width/numRows;
    const startArea = externals.resolution.current * 1/8;
    const startQuad = p5.floor(p5.random(4));
    const getStartCoord = () => p5.floor(p5.random(startArea));
    const sx = startQuad < 2 ? getStartCoord() : grid[0].length - 1 - getStartCoord();
    const sy = startQuad % 2 === 1 ? getStartCoord() : grid.length - 1 - getStartCoord();
    const ex = startQuad >= 2 ? getStartCoord() : grid[0].length - 1 - getStartCoord();
    const ey = startQuad % 2 === 0 ? getStartCoord() : grid.length - 1 - getStartCoord();
    start = grid[sx][sy];
    end = grid[ex][ey];
    openSet.push(start);
    start.wall = false;
    end.wall = false;
  };

  p5.draw = () => {
    p5.background(bgColor);
    start.display(p5.color(startColor));
    end.display(p5.color(endColor));

    if (openSet.length > 0) {
      openSet.sort((a, b) => {
        if (a.f < b.f) return -1;
        if (a.f > b.f) return 1;
        else return 0;
      });
      const [current] = openSet.splice(0, 1);
      if (current === end) {
        console.log('done');
        p5.noLoop();
      }

      createPath(current);
      closedSet.push(current);

      current.neighbors.forEach(n => {
        if (closedSet.includes(n) || n.wall) return;
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
        n.f = n.g + n.h;
        if (newPath) n.prev = current;
      });
      current.diagonals.forEach(d => {
        if (closedSet.includes(d) || d.wall) return;
        const tempG = current.g + p5.sqrt(2);
        let newPath = false;
        if (openSet.includes(d)) {
          if (tempG < d.g) {
            d.g = tempG;
            newPath = true;
          }
        } else {
          d.g = tempG;
          newPath = true;
          openSet.push(d);
        }
        d.h = heuristic(d, end);
        d.f = d.g + d.h;
        if (newPath) d.prev = current;
      });

    } else {
      console.log('impossible');
      p5.noLoop();
    };

    p5.strokeWeight(1);
    grid.forEach(row => {
      row.forEach(spot => spot.display());
    });

    p5.strokeJoin('round');
    p5.noFill();
    p5.stroke(oldPathColor)
    p5.strokeWeight(wallWidth * w * .8);
    prevPaths.forEach(p => showPath(p));
    p5.strokeWeight(wallWidth * w * 1.2);
    p5.stroke(pathColor);
    showPath(path);
  };

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };

  const heuristic = (a: Spot, b: Spot) => {
    return p5.abs(a.x -b.x) + p5.abs(a.y - b.y);
    // return p5.dist(a.x, b.x, a.y, b.y);
  }
  
  const createPath = (current: Spot) => {
    path = [];
    let temp = current;
    while (temp.prev) {
      path.push(temp);
      temp = temp.prev;
    }
    path.push(temp);
    prevPaths.push(path);
  }

  const showPath = (path: Spot[]) => {
    p5.beginShape();
    path.forEach(s => {
      p5.vertex(s.x * w + w/2, s.y * w + w/2);
    });
    p5.endShape();
  }

  class Spot {
    x: number;
    y: number;
    f: number;
    g: number;
    h: number;
    neighbors: Spot[];
    diagonals: Spot[];
    prev: Spot;
    wall: boolean;

    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
      this.g = 0;
      this.neighbors = [];
      this.diagonals = [];
      this.prev = undefined;
      this.wall = p5.random(1) < externals.wallDensity.current;
    }

    display(color?: p5.Color) {
      p5.noStroke();
      if (this.wall) {
        p5.fill(obstacleColor);
        p5.ellipse(this.x * w + w/2, this.y * w + w/2, w * wallWidth);
        this.neighbors.forEach(n => {
          p5.rectMode('center');
          if (n.wall && n.x < this.x) p5.rect(this.x * w, this.y * w + w/2, w, w * wallWidth);
          if (n.wall && n.x > this.x) p5.rect(this.x * w + w, this.y * w + w/2, w, w * wallWidth);
          if (n.wall && n.y < this.y) p5.rect(this.x * w + w/2, this.y * w, w * wallWidth, w);
          if (n.wall && n.y > this.y) p5.rect(this.x * w + w/2, this.y * w + w, w * wallWidth, w);
        })
        return;
      }
      if (!color) return;
      p5.fill(color);
      p5.ellipse(this.x * w + w/2, this.y * w + w/2, w);
    }

    addNeighbors(grid: Spot[][]) {
      if (this.x > 0)                  this.neighbors.push(grid[this.x - 1][this.y])
      if (this.x < grid[0].length - 1) this.neighbors.push(grid[this.x + 1][this.y])
      if (this.y > 0)                  this.neighbors.push(grid[this.x][this.y - 1])
      if (this.y < grid.length - 1)    this.neighbors.push(grid[this.x][this.y + 1])
      if (this.y < grid.length - 1 && this.x > 0)                    this.diagonals.push(grid[this.x - 1][this.y + 1])
      if (this.y > 0 && this.x > 0)                                  this.diagonals.push(grid[this.x - 1][this.y - 1])
      if (this.y < grid.length - 1 && this.x < grid[0].length -1)    this.diagonals.push(grid[this.x + 1][this.y + 1])
      if (this.y > 0 && this.x < grid[0].length -1)                  this.diagonals.push(grid[this.x + 1][this.y - 1])
    }
  }
};

export const AStarPathfindingSketch: SketchHolder = {
  sketch,
  info: {
    title: 'A* Pathfinding',
    controls: '',
    about: '<a href="https://en.wikipedia.org/wiki/A*_search_algorithm" target="_blank">a*</a> is an algorithm to find quickly find the closest path between two points. it uses a heuristic (an educated guess) to determine likely distance to the end point, then adds that distance to the distance traveled so far to determine which path to attempt next. The walls are randomly placed, some may not be solvable',
  },
  inputs: [
    {
      type: "slider",
      name: "resolution",
      initialValue: externals.resolution.current,
      max: externals.resolution.max,
      min: externals.resolution.min,
      step: externals.resolution.step,
      onChange: setResolution,
    },
    {
      type: "slider",
      name: "wall density",
      initialValue: externals.wallDensity.current,
      max: externals.wallDensity.max,
      min: externals.wallDensity.min,
      step: externals.wallDensity.step,
      onChange: setWallDensity,
    },
  ]
}
