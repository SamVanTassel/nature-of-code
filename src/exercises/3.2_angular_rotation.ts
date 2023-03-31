import P5 from "p5";
import "../styles.scss";
import { Draggable, Mover, getSize } from '../util';

export const angularRotationSketch = (p5: P5) => {
  const WIDTH = 600;
  const HEIGHT = 340;
  const movers: Mover[] = [];
  let a: Attractor;
  const G = .5;
  const minGravDistance = 2;
  const maxGravDistance = 25;
  const normal_ = 1;

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );

    for (let i = 0; i < 10; i++) {
      movers.push(new FlyingSquare({}));
    }
    a = new Attractor(undefined, undefined, 100);
  };

  p5.draw = () => {
    p5.background(15, 15, 24);
    a.update();
    a.display();
    movers.forEach(mover => {
      const gravity = a.attract(mover);
      mover.applyForce(gravity);
      mover.update();
      mover.display();
    })
  };

  p5.mouseClicked = () => {
    if (!a.rollover) movers.push(new FlyingSquare({ x: p5.mouseX, y: p5.mouseY }));
  }

  p5.mousePressed = () => {
    a.pressed();
  }

  p5.mouseReleased = () => {
    a.released();
  }

  p5.windowResized = () => {
    p5.resizeCanvas(getSize(WIDTH, HEIGHT).w, getSize(WIDTH, HEIGHT).h);
  };

  class FlyingSquare extends Mover {
    constructor({ x, y, c, m, r }: {x?: number, y?: number, c?: P5.Color, m?: number, r?: number }) {
      super({ p5, x: x, y: y, c, m , r});
    }
    
    draw() {
      p5.rectMode(p5.CENTER);
      p5.noStroke();
      p5.fill(this.color);
      p5.rect(0, 0, this.radius, this.radius * 1.3);
    }
  }

  class Attractor extends Draggable {
    mass: number;
    radius: number;

    constructor(x?: number, y?: number, r?: number) {
      super(p5, x && y ? p5.createVector(x, y) : undefined)
      this.radius = r ? r : 40;
      this.mass = this.radius/2;
    }

    display(): void {
      p5.stroke(0);
      this.rollover ? p5.fill(100, 200) : p5.fill(175, 200);
      p5.ellipse(this.location.x, this.location.y, this.radius);
    }

    attract(m: Mover): P5.Vector {
      const force = P5.Vector.sub(this.location, m.location);
      const distance = p5.constrain(force.mag(), minGravDistance, maxGravDistance);
      force.normalize();
      const strength = (G * this.mass * m.mass) / (distance * distance);
      force.mult(strength);
      return force;
    }

    over() {
      if (
        (Math.pow(p5.mouseX - this.location.x, 2)
        + Math.pow(p5.mouseY - this.location.y, 2)) 
        < Math.pow(this.radius/2, 2)
      ) {
        this.rollover = true;
      } else {
        this.rollover = false;
      }
    }
  }
}
