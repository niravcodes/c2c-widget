// @ts-nocheck
import { WebRTC } from "@signalwire/js";

class DevicesState {
  devices: MediaDeviceInfo[] = [];
  loading: boolean = false;
  selectedMicrophone: MediaDeviceInfo | null = null;
  selectedCamera: MediaDeviceInfo | null = null;
  selectedSpeaker: MediaDeviceInfo | null = null;
  isAudioMuted: boolean = false;
  isVideoMuted: boolean = false;
  isSpeakerMuted: boolean = false;

  get audioinput() {
    return this.devices.filter((d) => d.kind === "audioinput");
  }

  get audiooutput() {
    return this.devices.filter((d) => d.kind === "audiooutput");
  }

  get videoinput() {
    return this.devices.filter((d) => d.kind === "videoinput");
  }
}

export class Devices {
  state: DevicesState = new DevicesState();

  constructor() {}

  async setup() {
    this.state.loading = true;

    await WebRTC.getUserMedia({ audio: true, video: true });

    // when user plugs in a new device, we need to refresh the list
    const watcher = await WebRTC.createDeviceWatcher();
    watcher.on("changed", async () => {
      await this._updateDevicesList();
      this.onChange();
    });

    // finally, get devices
    await this._updateDevicesList();
    await this._updateSelectedDevices();
  }

  async _updateDevicesList() {
    const devices = await WebRTC.enumerateDevices();
    this.state.devices = devices;
  }

  async _updateSelectedDevices() {
    const { audioinput, audiooutput, videoinput } = this.state;

    if (!this.selectedMicrophone && audioinput.length > 0) {
      this.selectedMicrophone = audioinput[0];
    }
    if (!this.selectedCamera && videoinput.length > 0) {
      this.selectedCamera = videoinput[0];
    }
    if (!this.selectedSpeaker && audiooutput.length > 0) {
      this.selectedSpeaker = audiooutput[0];
    }

    this.selectedMicrophone =
      audioinput.find(
        (d) => d.deviceId === this.selectedMicrophone?.deviceId
      ) ||
      audioinput[0] ||
      null;
    this.selectedCamera =
      videoinput.find((d) => d.deviceId === this.selectedCamera?.deviceId) ||
      videoinput[0] ||
      null;
    this.selectedSpeaker =
      audiooutput.find((d) => d.deviceId === this.selectedSpeaker?.deviceId) ||
      audiooutput[0] ||
      null;
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
      selectedMicrophone: this.selectedMicrophone,
      selectedCamera: this.selectedCamera,
      selectedSpeaker: this.selectedSpeaker,
      isAudioMuted: this.isAudioMuted,
      isVideoMuted: this.isVideoMuted,
      isSpeakerMuted: this.isSpeakerMuted,
    };
  }

  setMicrophone(deviceId: string) {
    const device = this.devices.find(
      (d) => d.deviceId === deviceId && d.kind === "audioinput"
    );
    if (device) {
      this.selectedMicrophone = device;
      this.onChange();
    }
  }

  setCamera(deviceId: string) {
    const device = this.devices.find(
      (d) => d.deviceId === deviceId && d.kind === "videoinput"
    );
    if (device) {
      this.selectedCamera = device;
      this.onChange();
    }
  }

  setSpeaker(deviceId: string) {
    const device = this.devices.find(
      (d) => d.deviceId === deviceId && d.kind === "audiooutput"
    );
    if (device) {
      this.selectedSpeaker = device;
      this.onChange();
    }
  }

  private _muteAudio(audioTrack: MediaStreamTrack) {
    console.log("muting audio via track");
    audioTrack.enabled = false;
    this.isAudioMuted = true;
  }

  private _unmuteAudio(audioTrack: MediaStreamTrack) {
    console.log("unmuting audio via track");
    audioTrack.enabled = true;
    this.isAudioMuted = false;
  }

  private _muteVideo(videoTrack: MediaStreamTrack) {
    console.log("muting video via track");
    videoTrack.enabled = false;
    this.isVideoMuted = true;
  }

  private _unmuteVideo(videoTrack: MediaStreamTrack) {
    console.log("unmuting video via track");
    videoTrack.enabled = true;
    this.isVideoMuted = false;
  }

  toggleAudio(audioTrack: MediaStreamTrack) {
    if (this.isAudioMuted) {
      this._unmuteAudio(audioTrack);
    } else {
      this._muteAudio(audioTrack);
    }
    this.onChange();
  }

  toggleVideo(videoTrack: MediaStreamTrack) {
    if (this.isVideoMuted) {
      this._unmuteVideo(videoTrack);
    } else {
      this._muteVideo(videoTrack);
    }
    this.onChange();
  }

  toggleSpeaker() {
    this.isSpeakerMuted = !this.isSpeakerMuted;
    this.onChange();
  }

  muteAudio(audioTrack: MediaStreamTrack) {
    this._muteAudio(audioTrack);
    this.onChange();
  }

  unmuteAudio(audioTrack: MediaStreamTrack) {
    this._unmuteAudio(audioTrack);
    this.onChange();
  }

  muteVideo(videoTrack: MediaStreamTrack) {
    this._muteVideo(videoTrack);
    this.onChange();
  }

  unmuteVideo(videoTrack: MediaStreamTrack) {
    this._unmuteVideo(videoTrack);
    this.onChange();
  }

  // Note: Speaker muting is typically handled by the audio element's volume property
  // or the browser's audio context gain node, but for now we'll just track the state
  muteSpeaker() {
    this.isSpeakerMuted = true;
    this.onChange();
  }

  unmuteSpeaker() {
    this.isSpeakerMuted = false;
    this.onChange();
  }

  // meant to be overridden
  onLoad() {}
  onUIChangeRequest() {}
  onChange() {}
}
