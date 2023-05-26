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
  particleSystemSketch,
  particleSystemCosmicSketch,
  smokeSketch,
  seekingATargetSketch,
  wanderersSketch,
  flowFieldsSketch,
  linearPathFollowingSketch,
  circularPathFollowingSketch,
  groupBehaviorSketch,
  flockingSketch,
  oneDCellularAutomationSketch,
  gameOfLifeSketch,
  environmentSketch,
} from "./sketches/nature_of_code";
import { 
  oneDimendionalCollisionSketch,
  triangleCollisionSketch,
  rayCastingSketch,
  rayCastingPlusSketch,
} from "./sketches/misc";
import { Collection, SketchHolder } from "./types";

export const natureOfCodeSketches: SketchHolder[] = [
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
  particleSystemSketch,
  particleSystemCosmicSketch,
  smokeSketch,
  seekingATargetSketch,
  wanderersSketch,
  flowFieldsSketch,
  linearPathFollowingSketch,
  circularPathFollowingSketch,
  groupBehaviorSketch,
  flockingSketch,
  oneDCellularAutomationSketch,
  gameOfLifeSketch,
  environmentSketch,
];
export const miscSketches: SketchHolder[] = [
  oneDimendionalCollisionSketch,
  triangleCollisionSketch,
  rayCastingSketch,
  rayCastingPlusSketch,
];

export const data: Collection[] = [
  {
    title: "Nature of Code",
    sketches: natureOfCodeSketches,
  },
  {
    title: "Misc",
    sketches: miscSketches,
  },
];

export const about = {
  title: 'fun',
  html:
`</br>
This site is a sketchbook.
<br/><br/>
The sketches in the Nature of Code section are from the (awesome) book <a href="https://natureofcode.com/" target="_blank" rel="noreferrer noopener">The Nature of Code</a>
by Daniel Schiffman.
<br/><br/>
The sketches in the Misc section are anything that caught my interest. Many were inspired by <a href="https://thecodingtrain.com/challenges" target="_blank" rel="noreferrer noopener">The Coding Train</a>, also by Daniel Schiffman - the guy is a great teacher!
<br/><br/>
The source code lives <a href="https://github.com/SamVanTassel/nature-of-code" target="_blank">here</a>.`
}
