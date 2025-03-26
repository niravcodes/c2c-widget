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

  getLocalVideoTrack() {
    return this.currentCall?.localVideoTrack;
  }

  getLocalAudioTrack() {
    return this.currentCall?.localAudioTrack;
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

    currentCallLocal.on("call.updated", () => {
      // we want to track mute states
      // what does the server know about the client's mute states?
      // we ofc also have a local state
      console.log("call.updated", currentCallLocal);
    });

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

  private async getSelf() {
    if (!this.currentCall) {
      throw new Error("Call is not set. Please dial first.");
    }
    const members = await this.currentCall?.getMembers();
    return members?.members.find((m) => m.id === this.currentCall?.memberId);
  }

  async toggleVideo() {
    if (!this.currentCall) {
      console.error("Call is not set. Please dial first.");
      return false;
    }
    const self = await this.getSelf();
    try {
      if (self && self.videoMuted) {
        await this.currentCall?.videoUnmute();
      } else {
        await this.currentCall?.videoMute();
      }
    } catch (e) {
      console.error(
        e,
        "Error toggling video with SDK. Falling back to native method."
      );
      return false;
    }
  }

  async toggleAudio() {
    if (!this.currentCall) {
      console.error("Call is not set. Please dial first.");
      return false;
    }
    const self = await this.getSelf();
    try {
      if (self && self.audioMuted) {
        await this.currentCall?.audioUnmute();
      } else {
        await this.currentCall?.audioMute();
      }
    } catch (e) {
      console.error(
        e,
        "Error toggling audio with SDK. Falling back to native method."
      );
      return false;
    }
  }
  async toggleSpeaker() {
    if (!this.currentCall) {
      console.error("Call is not set. Please dial first.");
      return false;
    }
    const self = await this.getSelf();
    try {
      if (self && self.deaf) {
        await this.currentCall?.undeaf();
      } else {
        await this.currentCall?.deaf();
      }
    } catch (e) {
      console.error(
        e,
        "Error toggling speaker with SDK. Falling back to native method."
      );
      return false;
    }
  }
}
