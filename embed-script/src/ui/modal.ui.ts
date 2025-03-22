import modal from "./modal.html.ts";
import html from "../lib/html.ts";

export default function modalUI() {
  const {
    modalContainer,
    videoPanel,
    videoArea,
    localVideoArea,
    controlsPanel,
    chatPanel,
    videoPanelBackground,
  } = modal();

  const imageMaker = html`<img
    name="image"
    src="https://developer.signalwire.com/img/call-widget/sw_background.webp"
  />`;

  const { image } = imageMaker();

  (image as HTMLImageElement)
    .decode()
    .then(() => {
      videoPanelBackground.classList.add("loaded");
      videoPanelBackground.style.backgroundImage = `url(${
        (image as HTMLImageElement).src
      })`;
    })
    .catch((err) => {
      console.error("Image failed to decode", err);
    });

  return {
    modalContainer,
    videoPanel,
    videoArea,
    localVideoArea,
    controlsPanel,
    chatPanel,
  };
}
