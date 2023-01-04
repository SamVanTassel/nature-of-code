const movers = [];

function setup() {
  createCanvas(640, 360);
  for (let i = 0; i < 10; i++) {
    movers.push(new Mover());
  }
}

function draw() {
  background(200);
  movers.forEach(mover => {
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

  constructor(x, y) {
    this.location =  x & y ? createVector(x, y) : createVector(random(width), random(height));
    this.velocity = createVector(random(-2, 2), random(-2, 2));
    this.acceleration = createVector(-.001, .01);
    this.topspeed = 10;
    this.color = color(random(0, 255), random(0, 255), random(0, 255), random(0, 255))
  }

  update() {
    const mouse = createVector(mouseX, mouseY);
    const dir = p5.Vector.sub(mouse, this.location).normalize();
    
    dir.mult(.5);

    this.acceleration = dir;

    this.velocity.add(this.acceleration);
    this.velocity.limit(this.topspeed);
    this.location.add(this.velocity);
  }

  display() {
    stroke(0);
    fill(this.color);
    ellipse(this.location.x, this.location.y, 16, 16);
  }

  checkEdges() {
    if (this.location.x > width) {
      this.location.x = 0;
    } else if (this.location.x < 0) {
      this.location.x = width;
    }
 
    if (this.location.y > height) {
      this.location.y = 0;
    } else if (this.location.y < 0) {
      this.location.y = height;
    }
  }
}
