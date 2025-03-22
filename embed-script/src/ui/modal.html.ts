import html from "../lib/html";
import variables from "../css/variables.css?inline";
import modalStyle from "../css/modalStyle.css?inline";
import { style } from "../Style";

style.register(variables);
style.register(modalStyle);

export default html`
  <div class="modal-container" name="modalContainer">
    <div class="modal" name="modal">
      <div class="video-panel" name="videoPanel">
        <div class="video-panel-background" name="videoPanelBackground"></div>
        <div class="video-area">
          <div class="video-content" name="videoArea">
            <!-- Remote Video area -->
          </div>
          <div class="local-video-content" name="localVideoArea">
            <!-- Local Video area -->
          </div>
        </div>
        <div class="video-controls" name="controlsPanel">
          <!-- Controls panel -->
        </div>
      </div>
      <div class="chat-panel" name="chatPanel"></div>
    </div>
  </div>
`;
