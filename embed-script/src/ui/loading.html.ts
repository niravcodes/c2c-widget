import html from "../lib/html";
import loadingIcon from "../icons/loading.svg?raw";
import loadingStyle from "../css/loading.css?inline";

import { style } from "../Style";

style.register(loadingStyle);

export default html`
  <div class="loading" name="loading">
    <div class="loading-icon">${loadingIcon}</div>
  </div>
`;
