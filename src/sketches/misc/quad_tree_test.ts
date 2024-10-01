import P5 from "p5";
import "../../styles.scss";
import { getSize, QuadTree, Rectangle } from "../../util";
import { InputChangeHandler, SketchHolder } from "../../types";

const externals = {
  numPoints: {
    current: 4,
    max: 1000,
    min: 0,
    step: 1,
  },
};

const setVal: InputChangeHandler = (e) => {
  if (e.target.valueAsNumber !== undefined) {
    externals.numPoints.current = e.target.valueAsNumber;
  }
};

const sketch = (p5: P5) => {
  const WIDTH = 1000;
  const HEIGHT = 640;
  let quadTree: QuadTree;
  let points: Point[] = [];
  let rect: Rectangle;
  let showTree = false;

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );

    quadTree = new QuadTree(new Rectangle({
      x: p5.width / 2,
      y: p5.height /2,
      w: p5.width / 2,
      h: p5.height /2,
    }), 5);

    for (let i = 0; i < externals.numPoints.current; i++) {
      const point =new Point(p5.random() * p5.width, p5.random() * p5.height);
      points.push(point);
    }

    rect = new Rectangle({
      x: p5.mouseX,
      y: p5.mouseY,
      w: p5.random(100, 100),
      h: p5.random(100, 100),
    })
    p5.rectMode(p5.RADIUS);
  };

  p5.draw = () => {
    p5.background(0);
    quadTree.clear();

    if (p5.mouseIsPressed) {
      const point = new Point(p5.mouseX + p5.random(-5, 5), p5.mouseY + p5.random(-5, 5));
      points.push(point);
      quadTree.insert({ object: point, x: point.x, y: point.y });
    }

    rect.x = p5.mouseX;
    rect.y = p5.mouseY;

    for (let point of points) {
      point.update();
      quadTree.insert({ object: point, x: point.x, y: point.y });
      point.show();
    };
    if (showTree) quadTree.show(p5, p5.color(255));

    p5.stroke(0, 255, 0)
    p5.noFill();
    p5.rect(rect.x, rect.y, rect.w, rect.h);
    p5.noCursor();
    const inRect = quadTree.queryAndShow(rect, [], p5);
    for (let p of inRect) {
      p5.strokeWeight(5);
      p5.stroke(0,255,255);
      p5.point(p.x, p.y);
    }

    p5.fill(255);
    p5.noStroke();
    p5.text(points.length, p5.width / 2, p5.height - 20);
  };

  p5.keyPressed = () =>{
    console.log(p5.key);
    if (p5.key === ' ') showTree = !showTree;
    return false;
  }

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };

  class Point {
    x: number;
    y: number;
    v: P5.Vector;

    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
      this.v = p5.createVector(p5.random(-.1, .1), p5.random(-.1, .1));
    }

    update() {
      this.x += this.v.x;
      this.y += this.v.y;
      if (this.x > p5.width) {
        this.x = 0;
      }
      if (this.y > p5.height) {
        this.y = 0;
      }
    }
    
    show() {
      p5.stroke(255);
      p5.strokeWeight(2);
      p5.point(this.x, this.y);
    }
  }
};

export const quadTreeSketch: SketchHolder = {
  sketch,
  info: {
    title: 'Quad Tree',
    controls: '',
    about: '',
  },
  inputs: [
    {
      type: "slider",
      name: "number of points",
      initialValue: externals.numPoints.current,
      max: externals.numPoints.max,
      min: externals.numPoints.min,
      step: externals.numPoints.step,
      onChange: setVal,
    },
  ]
}
