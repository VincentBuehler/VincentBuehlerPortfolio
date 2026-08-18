/**
 * Gravitationsphysik des Spiels – bewusst ohne Engine-Abhängigkeit.
 *
 * Phasers Arcade-Physik kennt nur eine konstante Schwerkraft nach unten. Hier zieht
 * jeder Himmelskörper einzeln, weshalb Beschleunigung, Integration und Kollision
 * selbst gerechnet werden. Das Modul ist frei von Phaser-Typen und dadurch direkt
 * unter Node testbar.
 */

/**
 * Gravitationskonstante des Spiels.
 *
 * Nicht frei gewählt, sondern aus der Levelgrösse zurückgerechnet. Ein Level ist
 * rund 1400 px breit und soll in 6–15 s zu durchfliegen sein, also mit etwa
 * 100–220 px/s. Damit eine Bahn in typischem Abstand (r ≈ 300) um einen typischen
 * Planeten (m ≈ 2) bei genau diesem Tempo trägt, muss die Bahngeschwindigkeit
 * dort in derselben Grössenordnung liegen:
 *
 *   v_Bahn = √(G·m / r) ≈ 180  ⇒  G = v² · r / m = 180² · 300 / 2 ≈ 5·10⁶
 *
 * Grössere Werte saugen den Kurier in Sekunden in den nächsten Planeten – das war
 * messbar, siehe tools/validate-levels.js.
 */
export const G = 5e6;

/**
 * Weichzeichnung der Singularität. Ohne sie geht die Kraft nahe am Mittelpunkt
 * gegen unendlich und der Kurier wird in einem einzigen Schritt aus dem Level
 * geschleudert.
 */
export const SOFTENING = 30;

/**
 * Ab dieser Aufprallgeschwindigkeit zerbricht das Paket. Liegt unter der typischen
 * Bahngeschwindigkeit (≈ 250–340), damit ein Streifschuss im Vorbeiflug tödlich
 * ist – das ist der Preis für die Abkürzung dicht am Planeten.
 */
export const CRASH_SPEED = 300;

/** Fester Simulationsschritt in Sekunden (240 Hz). */
export const FIXED_DT = 1 / 240;

/** Maximale Zeit, die ein Frame nachsimulieren darf (verhindert Aufholspiralen). */
const MAX_FRAME_TIME = 0.25;

/**
 * Schubbeschleunigung. Bewusst in derselben Grössenordnung wie die Gravitation bei
 * mittlerem Abstand: Deutlich stärker, und die Gravitation wäre nur Dekoration.
 */
export const THRUST_ACCEL = 340;

/** Sekunden Dauerschub, bis der Tank leer ist. */
export const FUEL_CAPACITY = 1.85;
export const FUEL_REGEN = 0.62;

/**
 * Summierte Gravitationsbeschleunigung aller Körper an einem Punkt.
 *
 * @param {number} x
 * @param {number} y
 * @param {Array<{x:number,y:number,mass:number}>} bodies
 * @returns {{ax:number, ay:number}}
 */
export function gravityAt(x, y, bodies) {
  let ax = 0;
  let ay = 0;

  for (const body of bodies) {
    const dx = body.x - x;
    const dy = body.y - y;
    const distSq = dx * dx + dy * dy + SOFTENING * SOFTENING;
    const dist = Math.sqrt(distSq);
    const accel = (G * body.mass) / distSq;

    ax += (dx / dist) * accel;
    ay += (dy / dist) * accel;
  }

  return { ax, ay };
}

/**
 * Ein Simulationsschritt mit fester Schrittweite (semi-implizites Euler-Verfahren).
 *
 * Semi-implizit heisst: erst Geschwindigkeit aus der Beschleunigung, dann Position
 * aus der *neuen* Geschwindigkeit. Das ist bei Umlaufbahnen deutlich stabiler als
 * das explizite Verfahren, bei dem sich Bahnen sichtbar aufschaukeln.
 *
 * @param {{x:number,y:number,vx:number,vy:number,fuel:number}} state
 * @param {Array} bodies
 * @param {{x:number,y:number}} thrust Richtung, Länge 0..1
 * @param {number} dt
 */
export function step(state, bodies, thrust, dt = FIXED_DT) {
  const { ax, ay } = gravityAt(state.x, state.y, bodies);

  let tx = 0;
  let ty = 0;
  let fuel = state.fuel;
  const thrusting = (thrust.x !== 0 || thrust.y !== 0) && fuel > 0;

  if (thrusting) {
    const length = Math.hypot(thrust.x, thrust.y) || 1;
    tx = (thrust.x / length) * THRUST_ACCEL;
    ty = (thrust.y / length) * THRUST_ACCEL;
    fuel = Math.max(0, fuel - dt);
  } else {
    fuel = Math.min(FUEL_CAPACITY, fuel + FUEL_REGEN * dt);
  }

  const vx = state.vx + (ax + tx) * dt;
  const vy = state.vy + (ay + ty) * dt;

  return {
    x: state.x + vx * dt,
    y: state.y + vy * dt,
    vx,
    vy,
    fuel,
    thrusting,
  };
}

/**
 * Simuliert eine ganze Frame-Dauer in festen Schritten.
 *
 * Ein fester Schritt hält die Physik unabhängig von der Bildrate: Auf 144 Hz fliegt
 * dieselbe Eingabe exakt dieselbe Bahn wie auf 60 Hz. Bei einem Speedrun-Spiel mit
 * Bestzeiten ist das keine Feinheit, sondern Voraussetzung für faire Zeiten.
 *
 * @returns {{state:Object, steps:number, rest:number}}
 */
export function simulate(state, bodies, thrust, frameTime, carry = 0) {
  let accumulator = Math.min(frameTime, MAX_FRAME_TIME) + carry;
  let current = state;
  let steps = 0;

  while (accumulator >= FIXED_DT) {
    current = step(current, bodies, thrust);
    accumulator -= FIXED_DT;
    steps += 1;
  }

  return { state: current, steps, rest: accumulator };
}

/**
 * Prüft Kollision mit einem Körper.
 *
 * @returns {null | {body:Object, speed:number, crashed:boolean, nx:number, ny:number}}
 */
export function collide(state, bodies) {
  for (const body of bodies) {
    const dx = state.x - body.x;
    const dy = state.y - body.y;
    const dist = Math.hypot(dx, dy);

    if (dist < body.radius) {
      const speed = Math.hypot(state.vx, state.vy);
      const length = dist || 1;
      return {
        body,
        speed,
        crashed: speed > CRASH_SPEED,
        nx: dx / length,
        ny: dy / length,
      };
    }
  }
  return null;
}

/** Liegt der Kurier im Zielbereich? */
export function reachedGoal(state, goal) {
  return Math.hypot(state.x - goal.x, state.y - goal.y) < goal.radius;
}

/** Hat der Kurier das Spielfeld verlassen? */
export function isOutOfBounds(state, bounds) {
  return (
    state.x < bounds.x ||
    state.y < bounds.y ||
    state.x > bounds.x + bounds.width ||
    state.y > bounds.y + bounds.height
  );
}

/** Formatiert Sekunden als m:ss.mmm für Bestzeiten. */
export function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "--:--.---";
  const minutes = Math.floor(seconds / 60);
  const rest = seconds - minutes * 60;
  return `${minutes}:${rest.toFixed(3).padStart(6, "0")}`;
}
