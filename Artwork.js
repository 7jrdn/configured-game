class Artwork {
    constructor({ imageSrc, onComplete }) {
      this.imageSrc = imageSrc;
      this.onComplete = onComplete;
      this.createElement();
    }
  
    createElement() {
      // Create the artwork container
      this.element = document.createElement("div");
      this.element.className = "artwork-container";
  
      // Create and append the image
      const img = document.createElement("img");
      img.src = this.imageSrc;
      img.alt = "Artwork";
      img.className = "artwork-image";
      this.element.appendChild(img);
  
      // Append the artwork to the game container
      const gameContainer = document.querySelector(".game-container");
      gameContainer.appendChild(this.element);
  
      this.element.style.opacity = '0';
      this.element.style.transition = 'opacity 1s ease';

      this.element.addEventListener('transitionend', () => {
          if (this.element.style.opacity === '0') {
              this.element.remove();
              if (this.onComplete) {
                  this.onComplete();
              }
          }
      });
    }
  
    init(container) {
        // Append the element to the container
        container.appendChild(this.element);
        
        // Trigger the fade-in effect by setting opacity to 1
        requestAnimationFrame(() => {
          this.element.style.opacity = '1';
        });
      }
  }
  