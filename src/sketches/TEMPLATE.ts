import P5 from "p5";
import "../../styles.scss";
import { getSize } from "../util";
import { InputChangeHandler, SketchHolder } from "../types";

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
  const HEIGHT = 340;

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );

  };

  p5.draw = () => {

  };

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };
};

export const TEMPLATE_Sketch: SketchHolder = {
  sketch,
  info: {
    title: '',
    controls: '',
    about: '',
  },
  inputs: [
    {
      type: "slider",
      name: "val",
      initialValue: externals.val.current,
      max: externals.val.max,
      min: externals.val.min,
      step: externals.val.step,
      onChange: setVal,
    },
  ]
}
