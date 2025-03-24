import html from "../lib/html";
import callEndIcon from "../icons/callEnd.svg?raw";
import videoIcon from "../icons/video.svg?raw";
import microphoneIcon from "../icons/microphone.svg?raw";
import speakerIcon from "../icons/speaker.svg?raw";
import caretUpIcon from "../icons/caret-up.svg?raw";

export default html`
  <div name="controlsContainer">
    <div name="menuContainer"></div>
    <div class="controls">
      <div class="control-group">
        <button class="control-button video-button" name="videoButton">
          ${videoIcon}
        </button>
        <button
          class="device-select-button video-devices-button"
          name="videoDevicesButton"
        >
          ${caretUpIcon}
        </button>
      </div>

      <div class="control-group">
        <button class="control-button mic-button" name="micButton">
          ${microphoneIcon}
        </button>
        <button
          class="device-select-button mic-devices-button"
          name="micDevicesButton"
        >
          ${caretUpIcon}
        </button>
      </div>

      <div class="control-group">
        <button class="control-button speaker-button" name="speakerButton">
          ${speakerIcon}
        </button>
        <button
          class="device-select-button speaker-devices-button"
          name="speakerDevicesButton"
        >
          ${caretUpIcon}
        </button>
      </div>

      <button class="control-button hangup" name="hangupButton">
        ${callEndIcon}
      </button>
    </div>
  </div>
`;
