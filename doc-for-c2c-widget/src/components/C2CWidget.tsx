import BrowserOnly from "@docusaurus/BrowserOnly";
import C2CWidgetInternal from "./C2CWidgetInternal";
import useIsBrowser from "@docusaurus/useIsBrowser";

export default function C2CWidget() {
  const isBrowser = useIsBrowser();
  if (!isBrowser) {
    return null;
  }
  return (
    <BrowserOnly>
      {() => (
        <>
          <button id="callButton" className="button button--primary button--lg">
            Call
          </button>
          <C2CWidgetInternal />
        </>
      )}
    </BrowserOnly>
  );
}
