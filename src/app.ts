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
} from "./exercises";
import { environmentSketch } from "./environment";

const sketches: [string, (p5: P5) => void][] = [
  ["0.1 - 1D Collision", oneDimendionalCollisionSketch],
  ["1 - Mouse Followers", mouseFollowersSketch],
  ["1a - Triangle Collision", triangleCollisionSketch],
  ["2.1 - Wind & Gravity", windGravitySketch],
  ["2.2 - Wind, Gravity & Friction", windGravityFrictionSketch],
  [
    "2.2b - Wind, Gravity, Friction, Collision",
    windGravityFrictionCollisionSketch,
  ],
  ["2.3 - Drag", dragSketch],
  ["2.6 - Single Draggable Attractor", singleDraggableAttractorSketch],
  ["2.8 - Many Attractors", manyAttractorsSketch],
  ["3.2 - Angular Rotation", angularRotationSketch],
  ["3.2b - Cannonball", cannonballSketch],
  ["3.5 - Arctan Followers", arctanFollowersSketch],
  ["3.5b - Spaceship", spaceshipSketch],
  ["4.2 - Particle System", ParticleSystemSketch],
  ["4.2b - Particle System [COSMIC]", ParticleSystemCosmicSketch],
  ["4.8 - Smoke", smokeSketch],
  ["6.1 - Seeking a Target", seekingATargetSketch],
  ["6.4 - Wanderers", wanderersSketch],
  ["6.6 - Flow Fields", flowFieldsSketch],
  ["6.8 - Linear Path Following", linearPathFollowingSketch],
  ["6.8b - Circular Path Following", circularPathFollowingSketch],
  ["6.11 - Group Behavior", groupBehaviorSketch],
  ["6.13 - Flocking", flockingSketch],
  ["7.4 - 1d Cellular Automation", oneDellularAutomationSketch],
  ["7.7 - Game of Life", gameOfLifeSketch],
  ["WIP - environment project", environmentSketch],
  ["xc - Ray Casting", rayCastingSketch],
  ["xc - Ray Casting Plus", rayCastingPlusSketch],
];

const sidePanel = document.getElementById("side-panel");
const sketchList = document.getElementById("side-panel-list");
const container = document.getElementsByClassName(
  "container"
)[0] as HTMLElement;

let sidePanelOpen = false;

const closeButton = document.getElementById("close-button");
const closeSidePanel = () => {
  sidePanel.style.width = "0";
  sidePanel.style.left = "-2px";
  container.style.marginLeft = "0";
  openSidePanel.innerText = `> ${getDisplayTitle()}`;
  sidePanelOpen = false;
};
closeButton.onclick = () => {
  closeSidePanel();
};
const openSidePanel = document.getElementById("open-side-panel");
openSidePanel.onclick = () => {
  if (!sidePanelOpen) {
  sidePanel.style.width = "30rem";
  sidePanel.style.left = "0";
  container.style.marginLeft = "30rem";
  openSidePanel.innerText = `< ${getDisplayTitle()}`;
  sidePanelOpen =true;
  } else closeSidePanel();
};

document.addEventListener("click", (event) => {
  const clickedInSidenav = event.target instanceof Node && sidePanel.contains(event.target);
  const clickedSidenavButton = event.target instanceof Node && openSidePanel.contains(event.target);

  if (!clickedInSidenav && !clickedSidenavButton) {
    closeSidePanel();
  }
});

const createLinkText = (s: string) => {
  const [, title] = s.match(/- (.*)/);
  return title.toLowerCase().replace(/ /g, "_");
};

for (const pair of sketches) {
  const title = document.createElement("li");
  const a = document.createElement("a");
  a.innerText = pair[0];
  a.href = `#${createLinkText(pair[0])}`;
  a.onclick = closeSidePanel;
  title.appendChild(a);
  sketchList.appendChild(title);
}

const options = document.getElementsByClassName("options")[0] as HTMLElement;
let p: P5;

const getTitle = () => {
  let title = window.location.hash;
  title = title.replace("#", "");
  return title;
};

const getDisplayTitle = () => {
  let title = getTitle().replace(/_/g, " ");
  if (!title) title = 'select a sketch'
  return title;
}

const renderPage = () => {
  const title = getTitle();
  if (title) {
    loadSketch(title);
    options.style.display = "flex";
  } else {
    options.style.display = "none";
    openSidePanel.innerText = "> select a sketch";
  }
};

window.onhashchange = () => {
  renderPage();
};

window.onload = () => {
  renderPage();
};

const loadSketch = (title: string) => {
  if (!title) return;
  openSidePanel.innerText = `> ${title.replace(/_/g, " ")}`;
  let selectedIndex = sketches.findIndex(
    (pair) => createLinkText(pair[0]) === title
  );
  const sketch = selectedIndex > -1 ? sketches[selectedIndex][1] : () => null;
  if (p) p.remove();
  p = new P5(sketch, document.getElementById("app"));
  return p;
};

const resetButton = document.getElementById("reset");
resetButton.onclick = () => {
  if (p) p.remove();
  p = loadSketch(getTitle());
};
