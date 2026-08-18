import { abgleichen } from "./abgleich.js";

/* ---------------------------------------------------------------------------
   Fallakten. Jede Angabe stammt aus dem jeweiligen Repository – Testzahlen sind
   ausgezählt, die Knackpunkte sind Fehler, die beim Bauen tatsächlich auftraten.
--------------------------------------------------------------------------- */

const MODULE = [
  {
    nr: "01",
    titel: "Schulnetz-Monitor",
    zeile: "Überwacht Geräte und Services in kleinen Netzwerken",
    stack: "Python · FastAPI · SQLite",
    bild: "assets/monitor.png",
    bildAlt: "Dashboard mit Statuskarten, Latenz-Sparklines und Incident-Tabelle",
    messwerte: [["Tests", "16"], ["Zeilen", "1325"], ["Check-Typen", "3"]],
    repo: "https://github.com/VincentBuehler/schulnetz-monitor",
    felder: [
      ["Problem", "In Schulen und kleinen Büros fällt ein Drucker, ein Server oder eine Website aus – und niemand merkt es, bis sich jemand beschwert."],
      ["Einschränkung", "Läuft auf einem gewöhnlichen Rechner ohne Server-Setup und soll unbeaufsichtigt durchlaufen. Kein Login, keine Cloud."],
      ["Architektur", "FastAPI mit SQLAlchemy und SQLite. Die Prüfungen (ICMP-Ping, TCP-Port, HTTP-Status) laufen asynchron, ein Hintergrund-Scheduler in derselben Event-Loop stösst sie nach Intervall an. Datenbankzugriffe laufen über einen Thread, damit die synchrone Session die Loop nicht blockiert."],
    ],
    knackpunkt: [
      "Ein nicht existierendes Gerät wurde als <b>online</b> angezeigt. Ursache: Unter Windows liefert <code>ping</code> den Exit-Code 0 auch dann, wenn der Router mit „Zielhost nicht erreichbar“ antwortet. Ein Check gilt jetzt nur als erfolgreich, wenn die Ausgabe auch eine Antwortzeit enthält.",
      "Ausserdem prüfte der Scheduler nur halb so oft wie eingestellt: Bei gleicher Tick- und Intervalllänge verfehlt ein Gerät seinen Slot regelmässig um Millisekunden und kommt erst beim übernächsten Tick dran. Gelöst über eine Toleranz von einer halben Tick-Länge.",
    ],
    pruefung: "16 Tests. Die Check-Engine wird gegen einen echten lokalen HTTP- und TCP-Server geprüft, nicht gegen Attrappen. Uptime- und Incident-Logik laufen gegen eine In-Memory-Datenbank.",
  },
  {
    nr: "02",
    titel: "Bewerbungs-Tracker",
    zeile: "Gleicht Stellenanzeigen gegen das eigene Skill-Profil ab",
    stack: "Python · FastAPI · SQLite",
    bild: "assets/abgleich.png",
    bildAlt: "Skill-Abgleich mit Match-Score sowie abgedeckten und fehlenden Technologien",
    messwerte: [["Tests", "23"], ["Zeilen", "1903"], ["Vokabular", "107 Begriffe"]],
    repo: "https://github.com/VincentBuehler/bewerbungs-tracker",
    live: true,
    felder: [
      ["Problem", "Bewerbungen verteilen sich über Notizen, E-Mails und PDFs. Welche Anforderung man übersehen hat, merkt man erst im Gespräch."],
      ["Einschränkung", "Kein NLP-Overkill und kein Sprachmodell. Das Ergebnis muss erklärbar sein, weil es eine Bewerbungsentscheidung beeinflusst."],
      ["Architektur", "FastAPI mit SQLAlchemy und SQLite, Frontend ohne Build-Step. Jeder Statuswechsel wird zentral im CRUD-Layer als Ereignis geschrieben – egal ob er aus dem Formular oder per Drag &amp; Drop kommt. So können Board und Verlauf nicht auseinanderlaufen."],
    ],
    knackpunkt: [
      "Der naheliegende Ansatz – „welche meiner Skills stehen in der Anzeige?“ – liefert einen wertlosen Score, weil eine Java-Anzeige die meisten eigenen Skills naturgemäss nicht erwähnt. Der Abgleich läuft deshalb zweistufig: erst die <b>geforderten</b> Technologien aus dem Text extrahieren, dann gegen das Profil halten. Der Score heisst damit „Anteil der Anforderungen, die ich abdecke“.",
      "Die Worterkennung musste vier Fälle gleichzeitig treffen: Symbole im Namen (<code>C++</code>, <code>C#</code>, <code>.NET</code>), Namen als Präfix (<code>JavaScript</code> darf nicht als <code>Java</code> zählen), deutsche Komposita („Deutsch- und Englischkenntnisse“) und der Punkt, der mal Namensbestandteil ist (<code>Node.js</code>) und mal Satzende. Jeder Fall ist als Test hinterlegt.",
    ],
    pruefung: "23 Tests, Schwerpunkt auf der Matching-Engine und der Status-Historie. Drei davon entstanden aus Fehlern, die erst beim Ausprobieren auffielen.",
  },
  {
    nr: "03",
    titel: "Gravity Loop Courier",
    zeile: "2D-Speedrun-Spiel mit selbst gerechneter Gravitationsphysik",
    stack: "JavaScript · Phaser 3",
    spiel: true,
    messwerte: [["Tests", "23"], ["Zeilen", "1481"], ["Level", "15"]],
    repo: "https://github.com/VincentBuehler/gravity-loop-courier",
    felder: [
      ["Frage dahinter", "Kann ich eine Physik selbst rechnen, statt eine fertige Engine zu benutzen? Phaser übernimmt hier nur Darstellung, Eingabe und Szenen – die Bewegung ist eigener Code."],
      ["Einschränkung", "Läuft im Browser, und die Bestzeiten müssen fair sein. Das schliesst eine Simulation aus, die pro Bild rechnet."],
      ["Architektur", "Jeder Himmelskörper zieht einzeln, mit Abstandsquadratgesetz und einer Weichzeichnung gegen die Singularität im Mittelpunkt. Integriert wird semi-implizit, sonst schaukeln sich Umlaufbahnen sichtbar auf. Die Simulation läuft in festen Schritten von 1/240 s: Ohne das fliegt dieselbe Eingabe auf einem 144-Hz-Monitor eine andere Bahn als auf 60 Hz."],
    ],
    knackpunkt: [
      "Die Gravitationskonstante hatte ich zunächst geraten – um Grössenordnungen zu klein. Der Kurier flog schnurgerade, während <b>alle Tests grün waren</b>: Sie prüften nur relative Eigenschaften wie Richtung und Abstandsgesetz, nie die absolute Stärke. Die Konstante ist jetzt aus der Levelgrösse zurückgerechnet, und die Feldstärke ist getestet.",
      "Level mit mehreren Gravitationsquellen lassen sich nicht von Auge balancieren; kleine Änderungen an Masse oder Startvektor kippen das Ergebnis. Ein Werkzeug prüft deshalb jedes Level headless auf faire Startbedingungen, Lösbarkeit (Zufallssuche über 600 Schubfolgen) und passende Zielzeit. Der erste Durchlauf meldete <b>9 von 15 Leveln als unspielbar</b>.",
    ],
    pruefung: "23 Physik-Tests. Darunter: eine Kreisbahn über 20 Sekunden mit maximal 5 % Radiusdrift, und derselbe Flug bei 60 Hz und 144 Hz mit unter 1 px Abweichung.",
  },
  {
    nr: "04",
    titel: "TaskManager API",
    zeile: "REST-API für Aufgabenverwaltung",
    stack: "C# · ASP.NET Core 8 · SQLite",
    messwerte: [["Endpoints", "CRUD"], ["Doku", "Swagger"]],
    repo: "https://github.com/VincentBuehler/VincentBuehlertaskmanager-API",
    felder: [
      ["Zweck", "Schulprojekt, um eine saubere REST-Schnittstelle im .NET-Umfeld zu bauen: Ressourcen, Statuscodes, Filterung."],
      ["Architektur", "ASP.NET Core 8 mit SQLite, CRUD-Endpoints mit Filterung und automatisch erzeugter Swagger-Dokumentation."],
    ],
    pruefung: null,
  },
];

