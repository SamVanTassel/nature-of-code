import P5 from "p5";
import "./styles.scss";
import { loadRoute, setRoute, state } from "./state";
import {  about, data } from "./data";
import { dragElement, removeAllChildNodes, titleOrPlaceholder } from "./util";

const collectionTitles = data.map(el => el.title);

const sidePanelLeft = document.getElementById("side-panel-left");
const sidePanelRight = document.getElementById("side-panel-right");
const sketchList = document.getElementById("side-panel-list");
const container = document.getElementsByClassName(
  "container"
)[0] as HTMLElement;
const options = document.getElementsByClassName("options")[0] as HTMLElement;
const resetButton = document.getElementById("reset");
const infoButton = document.getElementById("sketch-info-button");
const infoModal = document.getElementById("info-modal");
const infoModalHeader = document.getElementById("info-modal-header");
const infoModalContent = document.getElementById("info-modal-content");
const closeButtonInfoModal = document.getElementById("close-button-info-modal");

const collectionsList = document.getElementById('side-panel-list-right');
for (const title of collectionTitles) {
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

const closeInfoModal = () => {
  infoModal.style.display = "none";
  state.infoModalOpen = false;
}

infoButton.onclick = () => {
  if (state.infoModalOpen) {
    closeInfoModal();
  } else {
    infoModal.style.display = "flex";
    state.infoModalOpen = true;
  }
};
closeButtonInfoModal.onclick = closeInfoModal;
dragElement(infoModal, infoModalHeader);

resetButton.onclick = () => {
  state.p5 = loadSketch();
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

const renderSketchList = () => {
  removeAllChildNodes(sketchList);
  if (state.about) return;
  for (const holder of state.currentCollection.sketches) {
    const title = document.createElement("li");
    const a = document.createElement("a");
    a.innerText = holder.info?.title || '';
    a.href = setRoute(holder.info?.title || '');
    a.onclick = closeSidePanelLeft;
    title.appendChild(a);
    sketchList.appendChild(title);
  }
}

const renderOptions = () => {
  if (state.currentSketch.title) {
    options.style.display = "flex";
    const info = state.currentSketch.info;
    if (info.about || info.controls) {
      infoButton.style.display = "block";
    } else {
      infoButton.style.display = "none";
    }
  } else {
    options.style.display = "none";
  }
}

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

const renderInfoModal = () => {
  closeInfoModal();
  removeAllChildNodes(infoModalContent);
  const info = state.currentSketch.info;
  if (info) {
    if (info.about) {
      const aboutHeader = document.createElement('h3');
      const about = document.createElement('p');
      aboutHeader.innerText = 'about:';
      about.innerHTML = info.about;
      infoModalContent.appendChild(aboutHeader);
      infoModalContent.appendChild(about);
    }
    if (info.controls) {
      const controlsHeader = document.createElement('h3');
      const controls = document.createElement('p');
      controlsHeader.innerText = 'controls:';
      controls.innerHTML = info.controls;
      infoModalContent.appendChild(controlsHeader);
      infoModalContent.appendChild(controls);
    }
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
  renderInfoModal();
};

window.onhashchange = () => {
  renderPage();
};

window.onload = () => {
  renderPage();
};
