import P5 from "p5";
import "./styles.scss";
import { loadRoute, setRoute, state } from "./state";
import {  about, data } from "./data";
import { titleOrPlaceholder } from "./util";

const sidePanelLeft = document.getElementById("side-panel-left");
const sidePanelRight = document.getElementById("side-panel-right");
const sketchList = document.getElementById("side-panel-list");
const container = document.getElementsByClassName(
  "container"
)[0] as HTMLElement;
const options = document.getElementsByClassName("options")[0] as HTMLElement;

let sidePanelLeftOpen = false;
let sidePanelRightOpen = false;

const closeButtonLeft = document.getElementById("close-button-left");
const closeSidePanelLeft = () => {
  sidePanelLeft.style.width = "0";
  sidePanelLeft.style.left = "-2px";
  container.style.marginLeft = "0";
  openSidePanelLeft.innerText = `> ${titleOrPlaceholder(state.currentSketch.title, state.about)}`;
  sidePanelLeftOpen = false;
};
closeButtonLeft.onclick = () => {
  closeSidePanelLeft();
};
const openSidePanelLeft = document.getElementById("open-side-panel-left");
openSidePanelLeft.onclick = () => {
  if (!sidePanelLeftOpen) {
  sidePanelLeft.style.width = "30rem";
  sidePanelLeft.style.left = "0";
  container.style.marginLeft = "30rem";
  openSidePanelLeft.innerText = `< ${titleOrPlaceholder(state.currentSketch.title, state.about)}`;
  sidePanelLeftOpen =true;
  } else closeSidePanelLeft();
};

const closeButtonRight = document.getElementById("close-button-right");
const closeSidePanelRight = () => {
  sidePanelRight.style.width = "0";
  sidePanelRight.style.right = "-2px";
  container.style.marginRight = "0";
  openSidePanelRight.innerText = `${titleOrPlaceholder(state.currentCollection.title, state.about)} <`;
  sidePanelRightOpen = false;
};
closeButtonRight.onclick = () => {
  closeSidePanelRight();
};
const openSidePanelRight = document.getElementById("open-side-panel-right");
openSidePanelRight.onclick = () => {
  if (!sidePanelRightOpen) {
  sidePanelRight.style.width = "20rem";
  sidePanelRight.style.right = "0";
  container.style.marginRight = "20rem";
  openSidePanelRight.innerText = `${titleOrPlaceholder(state.currentCollection.title, state.about)} >`;
  sidePanelRightOpen =true;
  } else closeSidePanelRight();
};

document.addEventListener("click", (event) => {
  const clickedInContainer = event.target instanceof Node && container.contains(event.target);
  const clickedOpenLeftPanelButton = event.target instanceof Node && openSidePanelLeft.contains(event.target);
  const clickedOpenRightPanelButton = event.target instanceof Node && openSidePanelRight.contains(event.target);

  if (clickedInContainer && !clickedOpenLeftPanelButton) {
    closeSidePanelLeft();
  }
  if (clickedInContainer && !clickedOpenRightPanelButton) {
    closeSidePanelRight();
  }
});

const removeAllChildNodes = (parent: HTMLElement) => {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

const renderSketchList = () => {
  removeAllChildNodes(sketchList);
  if (state.about) return;
  for (const pair of state.currentCollection.sketches) {
    const title = document.createElement("li");
    const a = document.createElement("a");
    a.innerText = pair[0];
    a.href = setRoute(pair[0]);
    a.onclick = closeSidePanelLeft;
    title.appendChild(a);
    sketchList.appendChild(title);
  }
}

const renderOptions = () => {
  if (state.currentSketch.title) {
    options.style.display = "flex";
  } else {
    options.style.display = "none";
  }
}

const collections = data.map(el => el.collection);

const collectionsList = document.getElementById('side-panel-list-right');
for (const title of collections) {
  const a = document.createElement('a');
  a.innerText = title;
  if (title === 'Nature of Code') {
    a.href = setRoute('', true);
  } else {
    a.href = setRoute(title, true);
  }
  a.onclick = () => {
    closeSidePanelRight();
  };
  collectionsList.appendChild(a);
}

const resetButton = document.getElementById("reset");
resetButton.onclick = () => {
  state.p5 = loadSketch();
};

const loadSketch = () => {
  const title = state.currentSketch.title;
  if (!title) {
    if (state.p5) state.p5.remove();
    return;
  }
  if (state.p5) state.p5.remove();
  state.p5 = new P5(state.currentSketch.file, document.getElementById("app"));
  return state.p5;
};

const renderAbout = () => {
  const aboutContainer = document.getElementById('about-container');
  if (state.about) {
    const header = document.createElement('h2');
    const p = document.createElement('p');
    header.innerHTML = about.title;
    p.innerHTML = about.html;
    aboutContainer.appendChild(header);
    aboutContainer.appendChild(p);
  } else {
    removeAllChildNodes(aboutContainer);
  }
}

const renderMainConent = () => {
  renderAbout();
  loadSketch();
}

const renderPage = () => {
  loadRoute();
  renderMainConent();
  renderSketchList();
  closeSidePanelLeft();
  closeSidePanelRight();
  renderOptions();
};

window.onhashchange = () => {
  renderPage();
};

window.onload = () => {
  renderPage();
};
