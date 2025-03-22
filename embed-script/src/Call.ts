import { SignalWire, SignalWireClient } from "@signalwire/js";
import { CallDetails } from "./C2CWidget";
import { Chat, ChatEntry } from "./Chat";
export class Call {
  private client: SignalWireClient | null = null;
  private callDetails: CallDetails | null = null;
  chat: Chat | null = null;
  currentCall: Call | null = null;

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
      console.log(params);
      // AI partial result (typing indicator)
      console.log("ai.partial_result", params.text);
      this.chat?.handleEvent(
        "ai.partial_result",
        params.text ?? "",
        params.barged ?? false
      );
    });

    // @ts-ignore
    this.client.on("ai.speech_detect", (params) => {
      console.log(params);
      // AI speech detection (user speaking)
      const cleanText = params.text.replace(/\{confidence=[\d.]+\}/, "");
      console.log("ai.speech_detect", cleanText);
      this.chat?.handleEvent(
        "ai.speech_detect",
        cleanText,
        params.type !== "normal" // this also doesn't seem to have type=barged, but leaving here for now
      );
    });

    // @ts-ignore
    this.client.on("ai.completion", (params) => {
      console.log(params);
      // AI completion (final response)
      this.chat?.handleEvent(
        "ai.completion",
        params.text ?? "",
        params.type === "barged"
      );
    });

    // @ts-ignore
    this.client.on("ai.response_utterance", (params) => {
      console.log(params);
      // AI response utterance (spoken response)
      console.log("ai.response_utterance", params.utterance);
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
    // @ts-expect-error FabricRoomSession missing types
    this.currentCall = currentCallLocal;

    if (this.chat) {
      this.chat.onUpdate = () => {
        onChatChange(this.chat?.getHistory() ?? []);
      };
    }

    console.log("currentCall", currentCallLocal);

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
}
