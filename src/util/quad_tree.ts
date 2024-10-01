import type P5 from 'p5';

export class Rectangle {
  /** center value */
  x: number;
  /** center value */
  y: number;
  /** half width */
  w: number;
  /** half height */
  h: number;

  constructor({ x, y, w, h }: { x: number, y: number, w: number, h: number }) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  contains(p: Point) {
    return (
      p.x < this.x + this.w && p.x > this.x - this.w &&
      p.y < this.y + this.h && p.y > this.y - this.h
    )
  }

  intersects(area: Rectangle) {
    return !(
      this.x - this.w > area.x + area.w ||
      this.x + this.w < area.x - area.w ||
      this.y - this.h > area.y + area.h ||
      this.y + this.h < area.y - area.h
    )
  }
};

export class QuadTree {
  /** boundary */
  b: Rectangle;
  /** capacity */
  c: number;
  points: any[] = [];
  nw: QuadTree | undefined;
  ne: QuadTree | undefined;
  se: QuadTree | undefined;
  sw: QuadTree | undefined;
  divided: boolean;
  pointsChecked: 0;
  cellsChecked: 0;

  constructor(boundary: Rectangle, capacity: number) {
    this.b = boundary;
    this.c = capacity;
    this.divided = false;
  }

  insert(p: Point) {
    if (!this.b.contains(p)) return false;

    if (this.points.length < this.c && !this.divided) {
      this.points.push(p);
      return true;
    } else {
      if (!this.divided) {
        this.subdivide();
      }
      return (
        this.nw.insert(p) ||
        this.ne.insert(p) ||
        this.se.insert(p) ||
        this.sw.insert(p)
      );
    }
  }

  subdivide() {
    const halfW = this.b.w / 2;
    const halfH = this.b.h / 2;
    this.nw = new QuadTree(
      new Rectangle({
        x: this.b.x - halfW,
        y: this.b.y + halfH,
        h: halfH,
        w: halfW,
  }),
      this.c
    );
    this.sw = new QuadTree(
      new Rectangle({
        x: this.b.x - halfW,
        y: this.b.y - halfH,
        h: halfH,
        w: halfW,
      }),
      this.c
    );
    this.se = new QuadTree(
      new Rectangle({
        x: this.b.x + halfW,
        y: this.b.y + halfH,
        h: halfH,
        w: halfW,
      }),
      this.c
    );
    this.ne = new QuadTree(
      new Rectangle({
        x: this.b.x + halfW,
        y: this.b.y - halfH,
        h: halfH,
        w: halfW,
      }),
      this.c
    );
    this.divided = true;
    // move points into child nodes
    for (let p of this.points) {
      (this.nw.insert(p) || this.ne.insert(p) || this.se.insert(p) || this.sw.insert(p));
    }
    this.points = [];
  }

  clear() {
    this.points = [];
    this.nw = undefined;
    this.ne = undefined;
    this.se = undefined;
    this.sw = undefined;
    this.divided = false;
  }

  query(area: Rectangle, contained: Point[] = []) {
    if (!this.b.intersects(area)) return contained;
    for (let p of this.points) {
      if (area.contains(p)) {
        contained.push(p);
      }
    }
    if (this.divided) {
      this.nw.query(area, contained);
      this.ne.query(area, contained);
      this.se.query(area, contained);
      this.sw.query(area, contained);
    }
    return contained;
  }

  show(p5: P5, color?: P5.Color) {
    if (color) p5.stroke(color);
    else p5.stroke(0, 100);
    p5.noFill();
    p5.strokeWeight(1);
    p5.rectMode(p5.RADIUS);
    p5.rect(this.b.x, this.b.y, this.b.w, this.b.h);

    if (this.divided) {
      this.nw.show(p5, color);
      this.ne.show(p5, color);
      this.se.show(p5, color);
      this.sw.show(p5, color)
    }
  }

  queryAndShow(area: Rectangle, contained: Point[] = [], p5: P5) {
    if (!this.b.intersects(area)) return contained;
    for (let p of this.points) {
      if (area.contains(p)) {
        contained.push(p);
      }
      p5.stroke(255, 0, 0);
      p5.circle(p.x, p.y, 5);
    }
    if (this.divided) {
      this.nw.queryAndShow(area, contained, p5);
      this.ne.queryAndShow(area, contained, p5);
      this.se.queryAndShow(area, contained, p5);
      this.sw.queryAndShow(area, contained, p5);
    }
    return contained;
  }
}

type Point = {
  x: number
  y: number
  object: any
}
