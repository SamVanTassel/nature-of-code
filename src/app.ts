import P5 from "p5";
import "./styles.scss";
import {
  mouseFollowersSketch,
  windGravitySketch,
  windGravityFrictionSketch,
  dragSketch,
  singleDraggableAttractorSketch,
  manyAttractorsSketch,
  angularRotationSketch,
  cannonballSketch,
  arctanFollowersSketch,
  spaceshipSketch,
} from './archive';

const sketches: [string, (p5: P5) => void][] = [
  ['1 - Mouse Followers', mouseFollowersSketch],
  ['2.1 - Wind & Gravity', windGravitySketch],
  ['2.2 - Wind, Gravity & Friction', windGravityFrictionSketch],
  ['2.3 - Drag', dragSketch],
  ['2.6 - Single Draggable Attractor', singleDraggableAttractorSketch],
  ['2.8 - Many Attractors', manyAttractorsSketch],
  ['3.2 - Angular Rotation', angularRotationSketch],
  ['3.2b - Cannonball', cannonballSketch],
  ['3.5 - Arctan Followers', arctanFollowersSketch],
];
if (window.localStorage.getItem('defaultIndex') === null) {
  window.localStorage.setItem('defaultIndex', '7');
}

const defaultIndex = Number.parseInt(window.localStorage.getItem('defaultIndex'), 10);

const titles = sketches.map(s => s[0]);

const selectSketch = document.getElementById('select-sketch');
for (const pair of sketches) {
  const s = document.createElement('option');
  s.innerText = pair[0];
  if (pair[0] === sketches[defaultIndex][0]) {
    s.setAttribute('selected', 'true');
  }
  selectSketch.appendChild(s);
}

let sketch = sketches[defaultIndex][1];
let p = new P5(sketch, document.getElementById("app"));

selectSketch.onchange = (e) => {
  p.remove();
  //@ts-ignore
  const title = e.target.value;
  const i = titles.indexOf(title);
  window.localStorage.setItem('defaultIndex', i.toString());
  sketch = i > -1 ? sketches[i][1] : cannonballSketch;
  p = new P5(sketch, document.getElementById("app"));
}

const resetButton = document.getElementById('reset');
resetButton.onclick = () => {
  p.remove();
  p = new P5(sketch, document.getElementById("app"));
}
