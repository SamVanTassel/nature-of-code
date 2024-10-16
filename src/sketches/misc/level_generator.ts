import P5 from "p5";
import "../../styles.scss";
import { getSize } from "../../util";
import { InputChangeHandler, SketchHolder } from "../../types";

const externals = {
  floorSpace: {
    current: .4,
    max: .7,
    min: .05,
    step: .01,
  },
  w: {
    current: 10,
    max: 20,
    min: 5,
    step: 1,
  },
};

const setFloorSpace: InputChangeHandler = (e) => {
  if (e.target.valueAsNumber !== undefined) {
    externals.floorSpace.current = e.target.valueAsNumber;
  }
};

const setW: InputChangeHandler = (e) => {
  if (e.target.valueAsNumber !== undefined) {
    externals.w.current = e.target.valueAsNumber;
  }
};

const sketch = (p5: P5) => {
  const WIDTH = 800;
  const HEIGHT = 600;

  let grid: Grid;
  let entitiesManager: EntitiesManager;
  let centerLocation: P5.Vector;

  const floorColor = p5.color(239, 208, 147);
  const wallColor = p5.color(85, 42, 25);
  const backgroundColor = p5.color(100, 52, 30);
  const treasureColor = p5.color(255, 100, 0);

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
    grid = new Grid(p5.width, p5.height, externals.w.current);
    entitiesManager = new EntitiesManager(40);

    centerLocation = p5.createVector(Math.floor(grid.width/2), Math.floor(grid.height/2));
    entitiesManager.addWalker(grid, centerLocation.copy());
  };

  p5.draw = () => {
    p5.background(backgroundColor);
    if (grid.maxFloorTiles > 0) {
      entitiesManager.update();
    } else {
      grid.addWalls();
    }
    grid.draw();
  };

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };

  type Material = 'floor'|'wall'|'empty'|'treasure';

  class Cell {
    p: P5.Vector;
    material: Material;

    constructor(p: P5.Vector, material: Material) {
      this.p = p;
      this.material = material;
    }

    draw(w: number) {
      p5.noStroke();
      switch (this.material) {
        case 'empty':
          break;
        case 'floor':
          p5.fill(floorColor);
          p5.rect(this.p.x*w, this.p.y*w, w);
          break;
        case 'wall':
          p5.fill(wallColor);
          p5.rect(this.p.x*w, this.p.y*w, w);
          break;
        case 'treasure':
          p5.fill(floorColor);
          p5.rect(this.p.x*w, this.p.y*w, w);
          p5.ellipseMode(p5.CORNER);
          p5.fill(treasureColor);
          p5.ellipse(this.p.x*w, this.p.y*w, w);
          break;
      }
    }
  }

  class Grid {
    width: number;
    height: number;
    w: number;
    cells: Cell[][];
    maxFloorTiles: number;
    maxTreasures: number;

    constructor(canvasWidth: number, canvasHeight: number, w: number) {
      this.width = Math.floor(canvasWidth/w);
      this.height = Math.floor(canvasHeight/w);
      this.w = w;
      const cells: Cell[][] = [];
      for (let i = 0; i < this.height; i++) {
        const row: Cell[] = [];
        for (let j = 0; j < this.width; j++) {
          row.push(new Cell(p5.createVector(j, i), 'empty'));
        }
        cells.push(row);
      }
      this.cells = cells;
      this.maxFloorTiles = externals.floorSpace.current * this.width * this.height;
      this.maxTreasures = 3;
    }

    update() {
      this.draw();
    }

    draw() {
      for (let i = 0; i < this.cells.length; i++) {
        for (let j = 0; j < this.cells[i].length; j++) {
          this.cells[i][j].draw(this.w);
        }
      }
    }

    addWalls() {
      this.cells.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell.material !== 'empty') return;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (r + i < 0 || r + i >= this.cells.length || c + j < 0 || c + j >= row.length) continue;
              const neighbor = this.cells[r + i][c + j];
              if (neighbor.material === 'floor' || neighbor.material === 'treasure') {
                this.cells[r][c].material = 'wall';
                return;
              } 
            }
          }
        });
      });
    }
  }

  class EntitiesManager {
    walkers: Walker[];
    walkersToFlush: Set<number>;
    walkerCounter: 0;

    constructor(maxWalkers: number) {
      this.walkers = [];
      this.walkersToFlush = new Set();
    };

    update() {
      this.walkers.forEach(w => w.update());
      if (grid.maxFloorTiles > 0) {
        this.addWalker(grid, centerLocation.copy(), p5.random(.3, .9));
      }
      this.flush();
    }

    addWalker(grid: Grid, p: P5.Vector, changeDirChance?: number,) {
      this.walkers.push(new Walker(grid, this, p, this.walkerCounter++, changeDirChance));
    }

    killWalker(index: number) {
      this.walkersToFlush.add(index);
    }

    flush() {
      this.walkers = this.walkers.filter((w, i) => !this.walkersToFlush.has(i));
    }
  }

  class Walker {
    grid: Grid;
    p: P5.Vector;
    manager: EntitiesManager;
    i: number;
    d: P5.Vector;
    changeDirChance: number;
    lifespan: number;
  
    static newDirection(direction?: P5.Vector) {
      const seed = Math.floor(p5.random(4));
      const directions = [
        p5.createVector(0, -1),
        p5.createVector(0, 1),
        p5.createVector(-1, 0),
        p5.createVector(1, 0),
      ];
      return directions[seed];
    }
  
    constructor(grid: Grid, manager: EntitiesManager, position: P5.Vector, index: number, changeDirChance: number = .25, direction?: P5.Vector) {
      this.grid = grid;
      this.manager = manager;
      this.p = position;
      this.i = index;
      this.changeDirChance = changeDirChance;
      this.d = direction ? direction : Walker.newDirection();
      this.lifespan = Math.floor(p5.random(100, 200));
    }

    update() {
      if (!this.lifespan || this.grid.maxFloorTiles <= 0) {
        this.kill();
      }
      this.walk();
      if (p5.random() < this.changeDirChance) this.changeDirection();
      this.layTile();
      this.lifespan--;
    }

    walk() {
      this.p = this.p.add(this.d);
      if (this.p.x < 1) this.p.x = 1;
      if (this.p.x >= this.grid.width - 2) this.p.x = this.grid.width - 2;
      if (this.p.y < 1) this.p.y = 1;
      if (this.p.y >= this.grid.height - 2) this.p.y = this.grid.height - 2;
    }

    changeDirection() {
      const newD = Walker.newDirection(this.d);
      if (newD.toString() === this.d.toString()) this.changeDirection();
      else this.d = newD;
    }

    createRoom() {
      
    }

    layTile() {
      const existing = this.grid.cells[this.p.y][this.p.x];
      if (existing.material === 'empty' && this.grid.maxFloorTiles > 0) {
        existing.material = 'floor';
        this.grid.maxFloorTiles--;
      }
    }
    
    kill() {
      if (this.grid.maxTreasures) {
        this.grid.cells[this.p.y][this.p.x].material = 'treasure';
        this.grid.maxTreasures--
      };
      this.manager.killWalker(this.i);
    }
  };
};

export const levelGeneratorSketch: SketchHolder = {
  sketch,
  info: {
    title: 'Level Generator',
    controls: '',
    about: 'Simple procedural 2D top-down level generator. Inspired by level generation in Nuclear Throne, with drunken walkers laying tile as they randomly move away from the center tile. Plenty of room to explore this concept: walkers changing direction for something other than randomness, or spawning from site of killed walkers, etc. A good opportunity to explore interactivity as well, by adding a player character to explore the generated map.',
  },
  inputs: [
    {
      type: "slider",
      name: "floor space",
      initialValue: externals.floorSpace.current,
      max: externals.floorSpace.max,
      min: externals.floorSpace.min,
      step: externals.floorSpace.step,
      onChange: setFloorSpace,
    },
    {
      type: "slider",
      name: "cell width",
      initialValue: externals.w.current,
      max: externals.w.max,
      min: externals.w.min,
      step: externals.w.step,
      onChange: setW,
    },
  ]
};
