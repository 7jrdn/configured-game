class OverworldEvent {
  constructor({ map, event }) {
    this.map = map;
    this.event = event;
    this.playerHasAllItems = false;
  }

  stand(resolve) {
    const who = this.map.gameObjects[this.event.who];
    who.startBehavior({
      map: this.map
    }, {
      type: "stand",
      direction: this.event.direction,
      time: this.event.time
    });

    // Set up a handler to complete when the correct person is done standing, then resolve the event
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonStandComplete", completeHandler);
        resolve();
      }
    };
    document.addEventListener("PersonStandComplete", completeHandler);
  }

  async fleeAndWalkBack(resolve) {
    const who = this.map.gameObjects[this.event.who];
    const hero = this.map.gameObjects["hero"];

    // Determine direction based on who’s direction and hero's position
    let fleeDirection = null;
    if (who.direction === "up" && hero.y < who.y) fleeDirection = "up";
    else if (who.direction === "down" && hero.y > who.y) fleeDirection = "down";
    else if (who.direction === "left" && hero.x < who.x) fleeDirection = "left";
    else if (who.direction === "right" && hero.x > who.x) fleeDirection = "right";

    if (fleeDirection) {
      // Start fleeing behavior
      who.startBehavior({ map: this.map }, { type: "walk", direction: fleeDirection, retry: true });
      hero.startBehavior({ map: this.map }, { type: "walk", direction: fleeDirection, retry: true });

      const completeHandler = e => {
        if (e.detail.whoId === this.event.who) {
          // Remove intentPosition for both after movement to avoid passing through each other
          hero.intentPosition = null;
          who.intentPosition = null;

          document.removeEventListener("PersonWalkingComplete", completeHandler);

          // Snap "who" to the nearest 8px grid position after fleeing
          this.snapToGrid(who);

          // After snapping, start walking back to original coordinates
          this.walkBack(resolve);
        }
      };
      document.addEventListener("PersonWalkingComplete", completeHandler);
    } else {
      // If no valid direction is determined, resolve immediately
      console.warn("No valid direction to flee.");
      resolve();
    }
  }

  snapToGrid(who) {
    who.x = Math.round(who.x / 8) * 8; // Snap to nearest 8px grid on x-axis
    who.y = Math.round(who.y / 8) * 8; // Snap to nearest 8px grid on y-axis
  }

  async walkBack(resolve) {
    const who = this.map.gameObjects[this.event.who]; // The NPC "who"

    // Retrieve original coordinates from the NPC object
    const originalCoords = {
      x: who.originalX,
      y: who.originalY
    };

    const targetX = originalCoords.x;
    const targetY = originalCoords.y;

    // Check if "who" is already at the target coordinates
    if (who.x === targetX && who.y === targetY) {
      who.behaviorLoopIndex = 0; // Reset the behavior loop index
      resolve(); // Resolve the event immediately
      return; // Exit the method
    }

    // Function to walk "who" step by step back to the original coordinates
    const moveStep = () => {
      let directionToMove = null;

      // Determine the correct direction based on current and target coordinates
      if (who.x > targetX) {
        directionToMove = "left";
      } else if (who.x < targetX) {
        directionToMove = "right";
      } else if (who.y > targetY) {
        directionToMove = "up";
      } else if (who.y < targetY) {
        directionToMove = "down";
      }

      // If a valid direction is determined, move one step
      if (directionToMove) {
        who.startBehavior({
          map: this.map
        }, {
          type: "walk",
          direction: directionToMove,
          retry: true
        });

        const completeHandler = e => {
          if (e.detail.whoId === this.event.who) {
            document.removeEventListener("PersonWalkingComplete", completeHandler);
            // Check if "who" has reached the original coordinates
            if (who.x === targetX && who.y === targetY) {
              who.behaviorLoopIndex = 0; // Reset the behavior loop index
              resolve(); // Resolve the event once the walk back is complete
            } else {
              // If not at the target yet, move another step
              moveStep();
            }
          }
        };

        // Add event listener for completion of the walk
        document.addEventListener("PersonWalkingComplete", completeHandler);
      } else {
        // If no valid direction is determined, log details for debugging
        console.warn("No valid direction to move back to original coordinates.");
        resolve();
      }
    };

    // Start the walking process
    moveStep();
  }

  walk(resolve) {
    const who = this.map.gameObjects[this.event.who];
    who.startBehavior({
      map: this.map
    }, {
      type: "walk",
      direction: this.event.direction,
      retry: true
    });

    // Set up a handler to complete when the correct person is done walking, then resolve the event
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonWalkingComplete", completeHandler);
        resolve();
      }
    };
    document.addEventListener("PersonWalkingComplete", completeHandler);
  }

  textMessage(resolve) {
    // Face the hero if specified in the event
    if (this.event.faceHero) {
      const obj = this.map.gameObjects[this.event.faceHero];
      obj.direction = utils.oppositeDirection(this.map.gameObjects["hero"].direction);
    }

    // Create the message, ensuring we pass the correct 'who' character
    const message = new TextMessage({
      text: this.event.text,
      who: this.event.faceHero || "Unknown", // Use 'who' from event or fallback to 'faceHero'
      onComplete: () => resolve()
    });

    message.init(document.querySelector(".game-container"));
  }

  storylineMessage(resolve) {
    const message = new StorylineMessage({
      text: this.event.text,
      onComplete: () => {
        // When the message is complete, resolve the promise
        resolve();
      }
    });
  
    message.init(document.querySelector(".game-container"));
  }
  

changeMap(resolve) {
    const sceneTransition = new SceneTransition();
    sceneTransition.init(document.querySelector(".game-container"), () => {
      this.map.overworld.startMap( window.OverworldMaps[this.event.map], {
        x: this.event.x,
        y: this.event.y,
        direction: this.event.direction,
      });
      resolve();
      sceneTransition.fadeOut();
    })
  }

  findIngredients(resolve) {
    // Check if all items have already been found (persisted in the map)
    console.log("Checking if all items are found:", this.map.playerHasAllItems);

    if (this.map.playerHasAllItems) {
      console.log("Ingredients already found. Event won't be triggered again.");
      resolve(); // Resolve immediately if all items are already found
      return;
    }

    const findIngredients = new FindIngredients({
      onComplete: () => {
        // Mark items as found and store this state on the map object
        this.map.playerHasAllItems = true;
        console.log("All items found! Marking game as completed.");
        resolve();
      }
    });

    findIngredients.init(document.querySelector(".game-container"));
    console.log("FindIngredients game started.");
  }

  async musicBox(resolve) {
    const musicBox = new MusicBox({
        onComplete: () => resolve()  // Resolves the event after the music box closes
    });

    musicBox.init(document.querySelector(".game-container"));
  }

  artwork(resolve) {
    const artwork = new Artwork({
        imageSrc: this.event.imageSrc,
        onComplete: () => resolve() // Ensure resolve is called when the artwork completes
    });

    artwork.init(document.querySelector(".game-container")); // Initialize and append the artwork
}


  init() {
    return new Promise(resolve => {
      this[this.event.type](resolve);
    });
  }
}
