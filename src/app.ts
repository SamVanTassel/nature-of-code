import P5 from "p5";
import "./styles.scss";

const sketch = (p5: P5) => {
  const movers: Mover[] = [];
  let gravity: P5.Vector;
  let wind: P5.Vector;
  const c = .05;
  const normal_ = 1;
  const frictionMag = c * normal_;
  let liquid: Liquid;

  p5.setup = () => {
    p5.createCanvas(640, 360);
  liquid = new Liquid(0, p5.height/2, p5.width, p5.height/2, .1);

  for (let i = 0; i < 10; i++) {
    movers.push(new Mover());
  }
  gravity = p5.createVector(0, .2);
  wind = p5.createVector(.01, 0);
  };

  p5.draw = () => {
    p5.background(200);
    liquid.display();
    movers.forEach(mover => {
      const specificGravity = P5.Vector.mult(gravity, mover.mass);
      mover.applyForce(specificGravity);

      const friction = mover.velocity.copy().normalize().mult(-1);
      if (mover.location.y >= (p5.height - mover.radius)) {
        friction.mult(.05);
      } else {
        friction.mult(.01);
      }
      mover.applyForce(friction);

      mover.applyForce(wind);

      if (mover.isInside(liquid)) {
        mover.drag(liquid);
      }

      mover.update();
      mover.checkEdges();
      mover.display();
    })
  };

  p5.mouseClicked = () => {
    movers.push(new Mover(p5.mouseX, p5.mouseY));
  }
  
  class Mover {
    location;
    velocity;
    acceleration;
    color;
    mass;
    radius;
  
  
    constructor(x?, y?) {
      this.location =  x & y ? p5.createVector(x, y) : p5.createVector(p5.random(p5.width), p5.height/4);
      this.velocity = p5.createVector(0, 0);
      this.acceleration = p5.createVector(.001, .001);
      this.color = p5.color(p5.random(0, 255), p5.random(0, 255), p5.random(0, 255), p5.random(0, 255))
      this.mass = p5.random(.75, 1.25);
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
      if (this.location.x + this.radius/2 > p5.width) {
        this.velocity.x = - this.velocity.x;
        this.location.x = p5.width - this.radius/2;
      }
   
      if (this.location.y + this.radius/2 > p5.height) {
        this.velocity.y = - this.velocity.y;
        this.location.y = p5.height - this.radius/2
      }
    }
  
    isInside(body) {
      if (this.location.x > body.x
        && this.location.x < body.x + body.w
        && this.location.y > body.y
        && this.location.y < body.y + body.h) {
          return true;
        } else return false;
    }
  
    drag (liquid) {
      const speed = this.velocity.mag();
      const dragMagnitude = liquid.c * speed * speed;
  
      const drag = this.velocity.copy().mult(-1).normalize().mult(dragMagnitude);
  
      this.applyForce(drag);
    }
  }
  
  class Liquid {
    x;
    y;
    w;
    h;
    c;
    
    constructor(x, y, w, h, c) {
      this.x = x;
      this.y = y;
      this. w = w;
      this.h = h;
      this.c = c;
    }
  
    display() {
      p5.noStroke();
      p5.fill(175);
      p5.rect(this.x, this.y, this.w, this.h);
    }
  }
}

new P5(sketch, document.getElementById("app"));
