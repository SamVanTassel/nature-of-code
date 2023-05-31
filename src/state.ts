import { data, miscSketches, natureOfCodeSketches } from './data';
import { createLinkText, decodeParam, encodeParam } from './util';
import type { CollectionTitle, SketchHolder, State } from './types';

export const state: State = {
  p5: undefined,
  currentSketch: {
    sketch: undefined,
    displayTitle: undefined,
    param: undefined,
    info: undefined,
    inputs: undefined,
  },
  currentCollection: {
    title: 'Nature of Code',
    sketches: natureOfCodeSketches,
  },  
  about: false,
  infoModalOpen: false,
}

const resetState = () => {
  state.about = false;
  setCurrentSketch();
  state.currentCollection.title = 'Nature of Code';
  state.currentCollection.sketches = natureOfCodeSketches;
  state.infoModalOpen = false;
}

export const setCurrentSketch = (sh?: SketchHolder) => {
  if (!sh) {
    state.currentSketch.sketch = undefined;
    state.currentSketch.displayTitle = undefined;
    state.currentSketch.param = undefined;
    state.currentSketch.info = undefined;
    state.currentSketch.inputs = undefined;
    return;
  }
  state.currentSketch.sketch = sh.sketch;
  state.currentSketch.displayTitle = sh.info?.title || '';
  state.currentSketch.param = encodeParam(sh.info?.title || '');
  state.currentSketch.info = sh.info;
  state.currentSketch.inputs = sh.inputs;
}

const getSketchHolder = (s?: string) => {
  if (!s) return;
  const currentSketchList = state.currentCollection.sketches;
  const sketchHolder = currentSketchList.find(
    (sh) => {
      return createLinkText(sh.info?.title) === s;
    }
  );
  return sketchHolder;
}

const getCollection = (s: string) => {
  const col = data.find((entry) => {
    return entry.title.toLowerCase() === s;
  });
  return col;
}

export const loadRoute = () => {
  const hash = window.location.hash;
  if (!hash) {
    resetState();
    return;
  }
  const hashGroups= hash.slice(2).split('/');
  if (!hashGroups || !hashGroups.length) {
    resetState();
  } else if (hashGroups.length === 1) {
    const [sketch] = hashGroups;
    const decoded = decodeParam(sketch);
    switch (decoded) {
      case 'about':
        state.about = true;
        state.currentCollection.title = 'About';
        state.currentCollection.sketches = undefined;
        setCurrentSketch();
        break;
      case 'misc':
        state.about = false;
        state.currentCollection.title = 'Misc';
        state.currentCollection.sketches = miscSketches;
        setCurrentSketch();
        break;
      default: {
        state.about = false;
        state.currentCollection.title = 'Nature of Code';
        state.currentCollection.sketches = natureOfCodeSketches;
        const sketchHolder = getSketchHolder(decoded);
        setCurrentSketch(sketchHolder);
      }
    }
  } else if (hashGroups.length === 2) {
    const [collectionParam, sketchParam] = hashGroups;
    state.about = false;
    const collection = getCollection(decodeParam(collectionParam))
    state.currentCollection.title = collection.title as CollectionTitle;
    state.currentCollection.sketches = collection.sketches;
    const sketchTitle = decodeParam(sketchParam);
    const sketchHolder = getSketchHolder(sketchTitle);
    setCurrentSketch(sketchHolder);
  }
};

export const setRoute = (s: string, collection?: boolean) => {
  if (collection) {
    return encodeParam(s);
  } else {
    if (state.currentCollection.title === 'Nature of Code') {
      return encodeParam(s);
    } else {
      return encodeParam(`${state.currentCollection.title}/${s}`);
    }
  }
}
