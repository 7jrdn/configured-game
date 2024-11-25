class StorylineMessage {
    constructor({ text, onComplete }) {
      this.text = text || "No message";  // Default to "No message" if no text is provided
      this.onComplete = onComplete;
      this.element = null;
    }
  
    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("TextMessage");
        this.element.classList.add("witchTextBox");
    
        // Use the 'who' property for the character's name in the message
        this.element.innerHTML = (`
          <p class="TextMessage_who">Witch</p>
          <p class="TextMessage_p" style="padding-right:40px"></p>
          <button class="TextMessage_button"></button>
        `);
  
      this.revealingText = new RevealingText({
        element: this.element.querySelector(".TextMessage_p"),
        text: this.text,
      });
  
      this.element.querySelector("button").addEventListener("click", () => this.done());
      this.actionListener = new KeyPressListener("Space", () => this.done());
    }
  
    done() {
      if (this.revealingText.isDone) {
        this.element.remove();
        this.actionListener.unbind();
        this.onComplete(); // Resolve when done
      } else {
        this.revealingText.warpToDone();
      }
    }
  
    init(container) {
      this.createElement();
      container.appendChild(this.element);
      this.revealingText.init();
    }
  }
  