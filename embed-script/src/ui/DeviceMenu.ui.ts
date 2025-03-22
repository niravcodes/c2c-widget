import html from "../lib/html.ts";
import { Devices } from "../Devices.ts";

// This is for popup device selection menu.
// Beneath all complexity, this just lists Devices.enumerateDevices()
// and triggers callback on callback select.

export default class DeviceMenu {
  private currentMenu: HTMLElement | null = null;
  private clickListener: ((event: MouseEvent) => void) | null = null;

  constructor(
    private menuContainer: HTMLElement,
    private deviceKind: MediaDeviceKind,
    private devices: Devices,
    private buttonRect: DOMRect,
    private onDeviceSelect?: (deviceId: string) => void
  ) {
    this.render();
    this.setupClickOutside();
  }

  render() {
    const devicesDetails = this.devices.enumerateDevices();
    const deviceList = devicesDetails[this.deviceKind];

    const menu = html`
      <div class="device-menu" name="deviceMenu">
        ${deviceList
          .map(
            (device: MediaDeviceInfo) =>
              `<div class="device-option" data-id="${device.deviceId}">
              ${device.label ?? `Unnamed ${this.deviceKind} Device`}
             </div>`
          )
          .join("")}
      </div>
    `;

    const { deviceMenu } = menu();
    this.currentMenu = deviceMenu;

    this.menuContainer.innerHTML = "";
    this.menuContainer.appendChild(deviceMenu);

    deviceMenu.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("device-option")) {
        const deviceId = target.dataset.id;
        if (deviceId && this.onDeviceSelect) {
          this.onDeviceSelect(deviceId);
          this.close();
        }
      }
    });

    this.reposition(this.buttonRect);
  }

  reposition(rect: DOMRect) {
    if (!this.currentMenu) return;

    this.buttonRect = rect;
    const menuRect = this.currentMenu.getBoundingClientRect();
    const containerRect =
      this.menuContainer.parentElement?.getBoundingClientRect() ||
      new DOMRect();

    const left =
      rect.left - containerRect.left + rect.width / 2 - menuRect.width / 2;
    const bottom = containerRect.height - (rect.top - containerRect.top) + 10;

    this.currentMenu.style.left = `${left}px`;
    this.currentMenu.style.bottom = `${bottom}px`;
  }

  close() {
    this.menuContainer.innerHTML = "";
    if (this.clickListener) {
      document.removeEventListener("click", this.clickListener);
      this.clickListener = null;
    }
  }

  private setupClickOutside() {
    this.clickListener = (event: MouseEvent) => {
      if (!this.currentMenu?.contains(event.target as Node)) {
        this.close();
      }
    };

    setTimeout(() => {
      document.addEventListener("click", this.clickListener!);
    }, 0);
  }
}
