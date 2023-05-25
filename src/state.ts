import { data, miscSketches, natureOfCodeSketches } from './data';
import P5 from 'p5';
import { createLinkText, decodeParam, getDisplayTitle } from './util';
import { CollectionTitle, State } from './types';

export const state: State = {
  p5: undefined,
  currentSketch: {
    file: undefined,
    title: undefined,
    param: undefined,
  },
  currentCollection: {
    title: 'Nature of Code',
    sketches: natureOfCodeSketches,
  },  
  about: false,
}

const resetState = () => {
  state.about = false;
  setCurrentSketch(getDisplayTitle());
  state.currentCollection.title = 'Nature of Code';
  state.currentCollection.sketches = natureOfCodeSketches;
}

export const setCurrentSketch = (title?: string, file?: (p5: P5) => void, param?: string) => {
  state.currentSketch.title = title;
  state.currentSketch.file = file;
  state.currentSketch.param = param;
}

const getFile = (s?: string) => {
  if (!s) return;
  const currentSketchList = state.currentCollection.sketches;
  const sketchPair = currentSketchList.find(
    (pair) => {
      return createLinkText(pair[0]) === s;
    }
  );
  return sketchPair  ? sketchPair[1] : () => null;
}

const getSketches = (s: string) => {
  const col = data.find((entry) => {
    return entry.collection.toLowerCase() === s;
  });
  return col?.sketches || [];
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
    switch (decodeParam(sketch)) {
      case 'about':
        state.about = true;
        setCurrentSketch(getDisplayTitle());
        state.currentCollection.title = 'About';
        state.currentCollection.sketches = undefined;
        setCurrentSketch();
        break;
      case 'misc':
        state.about = false;
        setCurrentSketch(getDisplayTitle());
        state.currentCollection.title = 'Misc';
        state.currentCollection.sketches = miscSketches;
        break;
      default: {
        state.about = false;
        state.currentCollection.title = 'Nature of Code';
        state.currentCollection.sketches = natureOfCodeSketches;
        const param = decodeParam(sketch);
        const file = getFile(param);
        const title = getDisplayTitle(param);
        setCurrentSketch(title, file, param);
      }
    }
  } else if (hashGroups.length === 2) {
    const [collection, sketch] = hashGroups;
    state.about = false;
    state.currentCollection.title = collection as CollectionTitle;
    state.currentCollection.sketches = getSketches(decodeParam(collection));
    const param = decodeParam(sketch);
    const file = getFile(param);
    const title = getDisplayTitle(param);
    setCurrentSketch(title, file, param);
  }
};

export const setRoute = (s: string, collection?: boolean) => {
  if (collection) {
    return `#/${createLinkText(s)}`;
  } else {
    if (state.currentCollection.title === 'Nature of Code') {
      return `#/${createLinkText(s)}`;
    } else {
      return `#/${createLinkText(state.currentCollection.title)}/${createLinkText(s)}`;
    }
  }
}
