export function logMap (
  number: number,
  start1: number,
  stop1: number,
  start2: number,
  stop2: number,
  skew: number
) {
  const originalRange = stop1 - start1;
  const newRange = stop2 - start2;
  const curve = Math.pow(10, skew);
  const normalizedCurVal = (number - start1) / originalRange;
  const rangedVal = ((Math.pow(normalizedCurVal, curve) * newRange) + start2);
  return rangedVal;
}
