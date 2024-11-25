class Overworld {
  constructor(config) {
    this.element = config.element;
    this.canvas = this.element.querySelector(".game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.map = null;

    this.ctx.imageSmoothingEnabled = false;
  }

  startGameLoop() {
    const fps = 60; // Set your desired FPS
    const fpsInterval = 1000 / fps;
    let lastTime = performance.now();
  
    const step = (currentTime) => {
      const elapsed = currentTime - lastTime;
  
      if (elapsed > fpsInterval) {
        lastTime = currentTime - (elapsed % fpsInterval);
  
        // Clear off the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
        // Establish the camera person
        const cameraPerson = this.map.gameObjects.hero;
  
        // Update all objects
        Object.values(this.map.gameObjects).forEach(object => {
          object.update({
            arrow: this.directionInput.direction,
            map: this.map,
          });
        });
  
        // Draw Lower layer
        this.map.drawLowerImage(this.ctx, cameraPerson);
  
        // Draw Game Objects
        Object.values(this.map.gameObjects).sort((a, b) => a.y - b.y).forEach(object => {
          object.sprite.draw(this.ctx, cameraPerson);
        });
  
        // Draw Upper layer
        this.map.drawUpperImage(this.ctx, cameraPerson);
  
      }
  
      requestAnimationFrame(step);
    };
  
    requestAnimationFrame(step);
  }
  

  bindActionInput() {
    new KeyPressListener("Space", () => {
      //Is there a person here to talk to?
      this.map.checkForActionCutscene()
    })
  }

  bindHeroPositionCheck() {
    document.addEventListener("PersonWalkingComplete", e => {
      if (e.detail.whoId === "hero") {
        //Hero's position has changed
        this.map.checkForFootstepCutscene()
      }
    })
  }

  startMap(mapConfig, heroInitialState=null) {
    this.map = new OverworldMap(mapConfig);
    this.map.overworld = this;
    this.map.mountObjects();

    if(heroInitialState) {
      const { hero } = this.map.gameObjects;
      hero.x = heroInitialState.x;
      hero.y = heroInitialState.y;
      hero.direction = heroInitialState.direction;
    }
  }

  init() {
    this.startMap(window.OverworldMaps.WitchHut);


    this.bindActionInput();
    this.bindHeroPositionCheck();

    this.directionInput = new DirectionInput();
    this.directionInput.init();

    this.startGameLoop();

  }
}