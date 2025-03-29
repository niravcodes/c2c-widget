import modal from "./ui/modal.ui.ts";
import loadingUI from "./ui/loading.html.ts";
import { Call } from "./Call.ts";

import devices from "./Devices.ts";
import createControls from "./ui/controls.ui.ts";
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

  private closeModal() {
    if (this.modalContainer) {
      const modal = this.modalContainer.querySelector(".modal");
      this.modalContainer.classList.add("closing");
      modal?.classList.add("closing");

      setTimeout(() => {
        devices.reset();
        this.modalContainer?.remove();
        this.modalContainer = null;
        document.body.style.overflow = this.previousOverflowStyle;
        this.callOngoing = false;
        this.call?.reset();
      }, 800);
    }
  }

  async setupCall() {
    if (this.callOngoing) {
      console.warn("Call is already ongoing; nop");
      return;
    } else if (this.callDetails === null || this.call === null) {
      console.warn("No call or Call details provided");
      return;
    }

    this.callOngoing = true;
    this.callLoading = true;

    this.previousOverflowStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";

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

    await devices.getPermissions();

    const callInstance = await this.call.dial(
      videoArea,
      function (chatHistory: ChatEntry[]) {
        createChatUI(chatHistory, chatPanel);
      },
      function (localVideo: HTMLElement) {
        localVideoArea.appendChild(localVideo);
      }
    );

    await devices.setup(callInstance);

    // Add aspect ratio handler
    devices.onAspectRatioChange = (aspectRatio: number | null) => {
      console.log("aspectRatio", aspectRatio);
      if (aspectRatio && localVideoArea) {
        localVideoArea.style.aspectRatio = String(aspectRatio);
      }
    };

    const control = await createControls(async () => {
      try {
        await this.call?.hangup();
      } catch (e) {
        console.error("Error hanging up call. Force terminating call.", e);
      }
      this.closeModal();
    });

    callInstance?.on("room.left", () => {
      this.closeModal();
    });

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
