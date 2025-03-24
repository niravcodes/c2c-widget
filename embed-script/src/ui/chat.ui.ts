import { ChatEntry } from "../Chat";
import chatStyle from "../css/chat.css?inline";
import html from "../lib/html";
import { style } from "../Style";

style.register(chatStyle);

export default function createChatUI(
  chatHistory: ChatEntry[],
  currentRoot: HTMLElement
) {
  const chatPanelScrolledToBottom =
    currentRoot.scrollHeight - currentRoot.clientHeight <=
    currentRoot.scrollTop + 300;
  const previousScrollTop = currentRoot.scrollTop;

  const messages = chatHistory
    .map((entry) => {
      const messageClass =
        entry.type === "user" ? "message-sent" : "message-received";
      const inProgressClass = entry.state === "partial" ? "in-progress" : "";
      return `<div class="message ${messageClass} ${inProgressClass}">${entry.text}</div> `;
    })
    .join("");

  const { chatContainer, chat } = html`
    <div name="chatContainer" class="chat-container">
      <div class="chat" name="chat">${messages}</div>
    </div>
  `();

  if (currentRoot.querySelector(".chat") !== null)
    simple_diff(chat, currentRoot.querySelector(".chat")!);
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
function simple_diff(newdom: HTMLElement, target: HTMLElement) {
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
