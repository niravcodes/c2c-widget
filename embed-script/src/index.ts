import { modal } from "./ui/modal";
import { Call } from "./Call";
import modalStyle from "./css/modalStyle.css?inline";
import { Devices } from "./Devices";
import { controls } from "./ui/controls";

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
      console.log("Parsed call details:", this.callDetails);
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

    const devices = new Devices();
    await devices.setup();

    const {
      modal: modalContainer,
      videoArea,
      controlsPanel,
      chatPanel: _,
    } = modal();

    this.containerElement?.appendChild(modalContainer);

    const call = await this.call?.dial(videoArea);

    const control = controls(function hangup() {
      call?.hangup();
    } as () => void);
    controlsPanel.appendChild(control);
    console.log(call);
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
