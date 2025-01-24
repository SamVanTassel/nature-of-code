import type P5 from 'p5';

export interface State {
  p5: P5
  currentSketch: CurrentSketch
  currentCollection: {
    title?: CollectionTitle
    sketches?: SketchHolder[]
  }
  about: boolean
  infoModalOpen: boolean
}

export type SketchInfo = {
  controls?: string
  about?: string
  title?: string
}

export interface CurrentSketch extends SketchHolder {
  param: string
  displayTitle: string
}

export interface SketchHolder {
  sketch: (p5: P5) => void
  info: SketchInfo
  inputs?: SketchInput[]
}

type SketchInputType = 'slider'|'button';

export type SketchInput = SliderInput|ButtonInput;

export type SliderInput = {
  type: SketchInputType
  name: string
  onChange: InputChangeHandler
  initialValue: number
  max: number
  min: number
  step?: number
}

export type ButtonInput = {
  type: SketchInputType
  name: string
  onClick: ButtonClickHandler
}

export interface InputChangeEvent extends Event {
  target: HTMLInputElement
}
export type InputChangeHandler = (event: InputChangeEvent) => void;
export type ButtonClickHandler = (this: GlobalEventHandlers, ev: MouseEvent) => any

export type CollectionTitle = "Nature of Code" | "Misc" | "About";

export type Collection = {
  title: CollectionTitle;
  sketches: SketchHolder[];
};
