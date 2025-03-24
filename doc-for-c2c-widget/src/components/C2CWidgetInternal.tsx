import { useRef, useEffect } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";

export default function C2CWidgetInternal() {
  const rootRef = useRef<HTMLDivElement>(null);

  // react doesn't like other scripts controlling the DOM,
  // we create an empty div and inject things via js
  // note: when component unmounts, we're clearing the div
  // so react doesn't get confused and break things
  useEffect(() => {
    if (rootRef.current) {
      rootRef.current.innerHTML = "";
      const widget = document.createElement("c2c-widget");

      widget.setAttribute("buttonId", "callButton");
      widget.setAttribute(
        "callDetails",
        JSON.stringify({
          destination: "/private/demo-1",
          supportsVideo: true,
          supportsAudio: true,
        })
      );
      widget.setAttribute(
        "token",
        "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIiwiY2giOiJwdWMuc2lnbmFsd2lyZS5jb20iLCJ0eXAiOiJTQVQifQ..QYHghlPEOE4HjtJb.1WKLEg09c05-g3RujrS0io5h6AJ4mfpKMWtykpMIERJlMuomtOLHrU8picaFHeppbb_-593GjxHfeZiVmYdPZiIPYuNw2znqBuySuPArPfb2NMvXtZHEgfl3sXAdy5xpqSpphxFKStXwylo0EGeC91cVQgn3_lmSBcp13JvwArnu5ULltGmjPJogRbE1PrBsBbEJJioumVSZuuMH5lo7am-wE37Q5GXgou1a9iJWBiBtgk5ysmW4HTvbZ7pZHL5VcnWVy4V0OJL3J4WXl-m47L6bgFmHUijvVWxoFDu4Z7aUfx551OEhefr04F5NuJaHzTWUpgNzQ_VgWho04K96MK--wH_dEyIxtbfUHJSZyk1-Ef_dDCgFK6Rlnl2H5HM4G05gEKWcSjXGGk4tN0g6YvHsrUrAgsZiQeVQ-ggCHHRcmYX1OeXYbv1vEPml8i5JPUHAak5VvOQLYoG2ydb5kVv3WdM0oWKGHzTFPLFmjTaRxSC2b378BGbR7hCxbY9NdaLFnSn45KDkv1_a-saR9gDCBa2ZCPbkFmWRKLtGORFoiN-mLYAPTugidqZx40Ue4hav-jX178udYpVgSmun_rMHoN81t0Sb4xqMovs2i47-WLyzTwaGBK2CgLeHohGBvB9aWsFOV7F_YrZlcn7ptKo7RdNSrfBkiw7F6Sf8oIOz.426h9VZWDSVYDUIL9a1wDg"
      );
      rootRef.current.appendChild(widget);
    }
    return () => {
      if (rootRef.current) {
        rootRef.current.innerHTML = "";
      }
    };
  }, []);

  return <BrowserOnly>{() => <div ref={rootRef} />}</BrowserOnly>;
}
