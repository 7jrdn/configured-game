class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.gameObjects = {}; // Live objects
    this.configObjects = config.configObjects; // Config content

    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.fog = new Image();
    this.fog.src = config.fogSrc;

    // Wait for the fog image to load
    this.fog.onload = () => {
      this.fogWidth = this.fog.width; // Store fog width once the image is loaded
    };

    this.fogOffset = 0; // Start offset for scrolling
    this.isCutscenePlaying = false;

    this.frameRate = 60; // Example: 60 FPS
    this.scrollSpeed = 15 / this.frameRate; // 1/16 grid per second

  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage, 
      utils.withGrid(14) - cameraPerson.x, 
      utils.withGrid(10) - cameraPerson.y
    );
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage, 
      utils.withGrid(14) - cameraPerson.x, 
      utils.withGrid(10) - cameraPerson.y
    );
  } 

drawFog(ctx, cameraPerson) {
    if (!this.fogWidth) return; // Ensure the fog image has been loaded

    // Calculate the position where the fog should start
    const fogX = utils.withGrid(-20) - cameraPerson.x;
    const fogY = utils.withGrid(16) - cameraPerson.y;

    // Set the desired fog opacity
    ctx.globalAlpha = 0.35;

// First fog (original)
ctx.drawImage(
  this.fog,
  this.fogOffset,
  0,
  this.fogWidth - this.fogOffset,
  this.fog.height,
  fogX,
  fogY,
  this.fogWidth - this.fogOffset,
  this.fog.height
);

// Second fog image: draw the remainder at the beginning to fill the gap
if (this.fogOffset > 0) {
  ctx.drawImage(
    this.fog,
    0,
    0,
    this.fogOffset,
    this.fog.height,
    fogX + (this.fogWidth - this.fogOffset),
    fogY,
    this.fogOffset,
    this.fog.height
  );
}

    // Reset opacity after drawing the fog
    ctx.globalAlpha = 1.0;

    // Update the fog offset, ensuring it loops around smoothly
    this.fogOffset = (this.fogOffset + this.scrollSpeed) % this.fogWidth;
  }


  isSpaceTaken(currentX, currentY, direction) {
    const {x,y} = utils.nextPosition(currentX, currentY, direction);
    if (this.walls[`${x},${y}`]) {
      return true;
    }
    //Check for game objects
    return Object.values(this.gameObjects).find(obj => {
      if (obj.x === x && obj.y === y) { return true; }
      if (obj.intentPosition && obj.intentPosition[0] === x && obj.intentPosition[1] === y) {
        return true;
      }
      return false;
    })
  }

  mountObjects() {
    Object.keys(this.configObjects).forEach(key => {

      let object = this.configObjects[key];
      object.id = key;

      let instance;
      if (object.type === "Person") {
        instance = new Person(object);
      }
      this.gameObjects[key] = instance;
      this.gameObjects[key].id = key;
      instance.mount(this);
    })
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true;
  
    for (let i = 0; i < events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      });
  
      await eventHandler.init();

    }
  
    this.isCutscenePlaying = false;
  }
  
  

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find(object => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {
      this.startCutscene(match.talking[0].events)
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[ `${hero.x},${hero.y}` ];
    if (!this.isCutscenePlaying && match) {
      this.startCutscene( match[0].events )
    }
  }

  initHiddenObjectGame() {
    const hiddenObjectGame = new HiddenObjectGame(document.querySelector(".game-container"), hiddenItems);
    hiddenObjectGame.init();
  }
  

}

