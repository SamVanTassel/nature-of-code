import P5 from "p5";
import "../../styles.scss";
import { getSize } from "../../util";
import { InputChangeHandler, SketchHolder } from "../../types";

const externals = {
  sides: {
    current: 5,
    max: 10,
    min: 1,
    step: 1,
  },
};

const setSides: InputChangeHandler = (e) => {
  if (e.target.valueAsNumber !== undefined) {
    externals.sides.current = e.target.valueAsNumber;
  }
};

const sketch = (p5: P5) => {
  const WIDTH = 600;
  const HEIGHT = 340;

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };

  p5.draw = () => {
    p5.background(10);
    p5.noFill();
    p5.stroke(230);
    p5.strokeWeight(5);

    p5.translate(p5.width/2, p5.height/2);
    p5.beginShape();
    for(let i = 0; i < externals.sides.current; i++) {
      const x = p5.cos(p5.radians(i * 360/externals.sides.current)) * 100;
      const y = p5.sin(p5.radians(i * 360/externals.sides.current)) * 100;
      p5.vertex(x, y);
    }
    p5.vertex(100, 0);
    p5.endShape();
  };

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };
};

export const shapeStuffSketch: SketchHolder = {
  sketch,
  info: {
    title: 'Shape Stuff',
    controls: '',
    about: '',
  },
  inputs: [
    {
      type: "slider",
      name: "sides",
      initialValue: externals.sides.current,
      max: externals.sides.max,
      min: externals.sides.min,
      step: externals.sides.step,
      onChange: setSides,
    },
  ]
}
