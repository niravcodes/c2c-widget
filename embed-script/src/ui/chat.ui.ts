import { ChatState } from "../Chat";
import styles from "../css/chat.css?inline";
import html from "../lib/html";

export default function createChatUI(chatState: ChatState) {
  const messages = chatState.entries
    .map((entry) => {
      const messageClass =
        entry.type === "user" ? "message-sent" : "message-received";
      return `<div class="message ${messageClass}">${entry.text}</div> `;
    })
    .join("");

  const { chatContainer } = html`
    <div name="chatContainer">
      <style>
        ${styles}
      </style>
      <div class="chat">
        <div class="chat-messages">${messages}</div>
      </div>
    </div>
  `();

  return { chatContainer };
}
