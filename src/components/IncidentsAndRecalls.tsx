import React, { useState } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Plus, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  Building2, 
  X,
  Lock,
  ExternalLink
} from 'lucide-react';
import { storage } from '../services/storage';
import { Incident, Recall } from '../types/inventory';

export const IncidentsAndRecalls: React.FC = () => {
  const [incidents, setIncidents] = useState(storage.getIncidents());
  const [recalls, setRecalls] = useState(storage.getRecalls());
  const [activeTab, setActiveTab] = useState<'INCIDENTS' | 'RECALLS'>('INCIDENTS');

  // Modals
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showRecallModal, setShowRecallModal] = useState(false);

  const devices = storage.getDevices();
  const batches = storage.getBatches();
  const products = storage.getProductTypes();
  const activeUser = storage.getActiveUser();
  const operator = storage.getOperator();

  const reloadData = () => {
    setIncidents(storage.getIncidents());
    setRecalls(storage.getRecalls());
  };

  // Incident form state
  const [incidentForm, setIncidentForm] = useState({
    deviceId: devices[0]?.id || '',
    severity: 'BEINAHE_VORKOMMNIS' as Incident['severity'],
    status: 'ASSESSMENT_REQUIRED' as Incident['status'],
    description: '',
    patientHarmOccurred: false,
    immediateMeasures: 'Gerät unverzüglich gesperrt und MPG-Sicherheitsbeauftragten informiert.'
  });

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const newInc: Incident = {
      id: 'inc-' + Date.now(),
      deviceId: incidentForm.deviceId,
      occurredAt: new Date().toISOString(),
      reportedAt: new Date().toISOString(),
      reporterName: activeUser.name,
      reporterRole: activeUser.role,
      status: incidentForm.status,
      severity: incidentForm.severity,
      description: incidentForm.description,
      patientHarmOccurred: incidentForm.patientHarmOccurred,
      immediateMeasures: incidentForm.immediateMeasures
    };

    storage.saveIncident(newInc);

    // If device selected, automatically lock it!
    if (newInc.deviceId) {
      const dev = devices.find(d => d.id === newInc.deviceId);
      if (dev && !dev.activeLocks.includes('INCIDENT_INVESTIGATION')) {
        dev.activeLocks.push('INCIDENT_INVESTIGATION');
        storage.saveDevice(dev);
        storage.addDeviceEvent({
          id: 'evt-' + Date.now(),
          deviceId: dev.id,
          eventType: 'STOERUNG',
          occurredAt: new Date().toISOString(),
          recordedBy: activeUser.name,
          summary: `Vorkommnis § 3 MPAMIV gemeldet (${newInc.severity}): ${newInc.description.slice(0, 60)}`
        });
      }
    }

    setShowIncidentModal(false);
    reloadData();
  };

  // Recall form state
  const [recallForm, setRecallForm] = useState({
    title: '',
    manufacturer: '',
    referenceNumber: `FSCA-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
    targetLotNumber: '',
    instructions: 'Chargen sperren und physisch in Quarantänelager überführen.'
  });

  const handleCreateRecall = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecall: Recall = {
      id: 'rec-' + Date.now(),
      title: recallForm.title,
      manufacturer: recallForm.manufacturer,
      referenceNumber: recallForm.referenceNumber,
      issuedAt: new Date().toISOString().split('T')[0],
      receivedAt: new Date().toISOString().split('T')[0],
      targetProductIds: [],
      targetLotNumbers: [recallForm.targetLotNumber],
      instructions: recallForm.instructions,
      activeStatus: 'ACTIVE',
      affectedLocationIds: ['loc-wache-lager']
    };

    storage.saveRecall(newRecall);
    setShowRecallModal(false);
    reloadData();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
            <span>Medizinprodukte-Sicherheit · § 3 MPAMIV &amp; Rückrufe</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Vorkommnisse &amp; Rückrufmanagement
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Meldepflicht nach § 3 MPAMIV an das BfArM und Durchsetzung von Chargen-Quarantänen.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'INCIDENTS' ? (
            <button
              onClick={() => setShowIncidentModal(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Vorkommnis § 3 MPAMIV erfassen</span>
            </button>
          ) : (
            <button
              onClick={() => setShowRecallModal(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Hersteller-Rückruf registrieren</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('INCIDENTS')}
          className={`px-4 py-2 rounded-xl transition ${activeTab === 'INCIDENTS' ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
        >
          Vorkommnisse &amp; Störungen ({incidents.length})
        </button>
        <button
          onClick={() => setActiveTab('RECALLS')}
          className={`px-4 py-2 rounded-xl transition ${activeTab === 'RECALLS' ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
        >
          Hersteller-Rückrufe &amp; FSCA ({recalls.length})
        </button>
      </div>

      {/* TAB 1: INCIDENTS */}
      {activeTab === 'INCIDENTS' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start space-x-3">
            <Building2 className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Beauftragter für Medizinproduktesicherheit (§ 6 MPBetreibV):</strong><br />
              {operator.mpSafetyOfficerName} · Offizielle Funktions-E-Mail:{' '}
              <a href={`mailto:${operator.mpSafetyOfficerEmail}`} className="text-red-600 font-bold underline">
                {operator.mpSafetyOfficerEmail}
              </a>
              <div className="text-[11px] text-slate-400 mt-1">
                Schwerwiegende Vorkommnisse sind unverzüglich über das DIMDI/BfArM-Meldeportal anzuzeigen.
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {incidents.map(inc => {
              const dev = devices.find(d => d.id === inc.deviceId);
              return (
                <div key={inc.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${inc.severity === 'SCHWERWIEGEND' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                          {inc.severity}
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                          {inc.description}
                        </h3>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Betroffenes Gerät: <strong>{dev ? `${dev.name} (${dev.inventoryNumber})` : 'Kein spezifisches Gerät'}</strong>
                      </div>
                    </div>

                    <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      Status: {inc.status}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs space-y-1">
                    <div><strong>Sofortmaßnahmen:</strong> {inc.immediateMeasures}</div>
                    <div className="text-slate-400">
                      Gemeldet am {new Date(inc.reportedAt).toLocaleDateString('de-DE')} durch {inc.reporterName} ({inc.reporterRole})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: RECALLS */}
      {activeTab === 'RECALLS' && (
        <div className="space-y-3">
          {recalls.map(r => (
            <div key={r.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">
                      RÜCKRUF
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {r.title}
                    </h3>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Hersteller: <strong>{r.manufacturer}</strong> · Ref: <code>{r.referenceNumber}</code> · Eingang: {r.receivedAt}
                  </div>
                </div>

                <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${r.activeStatus === 'ACTIVE' ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'}`}>
                  {r.activeStatus}
                </span>
              </div>

              <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl text-xs space-y-1 border border-red-200 dark:border-red-900">
                <div className="font-bold text-red-900 dark:text-red-200">
                  Gesperrte Ziel-Chargen: {r.targetLotNumbers.join(', ')}
                </div>
                <div className="text-red-800 dark:text-red-300">
                  <strong>Handlungsanweisung:</strong> {r.instructions}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: CREATE INCIDENT */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h2 className="font-bold text-base text-slate-900 dark:text-white mb-3">
              Vorkommnis / Störung erfassen (§ 3 MPAMIV)
            </h2>
            <form onSubmit={handleCreateIncident} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Medizinprodukt</label>
                <select
                  value={incidentForm.deviceId}
                  onChange={e => setIncidentForm({ ...incidentForm, deviceId: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  {devices.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.inventoryNumber})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Schweregrad</label>
                <select
                  value={incidentForm.severity}
                  onChange={e => setIncidentForm({ ...incidentForm, severity: e.target.value as any })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="BEINAHE_VORKOMMNIS">Beinahe-Vorkommnis (Kein Personenschaden)</option>
                  <option value="LEICHT">Leichte Störung / Fehlfunktion</option>
                  <option value="SCHWERWIEGEND">Mutmaßlich schwerwiegendes Vorkommnis (§ 3 MPAMIV Meldepflicht!)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Beschreibung des Sachverhalts *</label>
                <textarea
                  required
                  rows={3}
                  value={incidentForm.description}
                  onChange={e => setIncidentForm({ ...incidentForm, description: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  placeholder="Genaue Schilderung: Wann, wo und wie trat die Fehlfunktion auf?"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Sofortmaßnahmen *</label>
                <textarea
                  required
                  rows={2}
                  value={incidentForm.immediateMeasures}
                  onChange={e => setIncidentForm({ ...incidentForm, immediateMeasures: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowIncidentModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold"
                >
                  Vorkommnis protokollieren &amp; sperren
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE RECALL */}
      {showRecallModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h2 className="font-bold text-base text-slate-900 dark:text-white mb-3">
              Hersteller-Rückruf / Sicherheitskorrekturmaßnahme registrieren
            </h2>
            <form onSubmit={handleCreateRecall} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Titel / Betreff des Rückrufs *</label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Sicherheitsmitteilung Sauerstoff-Druckminderer"
                  value={recallForm.title}
                  onChange={e => setRecallForm({ ...recallForm, title: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Hersteller *</label>
                  <input
                    type="text"
                    required
                    value={recallForm.manufacturer}
                    onChange={e => setRecallForm({ ...recallForm, manufacturer: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Referenznummer *</label>
                  <input
                    type="text"
                    required
                    value={recallForm.referenceNumber}
                    onChange={e => setRecallForm({ ...recallForm, referenceNumber: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Betroffene Charge (Lot-Nummer) *</label>
                <input
                  type="text"
                  required
                  placeholder="z.B. SOEH-KMP-2023-QC oder CAT-2025-A91"
                  value={recallForm.targetLotNumber}
                  onChange={e => setRecallForm({ ...recallForm, targetLotNumber: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Diese Charge wird in allen Koffern und Lagern sofort gesperrt.
                </span>
              </div>

              <div>
                <label className="font-semibold block mb-1">Handlungsanweisungen</label>
                <textarea
                  rows={2}
                  value={recallForm.instructions}
                  onChange={e => setRecallForm({ ...recallForm, instructions: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRecallModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold"
                >
                  Rückruf aktivieren &amp; Chargen sperren
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
