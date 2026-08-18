import GameScene from "./scenes/GameScene.js";
import MenuScene from "./scenes/MenuScene.js";

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: "game",
  backgroundColor: "#080b14",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [MenuScene, GameScene],
});

// Für Debugging in der Browser-Konsole erreichbar.
window.game = game;
