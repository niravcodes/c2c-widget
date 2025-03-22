import html from "../lib/html";
import callEndIcon from "../icons/callEnd.svg?raw";
import videoIcon from "../icons/video.svg?raw";
import microphoneIcon from "../icons/microphone.svg?raw";
import speakerIcon from "../icons/speaker.svg?raw";
import controlStyle from "../css/controls.css?inline";
import { style } from "../Style";

style.register(controlStyle);

export default html`
  <div name="controlsContainer">
    <div name="menuContainer"></div>
    <div class="controls">
      <button class="control-button video" name="videoButton">
        ${videoIcon}
      </button>
      <button class="control-button mic" name="micButton">
        ${microphoneIcon}
      </button>
      <button class="control-button speaker" name="speakerButton">
        ${speakerIcon}
      </button>
      <button class="control-button hangup" name="hangupButton">
        ${callEndIcon}
      </button>
    </div>
  </div>
`;
