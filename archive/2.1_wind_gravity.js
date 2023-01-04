const movers = [];
let gravity;
let wind;

function setup() {
  createCanvas(640, 360);
  for (let i = 0; i < 10; i++) {
    movers.push(new Mover());
  }
  gravity = createVector(0, .2);
  wind = createVector(.01, 0);
}

function draw() {
  background(200);
  movers.forEach(mover => {
    mover.applyForce(p5.Vector.mult(gravity, mover.mass));
    mover.applyForce(wind);
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
    this.location =  x & y ? createVector(x, y) : createVector(random(width), random(height));
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
}