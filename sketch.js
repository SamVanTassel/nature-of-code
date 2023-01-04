const movers = [];
let gravity;
let wind;
const c = .05;
const normal_ = 1;
const frictionMag = c * normal_;
let liquid;

function setup() {
  createCanvas(640, 360);
  liquid = new Liquid(0, height/2, width, height/2, .1);

  for (let i = 0; i < 10; i++) {
    movers.push(new Mover());
  }
  gravity = createVector(0, .2);
  wind = createVector(.01, 0);
}
function draw() {
  background(200);
  liquid.display();
  movers.forEach(mover => {
    const specificGravity = p5.Vector.mult(gravity, mover.mass);
    mover.applyForce(specificGravity);

    const friction = mover.velocity.copy().normalize().mult(-1);
    if (mover.location.y >= (height - mover.radius)) {
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
}

function mouseClicked() {
  movers.push(new Mover(mouseX, mouseY));
}

class Mover {
  location;
  velocity;
  acceleration;
  color;
  mass;
  radius;


  constructor(x, y) {
    this.location =  x & y ? createVector(x, y) : createVector(random(width), height/4);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(.001, .001);
    this.color = color(random(0, 255), random(0, 255), random(0, 255), random(0, 255))
    this.mass = random(.75, 1.25);
    this.radius = this.mass * 16;
  }

  applyForce(force) {
    const f = p5.Vector.div(force, this.mass);
    this.acceleration.add(f);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.location.add(this.velocity);
    this.acceleration.mult(0);
  }

  display() {
    stroke(0);
    fill(this.color);
    ellipse(this.location.x, this.location.y, this.radius);
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
    noStroke();
    fill(175);
    rect(this.x, this.y, this.w, this.h);
  }
}