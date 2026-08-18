import { LEVELS } from "../data/levels.js";
import {
  CRASH_SPEED,
  FUEL_CAPACITY,
  collide,
  formatTime,
  isOutOfBounds,
  reachedGoal,
  simulate,
  step,
} from "../physics.js";
import { bestTime, saveTime } from "../storage.js";

const COLORS = {
  planet: 0x2f3f63,
  planetCore: 0x415682,
  planetGlow: 0x4a9eff,
  courier: 0xffd166,
  trail: 0x6c8cff,
  goal: 0x2ecc71,
  preview: 0x8fa6d8,
  danger: 0xe74c3c,
};

/** Wie weit die Flugbahn-Vorschau in die Zukunft rechnet (Sekunden). */
const PREVIEW_SECONDS = 2.4;
const PREVIEW_SAMPLES = 46;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  init(data) {
    this.levelIndex = data.levelIndex ?? 0;
    this.level = LEVELS[this.levelIndex];
  }

  create() {
    const { bounds } = this.level;

    this.physicsCarry = 0;
    this.elapsed = 0;
    this.finished = false;
    this.dead = false;
    this.trail = [];

    this.cameras.main.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
    this.cameras.main.setBackgroundColor(0x080b14);

    this.drawStarfield();

    this.staticLayer = this.add.graphics();
    this.previewLayer = this.add.graphics();
    this.trailLayer = this.add.graphics();
    this.courierLayer = this.add.graphics();

    this.drawStaticWorld();
    this.createParticles();
    this.createHud();
    this.bindInput();

    this.resetCourier();
    this.cameras.main.startFollow(this.followTarget, true, 0.12, 0.12);
    this.cameras.main.setZoom(this.fitZoom());
  }

  // --- Aufbau -------------------------------------------------------------

  fitZoom() {
    const { bounds } = this.level;
    const zoom = Math.min(
      this.scale.width / bounds.width,
      this.scale.height / bounds.height
    );
    // Nicht zu weit herauszoomen – der Kurier soll erkennbar bleiben.
    return Phaser.Math.Clamp(zoom * 1.55, 0.5, 1);
  }

  drawStarfield() {
    const { bounds } = this.level;
    const stars = this.add.graphics().setScrollFactor(0.25).setDepth(-10);
    const rng = new Phaser.Math.RandomDataGenerator([`glc-${this.levelIndex}`]);

    for (let i = 0; i < 260; i += 1) {
      const alpha = rng.realInRange(0.15, 0.85);
      const size = rng.realInRange(0.6, 1.9);
      stars.fillStyle(0xffffff, alpha);
      stars.fillCircle(
        rng.between(-200, bounds.width + 200),
        rng.between(-200, bounds.height + 200),
        size
      );
    }
  }

  drawStaticWorld() {
    const g = this.staticLayer;
    g.clear();

    const { bounds, goal, bodies } = this.level;

    // Spielfeldrand
    g.lineStyle(2, 0x1e2740, 1);
    g.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

    for (const body of bodies) {
      // Einflusszone – macht sichtbar, wo die Gravitation spürbar wird.
      g.fillStyle(COLORS.planetGlow, 0.045);
      g.fillCircle(body.x, body.y, body.radius * 3.1);

      g.fillStyle(COLORS.planet, 1);
      g.fillCircle(body.x, body.y, body.radius);
      g.fillStyle(COLORS.planetCore, 1);
      g.fillCircle(body.x - body.radius * 0.18, body.y - body.radius * 0.2, body.radius * 0.62);

      g.lineStyle(2, COLORS.planetGlow, 0.5);
      g.strokeCircle(body.x, body.y, body.radius);
    }

    this.goalGraphics = this.add.graphics();
    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      onUpdate: (tween) => {
        const t = tween.getValue();
        const g2 = this.goalGraphics;
        g2.clear();
        g2.fillStyle(COLORS.goal, 0.12 + t * 0.1);
        g2.fillCircle(goal.x, goal.y, goal.radius * (1.25 + t * 0.2));
        g2.lineStyle(3, COLORS.goal, 0.85);
        g2.strokeCircle(goal.x, goal.y, goal.radius);
        g2.lineStyle(1.5, COLORS.goal, 0.4);
        g2.strokeCircle(goal.x, goal.y, goal.radius * (1.4 + t * 0.35));
      },
    });
  }

  createParticles() {
    const dot = this.make.graphics({ add: false });
    dot.fillStyle(0xffffff, 1);
    dot.fillCircle(4, 4, 4);
    dot.generateTexture("dot", 8, 8);
    dot.destroy();

    this.thrustEmitter = this.add.particles(0, 0, "dot", {
      speed: { min: 20, max: 90 },
      scale: { start: 0.55, end: 0 },
      lifespan: 340,
      blendMode: "ADD",
      tint: [0xffd166, 0xff8f4d],
      frequency: 18,
      emitting: false,
    });

    this.burstEmitter = this.add.particles(0, 0, "dot", {
      speed: { min: 60, max: 320 },
      scale: { start: 0.9, end: 0 },
      lifespan: 700,
      blendMode: "ADD",
      emitting: false,
    });
  }

  createHud() {
    const style = {
      fontFamily: "Consolas, monospace",
      fontSize: "16px",
      color: "#e6ebf4",
    };

    this.hudTime = this.add
      .text(16, 14, "", { ...style, fontSize: "26px" })
      .setScrollFactor(0)
      .setDepth(100);

    this.hudBest = this.add
      .text(16, 46, "", { ...style, fontSize: "13px", color: "#8d9bb3" })
      .setScrollFactor(0)
      .setDepth(100);

    this.hudLevel = this.add
      .text(this.scale.width - 16, 14, `${this.levelIndex + 1}/${LEVELS.length}  ${this.level.name}`, {
        ...style,
        fontSize: "14px",
        color: "#8d9bb3",
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100);

    this.hudHint = this.add
      .text(this.scale.width / 2, this.scale.height - 68, this.level.hint, {
        ...style,
        fontSize: "14px",
        color: "#8fa6d8",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100);

    this.hudKeys = this.add
      .text(this.scale.width / 2, this.scale.height - 22, "Pfeiltasten / WASD: Schub    R: Neustart    Esc: Menü", {
        ...style,
        fontSize: "12px",
        color: "#5c6b85",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100);

    this.fuelBar = this.add.graphics().setScrollFactor(0).setDepth(100);

    this.banner = this.add
      .text(this.scale.width / 2, this.scale.height / 2, "", {
        ...style,
        fontSize: "34px",
        align: "center",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101)
      .setVisible(false);
  }

  bindInput() {
    this.keys = this.input.keyboard.addKeys({
      up: "UP", down: "DOWN", left: "LEFT", right: "RIGHT",
      w: "W", a: "A", s: "S", d: "D",
    });

    this.input.keyboard.on("keydown-R", () => this.scene.restart());
    this.input.keyboard.on("keydown-ESC", () => this.scene.start("Menu"));
    this.input.keyboard.on("keydown-SPACE", () => {
      if (this.finished) this.nextLevel();
      else if (this.dead) this.scene.restart();
    });
  }

  resetCourier() {
    const { start } = this.level;
    this.state = { x: start.x, y: start.y, vx: start.vx, vy: start.vy, fuel: FUEL_CAPACITY };
    this.followTarget = this.add.rectangle(start.x, start.y, 1, 1, 0x000000, 0);
  }

  // --- Spielschleife ------------------------------------------------------

  update(time, delta) {
    if (this.finished || this.dead) {
      this.renderCourier();
      return;
    }

    const thrust = this.readThrust();
    const result = simulate(
      this.state,
      this.level.bodies,
      thrust,
      delta / 1000,
      this.physicsCarry
    );

    this.state = result.state;
    this.physicsCarry = result.rest;
    this.elapsed += delta / 1000;

    this.followTarget.setPosition(this.state.x, this.state.y);
    this.pushTrail();
    this.checkEvents();
    this.renderPreview();
    this.renderTrail();
    this.renderCourier();
    this.renderHud();
  }

  readThrust() {
    const k = this.keys;
    const x = (k.right.isDown || k.d.isDown ? 1 : 0) - (k.left.isDown || k.a.isDown ? 1 : 0);
    const y = (k.down.isDown || k.s.isDown ? 1 : 0) - (k.up.isDown || k.w.isDown ? 1 : 0);
    return { x, y };
  }

  pushTrail() {
    this.trail.push({ x: this.state.x, y: this.state.y });
    if (this.trail.length > 150) this.trail.shift();
  }

  checkEvents() {
    if (reachedGoal(this.state, this.level.goal)) return this.win();

    const hit = collide(this.state, this.level.bodies);
    if (hit) {
      if (hit.crashed) return this.crash("Zu hart aufgeschlagen");
      // Sanfte Berührung: abstossen statt sterben, damit Fehler nicht sofort
      // das Level beenden.
      const body = hit.body;
      this.state.x = body.x + hit.nx * (body.radius + 2);
      this.state.y = body.y + hit.ny * (body.radius + 2);
      const dot = this.state.vx * hit.nx + this.state.vy * hit.ny;
      this.state.vx = (this.state.vx - 2 * dot * hit.nx) * 0.45;
      this.state.vy = (this.state.vy - 2 * dot * hit.ny) * 0.45;
      this.cameras.main.shake(90, 0.004);
    }

    if (isOutOfBounds(this.state, this.level.bounds)) this.crash("Aus dem Sektor geflogen");
  }

  win() {
    this.finished = true;
    const record = saveTime(this.levelIndex, this.elapsed);
    const beatTarget = this.elapsed <= this.level.target;

    this.burstEmitter.setParticleTint(COLORS.goal);
    this.burstEmitter.emitParticleAt(this.state.x, this.state.y, 40);

    const lines = [
      "ZUGESTELLT",
      formatTime(this.elapsed),
      record ? "Neue Bestzeit!" : "",
      beatTarget ? `★ Zielzeit ${this.level.target}s unterboten` : `Zielzeit: ${this.level.target}s`,
      "",
      this.levelIndex + 1 < LEVELS.length ? "Leertaste: nächstes Level" : "Alle Level geschafft!",
    ];
    this.showBanner(lines.filter(Boolean).join("\n"), "#2ecc71");
  }

  crash(reason) {
    this.dead = true;
    this.burstEmitter.setParticleTint(COLORS.danger);
    this.burstEmitter.emitParticleAt(this.state.x, this.state.y, 30);
    this.cameras.main.shake(240, 0.012);
    this.thrustEmitter.stop();
    this.showBanner(`PAKET VERLOREN\n${reason}\n\nLeertaste oder R: nochmal`, "#e74c3c");
  }

  showBanner(text, color) {
    this.banner.setText(text).setColor(color).setVisible(true).setAlpha(0);
    this.tweens.add({ targets: this.banner, alpha: 1, duration: 220 });
  }

  nextLevel() {
    if (this.levelIndex + 1 < LEVELS.length) {
      this.scene.restart({ levelIndex: this.levelIndex + 1 });
    } else {
      this.scene.start("Menu");
    }
  }

  // --- Darstellung --------------------------------------------------------

  /**
   * Zeichnet die Bahn, die der Kurier *ohne weiteren Schub* nehmen würde.
   *
   * Ohne diese Vorschau ist ein Gravitationsspiel kaum steuerbar – man sieht der
   * Situation nicht an, wohin einen die Summe mehrerer Felder trägt. Gerechnet
   * wird mit derselben Funktion wie die echte Simulation, nur schneller
   * abgetastet: Was die Vorschau zeigt, passiert auch wirklich.
   */
  renderPreview() {
    const g = this.previewLayer;
    g.clear();

    let ghost = { ...this.state };
    const stepsPerSample = Math.round((PREVIEW_SECONDS / PREVIEW_SAMPLES) * 240);

    for (let i = 0; i < PREVIEW_SAMPLES; i += 1) {
      for (let s = 0; s < stepsPerSample; s += 1) {
        ghost = step(ghost, this.level.bodies, { x: 0, y: 0 });
      }
      if (collide(ghost, this.level.bodies) || isOutOfBounds(ghost, this.level.bounds)) break;

      const fade = 0.5 * (1 - i / PREVIEW_SAMPLES);
      g.fillStyle(COLORS.preview, fade);
      g.fillCircle(ghost.x, ghost.y, 2.4);
    }
  }

  renderTrail() {
    const g = this.trailLayer;
    g.clear();

    for (let i = 1; i < this.trail.length; i += 1) {
      const alpha = (i / this.trail.length) * 0.55;
      g.lineStyle(2, COLORS.trail, alpha);
      g.lineBetween(this.trail[i - 1].x, this.trail[i - 1].y, this.trail[i].x, this.trail[i].y);
    }
  }

  renderCourier() {
    const g = this.courierLayer;
    g.clear();

    const { x, y, vx, vy } = this.state;
    const angle = Math.atan2(vy, vx);
    const speed = Math.hypot(vx, vy);

    // Bei Annäherung an die Absturzgeschwindigkeit färbt sich das Paket.
    const risk = Phaser.Math.Clamp(speed / CRASH_SPEED, 0, 1);
    const color = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(COLORS.courier),
      Phaser.Display.Color.ValueToColor(COLORS.danger),
      100,
      risk * 100
    );
    const tint = Phaser.Display.Color.GetColor(color.r, color.g, color.b);

    g.fillStyle(tint, 0.18);
    g.fillCircle(x, y, 16);

    const nose = 11;
    const back = 7;
    g.fillStyle(tint, 1);
    g.beginPath();
    g.moveTo(x + Math.cos(angle) * nose, y + Math.sin(angle) * nose);
    g.lineTo(x + Math.cos(angle + 2.5) * back, y + Math.sin(angle + 2.5) * back);
    g.lineTo(x + Math.cos(angle - 2.5) * back, y + Math.sin(angle - 2.5) * back);
    g.closePath();
    g.fillPath();

    if (this.state.thrusting && !this.finished && !this.dead) {
      this.thrustEmitter.setPosition(x, y);
      this.thrustEmitter.start();
    } else {
      this.thrustEmitter.stop();
    }
  }

  renderHud() {
    this.hudTime.setText(formatTime(this.elapsed));

    const best = bestTime(this.levelIndex);
    this.hudBest.setText(best !== null ? `Bestzeit ${formatTime(best)}` : `Zielzeit ${this.level.target}s`);

    if (this.elapsed > 5) this.hudHint.setAlpha(Math.max(0, 1 - (this.elapsed - 5) / 2));

    const width = 150;
    const ratio = this.state.fuel / FUEL_CAPACITY;
    const g = this.fuelBar;
    g.clear();
    g.fillStyle(0x1e2740, 0.9);
    g.fillRoundedRect(16, 74, width, 9, 4);
    g.fillStyle(ratio > 0.25 ? 0x4a9eff : 0xe74c3c, 1);
    g.fillRoundedRect(16, 74, Math.max(2, width * ratio), 9, 4);
  }
}
