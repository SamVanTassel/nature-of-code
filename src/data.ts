import { environmentSketch } from "./environment";
import {
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
  ParticleSystemSketch,
  ParticleSystemCosmicSketch,
  smokeSketch,
  seekingATargetSketch,
  wanderersSketch,
  flowFieldsSketch,
  linearPathFollowingSketch,
  circularPathFollowingSketch,
  groupBehaviorSketch,
  flockingSketch,
  oneDellularAutomationSketch,
  gameOfLifeSketch,
  oneDimendionalCollisionSketch,
  triangleCollisionSketch,
  rayCastingSketch,
  rayCastingPlusSketch,
} from "./exercises";
import { SketchPair, Entry } from "./types";

export const natureOfCodeSketches: SketchPair[] = [
  ["1 - Mouse Followers", mouseFollowersSketch],
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
];
export const miscSketches: SketchPair[] = [
  ["1D Collision", oneDimendionalCollisionSketch],
  ["Triangle Collision", triangleCollisionSketch],
  ["Ray Casting", rayCastingSketch],
  ["Ray Casting Plus", rayCastingPlusSketch],
];

export const data: Entry[] = [
  {
    collection: "Nature of Code",
    sketches: natureOfCodeSketches,
  },
  {
    collection: "Misc",
    sketches: miscSketches,
  },
];

export const about = {
  title: 'fun',
  html:
`</br>
This site is a sketchbook.
<br/><br/>
The exercises in the Nature of Code section are from the awesome book <a href="https://natureofcode.com/" target="_blank" rel="noreferrer noopener">The Nature of Code</a>
by Daniel Schiffman.
<br/><br/>
The sketches in the Misc section are anything that caught my interest. Many were inspired by <a href="https://thecodingtrain.com/challenges" target="_blank" rel="noreferrer noopener">The Coding Train</a>, also by Daniel Schiffman. The guy is a great teacher!
<br/><br/>
The source code lives <a href="https://github.com/SamVanTassel/nature-of-code" target="_blank">here</a>`
}
