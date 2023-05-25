import P5 from "p5";
import "../../styles.scss";
import { getSize } from "../../util";
import type { SketchHolder } from "../../types";

const sketch = (p5: P5) => {
  const WIDTH = 600;
  const HEIGHT = 340;
  const pts = [
    p5.random(0, WIDTH), p5.random(0, HEIGHT),
    p5.random(0, WIDTH), p5.random(0, HEIGHT),
    p5.random(0, WIDTH), p5.random(0, HEIGHT),
  ] as const;

  let inside = false;
  let hit = true;
  let color = getColor();
  let bg = getColor('dark');
  
  function getColor (type?: 'dark') {
    const dark = type === 'dark';
    const low = dark ? 0 : 100;
    const high = dark ? 100: 255;
    return p5.color(p5.random(low, high), p5.random(low, high), p5.random(low, high));
  }

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
    p5.noCursor();
  };

  p5.draw = () => {
    p5.background(bg);
    hit = trianglePoint(
      p5.mouseX, p5.mouseY,
      pts[0], pts[2], pts[4],
      pts[1], pts[3], pts[5],
      );
    if (hit && !inside) {
      inside = true;
      color = getColor();
    }
    if (!hit && inside) inside = false;
    p5.noStroke();
    p5.fill(inside ? color : p5.color('wheat'));
    p5.triangle(...pts);
    p5.stroke(0, 150);
    p5.strokeWeight(10);
    p5.point(p5.mouseX, p5.mouseY);
  };

  function trianglePoint (
    px: number, py: number,
    x1: number, x2: number, x3: number,
    y1: number, y2: number, y3: number,
  ): boolean {
    // get the area of the drawn triangle
    const areaOrig = p5.abs( (x2-x1)*(y3-y1) - (x3-x1)*(y2-y1) );
    // get the area of 3 triangles made between the point
    // and the corners of the triangle
    const area1 =    p5.abs( (x1-px)*(y2-py) - (x2-px)*(y1-py) );
    const area2 =    p5.abs( (x2-px)*(y3-py) - (x3-px)*(y2-py) );
    const area3 =    p5.abs( (x3-px)*(y1-py) - (x1-px)*(y3-py) );

    // if the area of the original triangle is the same as
    // that of the three between the points and the mouse,
    // the mouse is within the triangle
    // some wiggle room for floating point math error too
    return areaOrig + .0000000001 > area1 + area2 + area3
  }

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };
};

export const triangleCollisionSketch: SketchHolder = {
  sketch,
  info: {
    title: "Triangle Collision",
    controls: '',
    about: '',
  }
};
