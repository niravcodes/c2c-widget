import html from "../lib/html";
import modalStyle from "../css/modalStyle.css?inline";

export default html`
  <div class="modal-container" name="modalContainer">
    <style>
      ${modalStyle}
    </style>
    <div class="modal">
      <div class="video-panel">
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
