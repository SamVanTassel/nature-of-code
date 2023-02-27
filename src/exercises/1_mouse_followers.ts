import P5 from "p5";
import "../styles.scss";
import { getSize } from "../util";

export const mouseFollowersSketch = (p5: P5) => {
  const movers: Mover[] = [];
  const WIDTH = 600;
  const HEIGHT = 340;

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
    for (let i = 0; i < 10; i++) {
      movers.push(new Mover());
    }
  }

  p5.draw = () => {
    p5.background(200);
    movers.forEach(mover => {
      mover.update();
      mover.checkEdges();
      mover.display();
    })
  }

  p5.mouseClicked = () => {
    movers.push(new Mover(p5.mouseX, p5.mouseY));
  }

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };

  class Mover {
    location: P5.Vector;
    velocity: P5.Vector;
    acceleration: P5.Vector;
    color: P5.Color;
    topspeed: number;

    constructor(x?: number, y?: number) {
      this.location =  x & y ? p5.createVector(x, y) : p5.createVector(p5.random(p5.width), p5.random(p5.height));
      this.velocity = p5.createVector(p5.random(-2, 2), p5.random(-2, 2));
      this.acceleration = p5.createVector(-.001, .01);
      this.topspeed = 10;
      this.color = p5.color(p5.random(0, 255), p5.random(0, 255), p5.random(0, 255), p5.random(0, 255))
    }

    update() {
      const mouse = p5.createVector(p5.mouseX, p5.mouseY);
      const dir = P5.Vector.sub(mouse, this.location).normalize();
      
      dir.mult(.5);

      this.acceleration = dir;

      this.velocity.add(this.acceleration);
      this.velocity.limit(this.topspeed);
      this.location.add(this.velocity);
    }

    display() {
      p5.stroke(0);
      p5.fill(this.color);
      p5.ellipse(this.location.x, this.location.y, 16, 16);
    }

    checkEdges() {
      if (this.location.x > p5.width) {
        this.location.x = 0;
      } else if (this.location.x < 0) {
        this.location.x = p5.width;
      }
  
      if (this.location.y > p5.height) {
        this.location.y = 0;
      } else if (this.location.y < 0) {
        this.location.y = p5.height;
      }
    }
  }
}
