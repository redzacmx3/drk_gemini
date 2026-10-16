import { storage } from './storage';
import { Device, Location, ReadinessCheck } from '../types/inventory';

export function exportBestandsverzeichnisCSV(): void {
  const operator = storage.getOperator();
  const devices = storage.getDevices();
  const actors = storage.getEconomicActors();
  const locations = storage.getLocations();

  const headers = [
    'Betriebliche Inventarnummer (§14)',
    'Bezeichnung (§14)',
    'Art (§14)',
    'Typ (§14)',
    'Serien-/Losnummer (§14)',
    'Anschaffungsjahr (§14)',
    'Hersteller / Wirtschaftsakteur (§14)',
    'Anschrift Hersteller (§14)',
    'Standort (§14)',
    'Betriebliche Zuordnung (§14)',
    'Status (§14)',
    'CE-Kennzeichen',
    'MDR-Klasse',
    'Anlage 1 (STK)',
    'Nächste STK',
    'Anlage 2 (MTK)',
    'Nächste MTK'
  ];

  const rows = devices.map(d => {
    const actor = actors.find(a => a.id === d.economicActorId);
    const loc = locations.find(l => l.id === d.locationId);
    const actorStr = actor ? `${actor.name} (${actor.role})` : 'Unbekannt';
    const actorAddr = actor ? `${actor.address}, ${actor.city}, ${actor.country}` : '';
    const locStr = loc ? `${loc.name} [${loc.code}]` : 'Nicht zugewiesen';

    return [
      `"${d.inventoryNumber.replace(/"/g, '""')}"`,
      `"${d.name.replace(/"/g, '""')}"`,
      `"${d.deviceType.replace(/"/g, '""')}"`,
      `"${d.modelType.replace(/"/g, '""')}"`,
      `"${d.serialOrLotNumber.replace(/"/g, '""')}"`,
      d.acquisitionYear,
      `"${actorStr.replace(/"/g, '""')}"`,
      `"${actorAddr.replace(/"/g, '""')}"`,
      `"${locStr.replace(/"/g, '""')}"`,
      `"${d.operationalUnit.replace(/"/g, '""')}"`,
      d.lifecycleState,
      `"${d.ceMarking || ''}"`,
      `"${d.mdrClass || ''}"`,
      d.annex1Device ? 'Ja' : 'Nein',
      `"${d.nextStkDate || '-'}"`,
      d.annex2Device ? 'Ja' : 'Nein',
      `"${d.nextMtkDate || '-'}"`
    ].join(';');
  });

  const metadataLines = [
    `# BESTANDSVERZEICHNIS NACH § 14 MPBetreibV`,
    `# Betreiber: ${operator.organizationName} (${operator.parentOrg})`,
    `# Betriebsstätte: ${operator.siteName} - ${operator.address}`,
    `# Beauftragter für MP-Sicherheit: ${operator.mpSafetyOfficerName} (${operator.mpSafetyOfficerEmail})`,
    `# Stichtag / Exportdatum: ${new Date().toISOString().split('T')[0]}`,
    ''
  ];

  const csvContent = '\uFEFF' + metadataLines.join('\r\n') + headers.join(';') + '\r\n' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `DRK_Laupheim_Bestandsverzeichnis_14_MPBetreibV_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printBestandsverzeichnisHTML(): void {
  const operator = storage.getOperator();
  const devices = storage.getDevices();
  const actors = storage.getEconomicActors();
  const locations = storage.getLocations();

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>Bestandsverzeichnis gem. § 14 MPBetreibV – DRK OV Laupheim</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 20mm 15mm; color: #1e293b; font-size: 10pt; line-height: 1.4; }
    .header { border-bottom: 3px solid #E30613; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
    .drk-badge { color: #E30613; font-weight: bold; font-size: 14pt; }
    .subhead { color: #475569; font-size: 9pt; margin-top: 4px; }
    .meta-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 10px 14px; margin-bottom: 20px; font-size: 9pt; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 8.5pt; }
    th { background: #0f172a; color: white; text-align: left; padding: 6px 8px; font-weight: 600; }
    td { border-bottom: 1px solid #e2e8f0; padding: 6px 8px; vertical-align: top; }
    tr:nth-child(even) { background: #f8fafc; }
    .badge { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 7.5pt; font-weight: bold; }
    .badge-ok { background: #dcfce7; color: #166534; }
    .badge-warn { background: #fef3c7; color: #92400e; }
    .footer { margin-top: 25px; border-top: 1px solid #cbd5e1; padding-top: 10px; font-size: 8pt; color: #64748b; display: flex; justify-content: space-between; }
    @media print {
      body { margin: 10mm; }
      @page { size: landscape; margin: 10mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="drk-badge">DEUTSCHES ROTES KREUZ · ORTSVEREIN LAUPHEIM e.V.</div>
      <h2 style="margin: 6px 0 0 0; font-size: 15pt;">Bestandsverzeichnis nach § 14 MPBetreibV</h2>
      <div class="subhead">Aktive nichtimplantierbare Medizinprodukte gem. Medizinprodukte-Betreiberverordnung</div>
    </div>
    <div style="text-align: right; font-size: 9pt;">
      <strong>Stichtag:</strong> ${new Date().toLocaleDateString('de-DE')}<br>
      <strong>Dokument-ID:</strong> BV-LPH-${new Date().getFullYear()}
    </div>
  </div>

  <div class="meta-box">
    <div>
      <strong>Rechtlicher Betreiber:</strong> ${operator.organizationName}<br>
      <strong>Übergeordnete Gliederung:</strong> ${operator.parentOrg}<br>
      <strong>Betriebsstätte:</strong> ${operator.siteName}, ${operator.address}
    </div>
    <div>
      <strong>Beauftragter für MP-Sicherheit (§ 6):</strong> ${operator.mpSafetyOfficerName}<br>
      <strong>Öffentliche Kontakt-E-Mail:</strong> ${operator.mpSafetyOfficerEmail}<br>
      <strong>Rechtsstand MPBetreibV:</strong> Neufassung in Kraft seit 20.02.2025 / Stand 10/2026
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Inv.-Nr.</th>
        <th>Bezeichnung / Art</th>
        <th>Typ / Modell</th>
        <th>Serien- / Los-Nr.</th>
        <th>Anschaffung</th>
        <th>Wirtschaftsakteur (Hersteller)</th>
        <th>Standort & Zuordnung</th>
        <th>Anlage 1/2</th>
        <th>Nächste STK / MTK</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${devices.map(d => {
        const actor = actors.find(a => a.id === d.economicActorId);
        const loc = locations.find(l => l.id === d.locationId);
        return `
          <tr>
            <td><strong>${d.inventoryNumber}</strong></td>
            <td>${d.name}<br><small style="color: #64748b;">${d.deviceType}</small></td>
            <td>${d.modelType}</td>
            <td><code>${d.serialOrLotNumber}</code></td>
            <td>${d.acquisitionYear}</td>
            <td>${actor ? `${actor.name}<br><small style="color:#64748b;">${actor.address}, ${actor.city}</small>` : 'Unbekannt'}</td>
            <td>${loc ? `<strong>${loc.name}</strong>` : '-'}<br><small>${d.operationalUnit}</small></td>
            <td>${d.annex1Device ? 'Anlage 1 (STK)' : ''} ${d.annex2Device ? 'Anlage 2 (MTK)' : ''}</td>
            <td>${d.nextStkDate ? `STK: ${d.nextStkDate}<br>` : ''}${d.nextMtkDate ? `MTK: ${d.nextMtkDate}` : '-'}</td>
            <td><span class="badge ${d.lifecycleState === 'IN_SERVICE' ? 'badge-ok' : 'badge-warn'}">${d.lifecycleState}</span></td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <div class="footer">
    <div>Erstellt über DRK Warenbestand System · DRK OV Laupheim · Konform § 14 MPBetreibV</div>
    <div>Seite 1 von 1 · Amtliche Aufbewahrung gem. Richtlinien</div>
  </div>

  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>
`;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function printMedizinproduktebuchHTML(deviceId: string): void {
  const operator = storage.getOperator();
  const device = storage.getDevices().find(d => d.id === deviceId);
  if (!device) return;

  const actor = storage.getEconomicActors().find(a => a.id === device.economicActorId);
  const location = storage.getLocations().find(l => l.id === device.locationId);
  const events = storage.getDeviceEvents(deviceId);
  const instructions = storage.getInstructions(deviceId);

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>Medizinproduktebuch § 13 MPBetreibV – ${device.inventoryNumber}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 15mm; color: #0f172a; font-size: 10pt; line-height: 1.4; }
    .header { border-bottom: 3px solid #E30613; padding-bottom: 10px; margin-bottom: 16px; display: flex; justify-content: space-between; }
    .title { color: #E30613; font-size: 16pt; font-weight: 800; }
    .box { border: 1px solid #cbd5e1; border-radius: 4px; padding: 12px; margin-bottom: 16px; background: #f8fafc; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 9.5pt; }
    h3 { font-size: 11pt; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; margin: 16px 0 8px 0; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 9pt; }
    th { background: #1e293b; color: white; text-align: left; padding: 6px 8px; }
    td { border-bottom: 1px solid #e2e8f0; padding: 6px 8px; vertical-align: top; }
    .badge { padding: 2px 6px; border-radius: 3px; font-size: 8pt; font-weight: bold; background: #e2e8f0; }
    .badge-ok { background: #dcfce7; color: #166534; }
    .notice { font-size: 8.5pt; color: #475569; margin-top: 16px; padding: 8px; border-left: 3px solid #E30613; background: #fef2f2; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div style="font-weight: bold; color: #E30613;">DEUTSCHES ROTES KREUZ · OV LAUPHEIM</div>
      <div class="title">Medizinproduktebuch gem. § 13 MPBetreibV</div>
      <div style="color: #64748b; font-size: 9pt;">Gesetzliche Dokumentation für aktive Medizinprodukte der Anlage 1 & 2</div>
    </div>
    <div style="text-align: right; font-size: 9pt;">
      <strong>Inventar-Nr.:</strong> ${device.inventoryNumber}<br>
      <strong>Druckdatum:</strong> ${new Date().toLocaleDateString('de-DE')}
    </div>
  </div>

  <div class="box">
    <div class="grid">
      <div>
        <strong>Bezeichnung:</strong> ${device.name}<br>
        <strong>Geräte-Art:</strong> ${device.deviceType}<br>
        <strong>Typ / Modell:</strong> ${device.modelType}<br>
        <strong>Seriennummer:</strong> <code>${device.serialOrLotNumber}</code><br>
        <strong>Anschaffungsjahr (§ 14):</strong> ${device.acquisitionYear}
      </div>
      <div>
        <strong>Wirtschaftsakteur (Hersteller):</strong><br>
        ${actor ? `${actor.name}<br>${actor.address}, ${actor.city}` : 'Unbekannt'}<br>
        <strong>Aktueller Standort:</strong> ${location ? `${location.name} (${location.code})` : '-'}<br>
        <strong>Betriebliche Zuordnung:</strong> ${device.operationalUnit}
      </div>
    </div>
  </div>

  <h3>1. Beauftragte und eingewiesene Personen (§ 4 & § 11 MPBetreibV)</h3>
  <table>
    <thead>
      <tr>
        <th>Eingewiesene Person</th>
        <th>Qualifikation</th>
        <th>Einweisender</th>
        <th>Datum</th>
        <th>Einweisungstyp</th>
        <th>Handbuch-Version</th>
      </tr>
    </thead>
    <tbody>
      ${instructions.length > 0 ? instructions.map(i => `
        <tr>
          <td><strong>${i.personName}</strong></td>
          <td>${i.qualification}</td>
          <td>${i.instructorName}</td>
          <td>${i.instructionDate}</td>
          <td><span class="badge">${i.type === 'BEAUFTRAGTE_PERSON_PARAGRAPH_11' ? '§ 11 Beauftragte Person' : '§ 4 Anwender'}</span></td>
          <td>${i.manualVersion}</td>
        </tr>
      `).join('') : '<tr><td colspan="6" style="text-align:center; color:#64748b;">Noch keine Einweisungsnachweise digital hinterlegt.</td></tr>'}
    </tbody>
  </table>

  <h3>2. Kontrollfristen, Funktionsprüfungen, STK/MTK & Instandhaltung</h3>
  <table>
    <thead>
      <tr>
        <th>Datum</th>
        <th>Ereignisart</th>
        <th>Protokoll-Nr.</th>
        <th>Durchführende Person / Firma</th>
        <th>Feststellungen & Zusammenfassung</th>
      </tr>
    </thead>
    <tbody>
      ${events.length > 0 ? events.map(e => `
        <tr>
          <td><strong>${new Date(e.occurredAt).toLocaleDateString('de-DE')}</strong></td>
          <td><span class="badge ${e.eventType.includes('PRUEFUNG') || e.eventType === 'INBETRIEBNAHME' ? 'badge-ok' : ''}">${e.eventType}</span></td>
          <td><code>${e.protocolNumber || '-'}</code></td>
          <td>${e.recordedBy}</td>
          <td>${e.summary}</td>
        </tr>
      `).join('') : '<tr><td colspan="5" style="text-align:center; color:#64748b;">Keine Ereignisse im Buch verzeichnet.</td></tr>'}
    </tbody>
  </table>

  <div class="notice">
    <strong>Gesetzlicher Aufbewahrungshinweis gem. § 13 Abs. 3 MPBetreibV:</strong><br>
    Das Medizinproduktebuch ist den zuständigen Anwendern während der Arbeitszeit zugänglich zu halten. Nach einer Außerbetriebnahme ist das Medizinproduktebuch für die Dauer von mindestens fünf Jahren aufzubewahren.
    ${device.lifecycleState === 'OUT_OF_SERVICE' ? `<br><strong>Achtung: Gerät außer Betrieb genommen. Aufbewahrungsfrist bis: ${device.retentionUntilDate || 'mindestens 5 Jahre'}</strong>` : ''}
  </div>

  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>
`;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function printKofferCheckProtocolHTML(location: Location, check: ReadinessCheck): void {
  const operator = storage.getOperator();
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>Kofferprüfung / Einsatzbereitschaft – ${location.name}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 15mm; color: #0f172a; font-size: 10pt; line-height: 1.4; }
    .header { border-bottom: 3px solid #E30613; padding-bottom: 10px; margin-bottom: 16px; display: flex; justify-content: space-between; }
    .title { color: #E30613; font-size: 15pt; font-weight: bold; }
    .status-badge { display: inline-block; padding: 6px 16px; border-radius: 6px; font-weight: bold; font-size: 13pt; text-transform: uppercase; }
    .status-GREEN { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
    .status-YELLOW { background: #fef3c7; color: #92400e; border: 1px solid #fde047; }
    .status-RED { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
    .box { border: 1px solid #cbd5e1; border-radius: 4px; padding: 12px; margin-bottom: 16px; background: #f8fafc; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9pt; }
    th { background: #1e293b; color: white; text-align: left; padding: 6px 8px; }
    td { border-bottom: 1px solid #e2e8f0; padding: 6px 8px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div style="font-weight: bold; color: #E30613;">DEUTSCHES ROTES KREUZ · OV LAUPHEIM</div>
      <div class="title">Einsatzbereitschafts- &amp; Kofferprüfprotokoll</div>
      <div style="color: #64748b; font-size: 9pt;">Regelmäßige Kontrolle Sanitätsmaterial, Verfallsdaten &amp; Geräte</div>
    </div>
    <div style="text-align: right;">
      <span class="status-badge status-${check.readiness}">Status: ${check.readiness}</span>
    </div>
  </div>

  <div class="box">
    <strong>Prüfobjekt:</strong> ${location.name} (Code: ${location.code})<br>
    <strong>Prüfer / Helfer:</strong> ${check.checkedBy}<br>
    <strong>Prüfzeitpunkt:</strong> ${new Date(check.checkedAt).toLocaleString('de-DE')}<br>
    <strong>Soll-Packliste Version:</strong> ${check.packlistVersion}<br>
    <strong>Physische Sichtprüfung / Unversehrtheit:</strong> ${check.visualCheckOk ? 'Erfolgreich bestätigt' : 'Mängel festgestellt'}<br>
    ${check.tamperSealNumber ? `<strong>Plombennummer:</strong> ${check.tamperSealNumber}<br>` : ''}
  </div>

  <h3>Festgestellte Abweichungen / Prüfpunkte</h3>
  ${check.issues.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>Schweregrad</th>
          <th>Typ</th>
          <th>Beschreibung</th>
        </tr>
      </thead>
      <tbody>
        ${check.issues.map(i => `
          <tr>
            <td><strong>${i.severity}</strong></td>
            <td>${i.type}</td>
            <td>${i.description}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '<p style="color: #166534; font-weight: bold;">Keine Beanstandungen! Sämtliche Pflichtartikel vorhanden und Mindesthaltbarkeiten eingehalten.</p>'}

  <div style="margin-top: 30px; display: flex; justify-content: space-between; border-top: 1px solid #cbd5e1; padding-top: 15px;">
    <div>
      <strong>DRK Bereitschaft Laupheim</strong><br>
      ${operator.siteName}
    </div>
    <div style="text-align: right;">
      ____________________________________<br>
      Unterschrift / Quittierung Prüfer (${check.checkedBy})
    </div>
  </div>

  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>
`;

  printWindow.document.write(html);
  printWindow.document.close();
}
