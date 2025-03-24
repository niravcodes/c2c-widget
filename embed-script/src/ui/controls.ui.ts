import controls from "./controls.html.ts";
import { Devices } from "../Devices.ts";
import DeviceMenu from "./DeviceMenu.ui.ts";

export default async function createControls(
  onHangup?: () => void,
  onVideoDeviceSelect?: (deviceId: string) => void,
  onAudioInputSelect?: (deviceId: string) => void,
  onAudioOutputSelect?: (deviceId: string) => void,
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

  let activeMenu: DeviceMenu | null = null;
  let activeButton: HTMLElement | null = null;

  devices.onChange = () => {
    if (activeMenu && activeButton) {
      const rect = activeButton.getBoundingClientRect();
      activeMenu.render();
      activeMenu.reposition(rect);
    }
  };

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

  videoButton.addEventListener("click", () => onToggleVideo?.());
  micButton.addEventListener("click", () => onToggleMic?.());
  speakerButton.addEventListener("click", () => onToggleSpeaker?.());

  videoDevicesButton.addEventListener("click", () => {
    handleDeviceButtonClick(
      videoDevicesButton,
      "videoinput",
      onVideoDeviceSelect
    );
  });

  micDevicesButton.addEventListener("click", () => {
    handleDeviceButtonClick(micDevicesButton, "audioinput", onAudioInputSelect);
  });

  speakerDevicesButton.addEventListener("click", () => {
    handleDeviceButtonClick(
      speakerDevicesButton,
      "audiooutput",
      onAudioOutputSelect
    );
  });

  hangupButton.addEventListener("click", () => onHangup?.());

  return controlsContainer;
}
