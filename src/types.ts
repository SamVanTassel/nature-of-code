import type P5 from 'p5';

export interface State {
  p5: P5
  currentSketch: {
    file?: (p5: P5) => void
    title?: string
    param?: string
  }
  currentCollection: {
    title?: CollectionTitle
    sketches?: SketchPair[]
  }
  about: boolean
}

export type SketchPair = [string, (p5: P5) => void];

export type CollectionTitle = "Nature of Code" | "Misc" | "About";

export type Entry = {
  collection: CollectionTitle;
  sketches: SketchPair[];
};
