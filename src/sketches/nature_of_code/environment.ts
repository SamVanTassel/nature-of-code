import P5 from "p5";
import "../../styles.scss";
import { getSize } from "../../util";
import { SketchHolder } from "../../types";

const sketch = (p5: P5) => {
  const WIDTH = 1000;
  const HEIGHT = WIDTH;

  const ants: Ant[] = [];
  const G = .5;
  const minGravDistance = 2;
  const maxGravDistance = 25;

  p5.setup = () => {
    p5.createCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );

    for (let i = 0; i < 3; i++) {
      ants.push(new Ant({}));
    }
  };

  p5.draw = () => {
    // p5.background(110, 90, 90);
    ants.forEach(ant => {
      ants.forEach(a => {
        if (a !== ant) {
          const gravity = a.attract(ant);
          ant.applyForce(gravity);
        }
      })
      ant.update();
      ant.checkEdges();
      ant.display();
    })
  };

  p5.mouseClicked = () => {
    ants.push(new Ant({ x: p5.mouseX, y: p5.mouseY }));
  }

  p5.windowResized = () => {
    p5.resizeCanvas(
      getSize(WIDTH, HEIGHT).w,
      getSize(WIDTH, HEIGHT).h
    );
  };

// CLASSES
  abstract class Mover {
    location: P5.Vector;
    velocity: P5.Vector;
    acceleration: P5.Vector;
    color: P5.Color;
    mass: number;
  
    constructor({ x, y, v, a, c, m }: { x: number, y: number, v?: P5.Vector, a?: P5.Vector, c: P5.Color, m: number }) {
      this.location =  p5.createVector(x, y);
      this.velocity = v ? v : p5.createVector(0, 0);
      this.acceleration = a ? a : p5.createVector(0, 0);
      this.color = c;
      this.mass = m;
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

    abstract checkEdges(): void;

    abstract display(): void;
  }

  class Ant extends Mover {
    location: P5.Vector;
    velocity: P5.Vector;
    acceleration: P5.Vector;
    color: P5.Color;
    mass: number;
    radius: number;
  
    constructor({ x, y, c, m }: { x?: number, y?: number, c?: P5.Color, m?: number, r?: number }) {
      const v = p5.createVector(p5.random(-.2,.2), p5.random(-.2,.2));
      const a = p5.createVector(.001, .001);
      // brownish color by default
      const rc = p5.random(0, 50);
      c = c ? c : p5.color(rc + p5.random(0, 50), rc, rc);
      x = x ? x : p5.random(p5.width);
      y = y ? y : p5.random(p5.height);
      m = m ? m : p5.random(.1, .5);
      super({x, y, v, a, c, m });
      this.radius = this.mass * 30;
    }

    attract(m: Ant): P5.Vector {
      const force = P5.Vector.sub(this.location, m.location);
      let distance = force.mag();
      distance = p5.constrain(distance, minGravDistance, maxGravDistance);
      force.normalize();

      const strength = (G * this.mass * m.mass) / (distance * distance);
      force.mult(strength);
      return force;
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

    checkEdges() {
      if (this.location.x < this.radius) this.location.x = p5.width - this.radius;
      if (this.location.x > p5.width - this.radius) this.location.x = this.radius;
      if (this.location.y < this.radius) this.location.y = p5.height - this.radius;
      if (this.location.y > p5.height - this.radius) this.location.y = this.radius;
    }
  
    display() {
      p5.noStroke();
      p5.fill(this.color);
      p5.ellipse(this.location.x, this.location.y, this.radius);
    }
  }

  class Prey extends Mover {
    constructor({ x, y, c, m }) {
      super({ x, y, c, m })
    }

    checkEdges() {

    }
    
    display() {
      p5.noStroke();
      p5.fill(this.color);
      p5.ellipse(this.location.x, this.location.y, 15);
    }
  }
}

export const environmentSketch: SketchHolder = {
  sketch,
  info: {
    title: "WIP - environment project",
    controls: '',
    about: 'this is nothing yet',
  }
}

