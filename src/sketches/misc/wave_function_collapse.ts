import P5 from "p5";
import "../../styles.scss";
import { getSize } from "../../util";
import { InputChangeHandler, SketchHolder } from "../../types";

const externals = {
  w: {
    current: 50,
    max: 100,
    min: 20,
    step: 5,
  },
  b: {
    current: 150,
    max: 500,
    min: 50,
    step: 50,
  },
  s: {
    current: 30,
    max: 150,
    min: 10,
    step: 10,
  },
};

const setW: InputChangeHandler = (e) => {
  if (e.target.valueAsNumber !== undefined) {
    externals.w.current = e.target.valueAsNumber;
  }
};

const setB: InputChangeHandler = (e) => {
  if (e.target.valueAsNumber !== undefined) {
    externals.b.current = e.target.valueAsNumber;
  }
};

const setS: InputChangeHandler = (e) => {
  if (e.target.valueAsNumber !== undefined) {
    externals.s.current = e.target.valueAsNumber;
  }
};

const sketch = (p5: P5) => {
  const WIDTH = 600;
  const HEIGHT = 340;
  const images: P5.Image[] = [];

  p5.preload = () => {
    const imgPaths = [
      new URL('../../../images/wfc/simple/blank.jpg', import.meta.url).toString(),
      new URL('../../../images/wfc/simple/bottom_left.jpg', import.meta.url).toString(),
      new URL('../../../images/wfc/simple/bottom_right.jpg', import.meta.url).toString(),
      new URL('../../../images/wfc/simple/cross_flip.jpg', import.meta.url).toString(),
      new URL('../../../images/wfc/simple/cross.jpg', import.meta.url).toString(),
      new URL('../../../images/wfc/simple/hor.jpg', import.meta.url).toString(),
      new URL('../../../images/wfc/simple/top_left.jpg', import.meta.url).toString(),
      new URL('../../../images/wfc/simple/top_right.jpg', import.meta.url).toString(),
      new URL('../../../images/wfc/simple/vert.jpg', import.meta.url).toString(),
      new URL('../../../images/wfc/simple/end_cap_top.jpg', import.meta.url).toString(),
      new URL('../../../images/wfc/simple/end_cap_bottom.jpg', import.meta.url).toString(),
      new URL('../../../images/wfc/simple/end_cap_left.jpg', import.meta.url).toString(),
      new URL('../../../images/wfc/simple/end_cap_right.jpg', import.meta.url).toString(),

    ];
    imgPaths.forEach(path => images.push(p5.loadImage(path)));
  }

  let w: number;
  type Tile = {
    img: P5.Image;
    probability: number;
    top: 1|0;
    bottom: 1|0;
    right: 1|0;
    left: 1|0;
  }

  const tiles: Tile[] = [];
  let rows: number;
  let cols: number;

  type Neighbors = {
      top?: Cell;
      bottom?: Cell;
      left?: Cell;
      right?: Cell;
  }

  type Cell = {
    index: number;
    possibleStates: Tile[];
    neighbors?: Neighbors;
  }
  const cells: Cell[] = [];
  let cellStack: Cell[] = [];
  const collapsed: Set<Cell> = new Set();

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
    w = p5.map(externals.w.current, 20, 100, 100, 20);
    rows = Math.floor(p5.height/w);
    cols = Math.floor(p5.width/w);

    images.forEach(img => {
      img.resize(w, 0);
      const tile: Tile = {
        img,
        probability: 10,
        top: checkPixel(img, 'top'),
        left: checkPixel(img, 'left'),
        bottom: checkPixel(img, 'bottom'),
        right: checkPixel(img, 'right'),
      }
      tiles.push(tile);
    });

    // set blank tile probability
    tiles[0].probability = externals.b.current;
    // set endcap probability
    for (let i = 9; i < 13; i++) {
      tiles[i].probability = p5.map(externals.b.current, 50, 500, 0, 10);
    }
    // set squiggly tile probability
    tiles[1].probability = externals.s.current;
    tiles[7].probability = externals.s.current;
    // set straight tile probability
    tiles[5].probability = p5.map(externals.s.current, 10, 150, 150, 10);
    tiles[8].probability = p5.map(externals.s.current, 10, 150, 150, 10);

    // set all cells to all possibile states
    for (let i = 0; i < rows * cols; i++) {
      cells[i] = {
        index: i,
        possibleStates: tiles.slice(),
      };
    }
    // set neighbors for every cell
    for (let i = 0; i < cells.length; i++) {
      const neighbors: Neighbors = {};
      if (i % cols !== 0) {
        neighbors.left = (cells[i - 1]);
      }
      if (i % cols !== cols - 1) {
        neighbors.right = (cells[i + 1]);
      }
      if (i + cols < cells.length) {
        neighbors.bottom = (cells[i + cols]);
      }
      if (i - cols >= 0) {
        neighbors.top = (cells[i - cols]);
      }
      cells[i].neighbors = neighbors;
    }

    // add a random cell to the stack
    const randomCell = cells[Math.floor(p5.random(cells.length))];
    cellStack.push(randomCell);

    cells.forEach(cell => {
      // draw all cells in all possible states
      drawCell(cell);
    });
  };

  p5.draw = () => {
    const next = cellStack.pop();
    
    if (!next) {
      console.log('no more cells');
      p5.noLoop();
      return;
    }
    if (next.possibleStates.length === 0) {
      p5.noLoop();
      console.log('No possible states at ' + next.index);
      console.log(next);
      p5.noFill();
      p5.rect((next.index % cols) * w, Math.floor(next.index / cols) * w, w);
      return;
    }

    if (next.possibleStates.length > 1) {
      // pick a random state from the remaining possibilities
      next.possibleStates = chooseState(next);
    }

    propogateConsraints(next, 2);

    // sort so that least entropy is on top
    cellStack = [...new Set([...cellStack])]
    .sort((a, b) => {
      if (a.possibleStates.length < b.possibleStates.length) return 1;
      else return -1;
    });
  };

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };

  const checkPixel = (img: P5.Image, dir: 'top'|'left'|'bottom'|'right'): 0|1 => {
    let r: number, g: number, b: number, a: number;
    switch (dir) {
      case 'top':
        [r,g,b,a] = img.get(Math.floor(img.width/2), 0);
        break;
      case 'left':
        [r,g,b,a] = img.get(0, Math.floor(img.height/2));
        break;
      case 'bottom':
        [r,g,b,a] = img.get(Math.floor(img.width/2), img.height - 1);
        break;
      case 'right':
        [r,g,b,a] = img.get(img.width - 1, Math.floor(img.height/2));
        break;
    }
    return r < 10 ? 1 : 0;
  }

  const chooseState = (cell: Cell) => {
    let totalProb = cell.possibleStates.reduce((a, b) => a + b.probability, 0);
    const num = p5.random(totalProb);
    let i = 0;
    for (let state of cell.possibleStates) {
      i += state.probability;
      if (i >= num) return [state]
    }
  }

  const propogateConsraints = (cell: Cell, radius: number) => {
    drawCell(cell);
    if (radius <= 0 || collapsed.has(cell)) return;
    constrainNeighborPossibilities(cell);
    for (let dir in cell.neighbors) {
      const neighbor = cell.neighbors[dir];
      if (neighbor.possibleStates.length === 1) {
        propogateConsraints(neighbor, radius - 1);
        collapsed.add(neighbor);
      } else {
        cellStack.push(neighbor);
      }
    }
  }

  const constrainNeighborPossibilities = (cell: Cell) => {
    const ps = cell.possibleStates[0];
    for (let dir in cell.neighbors) {
      switch (dir) {
        case 'top':
          cell.neighbors.top.possibleStates = cell.neighbors.top.possibleStates.filter(n => ps.top === n.bottom);
          break;
        case 'bottom':
          cell.neighbors.bottom.possibleStates = cell.neighbors.bottom.possibleStates.filter(n => ps.bottom === n.top);
          break;
        case 'left':
          cell.neighbors.left.possibleStates = cell.neighbors.left.possibleStates.filter(n => ps.left === n.right);
          break;
        case 'right':
          cell.neighbors.right.possibleStates = cell.neighbors.right.possibleStates.filter(n => ps.right === n.left);
          break;
      }
    }
  }

  const drawCell = (cell: Cell) => {
    p5.fill(255);
    p5.noStroke();
    p5.rect(cell.index % cols * w, Math.floor(cell.index / cols) * w, w, w);
    p5.tint(255, p5.map(cell.possibleStates.length, 0, tiles.length, 255, 255/tiles.length));
    cell.possibleStates.forEach(state => {
      p5.image(state.img, cell.index % cols * w, Math.floor(cell.index / cols) * w);  
    });
  }
};

export const waveFunctionCollapseSketch: SketchHolder = {
  sketch,
  info: {
    title: 'Wave Function Collapse',
    controls: '',
    about: '',
  },
  inputs: [
    {
      type: "slider",
      name: "resolution",
      initialValue: externals.w.current,
      max: externals.w.max,
      min: externals.w.min,
      step: externals.w.step,
      onChange: setW,
    },
    {
      type: "slider",
      name: "sparse",
      initialValue: externals.b.current,
      max: externals.b.max,
      min: externals.b.min,
      step: externals.b.step,
      onChange: setB,
    },
    {
      type: "slider",
      name: "squiggly",
      initialValue: externals.s.current,
      max: externals.s.max,
      min: externals.s.min,
      step: externals.s.step,
      onChange: setS,
    },
  ]
}
