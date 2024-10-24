class FindIngredients {
  constructor({ onComplete }) {
    this.foundCount = 0;
    this.totalItems = 4; // Number of items to find
    this.onComplete = onComplete; // Save the onComplete callback

    // Create the element and movable divs
    this.createElement();
  }

  createElement() {
    // Create the fog overlay image
    const overlayImage = document.createElement('img');
    overlayImage.classList.add("fog");
  
    // Create the middle layer image
    const upperImage = document.createElement('img');
    upperImage.classList.add("upper");
  
    // Create the game container
    this.element = document.createElement("div");
    this.element.classList.add("background");
  
    // Set initial opacity to 0 for fade-in effect
    this.element.style.opacity = '0';
    this.element.style.transition = 'opacity 1s ease'; // Adjust duration as needed
  
    this.element.innerHTML = (`
      <p class="tut">click to collect items</p>
    `);
  
    const movableDivs = [
      //Crow Feather
      new MovableDiv(
        35, //startX
        2,  //startY
        -5, //endX
        2,  //endY
        10000, //interval between moves
        20, //size
        './images/ingredients/featherGathered.gif', //gathered anim
        'Gathered Crow Feather', //gathered text
        this.handleItemFound.bind(this), 
        './images/ingredients/crow.gif', //item image
        500, //delay before first move
        5, //speed between moves
        true //if it flips when reaching startX or endY
      ),
      
      //Frog Carcass
      new MovableDiv(
        10, //startX
        16, //startY
        8,  //endX
        16, //endY
        1000, //interval between moves
        15, //size
        './images/ingredients/frogGathered.gif', //gathered anim
        'Gathered Frog Carcass', //gathered text
        this.handleItemFound.bind(this), 
        './images/ingredients/frog.gif', //item image
        40, //delay before first move
        0.25,//speed between moves
      ),

      //Mossy Bark
      new MovableDiv(
        15, //startX
        8,  //startY
        15, //endX
        8,  //endY
        1000, //interval between moves
        15, //size
        './images/ingredients/mossyBarkGathered.gif', //gathered anim
        'Gathered Mossy Bark', //gathered text
        this.handleItemFound.bind(this), 
        './images/ingredients/mossyBark.gif', //item image
        40, //delay before first move
        0.25, //speed between moves
      ),

      //Moonlit Mushrooms
      new MovableDiv(
        21, //startX
        15,  //startY
        21, //endX
        15,  //endY
        1000, //interval between moves
        22, //size
        './images/ingredients/moonlitMushroomsGathered.gif', //gathered anim
        'Gathered Moonlit Mushrooms', //gathered text
        this.handleItemFound.bind(this), 
        './images/ingredients/moonlitMushrooms.gif', //item image
        40, //delay before first move
        0.25, //speed between moves
      ),
    ];
  
    // Append each movable div to the main element
    movableDivs.forEach(div => this.element.appendChild(div.div));
  
    // Start moving the movable divs
    movableDivs.forEach(div => div.startMovement());
  
    // Append the middle image above the movable divs
    this.element.appendChild(upperImage);
    // Append the fog overlay last
    this.element.appendChild(overlayImage);
  }
  

  handleItemFound() {
    // Increment the found count
    this.foundCount++;
  
    // Check if all items have been found
    if (this.foundCount >= this.totalItems) {
      // Delay the onComplete callback to allow the last item's GIF to play
      setTimeout(() => {
        // Fade out the entire game container
        this.element.style.opacity = '0'; // Start fading out
        this.element.style.transition = 'opacity 1s ease'; // Adjust duration as needed
  
        // After the fade-out completes, remove the element and trigger onComplete
        this.element.addEventListener('transitionend', () => {
          if (this.onComplete) {
            this.element.remove(); // Remove the game element after fade-out
            this.onComplete(); // Trigger the onComplete callback
          }
        });
      }, 2000); // Adjust delay time as needed (e.g., 2000ms = 2 seconds)
    }
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

class MovableDiv {
  constructor(startX, startY, endX, endY, interval = 1000, size = 100, gifSrc = '', clickText = '', handleItemFound, bgImageSrc = '', initialDelay = 0, transitionSpeed = 0.5, canFlip = false) {
    this.handleItemFound = handleItemFound;

    this.div = document.createElement('div');
    this.div.style.position = 'absolute';
    this.setSize(size);

    if (bgImageSrc) {
      this.div.style.backgroundImage = `url(${bgImageSrc})`;
      this.div.style.backgroundSize = 'cover';
    } else {
      this.div.style.backgroundColor = 'blue';
    }

    this.startX = utils.withGrid(startX);
    this.startY = utils.withGrid(startY);
    this.endX = utils.withGrid(endX);
    this.endY = utils.withGrid(endY);
    this.interval = interval;
    this.movingToEnd = true;
    this.movementInterval = null;
    this.gifSrc = gifSrc;
    this.clickText = clickText;
    this.initialDelay = initialDelay; // Set the initial delay
    this.transitionSpeed = transitionSpeed; // Set the transition speed

    this.flipped = false; // Track the flip state
    this.canFlip = canFlip; // Store whether this div can flip

    this.controlDiv(this.startX, this.startY);
    this.div.addEventListener('click', () => this.handleClick());
  }

  // Function to control the div's movement
  controlDiv(newX, newY) {
    // Set transition to linear with specified speed
    this.div.style.transition = `left ${this.transitionSpeed}s linear, top ${this.transitionSpeed}s linear`;
    this.div.style.left = `${newX}px`;
    this.div.style.top = `${newY}px`;

    // Flip the div if it reaches startX or endX and canFlip is true
    if (this.canFlip && (newX === this.startX || newX === this.endX)) {
      this.flip();
    }
  }

  flip() {
    this.flipped = !this.flipped; // Toggle the flip state
    this.div.style.transform = this.flipped ? 'scaleX(-1)' : 'scaleX(1)'; // Flip horizontally
  }

  startMovement() {
    if (this.movementInterval) return; // Prevent starting multiple intervals

    // Delay the first move by the specified initialDelay
    setTimeout(() => {
      this.controlDiv(this.endX, this.endY); // Move to end position after delay
      this.movingToEnd = false; // After first move, toggle direction

      // Start the regular movement interval after the first move
      this.movementInterval = setInterval(() => {
        if (this.movingToEnd) {
          this.controlDiv(this.endX, this.endY); // Move to end position
        } else {
          this.controlDiv(this.startX, this.startY); // Move back to start position
        }
        this.movingToEnd = !this.movingToEnd; // Toggle direction
      }, this.interval);
    }, this.initialDelay); // Wait for the initialDelay before starting the movement
  }

  stopMovement() {
    if (this.movementInterval) {
      clearInterval(this.movementInterval);
      this.movementInterval = null;
    }
  }

  setSize(size) {
    this.div.style.width = `${size}px`;
    this.div.style.height = `${size}px`;
  }

  handleClick() {
    this.div.style.display = 'none';
    const itemContainer = document.createElement('div');
    itemContainer.classList.add('itemContainer');
  
    const gif = document.createElement('img');
    gif.src = this.gifSrc;
    gif.classList.add('itemFound');
  
    const text = document.createElement('p');
    text.innerText = this.clickText;
    text.classList.add('itemText');
  
    itemContainer.appendChild(gif);
    itemContainer.appendChild(text);
  
    const gameContainer = document.querySelector('.game-container');
    
    // Set initial opacity to 0 and apply transition
    itemContainer.style.opacity = '0'; 
    itemContainer.style.transition = 'opacity 0.5s ease'; // Adjust duration as needed
    gameContainer.appendChild(itemContainer);
  
    itemContainer.style.left = '50%';
    itemContainer.style.top = '50%';
    itemContainer.style.transform = 'translate(-50%, -50%)';
  
    // Trigger the fade-in effect by setting opacity to 1
    requestAnimationFrame(() => {
      itemContainer.style.opacity = '1';
    });
  
    // Fade out after 1000ms
    setTimeout(() => {
      itemContainer.style.opacity = '0';
      itemContainer.addEventListener('transitionend', () => {
        gameContainer.removeChild(itemContainer);
      });
    }, 1000);
  
    this.handleItemFound();
  }
}  