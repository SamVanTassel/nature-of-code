import P5 from "p5";
import "../styles.scss";
import { getSize } from "../util";

export const TEMPlATE_Sketch = (p5: P5) => {
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