window.OverworldMaps = {
  Forest: {
    lowerSrc: "images/maps/ForestLower.png",
    upperSrc: "images/maps/ForestUpper.png",
    fogSrc: "images/maps/fog.png",
    fog2Src: "images/maps/fog.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(34),
        y: utils.withGrid(22),
      },
      tuopz: {
        type: "Person",
        x: utils.withGrid(32),
        y: utils.withGrid(16),
        src: "images/characters/people/tuopz.png",
        behaviorLoop: [
          { type: "stand",  direction: "down", time: 400 },
          { type: "walk",  direction: "down"},
          { type: "stand",  direction: "down", time: 400 },
          { type: "stand",  direction: "up", time: 400 },
          { type: "walk",  direction: "up"},
          { type: "stand",  direction: "up", time: 400 },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "I don’t know why but im still in love with old low poly games aesthetic...", faceHero:"tuopz" },
              { type: "textMessage", text: "Have you heard of Jet Set Radio?", faceHero:"tuopz" },
            ]
          }
        ]
      },
      iryfx: {
        type: "Person",
        x: utils.withGrid(12),
        y: utils.withGrid(10),
        src: "images/characters/people/iry.png",
        behaviorLoop: [
        { type: "stand",  direction: "right", time: 400 },
        { type: "walk",  direction: "right" },
        { type: "walk",  direction: "right" },
        { type: "stand",  direction: "left", time: 400 },
        { type: "walk",  direction: "left" },
        { type: "walk",  direction: "left" },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "You have 1 Blairwitch second to remove yourself from my proximity before I have you removed...", faceHero:"iryfx" },
              { type: "fleeAndWalkBack", who: "iryfx"},
              { type: "walkBack", who: "iryfx" },
              { type: "textMessage", text: "which amounts to 1 minute and 30 seconds.", faceHero:"iryfx" },
            ]
          }
        ]
      },
      'moon!': {
        type: "Person",
        x: utils.withGrid(28),
        y: utils.withGrid(2),
        src: "images/characters/people/moon.png",
        behaviorLoop: [
        { type: "walk",  direction: "down" },
        { type: "walk",  direction: "down" },
        { type: "stand",  direction: "down", time: "400", },
        { type: "walk",  direction: "up" },
        { type: "walk",  direction: "up" },
        { type: "stand",  direction: "up", time: "400" },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "I dont know you, and i dont care to know you.", faceHero:"moon!" },
              { type: "textMessage", text: "Now get out my way before i have you slapped to irons", faceHero:"moon!"},
              { type: "fleeAndWalkBack", who: "moon!" },
              { type: "walkBack", who: "moon!" },
            ]
          }
        ]
      },
    },
    walls: function() {
      let walls = {};
      [ //Bottom Forest TOP
        "0,22", "1,22", "2,22", "3,22", "4,22", "5,22", "6,22", "7,22", "8,22", "9,22", "10,22", "11,22", "12,22", "13,22", "14,22", "15,22", "16,22", "17,22", "18,22", "19,22", "20,22", "21,22", "22,22", "23,22", "24,22", "25,22", "26,22",

        //Bottom Forest RIGHT
        "26,22", "26,24", "26,30", "26,32", "26,34", "26,36", "26,38",

        //Maze
        "24,26", "22,26", "20,28", "24,30", "22,32", "20,32", "18,32", "20,26", "20,24", "18,22", "16,22", "14,22", "16,26", "16,28", "16,30", "14,28", "14,30", "14,32", "14,34", "12,28", "12,24", "10,24", "8,24", "10,28", "12,36", "10,36", "8,36", "6,36", "4,36", "2,36", "0,34", "0,32", "0,30", "0,28", "2,26", "4,26", "6,26", "6,28", "6,30", "10,32", "8,32", "6,32", "4,32", "4,30",

        //Hut
        "36,18", "36,16", "38,16", "40,16", "40,18",
      
      ].forEach(coord => {
        let [x,y] = coord.split(",");
        walls[utils.asGridCoord(x,y)] = true;
      })
      return walls;

    }(),
    cutsceneSpaces: {
      [utils.asGridCoord(38,18)]: [
        {
          events: [
            { type: "changeMap", map: "WitchHut" },
          ]
        }
      ],
      [utils.asGridCoord(4,28)]: [
        {
          events: [
            { type: "findIngredients" },
          ]
        }
      ],
    }
    
  },
  WitchHut: {
    lowerSrc: "images/maps/WitchHutLower.png",
    upperSrc: "images/maps/WitchHutUpper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(8),
        y: utils.withGrid(6),
      },
    }
  },
}