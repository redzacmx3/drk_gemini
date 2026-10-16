import React, { useState } from 'react';
import { 
  BriefcaseMedical, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Calendar, 
  UserCheck, 
  QrCode, 
  Printer, 
  ShieldCheck, 
  ChevronRight, 
  X,
  Stethoscope,
  Package,
  Layers
} from 'lucide-react';
import { storage } from '../services/storage';
import { printKofferCheckProtocolHTML } from '../services/exports';
import { Location, ReadinessCheck, ReadinessIssue } from '../types/inventory';

interface LocationsAndKofferProps {
  initialLocationId?: string;
}

export const LocationsAndKoffer: React.FC<LocationsAndKofferProps> = ({ initialLocationId }) => {
  const [locations, setLocations] = useState(storage.getLocations());
  const [selectedLocId, setSelectedLocId] = useState<string>(
    initialLocationId || locations.find(l => l.isPackable)?.id || locations[0].id
  );

  // Check Modal
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [visualCheckConfirmed, setVisualCheckConfirmed] = useState(false);
  const [sealNumber, setSealNumber] = useState('');
  const [checkNotes, setCheckNotes] = useState('');

  const activeUser = storage.getActiveUser();
  const selectedLocation = locations.find(l => l.id === selectedLocId) || locations[0];

  const reloadData = () => {
    setLocations(storage.getLocations());
  };

  // Evaluate readiness for selected location
  const evaluation = storage.calculateLocationReadiness(selectedLocation.id);

  const handleStartCheck = () => {
    setVisualCheckConfirmed(false);
    setSealNumber(selectedLocation.code + '-PL-' + Math.floor(1000 + Math.random() * 9000));
    setCheckNotes('');
    setShowCheckModal(true);
  };

  const handleCompleteCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visualCheckConfirmed) {
      alert('Bitte bestätigen Sie die physische Sichtprüfung und Unversehrtheit der Materialien.');
      return;
    }

    const checkRecord: ReadinessCheck = {
      id: 'chk-' + Date.now(),
      locationId: selectedLocation.id,
      packlistVersion: evaluation.packlist?.version || '2026.1',
      checkedAt: new Date().toISOString(),
      checkedBy: activeUser.name,
      readiness: evaluation.status,
      visualCheckOk: true,
      tamperSealIntact: true,
      tamperSealNumber: sealNumber,
      issues: evaluation.issues,
      notes: checkNotes
    };

    storage.recordReadinessCheck(checkRecord);
    setShowCheckModal(false);
    reloadData();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
            <span>Ortsverband Laupheim · Mobile Einsatzbereitschaft</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Standorte, Fuhrpark &amp; Kofferprüfungen
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hierarchische Lagerstruktur (Wache &rarr; Einsatzfahrzeuge &rarr; Notfallrucksäcke) und digitale Checklisten.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {selectedLocation.isPackable && (
            <button
              onClick={handleStartCheck}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Kofferprüfung starten</span>
            </button>
          )}
          <button
            onClick={() => setShowQrModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <QrCode className="w-4 h-4 text-slate-600" />
            <span>QR-Tag anzeigen</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar List of Locations + Detailed View of Selected Unit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Location Tree List */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Bereitschaftseinheiten &amp; Standorte
          </div>

          <div className="space-y-2">
            {locations.map(loc => {
              const isSelected = loc.id === selectedLocation.id;
              const isPackable = loc.isPackable;
              const status = loc.readinessStatus || 'GREEN';

              return (
                <div
                  key={loc.id}
                  onClick={() => setSelectedLocId(loc.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected 
                      ? 'bg-red-50 dark:bg-red-950/30 border-red-500 shadow-sm' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      loc.type === 'VEHICLE' 
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400' 
                        : loc.type === 'CONTAINER_BAG' 
                        ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                    }`}>
                      {loc.type === 'VEHICLE' ? <Truck className="w-4 h-4" /> : <BriefcaseMedical className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                        <span>{loc.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {loc.code}
                      </div>
                    </div>
                  </div>

                  {isPackable && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      status === 'GREEN' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                        : status === 'YELLOW' 
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' 
                        : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    }`}>
                      {status}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Columns: Detailed Readiness & Packlist Assessment */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Current Unit Status */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {selectedLocation.name}
                  </h2>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                    {selectedLocation.code}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedLocation.description || 'Bereitschaftsausstattung DRK OV Laupheim'}
                </p>
              </div>

              {/* Status Badge & Check Trigger */}
              <div className="flex items-center space-x-3">
                <div className={`px-4 py-2 rounded-xl border flex items-center space-x-2 ${
                  evaluation.status === 'GREEN'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
                    : evaluation.status === 'YELLOW'
                    ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900'
                    : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900'
                }`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${evaluation.status === 'GREEN' ? 'bg-emerald-500' : evaluation.status === 'YELLOW' ? 'bg-amber-500' : 'bg-red-500'}`} />
                  <span className="text-xs font-extrabold uppercase">
                    Status: {evaluation.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Check Details */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block font-semibold">Letzte Prüfung:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedLocation.lastCheckedAt ? new Date(selectedLocation.lastCheckedAt).toLocaleString('de-DE') : 'Ausstehend'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Geprüft durch:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedLocation.lastCheckedBy || '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Zugeordnete Packliste:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {evaluation.packlist?.name || 'Keine feste Packliste'}
                </span>
              </div>
            </div>

            {/* Issues / Findings List */}
            {evaluation.issues.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 space-y-2">
                <div className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center space-x-1.5 uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Festgestellte Abweichungen ({evaluation.issues.length})</span>
                </div>
                <div className="space-y-1.5 text-xs text-amber-800 dark:text-amber-200">
                  {evaluation.issues.map((iss, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${iss.severity === 'CRITICAL' ? 'bg-red-200 text-red-900' : 'bg-amber-200 text-amber-900'}`}>
                        {iss.severity}
                      </span>
                      <span>{iss.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section: Required Packlist Items Comparison */}
          {evaluation.packlist && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-red-600" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Soll-Packliste Abgleich (Soll vs. Ist)
                  </h3>
                </div>
                <span className="text-xs text-slate-400">Version {evaluation.packlist.version}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Artikel</th>
                      <th className="py-2.5 px-3">Soll</th>
                      <th className="py-2.5 px-3">Ist (Verfügbar)</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                    {evaluation.evaluatedItems.map(item => (
                      <tr key={item.product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-medium">
                          {item.product.name}
                          <div className="text-[10px] text-slate-400 font-mono">{item.product.itemNumber}</div>
                        </td>
                        <td className="py-2.5 px-3 font-bold">
                          {item.required} {item.product.baseUnit}
                        </td>
                        <td className="py-2.5 px-3 font-bold">
                          <span className={item.available < item.required ? 'text-red-600 font-extrabold' : 'text-slate-900 dark:text-white'}>
                            {item.available} {item.product.baseUnit}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {item.isOk ? (
                            <span className="inline-flex items-center space-x-1 text-emerald-600 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Vollständig</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-red-600 font-bold">
                              <AlertOctagon className="w-3.5 h-3.5" />
                              <span>Fehlbestand (-{item.required - item.available})</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: Assigned Medical Devices */}
          {evaluation.assignedDevices.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Stethoscope className="w-4 h-4 text-red-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Verlastete Medizinprodukte (§ 14 Bestandsverzeichnis)
                </h3>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {evaluation.assignedDevices.map(({ device, isOverdue, isLocked }) => (
                  <div key={device.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{device.name}</div>
                      <div className="text-slate-400 font-mono">
                        Inv: {device.inventoryNumber} · SN: {device.serialOrLotNumber}
                      </div>
                    </div>

                    <div className="text-right">
                      {isLocked ? (
                        <span className="text-red-600 font-bold">Gesperrt!</span>
                      ) : isOverdue ? (
                        <span className="text-red-600 font-bold">Prüffrist überfällig!</span>
                      ) : (
                        <span className="text-emerald-600 font-bold">Prüfung gültig (STK: {device.nextStkDate || '-'})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODAL: INTERACTIVE KOFFERPRÜFUNG */}
      {showCheckModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-red-600" />
                <span>Kofferprüfung dokumentieren</span>
              </h2>
              <button onClick={() => setShowCheckModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteCheck} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                <div><strong>Einheit:</strong> {selectedLocation.name} ({selectedLocation.code})</div>
                <div><strong>Prüfer:</strong> {activeUser.name} ({activeUser.role})</div>
                <div><strong>Datum / Zeit:</strong> {new Date().toLocaleString('de-DE')}</div>
                <div>
                  <strong>Berechnete Einsatzbereitschaft:</strong>{' '}
                  <span className={`font-bold uppercase ${evaluation.status === 'GREEN' ? 'text-emerald-600' : evaluation.status === 'YELLOW' ? 'text-amber-600' : 'text-red-600'}`}>
                    {evaluation.status}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Plombennummer (Tamper Seal)</label>
                <input
                  type="text"
                  value={sealNumber}
                  onChange={e => setSealNumber(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  placeholder="z.B. PL-2026-9812"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Bemerkungen / Feststellungen</label>
                <textarea
                  rows={2}
                  value={checkNotes}
                  onChange={e => setCheckNotes(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  placeholder="z.B. Alle Reißverschlüsse intakt, Sauerstoffflasche 200 bar befüllt"
                />
              </div>

              <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={visualCheckConfirmed}
                    onChange={e => setVisualCheckConfirmed(e.target.checked)}
                    className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                  />
                  <span className="text-slate-800 dark:text-slate-200">
                    <strong>Physische Sichtprüfung bestätigt:</strong> Ich habe mich gem. § 4 MPBetreibV 
                    von der Funktionsfähigkeit, Sauberkeit und Sterilverpackung aller enthaltenen Materialien überzeugt.
                  </span>
                </label>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCheckModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  Prüfung abschließen &amp; speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QR TAG VIEW */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center">
            <h2 className="font-bold text-base text-slate-900 dark:text-white mb-1">
              QR-Standort-Tag
            </h2>
            <div className="text-xs text-slate-400 mb-4">
              Zum Aufkleben auf Koffer, Rucksack oder Fahrzeugfach
            </div>

            <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-2xl inline-block border-2 border-slate-300 dark:border-slate-700 mb-4">
              <QrCode className="w-32 h-32 mx-auto text-slate-900 dark:text-white" />
              <div className="mt-2 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                {selectedLocation.qrCode}
              </div>
            </div>

            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-4">
              {selectedLocation.name}
            </div>

            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setShowQrModal(false)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
