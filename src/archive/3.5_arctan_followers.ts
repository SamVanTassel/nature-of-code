import P5 from "p5";
import "../styles.scss";

const sketch = (p5: P5) => {
  const movers: Mover[] = [];

  p5.setup = () => {
    p5.createCanvas(640, 360);
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
      const angle = this.velocity.heading();
      p5.stroke(0);
      p5.fill(this.color);
      p5.push();
      p5.rectMode(p5.CENTER);
      p5.translate(this.location.x, this.location.y);
      p5.rotate(angle);
      p5.rect(0,0,30,10);
      p5.pop();
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

new P5(sketch, document.getElementById("app"));
