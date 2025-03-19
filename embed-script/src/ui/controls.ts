import { Devices } from "../Devices";
import styles from "../css/controls.css?inline";
import callEndIcon from "../icons/callEnd.svg?raw";
import videoIcon from "../icons/video.svg?raw";
import microphoneIcon from "../icons/microphone.svg?raw";
import speakerIcon from "../icons/speaker.svg?raw";

export function controls(hangupCallback?: () => void) {
  const controlsElement = document.createElement("div");
  controlsElement.className = "controls";

  const style = document.createElement("style");
  style.textContent = styles;
  controlsElement.appendChild(style);

  let activeMenu: HTMLElement | null = null;
  const devicesInstance = new Devices();

  async function createDeviceMenu(
    deviceKind: MediaDeviceKind
  ): Promise<HTMLElement> {
    const menu = document.createElement("div");
    menu.className = "device-menu";

    const devices = await devicesInstance.enumerateDevices();
    const filteredDevices = devices.filter(
      (device) => device.kind === deviceKind
    );

    filteredDevices.forEach((device: MediaDeviceInfo) => {
      const option = document.createElement("div");
      option.className = "device-option";
      option.textContent =
        device.label || `${deviceKind} ${filteredDevices.indexOf(device) + 1}`;
      option.onclick = () => {
        menu.remove();
        activeMenu = null;
      };
      menu.appendChild(option);
    });

    return menu;
  }

  function createButton(
    icon: string,
    className: string,
    onClick: () => void
  ): HTMLButtonElement {
    const button = document.createElement("button");
    button.className = `control-button ${className}`;
    button.innerHTML = icon;
    button.onclick = onClick;
    return button;
  }

  async function handleDeviceClick(
    deviceKind: MediaDeviceKind,
    button: HTMLButtonElement
  ) {
    if (activeMenu) {
      activeMenu.remove();
      activeMenu = null;
      return;
    }

    const menu = await createDeviceMenu(deviceKind);
    const rect = button.getBoundingClientRect();
    menu.style.left = `${rect.left}px`;
    controlsElement.appendChild(menu);
    activeMenu = menu;
  }

  const videoButton = createButton(videoIcon, "", () =>
    handleDeviceClick("videoinput", videoButton)
  );
  const micButton = createButton(microphoneIcon, "", () =>
    handleDeviceClick("audioinput", micButton)
  );
  const speakerButton = createButton(speakerIcon, "", () =>
    handleDeviceClick("audiooutput", speakerButton)
  );

  const hangupButton = createButton(callEndIcon, "hangup", () => {
    if (hangupCallback) {
      hangupCallback();
    }
  });

  controlsElement.appendChild(videoButton);
  controlsElement.appendChild(micButton);
  controlsElement.appendChild(speakerButton);
  controlsElement.appendChild(hangupButton);

  document.addEventListener("click", (e) => {
    if (activeMenu && !activeMenu.contains(e.target as Node)) {
      activeMenu.remove();
      activeMenu = null;
    }
  });

  return controlsElement;
}
