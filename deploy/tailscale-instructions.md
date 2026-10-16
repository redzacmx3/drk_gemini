# Tailscale & NAS / VPS Einrichtungsleitfaden für DRK Bereitschaften

Dieses Dokument beschreibt, wie das DRK Warenbestandssystem auf einem Heim-/Wach-NAS (Synology, QNAP, TrueNAS), einem Proxmox-LXC oder einem externen VPS ohne offene Router-Ports betrieben wird.

## 1. Warum Tailscale für das DRK?

- **Keine offenen Ports am Router der DRK-Unterkunft nötig:** Das Bereitschaftsheim benötigt keine statische IP und keine riskanten Portweiterleitungen nach außen.
- **Verschlüsseltes WireGuard-Mesh:** Nur autorisierte DRK-Mitglieder mit DRK-Google-/Microsoft- oder Tailscale-Login können auf das System zugreifen.
- **Einfacher HTTP-Betrieb:** Da Tailscale den gesamten Datenverkehr Ende-zu-Ende verschlüsselt, reicht HTTP innerhalb des VPNs völlig aus (kein Zertifikats-Stress bei `.local` oder internen IPs). Optional stellt Tailscale mit `tailscale cert` sogar automatisch echte Let's Encrypt HTTPS-Zertifikate für Ihre MagicDNS-Namen bereit (`https://drk-nas.tailscale.net`).

## 2. Schnellstart auf NAS oder VPS

1. **Docker Compose starten:**
   ```bash
   git clone <repo-url> drk-warenbestand
   cd drk-warenbestand
   docker compose up -d
   ```
2. **Tailscale installieren:**
   - Auf Debian/Ubuntu: `curl -fsSL https://tailscale.com/install.sh | sh`
   - Starten: `sudo tailscale up`
3. **Ersteinrichtungs-Assistent aufrufen:**
   Öffnen Sie im Browser eines im Tailscale-Netzwerk befindlichen Tablets/Smartphones die Adresse:
   `http://<tailscale-ip-des-servers>:8080/`
   -> Der integrierte DRK-Web-Install-Wizard führt Sie durch die Ersteinrichtung von OV Laupheim, Rollen und Grundausstattung.