/* --- Module rendern ------------------------------------------------------ */

const escape = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function akteHtml(m) {
  const felder = m.felder
    .map(
      ([label, text]) =>
        `<div class="akte-feld ${m.felder.length % 2 && label === m.felder.at(-1)[0] ? "voll" : ""}">
           <span class="akte-label">${escape(label)}</span><p>${text}</p>
         </div>`
    )
    .join("");

  const knackpunkt = m.knackpunkt
    ? `<div class="akte-raster"><div class="akte-feld voll">
         <span class="akte-label">Knackpunkt</span>
         ${m.knackpunkt.map((k) => `<p>${k}</p>`).join("")}
       </div></div>`
    : "";

  const pruefung = m.pruefung
    ? `<div class="akte-raster"><div class="akte-feld voll">
         <span class="akte-label">Wie es geprüft ist</span><p>${m.pruefung}</p>
       </div></div>`
    : "";

  const messwerte = `<div class="akte-messwerte">${m.messwerte
    .map(([k, v]) => `<span>${escape(k)} <b>${escape(v)}</b></span>`)
    .join("")}</div>`;

  const bild = m.bild
    ? `<img class="akte-bild" src="${m.bild}" alt="${escape(m.bildAlt)}" loading="lazy">`
    : "";

  const spiel = m.spiel
    ? `<div class="spiel-flaeche" data-spiel>
         <div class="spiel-start">
           <p>Das Spiel läuft direkt hier. Pfeiltasten oder WASD geben Schub;
              die gepunktete Linie zeigt, wohin die Gravitation ohne weiteren Schub trägt.</p>
           <button class="knopf primaer" data-spiel-start>Spiel laden und starten</button>
           <p style="font-size:11px">Lädt rund 1,3 MB nach – deshalb erst auf Klick.</p>
         </div>
       </div>`
    : "";

  const live = m.live
    ? `<div class="akte-messwerte"><span>Dieselbe Engine rechnet in
         <a href="#abgleich"><b>Abschnitt 02</b></a> live in Ihrem Browser.</span></div>`
    : "";

  return `<div class="akte">
    ${spiel}${bild}${messwerte}
    <div class="akte-raster">${felder}</div>
    ${knackpunkt}${pruefung}${live}
    <div class="akte-links">
      <a class="knopf" href="${m.repo}" target="_blank" rel="noopener">Quellcode auf GitHub</a>
    </div>
  </div>`;
}

