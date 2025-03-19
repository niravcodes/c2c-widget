import { WebRTC } from "@signalwire/js";

export class Devices {
  constructor() {
    this.setup();
  }
  async setup() {
    await WebRTC.requestPermissions({ audio: true, video: true });
  }

  async enumerateDevices() {
    const devices = await WebRTC.enumerateDevices();
    return devices;
  }
}
