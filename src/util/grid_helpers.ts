export const getXY = (i: number, gridWidth: number) => {
  const y = Math.floor(i / gridWidth);
  const x = i % gridWidth;
  return [x, y];
}

type Coordinates = {
  x: number,
  y: number,
}

export const getI = (coordinates: Coordinates,  gridWidth: number) => {
  return coordinates.y * gridWidth + coordinates.x;
}

export function swap<T> (grid: Array<T>, next: Array<T>): [Array<T>, Array<T>] {
  let temp = grid;
  grid = next;
  next = temp;
  return [grid, next];
}