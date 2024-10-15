import P5 from "p5";
import "../../styles.scss";
import { getI, getSize, getXY } from "../../util";
import { InputChangeHandler, SketchHolder } from "../../types";
import { inbounds } from "../../util/click_helpers";

const externals = {
  val: {
    current: 1,
    max: 10,
    min: 0,
    step: 1,
  },
};

const setVal: InputChangeHandler = (e) => {
  if (e.target.valueAsNumber !== undefined) {
    externals.val.current = e.target.valueAsNumber;
  }
};

const sketch = (p5: P5) => {
  const WIDTH = 600;
  const HEIGHT = 600;
  const w = 5;
  let grid: Grid;

  let xOff = p5.random(0, 100);


  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );

    // create current & next grid of basic particles
    let width = Math.ceil(p5.width / w);
    let height = Math.ceil(p5.height / w);
    grid = new Grid(width, height);
  
    p5.noStroke();
  };

  p5.draw = () => {
    p5.background(180, 210, 235);

    // drop a grain of sand from the top
    const randomCol = Math.floor(grid.width * p5.noise(xOff));
    xOff += .5;
    grid.set(randomCol, new Sand());

    grid.update();
    grid.draw();

    if (p5.mouseIsPressed) {
      if (inbounds(p5)) {
        const row = Math.floor(p5.mouseY/w);
        const col = Math.floor(p5.mouseX/w);
        const index = getI({ x: col, y: row }, grid.width);
        if (p5.random() < .6) grid.set(index, new Sand());
        if (col + 1< grid.width && p5.random() < .6) grid.set(index + 1, new Sand());
        if (p5.random() < .6) grid.set(index + grid.width, new Sand());
        if (col + 1 < grid.width && p5.random() < .6) grid.set(index + grid.width + 1, new Sand());
      }
    }
  };

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };

  class Grid {
    private current: Particle[];
    private next: Particle[];
    width: number;
    height: number;

    constructor(width: number, height: number) {
      this.width = width;
      this.height = height;
      this.current = new Array(width * height).fill(0).map(_ => new Air());
      this.copyToNext();
    }

    update() {
      this.current.forEach((particle, i) => particle.update(this, i));
      this.current = this.next;
      this.current.forEach(p => p.remainingUpdates = 1);
    }

    draw() {
      this.current.forEach((particle, i) => {
        const [col, row] = getXY(i, grid.width);
        particle.draw(row, col);
      });
    }

    set(index: number, particle: Particle) {
      this.next[index] = particle;
    }

    getCurrent(index: number) {
      return this.current[index];
    }

    isEmpty(index: number) {
      return this.current[index]?.isEmpty;
    }

    swap(indexA: number, indexB: number) {
      const temp = this.current[indexB];
      this.next[indexB] = this.current[indexA];
      this.next[indexA] = temp;
    }

    clear() {
      this.next = new Array(this.next.length).fill(0).map(_ =>  new Air());
    }

    copyToNext() {
      const temp = [];
      this.current.forEach(p => {
        temp.push(p.copy());
      });
      this.next = temp;
    }
  }

  abstract class Particle {
    color: P5.Color;
    isEmpty: boolean;
    remainingUpdates: number;
    velocity: number;
  
    constructor(color?: P5.Color) {
      if (color) this.color = color;
      this.isEmpty = false;
      this.remainingUpdates = 0;
      this.velocity = 0;
    }

    abstract copy(): Particle
    abstract update(grid: Grid, index: number): void

    draw(row: number, col: number) {
      p5.fill(this.color);
      p5.rect(col*w, row*w, w);
    }
  }

  class Air extends Particle {
    static newColor() {
      return p5.color(0, 0);
    }

    constructor() {
      super(Air.newColor());
      this.isEmpty = true;
    }

    copy() { return new Air() }
    update(grid: Grid, index: number) {}
  }
  
  class Sand extends Particle {
    velocity: number
    acceleration: number
    maxVelocity: number;

    static newColor() {
      return p5.color(
        p5.random(190, 230),
        p5.random(140, 150),
        p5.random(10, 30));
    }

    constructor(color?: P5.Color) {
      super(color ? color : Sand.newColor());
      this.velocity = 0;
      this.acceleration = .1;
      this.maxVelocity = 3;
    }

    update(grid: Grid, index: number) {
      if (this.remainingUpdates <= 0) return;

      const column = index % grid.width;
      const belowIndex = index + grid.width;
      const belowLeftIndex = column > 0 ? belowIndex - 1 : -1;
      const belowRightIndex = column < grid.width - 1 ? belowIndex + 1 : -1;
      if (grid.isEmpty(belowIndex)) {
        grid.swap(index, belowIndex);
      } else if (grid.isEmpty(belowLeftIndex) && !grid.isEmpty(belowRightIndex)) {
        grid.swap(index, belowLeftIndex);
      } else if (grid.isEmpty(belowRightIndex) && !grid.isEmpty(belowLeftIndex)) {
        grid.swap(index, belowRightIndex);
      } else if (grid.isEmpty(belowLeftIndex) && grid.isEmpty(belowRightIndex)) {
        p5.random() < .5 ? grid.swap(index, belowLeftIndex) : grid.swap(index, belowRightIndex);
      }

      this.remainingUpdates--;
    }

    copy() { 
      return new Sand(this.color);
    }
  }

  class Steel extends Particle {
    static newColor(): P5.Color {
      return p5.color(100);
    }

    constructor() {
      super(Steel.newColor());
    }

    update(grid: Grid, index: number) {
      grid.set(index, this.copy());
    }

    copy() {
      return new Steel();
    }
  }

  class Water extends Particle {
    static newColor(): P5.Color {
      return p5.color(0, 50);
    }

    constructor() {
      super(Water.newColor());
    }

    update(grid: Grid, index: number) {
      // TODO
    }

    copy() {
      return new Water();
    }
  }

  abstract class Behavior {
    abstract update(grid: Grid, index: number): void
  }

  class FallsDown extends Behavior {
    update(grid: Grid, index: number) {

    }
  }
};

export const fallingSandSketch: SketchHolder = {
  sketch,
  info: {
    title: 'Falling Sand',
    controls: '',
    about: '',
  },
  // inputs: [
  //   {
  //     type: "slider",
  //     name: "val",
  //     initialValue: externals.val.current,
  //     max: externals.val.max,
  //     min: externals.val.min,
  //     step: externals.val.step,
  //     onChange: setVal,
  //   },
  // ]
}