const liste = document.getElementById("modulliste");
liste.innerHTML = MODULE.map(
  (m) => `<section class="modul" data-modul="${m.nr}">
    <button class="modul-kopf" aria-expanded="false">
      <span class="modul-nr">${m.nr}</span>
      <span>
        <span class="modul-titel">${escape(m.titel)}</span>
        <span class="modul-zeile">${escape(m.zeile)}</span>
      </span>
      <span class="modul-stack">${escape(m.stack)}</span>
      <span class="modul-schalter">Akte öffnen</span>
    </button>
    ${akteHtml(m)}
  </section>`
).join("");

liste.addEventListener("click", (e) => {
  const kopf = e.target.closest(".modul-kopf");
  if (!kopf) return;
  const modul = kopf.closest(".modul");
  const offen = modul.classList.toggle("offen");
  kopf.setAttribute("aria-expanded", String(offen));
  kopf.querySelector(".modul-schalter").textContent = offen ? "Akte schliessen" : "Akte öffnen";
});

// Spiel erst auf Klick laden – der Phaser-Build ist über ein Megabyte gross.
liste.addEventListener("click", (e) => {
  const knopf = e.target.closest("[data-spiel-start]");
  if (!knopf) return;
  const flaeche = knopf.closest("[data-spiel]");
  flaeche.innerHTML = `<iframe src="spiel/index.html" title="Gravity Loop Courier"
    allow="autoplay" loading="lazy"></iframe>`;
});

// Erste Akte offen, damit niemand raten muss, dass sich hier etwas öffnet.
const ersteAkte = liste.querySelector(".modul");
ersteAkte.classList.add("offen");
ersteAkte.querySelector(".modul-kopf").setAttribute("aria-expanded", "true");
ersteAkte.querySelector(".modul-schalter").textContent = "Akte schliessen";

/* --- Werdegang als Skala ------------------------------------------------- */

const STATIONEN = [
  { jahr: 2015, bis: 2021, titel: "Primarschule", ort: "Othmarsingen" },
  { jahr: 2021, bis: 2024, titel: "Bezirksschule", ort: "Lenzburg" },
  { jahr: 2024, bis: 2028, titel: "Informatikmittelschule", ort: "Kantonsschule Aarau" },
  { jahr: 2027, bis: 2028, titel: "Praktikum", ort: "gesucht", offen: true },
];

const START = 2015;
const ENDE = 2028;
const skala = document.getElementById("skala");
const jetzt = new Date();
const jetztPos = ((jetzt.getFullYear() + jetzt.getMonth() / 12 - START) / (ENDE - START)) * 100;

skala.innerHTML = `
  <div class="skala-achse">
    ${[2015, 2018, 2021, 2024, 2028]
      .map((j) => {
        const pos = ((j - START) / (ENDE - START)) * 100;
        return `<span class="skala-punkt" style="left:${pos}%"><i></i><span>${j}</span></span>`;
      })
      .join("")}
    <span class="skala-punkt jetzt" style="left:${jetztPos.toFixed(1)}%"><i></i><span>heute</span></span>
  </div>
  <div class="skala-eintraege">
    ${STATIONEN.map(
      (s) => `<div class="skala-eintrag">
        <span class="se-jahr">${s.jahr} – ${s.bis}</span>
        <div class="se-titel">${escape(s.titel)}</div>
        <div class="se-ort">${escape(s.ort)}</div>
      </div>`
    ).join("")}
  </div>`;

