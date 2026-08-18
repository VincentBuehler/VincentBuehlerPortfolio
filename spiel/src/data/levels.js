/**
 * Level-Definitionen.
 *
 * Ein Level ist reine Datenbeschreibung: Startpunkt, Ziel, Himmelskörper und
 * Spielfeldgrenzen. Damit lassen sich neue Level anlegen, ohne Spiellogik
 * anzufassen – und die Balance-Werte (Masse, Radius) bleiben an einer Stelle.
 *
 * `target` ist die angepeilte Bestzeit in Sekunden; wer sie unterbietet, bekommt
 * einen Stern.
 */

export const LEVELS = [
  {
    name: "Erster Abwurf",
    hint: "Pfeiltasten geben Schub. Der Planet zieht dich – lass ihn arbeiten.",
    target: 4,
    start: { x: 200, y: 400, vx: 40, vy: 0 },
    goal: { x: 1100, y: 400, radius: 46 },
    bounds: { x: 0, y: 0, width: 1300, height: 800 },
    bodies: [{ x: 650, y: 640, mass: 1.6, radius: 90 }],
  },
  {
    name: "Zwischen zwei Monden",
    hint: "Zwei Kräfte, ein Korridor. Halte die Mitte.",
    target: 4,
    start: { x: 150, y: 400, vx: 60, vy: 0 },
    goal: { x: 1200, y: 400, radius: 44 },
    bounds: { x: 0, y: 0, width: 1400, height: 800 },
    bodies: [
      { x: 675, y: 180, mass: 1.5, radius: 78 },
      { x: 675, y: 620, mass: 1.5, radius: 78 },
    ],
  },
  {
    name: "Schwungholen",
    hint: "Ein Vorbeiflug ist schneller als jeder Schub. Nutze die Kurve.",
    target: 4,
    start: { x: 160, y: 200, vx: 30, vy: 40 },
    goal: { x: 1250, y: 620, radius: 44 },
    bounds: { x: 0, y: 0, width: 1450, height: 850 },
    bodies: [{ x: 620, y: 480, mass: 3.1, radius: 118 }],
  },
  {
    name: "Der Korridor",
    hint: "Eng, aber ruhig. Kleine Korrekturen statt langer Schübe.",
    target: 4,
    start: { x: 140, y: 430, vx: 55, vy: 0 },
    goal: { x: 1360, y: 430, radius: 42 },
    bounds: { x: 0, y: 0, width: 1520, height: 860 },
    bodies: [
      { x: 480, y: 140, mass: 1.4, radius: 70 },
      { x: 480, y: 720, mass: 1.4, radius: 70 },
      { x: 980, y: 140, mass: 1.4, radius: 70 },
      { x: 980, y: 720, mass: 1.4, radius: 70 },
    ],
  },
  {
    name: "Umlaufbahn",
    hint: "Einmal herum ist manchmal kürzer als quer hindurch.",
    target: 4,
    start: { x: 700, y: 130, vx: 150, vy: 0 },
    goal: { x: 700, y: 830, radius: 44 },
    bounds: { x: 0, y: 0, width: 1400, height: 960 },
    bodies: [{ x: 700, y: 480, mass: 4.4, radius: 150 }],
  },
  {
    name: "Dreiklang",
    hint: "Drei Wellen, ein Rhythmus.",
    target: 4,
    start: { x: 160, y: 500, vx: 70, vy: -30 },
    goal: { x: 1340, y: 500, radius: 42 },
    bounds: { x: 0, y: 0, width: 1500, height: 900 },
    bodies: [
      { x: 480, y: 300, mass: 1.9, radius: 84 },
      { x: 750, y: 660, mass: 1.9, radius: 84 },
      { x: 1030, y: 300, mass: 1.9, radius: 84 },
    ],
  },
  {
    name: "Der Riese",
    hint: "So viel Masse verzeiht keinen späten Schub.",
    target: 5,
    start: { x: 170, y: 170, vx: 90, vy: 0 },
    goal: { x: 1330, y: 830, radius: 44 },
    bounds: { x: 0, y: 0, width: 1500, height: 1000 },
    bodies: [
      { x: 750, y: 500, mass: 6.2, radius: 190 },
      { x: 1250, y: 210, mass: 1.2, radius: 62 },
    ],
  },
  {
    name: "Slalom",
    hint: "Links, rechts, links. Der Schwung trägt dich.",
    target: 5,
    start: { x: 140, y: 480, vx: 80, vy: 0 },
    goal: { x: 1450, y: 480, radius: 42 },
    bounds: { x: 0, y: 0, width: 1600, height: 960 },
    bodies: [
      { x: 420, y: 250, mass: 1.7, radius: 76 },
      { x: 700, y: 710, mass: 1.7, radius: 76 },
      { x: 980, y: 250, mass: 1.7, radius: 76 },
      { x: 1260, y: 710, mass: 1.7, radius: 76 },
    ],
  },
  {
    name: "Enge Passage",
    hint: "Zwischen den beiden Grossen ist nur ein Fenster.",
    target: 5,
    start: { x: 160, y: 500, vx: 60, vy: 0 },
    goal: { x: 1380, y: 500, radius: 40 },
    bounds: { x: 0, y: 0, width: 1540, height: 1000 },
    bodies: [
      { x: 720, y: 190, mass: 4.6, radius: 148 },
      { x: 720, y: 810, mass: 4.6, radius: 148 },
      { x: 1120, y: 500, mass: 1.1, radius: 58 },
    ],
  },
  {
    name: "Rückweg",
    hint: "Der kleine Mond steht genau im Weg. Weiche ihm aus, nicht dem Ziel.",
    target: 4,
    start: { x: 1300, y: 220, vx: -40, vy: 60 },
    goal: { x: 1300, y: 820, radius: 42 },
    bounds: { x: 0, y: 0, width: 1500, height: 1000 },
    bodies: [
      { x: 760, y: 520, mass: 4.9, radius: 165 },
      { x: 1290, y: 520, mass: 1.0, radius: 52 },
    ],
  },
  {
    name: "Kette",
    hint: "Fünf kleine Wellen. Jede gibt dir ein bisschen mehr.",
    target: 5,
    start: { x: 130, y: 520, vx: 85, vy: 0 },
    goal: { x: 1600, y: 520, radius: 40 },
    bounds: { x: 0, y: 0, width: 1740, height: 1040 },
    bodies: [
      { x: 400, y: 300, mass: 1.5, radius: 68 },
      { x: 660, y: 740, mass: 1.5, radius: 68 },
      { x: 920, y: 300, mass: 1.5, radius: 68 },
      { x: 1180, y: 740, mass: 1.5, radius: 68 },
      { x: 1440, y: 300, mass: 1.5, radius: 68 },
    ],
  },
  {
    name: "Doppelstern",
    hint: "Die Mitte ist ruhig – aussen wirst du geschleudert.",
    target: 5,
    start: { x: 170, y: 540, vx: 70, vy: 0 },
    goal: { x: 1420, y: 540, radius: 40 },
    bounds: { x: 0, y: 0, width: 1580, height: 1080 },
    bodies: [
      { x: 700, y: 380, mass: 3.6, radius: 122 },
      { x: 880, y: 700, mass: 3.6, radius: 122 },
    ],
  },
  {
    name: "Labyrinth",
    hint: "Sechs Körper, ein sauberer Pfad. Ruhig bleiben.",
    target: 8,
    start: { x: 140, y: 200, vx: 60, vy: 30 },
    goal: { x: 1520, y: 880, radius: 40 },
    bounds: { x: 0, y: 0, width: 1680, height: 1080 },
    bodies: [
      { x: 460, y: 480, mass: 2.1, radius: 92 },
      { x: 820, y: 220, mass: 1.6, radius: 74 },
      { x: 860, y: 780, mass: 2.4, radius: 100 },
      { x: 1180, y: 440, mass: 1.8, radius: 80 },
      { x: 1440, y: 200, mass: 1.3, radius: 62 },
      { x: 1300, y: 900, mass: 1.3, radius: 62 },
    ],
  },
  {
    name: "Der lange Weg",
    hint: "Weit, offen, gnadenlos. Treibstoff einteilen.",
    target: 10,
    start: { x: 150, y: 900, vx: 60, vy: -60 },
    goal: { x: 1780, y: 200, radius: 40 },
    bounds: { x: 0, y: 0, width: 1920, height: 1160 },
    bodies: [
      { x: 560, y: 620, mass: 3.4, radius: 126 },
      { x: 1060, y: 300, mass: 2.2, radius: 94 },
      { x: 1180, y: 880, mass: 3.0, radius: 116 },
      { x: 1620, y: 560, mass: 1.9, radius: 84 },
    ],
  },
  {
    name: "Zustellung",
    hint: "Alles, was du gelernt hast. Viel Glück, Kurier.",
    target: 6,
    start: { x: 160, y: 560, vx: 80, vy: 0 },
    goal: { x: 1760, y: 560, radius: 38 },
    bounds: { x: 0, y: 0, width: 1920, height: 1120 },
    bodies: [
      { x: 520, y: 250, mass: 2.4, radius: 98 },
      { x: 520, y: 870, mass: 2.4, radius: 98 },
      { x: 980, y: 560, mass: 5.4, radius: 168 },
      { x: 1440, y: 250, mass: 2.4, radius: 98 },
      { x: 1440, y: 870, mass: 2.4, radius: 98 },
    ],
  },
];
