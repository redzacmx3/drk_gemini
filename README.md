# DRK Warenbestand & Medizinprodukte (OV Laupheim)

[![MPBetreibV v2](https://img.shields.io/badge/MPBetreibV-2025%2F2026%20konform-red.svg)](https://www.gesetze-im-internet.de/mpbetreibv_2025/)
[![Docker](https://img.shields.io/badge/Docker%20Compose-bereit-blue.svg)](docker-compose.yml)
[![Tailscale](https://img.shields.io/badge/Tailscale-kompatibel-100%20x%20y%20z.svg)](deploy/tailscale-instructions.md)
[![License](https://img.shields.io/badge/Open%20Source-DRK%20Bereitschaften-success.svg)](#)

Moderne, responsive Bestands- und Medizinprodukteverwaltung nach der Neufassung der **Medizinprodukte-Betreiberverordnung (MPBetreibV v2)** für den **DRK Ortsverein Laupheim e.V.** (und weitere DRK-Bereitschaften). 

Inspiriert von **InvenTree**, **OpenBoxes** und **Shelf.nu**, optimiert für den mobilen Sanitäts- und Rettungsdienst sowie den Katastrophenschutz.

---

## 🚑 Hauptfunktionen

### 1. § 14 MPBetreibV – Bestandsverzeichnis
- Lückenlose Erfassung aller aktiven nichtimplantierbaren Medizinprodukte der Betriebsstätte Laupheim mit allen gesetzlichen Pflichtfeldern:
  - Bezeichnung, Art, Typ, Los-/Seriennummer, Anschaffungsjahr, Wirtschaftsakteure (Hersteller/Bevollmächtigter mit Anschrift), betriebliche Inventarnummer, Standort und Zuordnung.
- **Exportfunktionen:**
  - Druckfertiges DIN A4-Bestandsverzeichnis für amtliche Begehungen / Kontrollen.
  - CSV-Export für Weiterverarbeitung in Tabellenkalkulationen.

### 2. § 13 MPBetreibV – Digitales Medizinproduktebuch
- Strukturierte Geräteakten mit Revisionshistorie:
  - Inbetriebnahmeprotokoll und Funktionsprüfung gem. § 11.
  - Dokumentierte Einweisungsnachweise für beauftragte Personen (§ 11) und Anwender (§ 4).
  - Kontrollfristen (STK, MTK, DGUV V3) mit automatischer Fristberechnung (STK zum Monatsende, MTK zum Jahresende).
  - Störungen, Vorkommnisse und 5-Jahres-Aufbewahrungsfrist nach Außerbetriebnahme.

### 3. Material- & Chargenverwaltung mit FEFO
- **First Expired, First Out:** Automatische Erkennung und Priorisierung von Chargen mit nahendem Verfallsdatum (< 60 Tage Warnung).
- **Atomare Bestandsbuchungen:** Wareneingang (RECEIPT), Umlagerung (TRANSFER), Entnahme (CONSUME) und Inventur (ADJUSTMENT) mit Schutz vor negativen Beständen.
- **Chargenstatus:** Globale Quarantäne (`QUARANTINED`) oder Rückrufe (`RECALLED`).

### 4. Standorte, Fuhrpark & Mobile Kofferprüfung
- Hierarchische Lagerstruktur:
  - Wache Laupheim (Hauptlager, Medizintechnik-Werkstatt)
  - Einsatzfahrzeuge:
    - *Rotkreuz Laupheim 1/19-1* (MTW)
    - *Rotkreuz Laupheim 1/26-1* (KTW-B)
    - *Rotkreuz Laupheim 1/48-1* (GW-San)
  - Mobile Einheiten (Notfallrucksäcke San-A, Sauerstofftasche 2L O2, AED-Bereitschaftstasche).
- **Einsatzbereitschafts-Check:**
  - Ampelbewertung (Grün, Gelb, Rot) basierend auf Soll-Packlisten, Verfallsdaten und Prüffristen.
  - Quittierung der physischen Sichtprüfung und Plombennummer mit druckbarem Prüfbericht.

### 5. § 3 MPAMIV Meldungen & Rückrufmanagement
- Meldeprozess an das BfArM für schwerwiegende Vorkommnisse.
- Verwaltung des Beauftragten für Medizinproduktesicherheit gem. § 6 mit veröffentlichter Funktions-Mail.
- Erfassung von Hersteller-Sicherheitskorrekturmaßnahmen (FSCA / Recalls) mit automatischer Chargensperrung.

### 6. Integrierter Scanner (GS1-128 & QR-Tags)
- Kamera-Scanner sowie Direkteingabe für Barcodes, GS1-128 Application Identifier (`01` GTIN, `10` Lot, `17` Verfall, `21` Seriennummer) und interne DRK-Tags (`DRK-LPH-...`).

### 7. DRK Corporate Design & Farbschemata
- Umschaltbar über die Kopfzeile:
  - 🔴 **DRK Rot (Standard)**
  - 🌙 **DRK Nachtdienst (Dark Mode)** – augenschonend bei Nachteinsätzen
  - 🔵 **KatS Blau / Sanitätsdienst**
  - ⚡ **Barrierefreier Hochkontrast-Modus**

---

## 🐳 Docker Deployment & Schnellstart

### Voraussetzungen
- Docker und Docker Compose (auf Synology NAS, Proxmox LXC, TrueNAS, VPS oder Mini-PC).
- Ein Reverse-Proxy (z.B. **Tailscale** oder **Traefik**). Ein direktes HTTPS im Container ist nicht zwingend erforderlich, HTTP auf Port `8080` genügt.

### 1. Repository klonen und starten
```bash
git clone https://github.com/redzacmx3/drk_gemini.git drk-warenbestand
cd drk-warenbestand
docker compose up -d
```

### 2. Web-Installations-Assistent aufrufen
Öffnen Sie im Browser:
```
http://<Server-IP>:8080/
```
Der interaktive 4-Schritte-Web-Install-Wizard führt Sie durch die Ersteinrichtung:
1. **Betreiberdaten:** Ortsverein, Kreisverband, Anschrift, MPG-Sicherheitsbeauftragter (§ 6).
2. **Administrator-Konto:** Name, E-Mail, Zugriffs-PIN.
3. **Ausstattung:** Auswahl der Vorlagen für Fuhrpark, Koffer und Sanitätsmaterial.
4. **Fertigstellung:** Sofortiger Start ins Dashboard!

---

## 🔒 Tailscale Integration (Empfohlen für Bereitschaften)

Das DRK-Bereitschaftsheim benötigt **keine statische IP-Adresse und keine Portweiterleitungen** im Router:
1. Installieren Sie Tailscale auf dem Server/NAS:
   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   sudo tailscale up
   ```
2. Alle autorisierten Helfer und Administratoren können über die Tailscale-IP verschlüsselt auf das System zugreifen:
   `http://100.x.y.z:8080/`
3. Optional stellt Tailscale mit `tailscale cert` automatische Let's Encrypt HTTPS-Zertifikate bereit.

Detaillierte Anleitung: siehe [`deploy/tailscale-instructions.md`](deploy/tailscale-instructions.md).

---

## 📄 Lizenz & Urheberrecht

Entwickelt für den **DRK Ortsverein Laupheim e.V.**  
Bereitgestellt als Open-Source-Lösung für DRK-Ortsvereine, Bereitschaften und Hilfsorganisationen.
