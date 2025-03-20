import { WebRTC } from "@signalwire/js";

export class Devices {
  devices: MediaDeviceInfo[] = [];
  loading: boolean = false;

  // not constructor because we NEED to wait for the user to grant permissions
  async setup() {
    this.loading = true;

    await WebRTC.getUserMedia({ audio: true, video: true });

    // when user plugs in a new device, we need to refresh the list
    const watcher = await WebRTC.createDeviceWatcher();
    watcher.on("changed", async () => {
      await this._enumerate();
      this.onChange();
    });

    // finally, get devices
    await this._enumerate();
  }

  async _enumerate() {
    const devices = await WebRTC.enumerateDevices();
    this.devices = devices;
    this.loading = false;
  }

  enumerateDevices() {
    const audioInputDevices = this.devices.filter(
      (d) => d.kind === "audioinput"
    );
    const audioOutputDevices = this.devices.filter(
      (d) => d.kind === "audiooutput"
    );
    const videoInputDevices = this.devices.filter(
      (d) => d.kind === "videoinput"
    );

    return {
      devices: this.devices,
      loading: this.loading,

      // sugar
      audioinput: audioInputDevices,
      audiooutput: audioOutputDevices,
      videoinput: videoInputDevices,
    };
  }

  // meant to be overridden
  onChange() {}
}
