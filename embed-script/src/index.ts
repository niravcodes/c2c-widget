import modal from "./ui/modal.html.ts";
import { Call } from "./Call";
import modalStyle from "./css/modalStyle.css?inline";
import createControls from "./ui/controls.ui.ts";
import html from "./lib/html";

export interface CallDetails {
  destination: string;
  supportsAudio: boolean;
  supportsVideo: boolean;
}

class C2CWidget extends HTMLElement {
  callOngoing: boolean = false;
  shadow = this.attachShadow({ mode: "open" });
  callDetails: CallDetails | null = null;
  call: Call | null = null;
  containerElement: HTMLElement | null = null;

  constructor() {
    super();
    this.setupDOM();
  }

  connectedCallback() {
    const buttonId = this.getAttribute("buttonId");
    if (buttonId) {
      const button = document.getElementById(buttonId);
      if (button) {
        button.addEventListener("click", () => this.setupCall());
      } else {
        console.error(`Button with ID "${buttonId}" not found.`);
      }
    }

    try {
      const callDetails = this.getAttribute("callDetails");
      if (callDetails === null) {
        throw new Error("callDetails attribute is required");
      }
      this.callDetails = JSON.parse(callDetails) as CallDetails;
    } catch (e) {
      console.error("Invalid JSON in callDetails attribute");
      this.callDetails = null;
    }

    if (this.callDetails) {
      this.call = new Call(this.callDetails);
    }
  }

  async setupCall() {
    if (this.callOngoing) {
      console.warn("Call is already ongoing; nop");
      return;
    } else if (this.callDetails === null) {
      console.warn("No call details provided");
      return;
    }

    this.callOngoing = true;

    const {
      modalContainer,
      videoArea,
      localVideoArea,
      controlsPanel,
      chatPanel,
    } = modal();

    this.containerElement?.appendChild(modalContainer);

    // note: we are awaiting this because this fn waits for
    // permissions and device list.
    const control = await createControls(
      function hangup() {
        callInstance?.hangup();
      },
      function onVideoDeviceSelect(deviceId: string) {
        callInstance?.updateCamera({ deviceId });
      },
      function onAudioInputSelect(deviceId: string) {
        callInstance?.updateMicrophone({ deviceId });
      },
      function onAudioOutputSelect(deviceId: string) {
        callInstance?.updateSpeaker({ deviceId });
      }
    );
    const callInstance = await this.call?.dial(videoArea, onChatChange);

    // AI partial result (typing indicator)
    callInstance?.on("ai.partial_result", (params) => {
      console.log("ai.partial_result", params.text);
      // this.logger.event('ai.partial_result', params.text);
      // this.events.emit(EventRegistry.SIGNALWIRE.CHAT_PARTIAL, params.text);
    });

    // AI speech detection (user speaking)
    callInstance?.on("ai.speech_detect", (params) => {
      const cleanText = params.text.replace(/\{confidence=[\d.]+\}/, "");
      console.log("ai.speech_detect", cleanText);
      // this.logger.event('ai.speech_detect', cleanText);
      // this.events.emit(EventRegistry.SIGNALWIRE.CHAT_SPEECH, cleanText);
    });

    // AI completion (final response)
    callInstance?.on("ai.completion", (params) => {
      console.log("ai.completion", params.text);
      // this.logger.event('ai.completion', params.text);
      // this.events.emit(EventRegistry.SIGNALWIRE.CHAT_COMPLETION, params.text);
    });

    // AI response utterance (spoken response)
    callInstance?.on("ai.response_utterance", (params) => {
      console.log("ai.response_utterance", params.utterance);
      // this.logger.event('ai.response_utterance', params.utterance);
      // if (params.utterance) {
      //   this.events.emit(EventRegistry.SIGNALWIRE.CHAT_UTTERANCE, params.utterance);
      // }
    });

    callInstance?.start();

    callInstance?.on("call.joined", () => {
      console.log("call.joined");
      if (callInstance?.localStream) {
        const { localVideo } = html`<video
          autoplay
          muted
          style="width: 100%; height: 100%;"
          name="localVideo"
        ></video>`();
        (localVideo as HTMLVideoElement).srcObject = callInstance.localStream;
        localVideoArea.appendChild(localVideo);
      }
    });

    function onChatChange(chatState: unknown) {
      // renderChat();
    }

    controlsPanel.appendChild(control);
  }

  setupDOM() {
    const style = document.createElement("style");
    style.textContent = modalStyle;
    this.shadow.appendChild(style);

    const container = document.createElement("div");
    this.shadow.appendChild(container);
    this.containerElement = container;
  }
}

customElements.define("c2c-widget", C2CWidget);
