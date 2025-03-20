import html from "../lib/html";

export default html`
  <div class="modal-container" name="modalContainer">
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
