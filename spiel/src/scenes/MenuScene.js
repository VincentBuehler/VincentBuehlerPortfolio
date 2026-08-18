import { LEVELS } from "../data/levels.js";
import { formatTime } from "../physics.js";
import { bestTime, completedCount, isUnlocked } from "../storage.js";

const FONT = "Consolas, monospace";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(0x080b14);

    this.drawBackdrop();

    this.add
      .text(width / 2, 64, "GRAVITY LOOP COURIER", {
        fontFamily: FONT,
        fontSize: "40px",
        color: "#ffd166",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 104, "Du springst nicht. Du fällst – nur klüger.", {
        fontFamily: FONT,
        fontSize: "15px",
        color: "#8fa6d8",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 136, `${completedCount()} von ${LEVELS.length} Leveln zugestellt`, {
        fontFamily: FONT,
        fontSize: "13px",
        color: "#5c6b85",
      })
      .setOrigin(0.5);

    this.drawLevelGrid();

    this.add
      .text(width / 2, height - 28, "Pfeiltasten / WASD: Schub    R: Neustart    Esc: zurück ins Menü", {
        fontFamily: FONT,
        fontSize: "12px",
        color: "#5c6b85",
      })
      .setOrigin(0.5);
  }

  drawBackdrop() {
    const { width, height } = this.scale;
    const g = this.add.graphics();
    const rng = new Phaser.Math.RandomDataGenerator(["glc-menu"]);

    for (let i = 0; i < 180; i += 1) {
      g.fillStyle(0xffffff, rng.realInRange(0.1, 0.7));
      g.fillCircle(rng.between(0, width), rng.between(0, height), rng.realInRange(0.5, 1.7));
    }

    // Dekorativer Planet mit angedeuteter Umlaufbahn. Bewusst angeschnitten in der
    // unteren rechten Ecke: Mittig läge er hinter dem Levelraster und würde
    // zwischen den Kacheln durchblitzen.
    const px = width * 0.87;
    const py = height * 1.12;

    g.fillStyle(0x4a9eff, 0.05);
    g.fillCircle(px, py, 330);
    g.fillStyle(0x2f3f63, 1);
    g.fillCircle(px, py, 150);
    g.fillStyle(0x415682, 1);
    g.fillCircle(px - 30, py - 34, 96);
    g.lineStyle(1, 0x6c8cff, 0.22);
    g.strokeCircle(px, py, 232);
    g.strokeCircle(px, py, 300);
  }

  drawLevelGrid() {
    const { width } = this.scale;
    const columns = 5;
    const size = 92;
    const gap = 14;
    const totalWidth = columns * size + (columns - 1) * gap;
    const startX = (width - totalWidth) / 2;
    const startY = 190;

    LEVELS.forEach((level, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = startX + column * (size + gap);
      const y = startY + row * (size + gap);

      const unlocked = isUnlocked(index);
      const best = bestTime(index);
      const starred = best !== null && best <= level.target;

      const box = this.add
        .rectangle(x + size / 2, y + size / 2, size, size, unlocked ? 0x161d2c : 0x11151f)
        .setStrokeStyle(1, unlocked ? 0x2b3444 : 0x1a2030);

      this.add
        .text(x + size / 2, y + 24, unlocked ? String(index + 1) : "🔒", {
          fontFamily: FONT,
          fontSize: unlocked ? "24px" : "18px",
          color: unlocked ? "#e6ebf4" : "#3d475c",
        })
        .setOrigin(0.5);

      this.add
        .text(x + size / 2, y + 54, best !== null ? formatTime(best) : unlocked ? "–" : "", {
          fontFamily: FONT,
          fontSize: "11px",
          color: best !== null ? "#8fa6d8" : "#5c6b85",
        })
        .setOrigin(0.5);

      if (starred) {
        this.add
          .text(x + size / 2, y + 72, "★", { fontFamily: FONT, fontSize: "14px", color: "#ffd166" })
          .setOrigin(0.5);
      }

      if (!unlocked) return;

      box.setInteractive({ useHandCursor: true });
      box.on("pointerover", () => box.setFillStyle(0x1e2740));
      box.on("pointerout", () => box.setFillStyle(0x161d2c));
      box.on("pointerdown", () => this.scene.start("Game", { levelIndex: index }));
    });
  }
}
