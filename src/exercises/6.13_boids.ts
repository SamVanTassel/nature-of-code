import P5 from "p5";
import "../styles.scss";
import { getSize } from "../util";

export const boidsSketch = (p5: P5) => {
  const WIDTH = 600;
  const HEIGHT = 340;

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );

  };

  p5.draw = () => {
    p5.background(100);
    p5.fill(255);
    p5.text('nothing yet...', 20, 20);
  };

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };

  class Boid {
    constructor() {

    }

  }
};
