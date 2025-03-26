import controls from "./controls.html.ts";
import { Devices } from "../Devices.ts";
import DeviceMenu from "./DeviceMenu.ui.ts";
import videoIcon from "../icons/video.svg?raw";
import videoOffIcon from "../icons/video-off.svg?raw";
import microphoneIcon from "../icons/microphone.svg?raw";
import microphoneOffIcon from "../icons/microphone-off.svg?raw";
import speakerIcon from "../icons/speaker.svg?raw";
import speakerOffIcon from "../icons/speaker-off.svg?raw";

export default async function createControls(
  onHangup?: () => void,
  onVideoDeviceSelect?: (deviceId: string) => Promise<boolean>,
  onAudioInputSelect?: (deviceId: string) => Promise<boolean>,
  onAudioOutputSelect?: (deviceId: string) => Promise<boolean>,
  onToggleVideo?: () => void,
  onToggleMic?: () => void,
  onToggleSpeaker?: () => void
) {
  const devices = new Devices();
  await devices.setup();

  const {
    controlsContainer,
    menuContainer,
    videoButton,
    micButton,
    speakerButton,
    hangupButton,
    videoDevicesButton,
    micDevicesButton,
    speakerDevicesButton,
  } = controls();

  function updateDeviceIcons() {
    const {
      isVideoMuted,
      isAudioMuted,
      isSpeakerMuted,
      videoinput,
      audioinput,
      audiooutput,
    } = devices.enumerateDevices();

    videoButton.innerHTML = isVideoMuted ? videoOffIcon : videoIcon;
    micButton.innerHTML = isAudioMuted ? microphoneOffIcon : microphoneIcon;
    speakerButton.innerHTML = isSpeakerMuted ? speakerOffIcon : speakerIcon;

    videoDevicesButton.style.display = videoinput.length > 0 ? "block" : "none";
    micDevicesButton.style.display = audioinput.length > 0 ? "block" : "none";
    speakerDevicesButton.style.display =
      audiooutput.length > 0 ? "block" : "none";
  }

  let activeMenu: DeviceMenu | null = null;
  let activeButton: HTMLElement | null = null;

  devices.onChange = () => {
    if (activeMenu && activeButton) {
      const rect = activeButton.getBoundingClientRect();
      activeMenu.render();
      activeMenu.reposition(rect);
    }
    updateDeviceIcons();
  };

  // Initial icon states
  updateDeviceIcons();

  function handleDeviceButtonClick(
    button: HTMLElement,
    deviceKind: MediaDeviceKind,
    callback?: (deviceId: string) => void
  ) {
    if (activeButton === button) {
      activeMenu?.close();
      activeMenu = null;
      activeButton = null;
      return;
    }

    activeMenu?.close();
    const rect = button.getBoundingClientRect();
    activeMenu = new DeviceMenu(
      menuContainer,
      deviceKind,
      devices,
      rect,
      callback
    );
    activeButton = button;
  }

  videoButton.addEventListener("click", () => {
    onToggleVideo?.();
    devices.toggleVideoMute();
    updateDeviceIcons();
  });
  micButton.addEventListener("click", () => {
    onToggleMic?.();
    devices.toggleAudioMute();
    updateDeviceIcons();
  });
  speakerButton.addEventListener("click", () => {
    onToggleSpeaker?.();
    devices.toggleSpeakerMute();
    updateDeviceIcons();
  });

  videoDevicesButton.addEventListener("click", () => {
    handleDeviceButtonClick(
      videoDevicesButton,
      "videoinput",
      async (deviceId) => {
        const success = await onVideoDeviceSelect?.(deviceId);
        if (success) {
          devices.setCamera(deviceId);
        }
      }
    );
  });

  micDevicesButton.addEventListener("click", () => {
    handleDeviceButtonClick(
      micDevicesButton,
      "audioinput",
      async (deviceId) => {
        const success = await onAudioInputSelect?.(deviceId);
        if (success) {
          devices.setMicrophone(deviceId);
        }
      }
    );
  });

  speakerDevicesButton.addEventListener("click", () => {
    handleDeviceButtonClick(
      speakerDevicesButton,
      "audiooutput",
      async (deviceId) => {
        const success = await onAudioOutputSelect?.(deviceId);
        if (success) {
          devices.setSpeaker(deviceId);
        }
      }
    );
  });

  hangupButton.addEventListener("click", () => onHangup?.());

  return controlsContainer;
}
