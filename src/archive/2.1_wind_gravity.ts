import P5 from "p5";
import "../styles.scss";

const sketch = (p5: P5) => {
  const movers: Mover[] = [];
  let gravity: P5.Vector;
  let wind: P5.Vector;


  p5.setup = () => {
    p5.createCanvas(640, 360);
    for (let i = 0; i < 10; i++) {
      movers.push(new Mover());
    }
    gravity = p5.createVector(0, .2);
    wind = p5.createVector(.01, 0);
  }

  p5.draw = () => {
    p5.background(200);
    movers.forEach(mover => {
      mover.applyForce(P5.Vector.mult(gravity, mover.mass));
      mover.applyForce(wind);
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
    mass: number;
    radius: number;

    constructor(x?: number, y?: number) {
      this.location =  x & y ? p5.createVector(x, y) : p5.createVector(p5.random(p5.width), p5.random(p5.height));
      this.velocity = p5.createVector(0, 0);
      this.acceleration = p5.createVector(.001, .001);
      this.color = p5.color(p5.random(0, 255), p5.random(0, 255), p5.random(0, 255), p5.random(0, 255))
      this.mass = p5.random(.75, 1.25);
      this.radius = this.mass * 16;
    }

    applyForce(force: P5.Vector) {
      const f = P5.Vector.div(force, this.mass);
      this.acceleration.add(f);
    }

    update() {
      this.velocity.add(this.acceleration);
      this.location.add(this.velocity);
      this.acceleration.mult(0);
    }

    display() {
      p5.stroke(0);
      p5.fill(this.color);
      p5.ellipse(this.location.x, this.location.y, this.radius);
    }

    checkEdges() {
      if (this.location.x + this.radius/2 > p5.width) {
        this.velocity.x = - this.velocity.x;
        this.location.x = p5.width - this.radius/2;
      }
  
      if (this.location.y + this.radius/2 > p5.height) {
        this.velocity.y = - this.velocity.y;
        this.location.y = p5.height - this.radius/2
      }
    }
  }
}

new P5(sketch, document.getElementById("app"));
