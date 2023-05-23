import P5 from "p5";
import "./styles.scss";
import {
  oneDimendionalCollisionSketch,
  mouseFollowersSketch,
  windGravitySketch,
  windGravityFrictionSketch,
  windGravityFrictionCollisionSketch,
  dragSketch,
  singleDraggableAttractorSketch,
  manyAttractorsSketch,
  angularRotationSketch,
  cannonballSketch,
  arctanFollowersSketch,
  spaceshipSketch,
  triangleCollisionSketch,
  oneDellularAutomationSketch,
  gameOfLifeSketch,
  seekingATargetSketch,
  ParticleSystemSketch,
  ParticleSystemCosmicSketch,
  smokeSketch,
  wanderersSketch,
  flowFieldsSketch,
  linearPathFollowingSketch,
  circularPathFollowingSketch,
  groupBehaviorSketch,
  flockingSketch,
  rayCastingSketch,
  rayCastingPlusSketch,
} from './exercises';
import { environmentSketch } from "./environment";

const sketches: [string, (p5: P5) => void][] = [
  ['0.1 - 1D Collision', oneDimendionalCollisionSketch],
  ['1 - Mouse Followers', mouseFollowersSketch],
  ['1a - Triangle Collision', triangleCollisionSketch],
  ['2.1 - Wind & Gravity', windGravitySketch],
  ['2.2 - Wind, Gravity & Friction', windGravityFrictionSketch],
  ['2.2b - Wind, Gravity, Friction, Collision', windGravityFrictionCollisionSketch],
  ['2.3 - Drag', dragSketch],
  ['2.6 - Single Draggable Attractor', singleDraggableAttractorSketch],
  ['2.8 - Many Attractors', manyAttractorsSketch],
  ['3.2 - Angular Rotation', angularRotationSketch],
  ['3.2b - Cannonball', cannonballSketch],
  ['3.5 - Arctan Followers', arctanFollowersSketch],
  ['4.2 - Particle System', ParticleSystemSketch],
  ['4.2b - Particle System [COSMIC]', ParticleSystemCosmicSketch],
  ['4.8 - Smoke', smokeSketch],
  ['6.1 - Seeking a Target', seekingATargetSketch],
  ['6.4 - Wanderers', wanderersSketch],
  ['6.6 - Flow Fields', flowFieldsSketch],
  ['6.8 - Linear Path Following', linearPathFollowingSketch],
  ['6.8b - Circular Path Following', circularPathFollowingSketch],
  ['6.11 - Group Behavior', groupBehaviorSketch],
  ['6.13 - Flocking', flockingSketch],
  ['7.4 - 1d Cellular Automation', oneDellularAutomationSketch],
  ['7.7 - Game of Life', gameOfLifeSketch],
  ['WIP - spaceship', spaceshipSketch],
  ['WIP - environment project', environmentSketch],
  ['xc - Ray Casting', rayCastingSketch],
  ['xc - Ray Casting Plus', rayCastingPlusSketch],
];

const sidenav = document.getElementById('sidenav');
const sidenavList = document.getElementById('sidenavList');

const createLinkText = (s: string) => {
  const [,title] = s.match(/- (.*)/);
  return title.toLowerCase().replace(/ /g, '_');
};

for (const pair of sketches) {
  const title = document.createElement('li');
  const a = document.createElement('a');
  a.innerText = pair[0];
  a.href = createLinkText(pair[0]);
  title.appendChild(a);
  sidenavList.appendChild(title);
}

const container = document.getElementsByClassName('container')[0] as HTMLElement;

const closeSidenav = document.getElementById('closebtn');
closeSidenav.onclick = () => {
  sidenav.style.width = '0';
  container.style.marginLeft = '0';
};
const openSidenav = document.getElementById('openSidenav');
openSidenav.onclick = () => {
  sidenav.style.width = '30rem';
  container.style.marginLeft = '30rem';
};

const options = document.getElementsByClassName('options')[0] as HTMLElement;

const title = window.location.pathname.slice(1);
window.onload = () => {
  if (title) {
    openSidenav.innerText = `> ${title.replace(/_/g, ' ')}`
  } else {
    options.style.display = 'none';
  }
}
let selectedIndex = sketches.findIndex(pair => createLinkText(pair[0]) === title);
const sketch = sketches[selectedIndex][1];
let p = new P5(sketch, document.getElementById("app"));

const resetButton = document.getElementById('reset');
resetButton.onclick = () => {
  p.remove();
  p = new P5(sketch, document.getElementById("app"));
}
