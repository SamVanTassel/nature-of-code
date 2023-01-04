import P5 from "p5";

const sketch = (p5: P5) => {
  const height = p5.height;
  const width = p5.width;
  const random = p5.random;
  const createVector = p5.createVector;

  const movers: Mover[] = [];
  let gravity: P5.Vector;
  let wind: P5.Vector;
  const c = .05;
  const normal_ = 1;
  const frictionMag = c * normal_;

  p5.setup = () => {
    for (let i = 0; i < 10; i++) {
      movers.push(new Mover());
    }
    gravity = createVector(0, .2);
    wind = createVector(.01, 0);
  }

  p5.draw = () => {
    p5.background(200);
    movers.forEach(mover => {
      const specificGravity = P5.Vector.mult(gravity, mover.mass);
      mover.applyForce(specificGravity);

      const friction = mover.velocity.copy().normalize().mult(-1);
      if (mover.location.y >= (height - mover.radius)) {
        friction.mult(.05);
      } else {
        friction.mult(.01);
      }
      mover.applyForce(friction);

      mover.applyForce(wind);
      mover.update();
      mover.checkEdges();
      mover.display();
    })
  }

  function mouseClicked() {
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
      this.location =  x & y ? createVector(x, y) : createVector(random(width), random(height));
      this.velocity = createVector(0, 0);
      this.acceleration = createVector(.001, .001);
      this.color = p5.color(random(0, 255), random(0, 255), random(0, 255), random(0, 255))
      this.mass = random(.75, 1.25);
      this.radius = this.mass * 16;
    }

    applyForce(force) {
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
      if (this.location.x + this.radius/2 > width) {
        this.velocity.x = - this.velocity.x;
        this.location.x = width - this.radius/2;
      }
  
      if (this.location.y + this.radius/2 > height) {
        this.velocity.y = - this.velocity.y;
        this.location.y = height - this.radius/2
      }
    }
  }
}

new P5(sketch);
