import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Building, 
  UserCheck, 
  Truck, 
  BriefcaseMedical, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles,
  Server,
  Heart
} from 'lucide-react';
import { storage } from '../services/storage';
import { OperatorConfig, User } from '../types/inventory';

interface SetupWizardProps {
  onComplete: () => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);

  // Step 1: Operator Config
  const [operatorData, setOperatorData] = useState<OperatorConfig>({
    organizationName: 'Deutsches Rotes Kreuz Ortsverein Laupheim e.V.',
    parentOrg: 'DRK Kreisverband Biberach e.V.',
    siteName: 'Bereitschaftsheim & Fahrzeughalle Laupheim',
    address: 'Bronner Straße 34, 88471 Laupheim',
    mpSafetyOfficerName: 'Florian Mayer (Notfallsanitäter & MPG-Beauftragter)',
    mpSafetyOfficerEmail: 'mpg-sicherheit@drk-laupheim.de',
    isInstalled: true,
    installedAt: new Date().toISOString(),
    defaultTimezone: 'Europe/Berlin'
  });

  // Step 2: Admin user
  const [adminUser, setAdminUser] = useState({
    name: 'Florian Mayer',
    email: 'florian.mayer@drk-laupheim.de',
    operationalUnit: 'Bereitschaftsleitung & MPG',
    pin: '1928'
  });

  // Step 3: Preset components
  const [presets, setPresets] = useState({
    includeVehicles: true,
    includeBackpacks: true,
    includeDevices: true,
    includeFefoStock: true
  });

  const handleFinish = () => {
    // Save operator
    storage.setOperator(operatorData);

    // Save admin
    const users = storage.getUsers();
    users[0] = {
      id: 'usr-admin-1',
      name: adminUser.name,
      email: adminUser.email,
      role: 'ADMIN',
      operationalUnit: adminUser.operationalUnit,
      avatarInitials: adminUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    };
    storage.setUsers(users);
    storage.setActiveUserId(users[0].id);

    // Mark as installed
    storage.logAudit('SYSTEM', 'SETUP', `Ersteinrichtung erfolgreich abgeschlossen für ${operatorData.organizationName}.`);

    onComplete();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        
        {/* DRK Signature Red Header */}
        <div className="bg-red-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white text-red-600 flex items-center justify-center font-bold text-xl shadow-md">
              ✚
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight">
                DRK Warenbestand · Web-Installations-Assistent
              </h1>
              <div className="text-xs text-red-100">
                Ersteinrichtung nach Container-Start gem. MPBetreibV v2
              </div>
            </div>
          </div>

          <div className="text-xs font-bold px-3 py-1 bg-red-700 rounded-full">
            Schritt {step} von 4
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-4 h-1.5 bg-slate-200 dark:bg-slate-800">
          <div className={`h-full ${step >= 1 ? 'bg-red-600' : ''}`} />
          <div className={`h-full ${step >= 2 ? 'bg-red-600' : ''}`} />
          <div className={`h-full ${step >= 3 ? 'bg-red-600' : ''}`} />
          <div className={`h-full ${step >= 4 ? 'bg-red-600' : ''}`} />
        </div>

        {/* Wizard Content */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6 text-sm text-slate-700 dark:text-slate-300">
          
          {/* STEP 1: OPERATOR & SITES */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Building className="w-5 h-5 text-red-600" />
                  <span>Schritt 1: Bereitschaft &amp; Betreiber festlegen</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Rechtliche Pflichtfelder für das Bestandsverzeichnis nach § 14 und § 6 MPBetreibV.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Gliederung / Ortsverein *</label>
                  <input
                    type="text"
                    required
                    value={operatorData.organizationName}
                    onChange={e => setOperatorData({ ...operatorData, organizationName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Übergeordneter Kreisverband</label>
                    <input
                      type="text"
                      value={operatorData.parentOrg}
                      onChange={e => setOperatorData({ ...operatorData, parentOrg: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Betriebsstätte / Wache</label>
                    <input
                      type="text"
                      value={operatorData.siteName}
                      onChange={e => setOperatorData({ ...operatorData, siteName: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Anschrift der Betriebsstätte</label>
                  <input
                    type="text"
                    value={operatorData.address}
                    onChange={e => setOperatorData({ ...operatorData, address: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-red-600 block">
                    Beauftragter für Medizinproduktesicherheit (§ 6 MPBetreibV):
                  </span>
                  <div>
                    <label className="font-semibold block mb-1">Name der bestellten Person</label>
                    <input
                      type="text"
                      value={operatorData.mpSafetyOfficerName}
                      onChange={e => setOperatorData({ ...operatorData, mpSafetyOfficerName: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Öffentliche Funktions-Mail (§ 6 Pflicht)</label>
                    <input
                      type="email"
                      value={operatorData.mpSafetyOfficerEmail}
                      onChange={e => setOperatorData({ ...operatorData, mpSafetyOfficerEmail: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: INITIAL ADMIN */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-red-600" />
                  <span>Schritt 2: Administrator-Konto einrichten</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Hauptansprechpartner für die Benutzer- und Rechteverwaltung des DRK OV.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Name des Administrators *</label>
                  <input
                    type="text"
                    required
                    value={adminUser.name}
                    onChange={e => setAdminUser({ ...adminUser, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">E-Mail-Adresse *</label>
                  <input
                    type="email"
                    required
                    value={adminUser.email}
                    onChange={e => setAdminUser({ ...adminUser, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Funktion / Organisationseinheit</label>
                  <input
                    type="text"
                    value={adminUser.operationalUnit}
                    onChange={e => setAdminUser({ ...adminUser, operationalUnit: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Schnellzugriffs-PIN (für Tablets im Einsatz)</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={adminUser.pin}
                    onChange={e => setAdminUser({ ...adminUser, pin: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono tracking-widest text-center text-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PRESETS & SEEDING */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-red-600" />
                  <span>Schritt 3: DRK-Ausstattung &amp; Vorlagen</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Wählen Sie die initialen Vorlagen für den DRK Ortsverband Laupheim:
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                <label className="flex items-start space-x-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-100 transition">
                  <input
                    type="checkbox"
                    checked={presets.includeVehicles}
                    onChange={e => setPresets({ ...presets, includeVehicles: e.target.checked })}
                    className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Fuhrpark (MTW, KTW-B, GW-San)</div>
                    <div className="text-slate-400">Rotkreuz Laupheim 1/19-1, 1/26-1, 1/48-1 anlegen.</div>
                  </div>
                </label>

                <label className="flex items-start space-x-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-100 transition">
                  <input
                    type="checkbox"
                    checked={presets.includeBackpacks}
                    onChange={e => setPresets({ ...presets, includeBackpacks: e.target.checked })}
                    className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Mobile Einheiten &amp; Soll-Packlisten</div>
                    <div className="text-slate-400">Notfallrucksack San-A, Sauerstofftasche 2L, AED-Bereitschaftstasche.</div>
                  </div>
                </label>

                <label className="flex items-start space-x-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-100 transition">
                  <input
                    type="checkbox"
                    checked={presets.includeDevices}
                    onChange={e => setPresets({ ...presets, includeDevices: e.target.checked })}
                    className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Medizinprodukte § 14 (Anlage 1 &amp; 2)</div>
                    <div className="text-slate-400">ACCUVAC Pro, ZOLL AED Plus, corpuls3 Monitor, boso carat.</div>
                  </div>
                </label>

                <label className="flex items-start space-x-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-100 transition">
                  <input
                    type="checkbox"
                    checked={presets.includeFefoStock}
                    onChange={e => setPresets({ ...presets, includeFefoStock: e.target.checked })}
                    className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Sanitätsmaterial mit FEFO-Chargen</div>
                    <div className="text-slate-400">Tourniquets, Notverbände, Jonosteril-Infusionen und Kompressen.</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMATION & LAUNCH */}
          {step === 4 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Installation bereit zur Aktivierung!
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Die Bereitschaft <strong>{operatorData.organizationName}</strong> ist konfiguriert.
                  Das System ist sofort betriebsbereit für Einsätze, Wachdienste und Kontrollen.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-400">Betreiber:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{operatorData.organizationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Administrator:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{adminUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">MPG-Sicherheit:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{operatorData.mpSafetyOfficerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rechtsstand:</span>
                  <span className="font-bold text-emerald-600">MPBetreibV v2 (2025/2026)</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-white dark:hover:bg-slate-800 transition flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Zurück</span>
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center space-x-1 shadow-sm"
            >
              <span>Weiter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold transition flex items-center space-x-1 shadow-md shadow-red-500/30"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>System jetzt starten</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
