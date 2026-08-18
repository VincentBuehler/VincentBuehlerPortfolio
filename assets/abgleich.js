/**
 * Skill-Abgleich, direkt aus dem Bewerbungs-Tracker portiert.
 *
 * Gleiche Logik wie in app/matching.py: erst die geforderten Technologien aus
 * dem Anzeigentext extrahieren, dann gegen das eigene Profil halten. Läuft
 * vollständig im Browser – der eingefügte Text verlässt das Gerät nicht.
 */

import { VOKABULAR } from "./vokabular.js";

const TERM_CHARS = "a-z0-9+#._/";
const TRAILING_CHARS = "a-z0-9+#_/";

/** Eigene Skills, wie im Lebenslauf. */
export const MEINE_SKILLS = [
  { name: "C#", kategorie: "Sprachen" },
  { name: "Java", kategorie: "Sprachen" },
  { name: "Python", kategorie: "Sprachen" },
  { name: "JavaScript", kategorie: "Sprachen", varianten: ["js"] },
  { name: "HTML", kategorie: "Frontend" },
  { name: "CSS", kategorie: "Frontend" },
  { name: ".NET", kategorie: "Frameworks", varianten: ["asp.net", "dotnet"] },
  { name: "FastAPI", kategorie: "Frameworks" },
  { name: "SQL", kategorie: "Datenbanken" },
  { name: "MS SQL Server", kategorie: "Datenbanken", varianten: ["sql server"] },
  { name: "SQLite", kategorie: "Datenbanken" },
  { name: "MySQL", kategorie: "Datenbanken" },
  { name: "Git", kategorie: "Werkzeuge", varianten: ["github", "gitlab"] },
  { name: "Docker", kategorie: "Werkzeuge" },
  { name: "REST", kategorie: "Konzepte" },
  { name: "OOP", kategorie: "Konzepte" },
  { name: "Unit Testing", kategorie: "Konzepte" },
  { name: "Scrum", kategorie: "Methoden" },
  { name: "Agile", kategorie: "Methoden" },
  { name: "Linux", kategorie: "Systeme" },
  { name: "Netzwerktechnik", kategorie: "Systeme" },
  { name: "TCP/IP", kategorie: "Systeme" },
  { name: "DNS", kategorie: "Systeme" },
  { name: "Deutsch", kategorie: "Sprachen" },
  { name: "Englisch", kategorie: "Sprachen" },
  { name: "Französisch", kategorie: "Sprachen" },
];

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Muster, das einen Begriff nur eigenständig findet.
 *
 * Vier Fälle müssen gleichzeitig stimmen: Symbole im Namen (C++, C#, .NET),
 * Namen als Präfix (JavaScript darf nicht als Java zählen), deutsche Komposita
 * ("Deutsch- und Englischkenntnisse") und der Punkt, der mal Namensbestandteil
 * ist (Node.js) und mal Satzende.
 */
function muster(begriff) {
  const escaped = escapeRegex(begriff.toLowerCase()).replace(/\\?\s+/g, "[\\s-]+");
  return new RegExp(
    `(?<![${TERM_CHARS}])${escaped}s?(?![${TRAILING_CHARS}])(?!\\.[a-z0-9])`,
    "gi"
  );
}

const MUSTER = Object.entries(VOKABULAR).map(([kanonisch, varianten]) => ({
  kanonisch,
  muster: [kanonisch, ...varianten].map((v) => ({ variante: v, re: muster(v) })),
}));

/** Findet alle Vokabular-Begriffe im Text. */
export function anforderungen(text) {
  if (!text || !text.trim()) return [];
  const klein = text.toLowerCase();
  const treffer = [];

  for (const { kanonisch, muster: varianten } of MUSTER) {
    let summe = 0;
    for (const { re } of varianten) {
      re.lastIndex = 0;
      summe += (klein.match(re) || []).length;
    }
    if (summe) treffer.push({ kanonisch, anzahl: summe });
  }

  treffer.sort((a, b) => b.anzahl - a.anzahl || a.kanonisch.localeCompare(b.kanonisch));
  return treffer;
}

const normalisieren = (v) => v.toLowerCase().replace(/[^a-z0-9+#.]/g, "");

/** Vergleicht die Anforderungen einer Anzeige mit dem Skill-Profil. */
export function abgleichen(text, skills = MEINE_SKILLS) {
  const gefordert = anforderungen(text);

  const eigene = new Map();
  for (const skill of skills) {
    for (const term of [skill.name, ...(skill.varianten || [])]) {
      eigene.set(normalisieren(term), skill);
    }
  }

  const getroffen = [];
  const fehlend = [];

  for (const a of gefordert) {
    const skill = eigene.get(normalisieren(a.kanonisch));
    if (skill) getroffen.push({ ...a, name: skill.name, kategorie: skill.kategorie });
    else fehlend.push(a.kanonisch);
  }

  const score = gefordert.length
    ? Math.round((getroffen.length / gefordert.length) * 1000) / 10
    : 0;

  return { score, getroffen, fehlend, gesamt: gefordert.length };
}
