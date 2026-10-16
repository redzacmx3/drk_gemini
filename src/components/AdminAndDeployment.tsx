import React, { useState } from 'react';
import { 
  Settings, 
  Server, 
  Users, 
  Database, 
  Download, 
  Upload, 
  Terminal, 
  Copy, 
  Check, 
  RefreshCcw, 
  Shield, 
  Building, 
  Wrench, 
  Network,
  RotateCcw
} from 'lucide-react';
import { storage } from '../services/storage';
import { OperatorConfig, User, Role } from '../types/inventory';

interface AdminAndDeploymentProps {
  onStartSetupWizard: () => void;
}

export const AdminAndDeployment: React.FC<AdminAndDeploymentProps> = ({ onStartSetupWizard }) => {
  const [operator, setOperator] = useState<OperatorConfig>(storage.getOperator());
  const [users, setUsers] = useState<User[]>(storage.getUsers());
  const [activeTab, setActiveTab] = useState<'OPERATOR' | 'USERS' | 'DOCKER' | 'BACKUP'>('DOCKER');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveOperator = (e: React.FormEvent) => {
    e.preventDefault();
    storage.setOperator(operator);
    storage.logAudit('OPERATOR', 'CONFIG', `Betreiber-Stammdaten aktualisiert: ${operator.organizationName}`);
    alert('Betreiberstammdaten erfolgreich gespeichert.');
  };

  const handleExportBackup = () => {
    const backup = storage.createBackupManifest();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `DRK_Laupheim_Backup_Manifest_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = storage.restoreFromBackup(content);
      setRestoreMessage(result.message);
      if (result.success) {
        setOperator(storage.getOperator());
        setUsers(storage.getUsers());
      }
    };
    reader.readAsText(file);
  };

  const handleFactoryReset = () => {
    if (confirm('Achtung: Sämtliche aktuellen Daten werden gelöscht und auf die DRK OV Laupheim Werkseinstellungen zurückgesetzt. Fortfahren?')) {
      storage.resetToDefaults();
      window.location.reload();
    }
  };

  const dockerComposeSnippet = `# ==============================================================================
# DRK Warenbestand & Medizinprodukte (OV Laupheim)
# Docker Compose Konfiguration für Synology NAS, Proxmox, VPS oder Mini-PC
# ==============================================================================

version: '3.8'

services:
  drk-inventory:
    container_name: drk-warenbestand-laupheim
    image: ghcr.io/redzacmx3/drk_gemini:latest
    # build:
    #   context: .
    #   dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "8080:8080" # Standard HTTP Port für Tailscale / lokales LAN
    environment:
      - NODE_ENV=production
      - PORT=8080
      - DRK_OV_NAME=DRK Ortsverein Laupheim e.V.
      - DRK_DEFAULT_TIMEZONE=Europe/Berlin
      - DATA_DIR=/data
    volumes:
      - drk_inventory_data:/data
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:8080/"]
      interval: 30s
      timeout: 5s
      retries: 3
    security_opt:
      - no-new-privileges:true

volumes:
  drk_inventory_data:
    name: drk_inventory_data_laupheim`;

  const traefikSnippet = `# Traefik Reverse Proxy Integration (Optional bei echter Domäne oder Let's Encrypt)
services:
  traefik:
    image: traefik:v3.1
    ports: ["80:80", "443:443"]
    volumes: ["/var/run/docker.sock:/var/run/docker.sock:ro", "certs:/letsencrypt"]

  drk-inventory:
    image: drk-warenbestand:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.drk.rule=Host(\`inventar.drk-laupheim.de\`)"
      - "traefik.http.services.drk.loadbalancer.server.port=8080"`;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
            <span>Systemsteuerung &amp; Self-Hosting</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Administration &amp; Docker Deployment
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Konfiguration von OV Laupheim, Rollen, Docker Compose Images, Tailscale und Backup-Routinen.
          </p>
        </div>

        <button
          onClick={onStartSetupWizard}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Web-Install-Wizard starten</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('DOCKER')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition whitespace-nowrap ${activeTab === 'DOCKER' ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
        >
          <Server className="w-4 h-4" />
          <span>Docker &amp; Deployment</span>
        </button>
        <button
          onClick={() => setActiveTab('OPERATOR')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition whitespace-nowrap ${activeTab === 'OPERATOR' ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
        >
          <Building className="w-4 h-4" />
          <span>Betreiber (§ 14 &amp; § 6)</span>
        </button>
        <button
          onClick={() => setActiveTab('USERS')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition whitespace-nowrap ${activeTab === 'USERS' ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
        >
          <Users className="w-4 h-4" />
          <span>Benutzer &amp; Rollen</span>
        </button>
        <button
          onClick={() => setActiveTab('BACKUP')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition whitespace-nowrap ${activeTab === 'BACKUP' ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
        >
          <Database className="w-4 h-4" />
          <span>Backup &amp; Wiederherstellung</span>
        </button>
      </div>

      {/* TAB 1: DOCKER DEPLOYMENT */}
      {activeTab === 'DOCKER' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                  <Server className="w-5 h-5 text-red-600" />
                  <span>Fertige Docker Compose Konfiguration</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Startklar für Synology Container Manager, Proxmox Docker-LXC, TrueNAS oder VPS
                </p>
              </div>

              <button
                onClick={() => handleCopy('compose', dockerComposeSnippet)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-100 transition"
              >
                {copiedKey === 'compose' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'compose' ? 'Kopiert!' : 'Kopieren'}</span>
              </button>
            </div>

            <div className="relative">
              <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                {dockerComposeSnippet}
              </pre>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <div className="font-bold text-slate-900 dark:text-white">
                🚀 Container starten in 3 Schritten:
              </div>
              <ol className="list-decimal list-inside space-y-1">
                <li>Erstellen Sie auf Ihrem NAS/Server einen Ordner: <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">mkdir drk-warenbestand &amp;&amp; cd drk-warenbestand</code></li>
                <li>Speichern Sie obige <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">docker-compose.yml</code> in diesem Verzeichnis.</li>
                <li>Führen Sie <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">docker compose up -d</code> aus.</li>
              </ol>
            </div>
          </div>

          {/* Tailscale & Traefik Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm">
                <Network className="w-4 h-4 text-blue-600" />
                <span>Tailscale Verbindung (Empfohlen für Bereitschaften)</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sie müssen im Router des Bereitschaftsheims <strong>keine Ports öffnen</strong>. Mit Tailscale können autorisierte DRK-Mitglieder sicher von zu Hause oder unterwegs via VPN auf die IP <code className="text-slate-700 dark:text-slate-300">http://100.x.y.z:8080</code> zugreifen.
              </p>
              <div className="text-xs font-semibold text-blue-600">
                HTTP genügt innerhalb des Tailscale WireGuard-Tunnels vollkommen.
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Traefik Reverse Proxy (Vorbereitet)</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                In der Codebase liegt unter <code className="text-slate-700 dark:text-slate-300">deploy/traefik-docker-compose.yml</code> eine fertige Proxy-Konfiguration bereit, falls Sie später eine offizielle Domain anbinden möchten.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OPERATOR CONFIG */}
      {activeTab === 'OPERATOR' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="font-bold text-base text-slate-900 dark:text-white mb-2">
            Betreiber-Stammdaten gem. § 14 &amp; § 6 MPBetreibV
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Diese Daten erscheinen auf allen gesetzlichen Bestandsverzeichnissen, MP-Büchern und Prüfprotokollen.
          </p>

          <form onSubmit={handleSaveOperator} className="space-y-4 text-xs max-w-xl">
            <div>
              <label className="font-semibold block mb-1">Gliederung / Organisation *</label>
              <input
                type="text"
                required
                value={operator.organizationName}
                onChange={e => setOperator({ ...operator, organizationName: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Übergeordneter Kreisverband</label>
                <input
                  type="text"
                  value={operator.parentOrg}
                  onChange={e => setOperator({ ...operator, parentOrg: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Betriebsstätte / Standort</label>
                <input
                  type="text"
                  value={operator.siteName}
                  onChange={e => setOperator({ ...operator, siteName: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Anschrift der Betriebsstätte *</label>
              <input
                type="text"
                required
                value={operator.address}
                onChange={e => setOperator({ ...operator, address: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="font-bold text-red-600 block">
                Beauftragter für Medizinproduktesicherheit gem. § 6 MPBetreibV:
              </span>
              <div>
                <label className="font-semibold block mb-1">Name der bestellten Person *</label>
                <input
                  type="text"
                  required
                  value={operator.mpSafetyOfficerName}
                  onChange={e => setOperator({ ...operator, mpSafetyOfficerName: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Öffentliche Funktions-E-Mail (§ 6 Pflicht) *</label>
                <input
                  type="email"
                  required
                  value={operator.mpSafetyOfficerEmail}
                  onChange={e => setOperator({ ...operator, mpSafetyOfficerEmail: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Muss auf der Website des DRK OV für Behörden und Hersteller veröffentlicht sein.
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
              >
                Betreiberdaten speichern
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: USERS & ROLES */}
      {activeTab === 'USERS' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            Benutzerkonten &amp; Rollenberechtigungen (Blueprint § 5.2)
          </h2>
          <p className="text-xs text-slate-400">
            Serverseitig geprüfte Rechte statt pauschaler Rollenvererbung.
          </p>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            {users.map(u => (
              <div key={u.id} className="p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">
                    {u.avatarInitials}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                    <div className="text-slate-400">{u.email} · {u.operationalUnit}</div>
                  </div>
                </div>

                <span className="font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BACKUP & RESTORE */}
      {activeTab === 'BACKUP' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              SQLite Online Backup &amp; Manifest (Blueprint § 12)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Konsistente Momentaufnahme aller Geräteakten, Ereignisse, Chargen, Bestände und des Audit-Trails.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Export Backup Card */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Sicherung exportieren</span>
              </div>
              <p className="text-xs text-slate-500">
                Erzeugt eine vollständige, signierte JSON-Manifestdatei inklusive aller § 14 Pflichtfelder und Bewegungszeilen.
              </p>
              <button
                onClick={handleExportBackup}
                className="px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Backup herunterladen</span>
              </button>
            </div>

            {/* Import Backup Card */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Sicherung wiederherstellen</span>
              </div>
              <p className="text-xs text-slate-500">
                Wiederherstellungstest durchführen oder ein zuvor gesichertes DRK-Manifest einspielen.
              </p>
              <label className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Datei auswählen</span>
                <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
              </label>
            </div>

          </div>

          {restoreMessage && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 text-blue-800 dark:text-blue-200 text-xs rounded-xl font-bold">
              {restoreMessage}
            </div>
          )}

          {/* Danger Zone: Reset to Factory Defaults */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-red-600">Werkseinstellungen</div>
              <div className="text-[11px] text-slate-400">Setzt alle Daten auf die initialen DRK Laupheim Testdaten zurück.</div>
            </div>
            <button
              onClick={handleFactoryReset}
              className="px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold transition"
            >
              System zurücksetzen
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
