import {
  FabricRoomSession,
  SignalWire,
  SignalWireClient,
} from "@signalwire/js";
import { CallDetails } from "./C2CWidget";
import { Chat, ChatEntry } from "./Chat";
export class Call {
  private client: SignalWireClient | null = null;
  private callDetails: CallDetails | null = null;
  chat: Chat | null = null;
  currentCall: FabricRoomSession | null = null;

  constructor(callDetails: CallDetails, token: string) {
    this.callDetails = callDetails;
    this.setupClient(token);
    this.chat = new Chat();
  }

  async setupClient(token: string) {
    this.client = await SignalWire({
      token: token,
    });

    // @ts-ignore
    this.client.on("ai.partial_result", (params) => {
      // AI partial result (typing indicator)
      this.chat?.handleEvent(
        "ai.partial_result",
        params.text ?? "",
        params.barged ?? false
      );
    });

    // @ts-ignore
    this.client.on("ai.speech_detect", (params) => {
      // AI speech detection (user speaking)
      const cleanText = params.text.replace(/\{confidence=[\d.]+\}/, "");
      this.chat?.handleEvent(
        "ai.speech_detect",
        cleanText,
        params.type !== "normal" // this also doesn't seem to have type=barged, but leaving here for now
      );
    });

    // @ts-ignore
    this.client.on("ai.completion", (params) => {
      // AI completion (final response)
      this.chat?.handleEvent(
        "ai.completion",
        params.text ?? "",
        params.type === "barged"
      );
    });

    // @ts-ignore
    this.client.on("ai.response_utterance", (params) => {
      // AI response utterance (spoken response)
      this.chat?.handleEvent(
        "ai.response_utterance",
        params.utterance ?? "",
        false // this doesn't have barged yet
      );
    });
  }

  async dial(
    container: HTMLElement,
    onChatChange: (chatHistory: ChatEntry[]) => void
  ) {
    if (!this.client) {
      throw new Error("Client is not set");
    }
    if (!this.callDetails) {
      throw new Error("Call details are not set");
    }

    const currentCallLocal = await this.client.dial({
      to: this.callDetails.destination,
      rootElement: container,
      audio: this.callDetails.supportsAudio,
      video: this.callDetails.supportsVideo,
      negotiateVideo: this.callDetails.supportsVideo,
    });
    this.currentCall = currentCallLocal;

    if (this.chat) {
      this.chat.onUpdate = () => {
        onChatChange(this.chat?.getHistory() ?? []);
      };
    }

    return currentCallLocal;
  }

  async start() {
    if (!this.client) {
      throw new Error("Client is not set");
    }
    await this.currentCall?.start();
  }

  async hangup() {
    if (!this.currentCall) {
      throw new Error("Call is not set");
    }
    await this.currentCall?.hangup();
  }

  async updateCamera(deviceId: string): Promise<boolean> {
    if (!this.currentCall) {
      console.error("Call is not set. Please dial first.");
      return false;
    }
    try {
      await this.currentCall?.updateCamera({ deviceId });
      return true;
    } catch (e) {
      console.error("Error updating camera", e);
      return false;
    }
  }

  async updateMicrophone(deviceId: string): Promise<boolean> {
    if (!this.currentCall) {
      console.error("Call is not set. Please dial first.");
      return false;
    }
    try {
      await this.currentCall?.updateMicrophone({ deviceId });
      return true;
    } catch (e) {
      console.error("Error updating microphone", e);
      return false;
    }
  }

  async updateSpeaker(deviceId: string): Promise<boolean> {
    if (!this.currentCall) {
      console.error("Call is not set. Please dial first.");
      return false;
    }
    try {
      await this.currentCall?.updateSpeaker({ deviceId });
      return true;
    } catch (e) {
      console.error("Error updating speaker", e);
      return false;
    }
  }
}
