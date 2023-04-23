import p5 from "p5";
import P5 from "p5";
import "../styles.scss";
import { Draggable, getSize } from "../util";

const imgPath = new URL('../../images/circle_10px.png', import.meta.url).toString();

type ParticleMode = 'ellipse'|'image'

export const ParticleSystemCosmicSketch = (p5: P5) => {
  const WIDTH = 800;
  const HEIGHT = 800;
  let img: P5.Image;
  let bgBlue: number;
  let perlinOffset = p5.random(0, 400);

  const PARTICLE_MODE: ParticleMode = 'ellipse';

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

    numRepellers = Math.floor(p5.random(3, 10));
    numAttractors = Math.floor(p5.random(1, 5));
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
    perlinOffset += .005;
    const bgBlueMin = p5.map(systems.length, 0, 5, 15, 45);
    const bgBlueMax = p5.map(systems.length, 0, 5, 45, 75);
    bgBlue = p5.map(p5.noise(perlinOffset), 0, 1, bgBlueMin, bgBlueMax);
    p5.background(0, 10, bgBlue);
    systems.forEach(ps => {
      ps.addParticle();
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

  const glow = (glowColor: P5.Color, blurriness: number) => {
    p5.drawingContext.shadowBlur = blurriness;
    p5.drawingContext.shadowColor = glowColor;
  }

  class Particle {
    location: P5.Vector;
    velocity: P5.Vector;
    acceleration: P5.Vector;
    mass: number;
    lifespan: number;
    r: number;
    g: number;
    b: number;
    mode: ParticleMode;
  
    constructor(l: P5.Vector, mode: ParticleMode) {
      this.location = l.copy();
      this.velocity = p5.createVector(p5.random(-2, 2), p5.random(-2, 2))
      this.acceleration = p5.createVector(.005, -.005);
      this.mass = 4;
      this.lifespan = 255;
      this.r = p5.random(200, 255);
      this.g = p5.random(200, 255);
      this.b = p5.random(200, 255);
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
        p5.noStroke();
        p5.fill(this.r, this.g, this.b, this.lifespan);
        glow(p5.color(this.r, this.g, this.b), 30);
        p5.ellipse(0, 0, this.mass * 2);
      } else if (this.mode === 'image') {
        p5.noStroke();
        p5.imageMode('center');
        p5.tint(this.r, this.g, this.b, this.lifespan);
        p5.image(img, 0, 0);
      }
    }

    isDead() {
      if (this.lifespan <= 0) return true;
      return false;
    }
  }
  
  class ParticleSystem {
    supply: number;
    particles: Particle[];
    origin: p5.Vector;

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
    c: P5.Color;
    cRoll: P5.Color;

    constructor(l: P5.Vector, m: number) {
      super(p5, l);
      this.m = m;
      this.strength = 5;
      const red = 80 + m * 2;
      const g = p5.random(40, 80);
      const b = p5.random(40, 80);
      this.c = p5.color(red, g, b);
      this.cRoll = p5.color(red + 50, g, b);
    }

    display() {
      this.update();
      p5.noStroke();
      glow(p5.color('black'), this.m);
      p5.fill(this.rollover ? this.cRoll : this.c);
      p5.ellipse(this.location.x, this.location.y, this.m);
      p5.fill('black');
      p5.ellipse(this.location.x, this.location.y, this.m - 4)
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
    c: P5.Color;
    cRoll: P5.Color;

    constructor(l: P5.Vector, m: number) {
      super(p5, l);
      this.m = m;
      this.strength = 5;
      const green = 150 + m * 2;
      const r = p5.random(140, 180);
      const b = p5.random(140, 180);
      this.c = p5.color(r, green, b);
      this.cRoll = p5.color(r, green + 50, b);
    }

    over() {
      if (P5.Vector.dist(p5.createVector(p5.mouseX, p5.mouseY), this.location) < this.m/2) {
        this.rollover = true;
      } else this.rollover = false;
    }

    display() {
      this.update();
      p5.noStroke();
      p5.fill(this.rollover ? this.cRoll : this.c);
      glow(this.c, this.m);
      p5.ellipse(this.location.x, this.location.y, this.m);
      p5.ellipse(this.location.x, this.location.y, this.m);
      glow(this.c, 0)
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
