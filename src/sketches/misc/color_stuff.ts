import P5 from "p5";
import "../../styles.scss";
import { getSize } from "../../util";
import { InputChangeHandler, SketchHolder } from "../../types";
// won't directly import as an nopm package for some reason...
import { Hsluv } from "../../../node_modules/hsluv/dist/hsluv.mjs";

const externals = {
  hue: {
    current: Math.floor(Math.random() * 360),
    max: 360,
    min: 0,
    step: 1,
  },
  sat: {
    current: 80,
    max: 100,
    min: 0,
    step: 1,
  },
};

const setHue: InputChangeHandler = (e) => {
  if (e.target.valueAsNumber !== undefined) {
    externals.hue.current = e.target.valueAsNumber;
  }
};

const setSat: InputChangeHandler = (e) => {
  if (e.target.valueAsNumber !== undefined) {
    externals.sat.current = e.target.valueAsNumber;
  }
};

const sketch = (p5: P5) => {
  const WIDTH = 600;
  const HEIGHT = 600;

  const hsluv = new Hsluv();
  
  function hslToRgb (h: number, s: number, l: number): number[] {
    hsluv.hsluv_h = h;
    hsluv.hsluv_s = s;
    hsluv.hsluv_l = l;
    hsluv.hsluvToRgb();
    return [hsluv.rgb_r * 256, hsluv.rgb_g * 256, hsluv.rgb_b * 256];
  }

  let numSwatches = 8;

  p5.keyPressed = () => {
    switch (p5.key) {
      case 'ArrowUp': 
        numSwatches++;
        break;
      case 'ArrowDown':
        numSwatches--;
        break
      default:
        return;
    }
    numSwatches = p5.constrain(numSwatches, 1, 40);
  }

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
    p5.noStroke();
  };

  p5.draw = () => {
    p5.background(hslToRgb(0, 0, 90));

    const w = p5.width/numSwatches;
    const m = w/10;

    for (let i = 0; i < numSwatches; i++) {
      p5.fill(
        hslToRgb(
          externals.hue.current,
          externals.sat.current,
          p5.lerp(0, 100, i/numSwatches)
        ));
      p5.rect(m, i * w + m, p5.width - 2 * m, w - 2 * m);
    }
  };

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };
};

export const colorStuffSketch: SketchHolder = {
  sketch,
  info: {
    title: 'Color Stuff',
    controls: 'use up and down arrow keys to change the number of swatches',
    about: '',
  },
  inputs: [
    {
      type: "slider",
      name: "hue",
      initialValue: externals.hue.current,
      max: externals.hue.max,
      min: externals.hue.min,
      step: externals.hue.step,
      onChange: setHue,
    },
    {
      type: "slider",
      name: "saturation",
      initialValue: externals.sat.current,
      max: externals.sat.max,
      min: externals.sat.min,
      step: externals.sat.step,
      onChange: setSat,
    },
  ]
}
