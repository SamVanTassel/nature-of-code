const hexToRgb = (hex: string) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const luminance = (color: { r: number, g: number, b: number }) => {
  const { r, g, b } = color;
  var a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928
          ? v / 12.92
          : Math.pow( (v + 0.055) / 1.055, 2.4 );
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export const checkContrast = (color1: string, color2: string) => {
  const c1rgb = hexToRgb(color1);
  const c2rgb = hexToRgb(color2);

  const c1luminance = luminance(c1rgb);
  const c2luminance = luminance(c2rgb);

  const ratio = c1luminance > c2luminance 
  ? ((c2luminance + 0.05) / (c1luminance + 0.05))
  : ((c1luminance + 0.05) / (c2luminance + 0.05));

  return ratio < 1/3;
};