/* --- Instrumente: Zähler und Tageszähler --------------------------------- */

const IMS_START = new Date(2024, 7, 1); // 1. August 2024
const tage = Math.floor((jetzt - IMS_START) / 86400000);
document.querySelectorAll("[data-uhr=tage]").forEach((el) => {
  el.textContent = tage.toLocaleString("de-CH");
});

const zaehlerLauf = (el) => {
  const ziel = Number(el.dataset.zaehler);
  const dauer = 900;
  const start = performance.now();
  const schritt = (t) => {
    const p = Math.min(1, (t - start) / dauer);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(ziel * eased).toLocaleString("de-CH");
    if (p < 1) requestAnimationFrame(schritt);
  };
  requestAnimationFrame(schritt);
};

const zaehler = document.querySelectorAll("[data-zaehler]");
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  zaehler.forEach((el) => (el.textContent = Number(el.dataset.zaehler).toLocaleString("de-CH")));
} else {
  const beobachter = new IntersectionObserver(
    (eintraege) => {
      eintraege.forEach((e) => {
        if (e.isIntersecting) {
          zaehlerLauf(e.target);
          beobachter.unobserve(e.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  zaehler.forEach((el) => beobachter.observe(el));
}

/* --- Abgleich ------------------------------------------------------------ */

const BEISPIEL = `Praktikum Applikationsentwicklung EFZ (m/w/d)

Deine Aufgaben:
- Mitentwicklung von Webanwendungen mit C# und ASP.NET Core
- Arbeit mit relationalen Datenbanken (SQL Server, SQL)
- Umsetzung und Anbindung von REST-APIs
- Frontend-Anpassungen mit JavaScript, HTML und CSS
- Einsatz von Docker in der Entwicklungsumgebung

Dein Profil:
- Erste Erfahrung mit objektorientierter Programmierung (OOP)
- Kenntnisse in Git und agilen Methoden (Scrum)
- Interesse an Clean Code und Unit Tests
- Gute Deutsch- und Englischkenntnisse`;

const feld = document.getElementById("anzeige");
const ausgabe = document.getElementById("ergebnis");

function zeigeErgebnis(text) {
  const r = abgleichen(text);

  if (!r.gesamt) {
    ausgabe.innerHTML = `<p class="platzhalter">Im Text wurde keine bekannte Technologie
      gefunden. Das Vokabular kennt 107 Begriffe – bei einer sehr allgemein
      gehaltenen Anzeige greift es nicht.</p>`;
    return;
  }

  ausgabe.innerHTML = `
    <div class="score-zeile">
      <span class="score-wert">${r.score}%</span>
      <span class="score-text"><b>${r.getroffen.length} von ${r.gesamt}</b> geforderten
        Technologien decke ich ab</span>
    </div>
    <div class="score-balken"><i style="width:0%"></i></div>
    <div class="trefferliste">
      <div class="tl-titel">Bringe ich mit (${r.getroffen.length})</div>
      <div class="marker">${
        r.getroffen.map((t) => `<span class="marke-chip ja">${escape(t.name)}</span>`).join("") ||
        "<span class='platzhalter'>keine</span>"
      }</div>
    </div>
    <div class="trefferliste">
      <div class="tl-titel">Fehlt mir (${r.fehlend.length})</div>
      <div class="marker">${
        r.fehlend.map((f) => `<span class="marke-chip nein">${escape(f)}</span>`).join("") ||
        "<span class='platzhalter'>nichts</span>"
      }</div>
    </div>`;

  requestAnimationFrame(() => {
    ausgabe.querySelector(".score-balken i").style.width = `${r.score}%`;
  });
}

document.getElementById("pruefen").addEventListener("click", () => zeigeErgebnis(feld.value));
document.getElementById("beispiel").addEventListener("click", () => {
  feld.value = BEISPIEL;
  zeigeErgebnis(BEISPIEL);
});

/* --- Statuszeile: aktiven Abschnitt markieren ---------------------------- */

const links = [...document.querySelectorAll(".sb-nav a")];
const ziele = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);

const beobachterNav = new IntersectionObserver(
  (eintraege) => {
    eintraege.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.remove("aktiv"));
      const i = ziele.indexOf(e.target);
      if (i >= 0) links[i].classList.add("aktiv");
    });
  },
  { rootMargin: "-46px 0px -70% 0px" }
);
ziele.forEach((z) => beobachterNav.observe(z));
