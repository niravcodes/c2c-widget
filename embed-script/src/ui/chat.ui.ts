import { ChatEntry } from "../Chat";
import styles from "../css/chat.css?inline";
import html from "../lib/html";
import { style } from "../Style";

style.register(styles);

export default function createChatUI(chatHistory: ChatEntry[]) {
  const messages = chatHistory
    .map((entry) => {
      const messageClass =
        entry.type === "user" ? "message-sent" : "message-received";
      return `<div class="message ${messageClass}">${entry.text}</div> `;
    })
    .join("");

  const { chatContainer } = html`
    <div name="chatContainer" class="chat-container">
      <div class="chat">${messages}</div>
    </div>
  `();

  return { chatContainer };
}
