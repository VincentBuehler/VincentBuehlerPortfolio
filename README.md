# buehlervincent.ch

Mein Portfolio. Eine statische Seite ohne Framework und ohne Build-Step: HTML, CSS
und ein paar ES-Module.

## Gestaltung

Schweizer Rastertypografie trifft Instrumententafel. Sichtbares Millimeterraster,
nummerierte Abschnitte, alle Messwerte in Monospace, ein einziger Signalakzent in Rot.

Bewusst vermieden: Creme-Hintergrund mit Serif-Headline, „Open to work"-Badge,
Skill-Prozentbalken, Glassmorphism und Karten-Raster mit drei gleichen Projektkacheln.
Jeder Inhalt steht ohne JavaScript im HTML — Animationen sind Zugabe, keine Voraussetzung.

## Was hier eigenständig ist

**Der Skill-Abgleich in Abschnitt 02 rechnet wirklich.** Die Matching-Engine aus meinem
[Bewerbungs-Tracker](https://github.com/VincentBuehler/bewerbungs-tracker) ist nach
JavaScript portiert (`assets/abgleich.js`, Vokabular in `assets/vokabular.js`). Wer den
Text einer Stellenanzeige einfügt, bekommt denselben zweistufigen Abgleich wie im
Original: erst die geforderten Technologien aus dem Text extrahieren, dann gegen mein
Profil halten. Alles im Browser, der Text wird nirgendwo hochgeladen.

**Das Spiel läuft eingebettet.** [Gravity Loop Courier](https://github.com/VincentBuehler/gravity-loop-courier)
liegt unter `spiel/` und wird erst auf Klick geladen, weil der Phaser-Build gut ein
Megabyte gross ist.

**Alle Zahlen sind ausgezählt**, nicht geschätzt: 62 Tests und 4709 Zeilen stammen aus
den vier Repositories.

## Aufbau

```
index.html
assets/style.css          Gestaltung
assets/app.js             Fallakten, Skala, Instrumente, Abgleich-Anbindung
assets/abgleich.js        Matching-Engine, aus Python portiert
assets/vokabular.js       107 Technologiebegriffe mit Schreibvarianten
spiel/                    Gravity Loop Courier, eingebettet
```

## Lokal ansehen

Wegen der ES-Module braucht die Seite einen Webserver:

```bash
npx http-server . -p 8400
```

## Projekte

| Projekt | Repository |
|---|---|
| Schulnetz-Monitor | [schulnetz-monitor](https://github.com/VincentBuehler/schulnetz-monitor) |
| Bewerbungs-Tracker | [bewerbungs-tracker](https://github.com/VincentBuehler/bewerbungs-tracker) |
| Gravity Loop Courier | [gravity-loop-courier](https://github.com/VincentBuehler/gravity-loop-courier) |
| Wetter-Dashboard | [wetter-dashboard](https://github.com/VincentBuehler/wetter-dashboard) |
