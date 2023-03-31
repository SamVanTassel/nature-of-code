// @ts-ignore
import c from 'nice-color-palettes';
import { checkContrast } from './';

const colors = c as string[][];

export const getContrastingColors = () => {
  const colorScheme = [... colors[Math.floor(Math.random() * colors.length)]] as string[];

  const color1Index = Math.floor(Math.random() * colorScheme.length);

  const [color1] = colorScheme.splice(color1Index, 1);
  let color2Index = Math.floor(Math.random() * colorScheme.length);
  let [color2] = colorScheme.splice(color2Index, 1);

  while (!checkContrast(color1, color2) && colorScheme.length) {
    color2Index = Math.floor(Math.random() * colorScheme.length);
    [color2] = colorScheme.splice(color2Index, 1);

    if (!color1 && !color2) {
      return {
        c1: 'FFFFFF',
        c2: '000000',
      }
    }
  }
  return { c1: color1, c2: color2 };
};
