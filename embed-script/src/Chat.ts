interface ChatEntry {
  type: "ai" | "user";
  text: string;
  state: "partial" | "complete";
}

export class ChatState {
  entries: ChatEntry[] = [];

  private getLastEntry(): ChatEntry | undefined {
    return this.entries[this.entries.length - 1];
  }

  addPartialAIResponse(text: string) {
    const lastEntry = this.getLastEntry();

    if (lastEntry?.type === "ai" && lastEntry.state === "partial") {
      lastEntry.text += " " + text;
    } else {
      this.entries.push({ type: "ai", text, state: "partial" });
    }
  }

  completeAIResponse(text: string) {
    const lastEntry = this.getLastEntry();
    if (lastEntry?.type === "ai" && lastEntry.state === "partial") {
      lastEntry.text = text;
      lastEntry.state = "complete";
    } else if (lastEntry?.type === "ai" && lastEntry.state === "complete") {
      return; // Ignore duplicate completion
    } else {
      this.entries.push({ type: "ai", text, state: "complete" });
    }
  }

  updatePartialUserText(text: string) {
    const lastEntry = this.getLastEntry();

    if (lastEntry?.type === "user" && lastEntry.state === "partial") {
      lastEntry.text = text;
    } else {
      this.entries.push({ type: "user", text, state: "partial" });
    }
  }

  completeUserText(text: string) {
    const lastEntry = this.getLastEntry();

    if (lastEntry?.type === "user") {
      lastEntry.text = text;
      lastEntry.state = "complete";
    } else {
      this.entries.push({ type: "user", text, state: "complete" });
    }
  }
}

// Chat class takes all the chat related events
// from client, and accumulates them into a single
// state, which can rendered with a pure function.

// note: these four things should probably be modeled as a fsm?
export class Chat {
  private state: ChatState;

  constructor() {
    this.state = new ChatState();
  }

  handleEvent(
    event:
      | "ai.response_utterance"
      | "ai.completion"
      | "ai.partial_result"
      | "ai.speech_detect",
    text: string
  ) {
    if (event === "ai.response_utterance") {
      this.state.addPartialAIResponse(text);
    } else if (event === "ai.completion") {
      this.state.completeAIResponse(text);
    } else if (event === "ai.partial_result") {
      this.state.updatePartialUserText(text);
    } else if (event === "ai.speech_detect") {
      this.state.completeUserText(text);
    }
    this.onUpdate();
  }

  // meant to be overridden
  onUpdate() {}
}
