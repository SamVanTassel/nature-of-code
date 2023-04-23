import p5 from "p5";
import P5 from "p5";
import "../styles.scss";
import { Draggable, getSize } from "../util";

const imgPath = new URL('../../images/circle_10px.png', import.meta.url).toString();

type ParticleMode = 'ellipse'|'image'

export const smokeSketch = (p5: P5) => {
  const WIDTH = 800;
  const HEIGHT = 540;
  const RANDOM_SEED = Math.random() * 100;
  const WIND_MAX = 1;
  const BG_COLOR = 255;
  const PARTICLE_MODE: ParticleMode = 'ellipse';
  const MIN_FRAMERATE = 30;

  let img: P5.Image;
  let sizes = [];

  let tableCoordinates: {
    corner: P5.Vector;
    left: number;
    right: number;
  };
  let bottoms: P5.Vector[] = [];

  const lift = p5.createVector(0, -.5);
  const wind = p5.createVector(0, 0);

  let emitter: Emitter;
  p5.preload = () => {
    img = p5.loadImage(imgPath);
  }

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h,
    );

    sizes = makeImageSizes(img, 20, 100, 10);
    for (let i = 0; i < 10; i++) {
      const copy = img.get();
    }

    p5.noCursor();
    p5.noStroke();
    emitter = new Emitter(p5.createVector(p5.mouseX, p5.mouseY));
  };

  p5.draw = () => {
    p5.background(BG_COLOR);
    drawTable();

    updateWind();
    drawMatchStick();
    // create smoke
    emitter.run();
    emitter.applyForce(lift);
    emitter.applyForce(wind);
  };

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };

  const updateWind = () => {
    const seed = p5.noise(p5.frameCount/100 + RANDOM_SEED);
    wind.x = p5.map(seed, 0, 1, -WIND_MAX, WIND_MAX);
    // display wind direction
    const windX = p5.map(wind.x, -WIND_MAX, WIND_MAX, 0, p5.width);
    p5.stroke('red');
    p5.line(windX, 0, windX, 30);
  }

  const drawTable = () => {
    if (!tableCoordinates) {
      const cornerX = p5.random(p5.width/6, p5.width - p5.width/6);
      const cornerY = p5.random(p5.height/5 * 2, p5.height - p5.height/3);
      tableCoordinates = {
      corner: p5.createVector(cornerX, cornerY),
      left: p5.random(cornerY + 10, p5.height - 40),
      right: p5.random(cornerY + 10, p5.height -40),
      }
    }
    p5.stroke(175);
    p5.fill(240);
    p5.beginShape();
    p5.vertex(0, p5.height);
    p5.vertex(0, tableCoordinates.left);
    p5.vertex(tableCoordinates.corner.x, tableCoordinates.corner.y);
    p5.vertex(p5.width, tableCoordinates.right);
    p5.vertex(p5.width, p5.height);
    p5.endShape();

    // p5.line(0, tableCoordinates.left, tableCoordinates.corner.x, tableCoordinates.corner.y);
    // p5.line(tableCoordinates.corner.x, tableCoordinates.corner.y, p5.width, tableCoordinates.right);
  }

  const drawMatchStick = () => {
    p5.noStroke();
    p5.push();
    // rudimentary drag on bottom of matchstick
    bottoms[p5.frameCount] = p5.createVector(p5.mouseX, p5.mouseY + 90);
    let bottom = p5.createVector(p5.mouseX, p5.mouseY + 90);
    if (p5.frameCount > 20) bottom = bottoms[p5.frameCount - 20];
    const angle = p5.createVector(p5.mouseX, p5.mouseY + 90).angleBetween(bottom);
    p5.translate(p5.mouseX, p5.mouseY);
    p5.rotate(angle);
    p5.fill('tan');
    p5.rect(-5, 10, 10, 120);
    p5.stroke('black');
    p5.strokeCap('square');
    // draw some hash marks on the match
    let long = false;
    for (let i = 12; i < 130; i+=2) {
      p5.line(3, i, 5, i - 2);
      if (long) {
        p5.line(1, i, 5, i - 2);
        long = false;
      } else long = true;
    }
    p5.fill(BG_COLOR);
    p5.noStroke();
    p5.rect(5, 9, 1, 120);
    p5.fill(20);
    p5.ellipse(0, 10, 10, 20);
    p5.ellipse(0, 4, 12, 14);
    p5.pop();
  }

  const makeImageSizes = (img: P5.Image, minSize: number, maxSize: number, numSizes: number = 10,): P5.Image[] => {
    const sizes = [];
    for (let i = 1; i < numSizes + 1; i++) {
      const copy = img.get();
      copy.resize((maxSize - minSize)/numSizes * (i - 1) + minSize, 0);
      sizes.push(copy);
    }
    return sizes;
  }

  class Particle {
    location: P5.Vector;
    velocity: P5.Vector;
    acceleration: P5.Vector;
    mass: number;
    lifespan: number;
    mode: ParticleMode
  
    constructor(l: P5.Vector, mode: ParticleMode) {
      this.location = l.copy();
      this.velocity = p5.createVector(p5.random(-.5, .5), p5.random(-.5, .5))
      this.acceleration = p5.createVector(.005, -.005);
      this.mass = 5;
      this.lifespan = 100;
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
      this.lifespan -= 1;
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
        p5.fill(175, this.lifespan)
        p5.ellipse(0, 0, this.mass * 250/this.lifespan);
      } else if (this.mode === 'image') {
        p5.imageMode('center');
        p5.tint(175, this.lifespan);
        p5.image(sizes[Math.floor(p5.map(this.lifespan, 100, 0, 0, sizes.length - 1))], 0, 0);
      }
    }

    isDead() {
      if (this.lifespan <= 0) return true;
      return false;
    }
  }
  
  class Emitter {
    particles: Particle[];
    origin: p5.Vector;

    constructor(o: P5.Vector) {
      this.particles = [];
      this.origin = o;
    }

    addParticle() {
      this.particles.push(new Particle(this.origin, PARTICLE_MODE));
    }

    applyForce(f: P5.Vector) {
      this.particles.forEach(p => {
        p.applyForce(f);
      });
    }

    run() {
      if (p5.frameRate() >= MIN_FRAMERATE) this.addParticle();
      this.origin = p5.createVector(p5.mouseX, p5.mouseY);
      this.particles.forEach(p => {
        p.run();
      });
      this.particles = this.particles.filter(p => !p.isDead());
    }
  }
};
