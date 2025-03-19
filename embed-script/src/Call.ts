import { SignalWire, SignalWireClient } from "@signalwire/js";
import { CallDetails } from ".";

export class Call {
  private client: SignalWireClient | null = null;
  private callDetails: CallDetails | null = null;

  constructor(callDetails: CallDetails) {
    this.callDetails = callDetails;
    this.setupClient();
  }

  async setupClient() {
    if (!import.meta.env.VITE_PUBLIC_TOKEN) {
      throw new Error("PUBLIC_TOKEN env variable is not set");
    }
    this.client = await SignalWire({
      token: import.meta.env.VITE_PUBLIC_TOKEN,
    });
  }

  async dial(container: HTMLElement) {
    if (!this.client) {
      throw new Error("Client is not set");
    }
    if (!this.callDetails) {
      throw new Error("Call details are not set");
    }

    const currentCall = await this.client.dial({
      to: this.callDetails.destination,
      rootElement: container,
      audio: this.callDetails.supportsAudio,
      video: this.callDetails.supportsVideo,
      negotiateVideo: this.callDetails.supportsVideo,
    });
    const dialedCall = currentCall.start();

    console.log(currentCall);
    console.log(dialedCall);

    return currentCall;
  }
}
