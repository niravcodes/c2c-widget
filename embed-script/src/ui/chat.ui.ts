import { ChatEntry } from "../Chat";
import html from "../lib/html";
import tail from "../icons/chat-tail.svg?raw";

export default function createChatUI(
  chatHistory: ChatEntry[],
  currentRoot: HTMLElement
) {
  const SCROLL_THRESHOLD = 300;

  const chatPanelScrolledToBottom =
    currentRoot.scrollHeight - currentRoot.clientHeight <=
    currentRoot.scrollTop + SCROLL_THRESHOLD;
  const previousScrollTop = currentRoot.scrollTop;

  const messages = chatHistory
    .map((entry) => {
      const messageClass =
        entry.type === "user" ? "message-sent" : "message-received";
      const inProgressClass = entry.state === "partial" ? "in-progress" : "";
      return `<div class="message ${messageClass} ${inProgressClass}">${entry.text}<div class="tail">${tail}</div></div> `;
    })
    .join("");

  const { chatContainer, chat } = html`
    <div name="chatContainer" class="chat-container">
      <div class="chat" name="chat">${messages}</div>
    </div>
  `();

  if (currentRoot.querySelector(".chat") !== null)
    simple_diff_old(chat, currentRoot.querySelector(".chat")!);
  else {
    currentRoot.appendChild(chatContainer);
  }

  if (chatPanelScrolledToBottom) {
    currentRoot.scrollTo({
      top: currentRoot.scrollHeight,
      behavior: "smooth",
    });
    // currentRoot.scrollTop = currentRoot.scrollHeight;
  } else {
    currentRoot.scrollTop = previousScrollTop;
  }
}

// Extremely simple diffing, specifically for chat messages.
// Assumptions: i. history doesn't change; ii. messages are only added iii. No grand-children.
// If any might fail, just use a simple dom-diffing library like nanomorph:
// please don't push this function beyond what it's currently doing.
function simple_diff_old(newdom: HTMLElement, target: HTMLElement) {
  const newChildren = newdom.children;
  const currentChildren = target.children;

  for (let i = 0; i < currentChildren.length; i++) {
    const currentChild = currentChildren[i] as HTMLElement;
    const newChild = newChildren[i] as HTMLElement;

    if (!newChild) {
      // this should never happen based on Chat state design.
      console.warn(
        "chat.ui.ts: simple_diff: chat state changed in unexpected way."
      );
      target.removeChild(currentChild);
      continue;
    }

    currentChild.textContent = newChild.textContent;
    currentChild.className = newChild.className;
  }

  for (let i = currentChildren.length; i < newChildren.length; i++) {
    target.appendChild(newChildren[i].cloneNode(true));
  }
}

/*--------------------
 typing effect, this works but ignoring for now because it introduces 2 new bugs:
1. scroll position snapping to the bottom gets thrown off because the new text is animated in
2. the svg tail is lost because of the rudimentary code

TODO: work on this more later,

// TODO: We're entering luxury territory from here onwards.
// To revert to the simpler days, get rid of the opulence below
// and rename `simple_diff_old` to `simple_diff`.

const activeTimers = new Map<HTMLElement, NodeJS.Timeout>();

// simple lcp
function findCommonPrefix(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

function typeText(
  target: HTMLElement,
  oldText: string,
  newText: string,
  speed = 30
) {
  if (activeTimers.has(target)) {
    clearTimeout(activeTimers.get(target)!);
    activeTimers.delete(target);
  }

  const commonLength = findCommonPrefix(oldText, newText);
  target.textContent = newText.substring(0, commonLength);

  let i = commonLength;
  function type() {
    if (i < newText.length) {
      target.textContent += newText[i++];
      const timer = setTimeout(type, speed);
      activeTimers.set(target, timer);
    } else {
      activeTimers.delete(target);
    }
  }

  type();
}

function simple_diff(newdom: HTMLElement, target: HTMLElement) {
  const newChildren = newdom.children;
  const currentChildren = target.children;

  for (let i = 0; i < currentChildren.length; i++) {
    const currentChild = currentChildren[i] as HTMLElement;
    const newChild = newChildren[i] as HTMLElement;

    if (!newChild) {
      console.warn(
        "chat.ui.ts: simple_diff: chat state changed in unexpected way."
      );
      target.removeChild(currentChild);
      continue;
    }

    const oldText = currentChild.textContent || "";
    const newText = newChild.textContent || "";

    if (oldText !== newText) {
      typeText(currentChild, oldText, newText);
    }

    currentChild.className = newChild.className;
  }

  for (let i = currentChildren.length; i < newChildren.length; i++) {
    const clone = newChildren[i].cloneNode(true) as HTMLElement;
    target.appendChild(clone);
    typeText(clone, "", clone.textContent || "");
  }
}
*/
