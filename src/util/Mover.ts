import P5 from 'p5';

export abstract class Mover {
  p5: P5;
  location: P5.Vector;
  velocity: P5.Vector;
  acceleration: P5.Vector;
  angle = 0;
  angularVelocity = 0;
  angularMomentum = 0;
  color: P5.Color;
  mass: number;
  radius: number;

  constructor({ p5, x, y, c, m, r, v }: { p5: P5, x?: number, y?: number, c?: P5.Color, m?: number, r?: number, v?: P5.Vector }) {
    this.p5 = p5;
    this.location =  x & y ? p5.createVector(x, y) : p5.createVector(p5.random(p5.width), p5.random(p5.height));
    this.velocity = v ? v : p5.createVector(p5.random(-2,2), p5.random(-2,2));
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

    this.angularMomentum = this.acceleration.x / 10;
    this.angularVelocity += this.p5.constrain(this.angularMomentum, -.1, .1);
    this.angle += this.angularVelocity;

    this.acceleration.mult(0);
  }

  display() {
    this.p5.push();
    this.p5.translate(this.location.x, this.location.y);
    this.p5.rotate(this.angle);
    this.draw();
    this.p5.pop();
  }

  /** draw shape centered at 0, 0 */
  abstract draw(): void;
}
