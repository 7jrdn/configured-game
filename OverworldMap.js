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

  isSpaceTaken(currentX, currentY, direction) {
    const { x, y } = utils.nextPosition(currentX, currentY, direction);
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
    const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];
    if (!this.isCutscenePlaying && match) {
      this.startCutscene(match[0].events)
    }
  }

  initHiddenObjectGame() {
    const hiddenObjectGame = new HiddenObjectGame(document.querySelector(".game-container"), hiddenItems);
    hiddenObjectGame.init();
  }


}

window.OverworldMaps = {
  Forest: {
    lowerSrc: "./images/maps/ForestLower.png",
    upperSrc: "./images/maps/ForestUpper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(38),
        y: utils.withGrid(22),
      },
      tuopz: {
        type: "Person",
        x: utils.withGrid(32),
        y: utils.withGrid(16),
        src: "./images/characters/people/tuopz.png",
        behaviorLoop: [
          { type: "stand", direction: "down", time: 400 },
          { type: "walk", direction: "down" },
          { type: "stand", direction: "down", time: 400 },
          { type: "stand", direction: "up", time: 400 },
          { type: "walk", direction: "up" },
          { type: "stand", direction: "up", time: 400 },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "I don’t know why but im still in love with old low poly games aesthetic...", faceHero: "tuopz" },
              { type: "textMessage", text: "Have you heard of Jet Set Radio?", faceHero: "tuopz" },
            ]
          }
        ]
      },
      iryfx: {
        type: "Person",
        x: utils.withGrid(12),
        y: utils.withGrid(10),
        src: "./images/characters/people/iry.png",
        behaviorLoop: [
          { type: "stand", direction: "right", time: 400 },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "stand", direction: "left", time: 400 },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "You have 1 Blairwitch second to remove yourself from my proximity before I have you removed...", faceHero: "iryfx" },
              { type: "fleeAndWalkBack", who: "iryfx" },
              { type: "walkBack", who: "iryfx" },
              { type: "textMessage", text: "which amounts to 1 minute and 30 seconds.", faceHero: "iryfx" },
            ]
          }
        ]
      },
      'moon!': {
        type: "Person",
        x: utils.withGrid(28),
        y: utils.withGrid(4),
        src: "./images/characters/people/moon.png",
        behaviorLoop: [
          { type: "walk", direction: "down" },
          { type: "stand", direction: "down", time: "400", },
          { type: "walk", direction: "up" },
          { type: "stand", direction: "up", time: "400" },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "I dont know you, and i dont care to know you.", faceHero: "moon!" },
              { type: "textMessage", text: "Now get out my way before i have you slapped to irons", faceHero: "moon!" },
              { type: "fleeAndWalkBack", who: "moon!" },
              { type: "walkBack", who: "moon!" },
            ]
          }
        ]
      },
      'parkus': {
        type: "Person",
        x: utils.withGrid(46),
        y: utils.withGrid(22),
        src: "./images/characters/people/parkus.png",
        behaviorLoop: [
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "stand", direction: "right", time: "500", },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "stand", direction: "left", time: "500" },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "I love Dominik Santorski.", faceHero: "parkus" },
            ]
          }
        ]
      },
      'akamey': {
        type: "Person",
        x: utils.withGrid(32),
        y: utils.withGrid(2),
        src: "./images/characters/people/akamey.png",
        behaviorLoop: [
          { type: "stand", direction: "down", time: "2000" },
          { type: "stand", direction: "left", time: "2000" },
          { type: "stand", direction: "down", time: "2000" },
          { type: "stand", direction: "right", time: "2000" },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "Excuse me,", faceHero: "akamey" },
              { type: "textMessage", text: "friend,", faceHero: "akamey" },
              { type: "textMessage", text: "any chance you possess knowledge of the 'poet’s herb’?", faceHero: "akamey" },
              { type: "textMessage", text: "My craft requires a certain...", faceHero: "akamey" },
              { type: "textMessage", text: "creative spark.", faceHero: "akamey" },
            ]
          }
        ]
      },
      '642': {
        type: "Person",
        x: utils.withGrid(46),
        y: utils.withGrid(6),
        src: "./images/characters/people/642.png",
        behaviorLoop: [
          { type: "walk", direction: "down" },
          { type: "stand", direction: "down", time: "1000" },
          { type: "walk", direction: "right" },
          { type: "stand", direction: "right", time: "1000" },
          { type: "walk", direction: "up" },
          { type: "stand", direction: "up", time: "1000" },
          { type: "walk", direction: "left" },
          { type: "stand", direction: "left", time: "1000" },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "I am relevant to goliaths, the mountain's root are as fine as pure wine.", faceHero: "642" },
            ]
          }
        ]
      },
    },
    walls: function () {
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
        let [x, y] = coord.split(",");
        walls[utils.asGridCoord(x, y)] = true;
      })
      return walls;

    }(),
    cutsceneSpaces: {
      [utils.asGridCoord(38, 20)]: [
        {
          events: [
            { type: "storylineMessage", text: "Hold up..." },
            { type: "storylineMessage", text: "Who are you?" },
            { type: "storylineMessage", text: "You're not allowed in here." },
            { type: "storylineMessage", text: "WHAT?!" },
            { type: "storylineMessage", text: "You're back??" },
            { type: "storylineMessage", text: "Forgive me Blair..." },
            { type: "storylineMessage", text: "You look so different." },
            { type: "storylineMessage", text: "Come in please. Many things have changed since you've been gone." },
            { type: "walk", who: "hero", direction: "up", },
            {
              type: "changeMap",
              map: "WitchHut",
              x: utils.withGrid(32),
              y: utils.withGrid(22),
              direction: "up"
            },
          ]
        }
      ],
      [utils.asGridCoord(38, 18)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "WitchHut",
              x: utils.withGrid(32),
              y: utils.withGrid(22),
              direction: "up"
            },
          ]
        }
      ],
      [utils.asGridCoord(4, 28)]: [
        {
          events: [
            { type: "findIngredients" },
          ]
        }
      ],
    }

  },
  WitchHut: {
    lowerSrc: "./images/maps/witchHutLower.png",
    upperSrc: "./images/maps/witchHutUpper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(32),
        y: utils.withGrid(22),
      },
      fire: {
        type: "Person",
        x: utils.withGrid(32),
        y: utils.withGrid(6),
        src: "./images/characters/fire.png",
        behaviorLoop: [
          { type: "stand", direction: "down", time: "100" },
          { type: "stand", direction: "right", time: "100" },
          { type: "stand", direction: "up", time: "100" },
          { type: "stand", direction: "left", time: "100" },
        ],
      },
      musicBox: {
        type: "Person",
        src: "./images/empty.png",
        x: utils.withGrid(36),
        y: utils.withGrid(10),
        talking: [
          {
            events: [
              { type: "musicBox" },
            ]
          }
        ]
      },
      artwork1: {
        type: "Person",
        x: utils.withGrid(22),
        y: utils.withGrid(12),
        talking: [
          {
            events: [
              {
                type: "artwork",
                imageSrc: "./images/artwork/moonART.jpg", // Ensure path correctness
              }
            ]
          }
        ]
      },

    },
    walls: function () {
      let walls = {};
      [
        //Walls
        "4,4", "6,4", "8,4", "10,4", "12,12", "14,12", "16,12", "18,12", "12,10", "12,8", "12,6",
        "20,12", "22,12", "24,12", "24,10", "26,8", "28,8", "30,6", "32,6", "34,6", "36,8", "36,10", "38,12", "38,10",
        "38,8", "38,6", "40,4", "42,4", "44,4", "46,4", "42,10", "44,10", "46,10", "42,10", "42,12", "42,14", "42,16", "42,18",
        "42,20", "42,22", "26,24", "28,24", "30,24", "32,24", "34,24", "36,24", "38,24", "40,24", "24,22", "24,20", "12,18",
        "14,18", "16,18", "18,18", "20,18", "22,18", "24,18", "12,20", "4,22", "6,22", "8,22", "10,22", "2,6", "2,8", "2,10",
        "2,12", "2,14", "2,16", "2,18", "2,20"
      ].forEach(coord => {
        let [x, y] = coord.split(",");
        walls[utils.asGridCoord(x, y)] = true;
      })
      return walls;
    }(),
    cutsceneSpaces: {
      [utils.asGridCoord(32, 22)]: [
        {
          events: [
            { type: "changeMap", map: "Forest" },
          ]
        }
      ],
      [utils.asGridCoord(46, 6)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Bedroom",
              x: utils.withGrid(0),
              y: utils.withGrid(0),
              direction: "right"
            },
          ]
        }
      ],
      [utils.asGridCoord(46, 8)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Bedroom",
              x: utils.withGrid(0),
              y: utils.withGrid(2),
              direction: "right"
            },
          ]
        }
      ],
    }
  },

  Bedroom: {
    lowerSrc: "./images/maps/bedroomLower.png",
    upperSrc: "./images/maps/bedroomUpper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(0),
        y: utils.withGrid(0),
      },
    },
    walls: function () {
      let walls = {};
      [
        //Walls

      ].forEach(coord => {
        let [x, y] = coord.split(",");
        walls[utils.asGridCoord(x, y)] = true;
      })
      return walls;
    }(),
    cutsceneSpaces: {
      [utils.asGridCoord(0, 0)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "WitchHut",
              x: utils.withGrid(46),
              y: utils.withGrid(6),
              direction: "left"
            }
          ]
        }
      ],
      [utils.asGridCoord(0, 2)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "WitchHut",
              x: utils.withGrid(46),
              y: utils.withGrid(8),
              direction: "left"
            },
          ]
        }
      ],
    }
  },
}