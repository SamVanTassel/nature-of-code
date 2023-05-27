import p5 from "p5";

export const inbounds = (p5: p5) => {
  if (
    p5.mouseX <= p5.width &&
    p5.mouseX >= 0 &&
    p5.mouseY <= p5.height &&
    p5.mouseY >= 0
  ) return true;
  else return false;
}
