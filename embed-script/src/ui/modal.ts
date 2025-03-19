export function modal() {
  const modalContainer = document.createElement("div");
  modalContainer.classList.add("modal-container");

  const modalInner = document.createElement("div");
  modalInner.classList.add("modal");
  modalContainer.appendChild(modalInner);

  const videoPanel = document.createElement("div");
  videoPanel.classList.add("video-panel");

  const videoArea = document.createElement("div");
  videoArea.style.position = "absolute";
  videoArea.style.top = "0";
  videoArea.style.left = "0";
  videoArea.style.width = "100%";
  videoArea.style.height = "100%";
  videoArea.style.background = "red"; //this is red cuz I need to replace this with bgimage

  const controlsPanel = document.createElement("div");
  controlsPanel.classList.add("video-controls");
  controlsPanel.style.position = "absolute";
  controlsPanel.style.bottom = "0";
  controlsPanel.style.width = "100%";

  videoPanel.appendChild(videoArea);
  videoPanel.appendChild(controlsPanel);

  const chatPanel = document.createElement("div");
  chatPanel.classList.add("chat-panel");
  chatPanel.textContent = "Chat Panel";

  modalInner.appendChild(videoPanel);
  modalInner.appendChild(chatPanel);

  return {
    modal: modalContainer,
    videoPanel,
    videoArea,
    controlsPanel,
    chatPanel,
  };
}
