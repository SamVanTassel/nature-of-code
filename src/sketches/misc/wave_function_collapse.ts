import P5 from "p5";
import "../../styles.scss";
import { getSize } from "../../util";
import { InputChangeHandler, SketchHolder } from "../../types";

const sMax = 50;
const externals = {
  w: {
    current: 50,
    max: 100,
    min: 20,
    step: 5,
  },
  b: {
    current: 40,
    max: 100,
    min: 0,
    step: 5,
  },
  s: {
    current: 30,
    max: sMax,
    min: 10,
    step: 2,
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

const imgData: [string, number][] = [
  [new URL('../../../images/wfc/simple/blank.jpg', import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/bottom_left.jpg', import.meta.url).toString(), 100],
  [new URL('../../../images/wfc/simple/bottom_right.jpg', import.meta.url).toString(), 100],
  [new URL('../../../images/wfc/simple/cross_flip.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/cross.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/hor.jpg',import.meta.url).toString(), 100],
  [new URL('../../../images/wfc/simple/top_left.jpg',import.meta.url).toString(), 100],
  [new URL('../../../images/wfc/simple/top_right.jpg',import.meta.url).toString(), 100],
  [new URL('../../../images/wfc/simple/vert.jpg',import.meta.url).toString(), 100],
  [new URL('../../../images/wfc/simple/end_cap_top.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/end_cap_bottom.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/end_cap_left.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/end_cap_right.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/circle.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/bottom_left_2.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/bottom_right_2.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/cross_flip_2.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/cross_2.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/hor_2.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/top_left_2.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/top_right_2.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/vert_2.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/end_cap_top_2.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/end_cap_bottom_2.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/end_cap_left_2.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/end_cap_right_2.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/cross_flip_mix_1.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/cross_flip_mix_2.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/cross_flip_2.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/cross_mix_1.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/cross_mix_2.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/cross_2.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/circle_2.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/circle_3.jpg',import.meta.url).toString(), 10],
  [new URL('../../../images/wfc/simple/connector_1.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/connector_2.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/connector_3.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/connector_4.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/two_turns_1.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/two_turns_2.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/two_turns_3.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/two_turns_4.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/two_turns_5.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/two_turns_6.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/cap_and_pipe_turn_1.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/end_cap_and_pipe_1.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/cap_and_pipe_turn_2.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/end_cap_and_pipe_2.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/cap_and_pipe_turn_3.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/end_cap_and_pipe_3.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/cap_and_pipe_turn_4.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/end_cap_and_pipe_4.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/cap_and_pipe_turn_5.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/end_cap_and_pipe_5.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/cap_and_pipe_turn_6.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/end_cap_and_pipe_6.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/cap_and_pipe_turn_7.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/end_cap_and_pipe_7.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/cap_and_pipe_turn_8.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/end_cap_and_pipe_8.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/cap_and_pipe_turn_9.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/end_cap_and_pipe_9.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/cap_and_pipe_turn_10.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/end_cap_and_pipe_10.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/cap_and_pipe_turn_11.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/end_cap_and_pipe_11.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/cap_and_pipe_turn_12.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/end_cap_and_pipe_12.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/cap_and_pipe_turn_13.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/end_cap_and_pipe_13.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/cap_and_pipe_turn_14.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/end_cap_and_pipe_14.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/cap_and_pipe_turn_15.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/end_cap_and_pipe_15.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/cap_and_pipe_turn_16.jpg',import.meta.url).toString(), 1],
  [new URL('../../../images/wfc/simple/end_cap_and_pipe_16.jpg',import.meta.url).toString(), 1],
];

type ImageHolder = {
  prob: number
  img: P5.Image
  original: P5.Image
}
const images: ImageHolder[] = [];

let slowMode: boolean = false;

const sketch = (p5: P5) => {
  const WIDTH = 800;
  const HEIGHT = 600;

  p5.preload = () => {
    if (!images.length) {
      imgData.forEach(path => {
        const img: ImageHolder = {
          prob: path[1],
          img: p5.loadImage(path[0]),
          original: p5.loadImage(path[0]),
        }
        images.push(img)
    });
    }
  }


  let w: number;
  type Tile = {
    img: P5.Image;
    prob: number;
    top: number[]
    bottom: number[];
    right: number[];
    left: number[];
  }

  let tiles: Tile[] = [];
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

    // draw loading indicator
    p5.fill(255, 0, 0, 100);
    p5.rect(0, 0, cols * w, rows * w);

    if (!tiles.length) {
      images.forEach(holder => {
        holder.img = holder.original.get();
        holder.img.resize(w, 0);
        const tile: Tile = {
          img: holder.img,
          prob: holder.prob,
          top: checkPixel(holder.img, 'top'),
          left: checkPixel(holder.img, 'left'),
          bottom: checkPixel(holder.img, 'bottom'),
          right: checkPixel(holder.img, 'right'),
        }
        tiles.push(tile);
      });
    }

    // set blank tile probability
    tiles[0].prob = p5.map(externals.b.current, 0, 100, 1, tiles.length * 300);
    // less crosses when blank is high
    tiles[3].prob = p5.map(externals.b.current, 0, 100, tiles.length * 2, 1);
    tiles[4].prob = p5.map(externals.b.current, 0, 100, tiles.length * 2, 1);
    tiles[16].prob = p5.map(externals.b.current, 0, 100, tiles.length * 2, 1);
    tiles[17].prob = p5.map(externals.b.current, 0, 100, tiles.length * 2, 1);
    // same for other tiles with all 4 sides filled
    for (let i = 85 - 47; i < 91 - 47; i++) {
      tiles[i].prob = p5.map(externals.b.current, 0, 100, tiles.length, 1);
    }
    // more circles when blank is high
    tiles[13].prob = p5.map(externals.b.current, 0, 100, 10, tiles.length);
    tiles[32].prob = p5.map(externals.b.current, 0, 100, 10, tiles.length);
    tiles[33].prob = p5.map(externals.b.current, 0, 100, 10, tiles.length / 2);
    // set endcap probability
    for (let i = 9; i < 13; i++) {
      tiles[i].prob = p5.map(externals.b.current, 0, 100, 1, tiles.length);
    }
    // set squiggly tile probability
    tiles[1].prob = p5.map(externals.s.current, 10, sMax, 1, sMax * tiles.length/2)
    tiles[2].prob = p5.map(externals.s.current, 10, sMax, 1, sMax * tiles.length/6)
    tiles[6].prob = p5.map(externals.s.current, 10, sMax, 1, sMax * tiles.length/6)
    tiles[7].prob = p5.map(externals.s.current, 10, sMax, 1, sMax * tiles.length/2)
    tiles[14].prob = p5.map(externals.s.current, 10, sMax, 1, sMax * tiles.length/2)
    tiles[15].prob = p5.map(externals.s.current, 10, sMax, 1, sMax * tiles.length/6)
    tiles[19].prob = p5.map(externals.s.current, 10, sMax, 1, sMax * tiles.length/6)
    tiles[20].prob = p5.map(externals.s.current, 10, sMax, 1, sMax * tiles.length/2)
    // set straight tile probability
    tiles[5].prob = p5.map(externals.s.current, 10, sMax, sMax * tiles.length/2, tiles.length/2);
    tiles[8].prob = p5.map(externals.s.current, 10, sMax, sMax * tiles.length/2, tiles.length/2);
    tiles[18].prob = p5.map(externals.s.current, 10, sMax, sMax * tiles.length/2, tiles.length/2);
    tiles[21].prob = p5.map(externals.s.current, 10, sMax, sMax * tiles.length/2, tiles.length/2);

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
    // ensure the seed cell is not blank
    randomCell.possibleStates.splice(0, 1);
    cellStack.push(randomCell);

    p5.fill(100, 40, 40);
    p5.rect(0, 0, cols * w, rows * w);
  };

  p5.draw = () => {
    if (slowMode && p5.frameCount % 10 !== 0) return;
    const next = cellStack.pop();
    
    if (!next) {
      console.log('no more cells');
      p5.noLoop();
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

  p5.keyPressed = () => {
    if (p5.key === 's') {
      slowMode = !slowMode;
    }
  }

  const checkPixel = (img: P5.Image, dir: 'top'|'left'|'bottom'|'right'): number[] => {
    switch (dir) {
      case 'top':
        return img.get(Math.floor(img.width/2), 0);
      case 'left':
        return img.get(0, Math.floor(img.height/2));
      case 'bottom':
        return img.get(Math.floor(img.width/2), img.height - 1);
      case 'right':
        return img.get(img.width - 1, Math.floor(img.height/2));
    }
  }

  const chooseState = (cell: Cell) => {
    let totalProb = cell.possibleStates.reduce((a, b) => a + b.prob, 0);
    const num = p5.random(totalProb);
    let i = 0;
    for (let state of cell.possibleStates) {
      i += state.prob;
      if (i >= num) return [state]
    }
  }

  const propogateConsraints = (cell: Cell, radius: number) => {
    drawCell(cell);
    if (radius <= 0 || collapsed.has(cell)) return;
    constrainNeighborPossibilities(cell);
    for (let dir in cell.neighbors) {
      const neighbor = cell.neighbors[dir];
      drawCell(neighbor);
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
          cell.neighbors.top.possibleStates = 
            cell.neighbors.top.possibleStates
              .filter(n => ps.top.toString() === n.bottom.toString());
          break;
        case 'bottom':
          cell.neighbors.bottom.possibleStates = 
            cell.neighbors.bottom.possibleStates
              .filter(n => ps.bottom.toString() === n.top.toString());
          break;
        case 'left':
          cell.neighbors.left.possibleStates = 
            cell.neighbors.left.possibleStates
              .filter(n => ps.left.toString() === n.right.toString());
          break;
        case 'right':
          cell.neighbors.right.possibleStates = 
            cell.neighbors.right.possibleStates
              .filter(n => ps.right.toString() === n.left.toString());
          break;
      }
    }
  }

  const drawCell = (cell: Cell) => {
    p5.fill(255);
    p5.noStroke();
    p5.rect(cell.index % cols * w, Math.floor(cell.index / cols) * w, w, w);
    const totalPossible = cell.possibleStates.reduce((a, b) => a + b.prob, 0);
    cell.possibleStates.forEach(state => {
      p5.tint(255, p5.map(state.prob, 0, totalPossible, 0, 255));
      p5.image(state.img, cell.index % cols * w, Math.floor(cell.index / cols) * w);  
    });
  }
};

export const waveFunctionCollapseSketch: SketchHolder = {
  sketch,
  info: {
    title: 'Wave Function Collapse (Tiled)',
    controls: 'press s to enter slow mode',
    about: 'TIled version of the wave function collapse algoritim. Every cell in the grid could be represented by any tile to begin with, then as one cell is assigned a tile, the possible tiles that its neighbors can be represented by are reduced, and so on until every cell in the grid is represented by a single tile, which fits seamlessly with its neighbors',
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
