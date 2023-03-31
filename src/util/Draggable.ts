import P5 from "p5";

export abstract class Draggable {
  p5: P5;
  dragging: boolean;
  rollover: boolean;
  location: P5.Vector;
  offsetX: number;
  offsetY: number;

  constructor(p5: P5, location?: P5.Vector) {
    this.p5 = p5;
    this.dragging = false; // Is the object being dragged?
    this.rollover = false; // Is the mouse over the ellipse?
    this.location = location ? location : new P5.Vector(p5.width/2, p5.height/2);
  }

  // Is mouse over object
  abstract over(): void

  // Adjust location if being dragged
  update() {
    this.over();
    if (this.dragging) {
      this.location.x = this.p5.mouseX + this.offsetX;
      this.location.y = this.p5.mouseY + this.offsetY;
    }
  }

  // Did I click on the object?
  pressed() {
    if (this.rollover) {
      this.dragging = true;
      this.offsetX = this.location.x - this.p5.mouseX;
      this.offsetY = this.location.y - this.p5.mouseY;
    }
  }

  // Quit dragging
  released() {
    this.dragging = false;
  }
}