import type P5 from 'p5';

export interface State {
  p5: P5
  currentSketch: {
    file?: (p5: P5) => void
    title?: string
    param?: string
    info?: SketchInfo
  }
  currentCollection: {
    title?: CollectionTitle
    sketches?: SketchHolder[]
  }
  about: boolean
}

export type SketchInfo = {
  controls?: string
  about?: string
  title?: string
}

export type SketchHolder = {
  sketch: (p5: P5) => void
  info: SketchInfo
}

export type CollectionTitle = "Nature of Code" | "Misc" | "About";

export type Collection = {
  title: CollectionTitle;
  sketches: SketchHolder[];
};
