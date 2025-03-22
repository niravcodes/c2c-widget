import modal from "./ui/modal.ui.ts";
import loadingUI from "./ui/loading.html.ts";
import { Call } from "./Call.ts";

import createControls from "./ui/controls.ui.ts";
import html from "./lib/html.ts";
import { ChatEntry } from "./Chat.ts";
import createChatUI from "./ui/chat.ui.ts";
import { style } from "./Style.ts";

export interface CallDetails {
  destination: string;
  supportsAudio: boolean;
  supportsVideo: boolean;
}

export default class C2CWidget extends HTMLElement {
  callOngoing: boolean = false;
  callLoading: boolean = false;
  shadow = this.attachShadow({ mode: "open" });
  callDetails: CallDetails | null = null;
  call: Call | null = null;
  containerElement: HTMLElement | null = null;
  modalContainer: HTMLElement | null = null;
  previousOverflowStyle: string = "";
  token: string | null = null;
  constructor() {
    super();
    this.setupDOM();
    style.apply(this.shadow);
  }

  connectedCallback() {
    const token = this.getAttribute("token");
    this.token = token;
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

    if (this.callDetails && this.token) {
      this.call = new Call(this.callDetails, this.token);
    }
  }

  private openModal() {
    this.previousOverflowStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  private closeModal() {
    if (this.modalContainer) {
      const modal = this.modalContainer.querySelector(".modal");
      this.modalContainer.classList.add("closing");
      modal?.classList.add("closing");

      setTimeout(() => {
        this.modalContainer?.remove();
        this.modalContainer = null;
        document.body.style.overflow = this.previousOverflowStyle;
        this.callOngoing = false;
        this.call?.hangup();
      }, 800);
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
    this.callLoading = true;
    this.openModal();

    const {
      modalContainer,
      videoPanel,
      videoArea,
      localVideoArea,
      controlsPanel,
      chatPanel,
    } = modal();

    this.modalContainer = modalContainer;
    this.renderLoading(this.callLoading, videoPanel);
    this.containerElement?.appendChild(modalContainer);

    const control = await createControls(
      () => this.closeModal(),
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

    callInstance?.on("room.left", () => {
      this.closeModal();
    });

    // todo: this logic should be in the chat ui component
    function onChatChange(chatHistory: ChatEntry[]) {
      createChatUI(chatHistory, chatPanel);
    }

    controlsPanel.appendChild(control);

    await this.call?.start();
    this.callLoading = false;
    this.renderLoading(this.callLoading, videoPanel);
  }

  renderLoading(loadingState: boolean, element: HTMLElement) {
    if (loadingState) {
      const { loading } = loadingUI();
      element.appendChild(loading);
    } else {
      element.querySelector(".loading")?.remove();
    }
  }

  setupDOM() {
    const container = document.createElement("div");
    this.shadow.appendChild(container);
    this.containerElement = container;
  }

  disconnectedCallback() {
    this.closeModal();
  }
}

customElements.define("c2c-widget", C2CWidget);
