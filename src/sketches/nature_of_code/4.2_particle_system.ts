import P5 from "p5";
import "../../styles.scss";
import { Draggable, getSize } from "../../util";
import type { SketchHolder } from "../../types";

const imgPath = new URL('../../../images/circle_10px.png', import.meta.url).toString();

type ParticleMode = 'ellipse'|'image'

const sketch = (p5: P5) => {
  const WIDTH = 600;
  const HEIGHT = 340;
  let img: P5.Image;

  const PARTICLE_MODE: ParticleMode = 'ellipse';

  const gravity = p5.createVector(0, 1);
  let numRepellers: number;
  let numAttractors: number;
  
  let systems: ParticleSystem[] = [];
  let repellers: Repeller[] = [];
  let attractors: Attractor[] = [];

  p5.preload = () => {
    img = p5.loadImage(imgPath);
  }

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
    img.resize(20, 0);

    numRepellers = Math.floor(p5.random(2, 4));
    numAttractors = Math.floor(p5.random(1, 3));
    for (let i = 0; i < numRepellers; i++) {
      repellers.push(new Repeller(
        p5.createVector(
          p5.random(0, p5.width), 
          p5.random(0, p5.height)
        ),
        p5.random(10, 35),
      ));
    }
    for (let i = 0; i < numAttractors; i++) {
      attractors.push(new Attractor(
        p5.createVector(
          p5.random(0, p5.width), 
          p5.random(0, p5.height)
        ),
        p5.random(20, 40),
      ));
    }
  };

  p5.draw = () => {
    p5.background(255);
    systems.forEach(ps => {
      ps.addParticle();
      ps.applyForce(gravity);
      repellers.forEach(r => {
        ps.applyRepeller(r);
      });
      attractors.forEach(r => {
        ps.applyAttractor(r);
      });
      ps.run();
    });
    systems = systems.filter(s => !s.isEmpty());
    repellers.forEach(r => r.display());
    attractors.forEach(a => a.display());
  };

  p5.mouseClicked = () => {
    const overA = attractors.some(a => a.rollover);
    const overB = repellers.some(r => r.rollover);
    if (!overA && !overB && (p5.mouseX !== 0 && p5.mouseY !== 0)) {
      systems.push(new ParticleSystem(p5.createVector(p5.mouseX, p5.mouseY)));
    }
  }

  p5.mousePressed = () => {
    attractors.forEach(a => a.pressed());
    repellers.forEach(r => r.pressed());
  }

  p5.mouseReleased = () => {
    attractors.forEach(a => a.released());
    repellers.forEach(r => r.released());
  }

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };

  class Particle {
    location: P5.Vector;
    velocity: P5.Vector;
    acceleration: P5.Vector;
    mass: number;
    lifespan: number;
    mode: ParticleMode
  
    constructor(l: P5.Vector, mode: ParticleMode) {
      this.location = l.copy();
      this.velocity = p5.createVector(p5.random(-2, 2), p5.random(-2, 2))
      this.acceleration = p5.createVector(.005, -.005);
      this.mass = 5;
      this.lifespan = 255;
      this.mode = mode;
    }
  
    applyForce(force: P5.Vector) {
      const f = P5.Vector.div(force, this.mass);
      this.acceleration.add(f);
    }

    run() {
      this.update();
      this.display();
    }
  
    update() {
      this.checkEdges();
      this.velocity.add(this.acceleration);
      this.location.add(this.velocity);
      this.acceleration.mult(0);
      this.lifespan -= 2;
    }
  
    display() {
      p5.push();
      p5.translate(this.location.x, this.location.y);
      this.draw();
      p5.pop();
    }
  
    /** draw shape centered at 0, 0 */
    draw() {
      if (this.mode === 'ellipse') {
        p5.stroke(0, this.lifespan)
        p5.fill(175, this.lifespan)
        p5.ellipse(0, 0, this.mass * 2);
      } else if (this.mode === 'image') {
        p5.noStroke();
        p5.imageMode('center');
        p5.tint(175, this.lifespan);
        p5.image(img, 0, 0);
      }
    }

    isDead() {
      if (this.lifespan <= 0) return true;
      return false;
    }

    checkEdges() {
      if (this.location.x >= p5.width - this.mass) {
        this.location.x = p5.width - this.mass;
        this.velocity.x = -this.velocity.x;
      }
      if (this.location.x <= this.mass) {
        this.location.x = this.mass;
        this.velocity.x = -this.velocity.x;
      }
      if (this.location.y >= p5.height - this.mass) {
        this.location.y = p5.height - this.mass;
        this.velocity.y = -this.velocity.y;
      }
      if (this.location.y <= this.mass) {
        this.location.y = this.mass;
        this.velocity.y = -this.velocity.y;
      }
    }
  }
  
  class ParticleSystem {
    supply: number;
    particles: Particle[];
    origin: P5.Vector;

    constructor(o: P5.Vector) {
      this.particles = [];
      this.origin = o;
      this.supply = 100;
    }

    addParticle() {
      if (this.supply-- > 0) this.particles.push(new Particle(this.origin, PARTICLE_MODE));
    }

    applyForce(f: P5.Vector) {
      this.particles.forEach(p => {
        p.applyForce(f);
      });
    }

    applyRepeller(r: Repeller) {
      this.particles.forEach(p => {
        const f = r.repel(p);
        p.applyForce(f);
      });
    }

    applyAttractor(a: Attractor) {
      this.particles.forEach(p => {
        const f = a.attract(p);
        p.applyForce(f);
      });
    }

    run() {
      this.particles.forEach(p => {
        p.run();
      });
      this.particles = this.particles.filter(p => !p.isDead());
    }

    isEmpty() {
      if (this.supply <= 0 && this.particles.every(p => p.isDead())) return true;
      return false;
    }
  }

  class Repeller extends Draggable {
    m: number;
    strength: number;

    constructor(l: P5.Vector, m: number) {
      super(p5, l);
      this.m = m;
      this.strength = 5;
    }

    display() {
      this.update();
      p5.stroke(100);
      p5.fill(this.rollover ? 175 : 100);
      p5.ellipse(this.location.x, this.location.y, this.m);
    }

    over() {
      if (P5.Vector.dist(p5.createVector(p5.mouseX, p5.mouseY), this.location) < this.m/2) {
        this.rollover = true;
      } else this.rollover = false;
    }

    repel(p: Particle) {
      const dir = P5.Vector.sub(this.location, p.location);
      let d = dir.mag();
      dir.normalize();
      d = p5.constrain(d, 5, 100);
      const force = -1 * (this.m * this.m * this.strength) / (d * d);
      dir.mult(force);
      return dir;
    }
  }

  class Attractor extends Draggable {
    m: number;
    strength: number;

    constructor(l: P5.Vector, m: number) {
      super(p5, l);
      this.m = m;
      this.strength = 5;
    }

    over() {
      if (P5.Vector.dist(p5.createVector(p5.mouseX, p5.mouseY), this.location) < this.m/2) {
        this.rollover = true;
      } else this.rollover = false;
    }

    display() {
      this.update();
      p5.stroke(0);
      p5.fill(this.rollover ? 200 : 255);
      p5.ellipse(this.location.x, this.location.y, this.m);
    }

    attract(p: Particle) {
      const dir = P5.Vector.sub(this.location, p.location);
      let d = dir.mag();
      dir.normalize();
      d = p5.constrain(d, 10, 100);
      const force = (this.m * this.m * this.strength) / (d * d);
      dir.mult(force);
      return dir;
    }
  }
};

export const particleSystemSketch: SketchHolder = {
  sketch,
  info: {
    title: "4.2 - Particle System",
    controls: '',
    about: '',
  }
};
