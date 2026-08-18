/** Bestzeiten und Fortschritt im localStorage. */

const KEY = "glc.progress.v1";

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    // Privater Modus oder beschädigter Eintrag – das Spiel läuft ohne weiter.
    return {};
  }
}

function write(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* Speichern ist optional. */
  }
}

export function bestTime(levelIndex) {
  const value = read()[levelIndex];
  return typeof value === "number" ? value : null;
}

/** Speichert die Zeit, falls sie besser ist. Gibt zurück, ob es ein Rekord war. */
export function saveTime(levelIndex, seconds) {
  const data = read();
  const previous = data[levelIndex];
  if (typeof previous === "number" && previous <= seconds) return false;

  data[levelIndex] = seconds;
  write(data);
  return true;
}

export function isUnlocked(levelIndex) {
  return levelIndex === 0 || bestTime(levelIndex - 1) !== null;
}

export function completedCount() {
  return Object.keys(read()).length;
}
