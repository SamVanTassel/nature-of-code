import P5 from "p5";
import "./styles.scss";

const sketch = (p5: P5) => {
  const movers: Mover[] = [];
  let a: Attractor;
  const G = .5;
  const minGravDistance = 2;
  const maxGravDistance = 25;
  const normal_ = 1;

  p5.setup = () => {
    p5.createCanvas(1000, 1000);

    for (let i = 0; i < 10; i++) {
      movers.push(new Mover({}));
    }
    a = new Attractor();
  };

  p5.draw = () => {
    p5.background(15, 15, 24);
    a.over();
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
    if (!a.rollover) movers.push(new Mover({ x: p5.mouseX, y: p5.mouseY }));
  }

  p5.mousePressed = () => {
    a.pressed();
  }

  p5.mouseReleased = () => {
    a.released();
  }
  
  class Mover {
    location: P5.Vector;
    velocity: P5.Vector;
    acceleration: P5.Vector;
    color: P5.Color;
    mass: number;
    radius: number;
  
    constructor({ x, y, c, m, r }: { x?: number, y?: number, c?: P5.Color, m?: number, r?: number }) {
      this.location =  x & y ? p5.createVector(x, y) : p5.createVector(p5.random(p5.width), p5.random(p5.height));
      this.velocity = p5.createVector(p5.random(-2,2), p5.random(-2,2));
      this.acceleration = p5.createVector(.001, .001);
      this.color = c ? c : p5.color(p5.random(100, 255), p5.random(100, 255), p5.random(100, 255), p5.random(100, 255))
      this.mass = m ? m : p5.random(.75, 1.25);
      this.radius = r ? r : this.mass * 16;
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
      p5.noStroke();
      p5.fill(this.color);
      p5.ellipse(this.location.x, this.location.y, this.radius);
    }
  }

  class Draggable {
    dragging: boolean;
    rollover: boolean;
    location: P5.Vector;
    x: number;
    y: number;
    r: number;
    offsetX: number;
    offsetY: number;

    constructor(x: number, y: number, r: number) {
      this.dragging = false; // Is the object being dragged?
      this.rollover = false; // Is the mouse over the ellipse?
      this.location = new P5.Vector(p5.width/2, p5.height/2);
      this.r = r;
    }
  
    over() {
      // Is mouse over object
      if (
        p5.mouseX > this.location.x - this.r
        && p5.mouseX < this.location.x + this.r
        && p5.mouseY > this.location.y - this.r
        && p5.mouseY < this.location.y + this.r
      ) {
        this.rollover = true;
      } else {
        this.rollover = false;
      }
    }
  
    update() {
      // Adjust location if being dragged
      if (this.dragging) {
        this.location.x = p5.mouseX;
        this.location.y = p5.mouseY;
      }
    }
  
    pressed() {
      // Did I click on(ish) the object?
      if (
        p5.mouseX > this.location.x - this.r
        && p5.mouseX < this.location.x + this.r
        && p5.mouseY > this.location.y - this.r
        && p5.mouseY < this.location.y + this.r
      ) {
        this.dragging = true;
      }
    }
  
    released() {
      // Quit dragging
      this.dragging = false;
    }
  }

  class Attractor extends Draggable {
    mass: number;

    constructor() {
      super(p5.width/2, p5.height/2, 40)
      this.mass = 20;
    }

    display(): void {
      p5.stroke(0);
      p5.fill(175, 200);
      p5.ellipse(this.location.x, this.location.y, this.mass * 2);
    }

    attract(m: Mover): P5.Vector {
      const force = P5.Vector.sub(this.location, m.location);
      const distance = p5.constrain(force.mag(), minGravDistance, maxGravDistance);
      force.normalize();
      const strength = (G * this.mass * m.mass) / (distance * distance);
      force.mult(strength);
      return force;
    }
  }
}

new P5(sketch, document.getElementById("app"));
