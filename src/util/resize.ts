type Size = {
  w: number;
  h: number;
};

const MIN = 200;

export const getSize = (w: number, h?: number): Size => {
  if (!h) h = w;
  const whRatio = w/h;

  const maxWidth = Math.min(innerWidth * .9, w);
  const maxHeight = Math.min(innerHeight * .75, h);

  if (whRatio === 1) {
    const min = Math.min(innerHeight, innerWidth);
    return {
      w: Math.max(MIN, Math.min(min * 0.75, w)),
      h: Math.max(MIN, Math.min(min * 0.75, w)),
    };
  } else if (whRatio < 1) {
    if (innerWidth * .9 > w) {
      console.log('ok');
      return {
        w: Math.max(MIN, maxHeight * whRatio),
        h: Math.max(MIN, maxHeight),
      };
    } else {
      return {
        w: Math.max(MIN, maxWidth),
        h: Math.max(MIN, maxWidth / whRatio),
      };
    }
  } else {
    if (innerHeight * .75 > h) {
      return {
        w: Math.max(MIN, maxWidth),
        h: Math.max(MIN, maxWidth / whRatio),
      };
    } else {
      return {
        w: Math.max(MIN, maxHeight * whRatio),
        h: Math.max(MIN, maxHeight),
      };
    }
  }
};
