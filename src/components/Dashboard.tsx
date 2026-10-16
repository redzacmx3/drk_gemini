import React from 'react';
import { 
  Stethoscope, 
  Truck, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Scan, 
  PlusCircle, 
  FileDown, 
  ArrowRight,
  ShieldAlert,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { storage } from '../services/storage';
import { exportBestandsverzeichnisCSV, printBestandsverzeichnisHTML } from '../services/exports';

interface DashboardProps {
  onNavigate: (tab: string, contextId?: string) => void;
  onOpenScanner: () => void;
  onOpenNewReceipt: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onNavigate, 
  onOpenScanner, 
  onOpenNewReceipt 
}) => {
  const operator = storage.getOperator();
  const devices = storage.getDevices();
  const locations = storage.getLocations();
  const batches = storage.getBatches();
  const balances = storage.getStockBalances();
  const auditEvents = storage.getAuditEvents().slice(0, 5);

  const now = new Date();

  // Metrics
  const activeDevices = devices.filter(d => d.lifecycleState === 'IN_SERVICE');
  const annex1Count = devices.filter(d => d.annex1Device).length;
  const annex2Count = devices.filter(d => d.annex2Device).length;

  // Due inspections
  const upcomingInspections = devices.map(d => {
    let nextDate: string | undefined = undefined;
    let type: string = '';
    if (d.nextStkDate) {
      nextDate = d.nextStkDate;
      type = 'STK (§ 12)';
    }
    if (d.nextMtkDate && (!nextDate || new Date(d.nextMtkDate) < new Date(nextDate))) {
      nextDate = d.nextMtkDate;
      type = 'MTK (§ 15)';
    }
    const daysLeft = nextDate ? Math.round((new Date(nextDate).getTime() - now.getTime()) / (1000 * 3600 * 24)) : 999;
    return { device: d, nextDate, type, daysLeft };
  }).filter(i => i.nextDate).sort((a, b) => a.daysLeft - b.daysLeft);

  const overdueInspectionsCount = upcomingInspections.filter(i => i.daysLeft < 0).length;
  const dueSoonInspectionsCount = upcomingInspections.filter(i => i.daysLeft >= 0 && i.daysLeft <= 60).length;

  // Batches expiring soon
  const expiringBatches = batches.map(b => {
    const daysLeft = Math.round((new Date(b.expiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24));
    return { batch: b, daysLeft };
  }).filter(b => b.daysLeft <= 60 && b.batch.globalState === 'AVAILABLE');

  // Packable Locations Readiness Summary
  const packableLocations = locations.filter(l => l.isPackable);
  const greenLocations = packableLocations.filter(l => (l.readinessStatus || 'GREEN') === 'GREEN').length;
  const yellowLocations = packableLocations.filter(l => l.readinessStatus === 'YELLOW').length;
  const redLocations = packableLocations.filter(l => l.readinessStatus === 'RED').length;

  return (
    <div className="space-y-6">
      
      {/* Banner / Readiness Headline */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <span>DRK Bereitschaft Laupheim · Status Einsatzbereitschaft</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Warenbestand &amp; Medizinprodukte
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Konforme Dokumentation nach MPBetreibV (Neufassung 2025/2026), § 14 Bestandsverzeichnis, 
            § 13 Medizinproduktebuch und lückenlose Chargen-FEFO-Verwaltung.
          </p>
        </div>

        {/* Global Readiness Badge */}
        <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className={`w-3.5 h-3.5 rounded-full ${redLocations > 0 ? 'bg-red-500 ring-4 ring-red-100 dark:ring-red-950' : yellowLocations > 0 ? 'bg-amber-500 ring-4 ring-amber-100 dark:ring-amber-950' : 'bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950'}`} />
          <div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">
              {redLocations > 0 ? 'Mängel vorhanden' : yellowLocations > 0 ? 'Einsatzbereit (Fristwarnung)' : 'Voll einsatzbereit'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {greenLocations} / {packableLocations.length} Einheiten geprüft grün
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Active Devices */}
        <div 
          onClick={() => onNavigate('devices')}
          className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-red-400 dark:hover:border-red-600 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Medizinprodukte § 14
            </span>
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 group-hover:scale-110 transition">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {activeDevices.length}
            </span>
            <span className="text-xs font-medium text-emerald-600">im Dienst</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2">
            <span>Anlage 1 (STK): <strong>{annex1Count}</strong></span>
            <span>·</span>
            <span>Anlage 2 (MTK): <strong>{annex2Count}</strong></span>
          </div>
        </div>

        {/* KPI 2: Due Inspections */}
        <div 
          onClick={() => onNavigate('devices')}
          className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-400 dark:hover:border-amber-600 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              STK / MTK Fristen
            </span>
            <div className={`p-2 rounded-lg ${overdueInspectionsCount > 0 ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'} group-hover:scale-110 transition`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {dueSoonInspectionsCount + overdueInspectionsCount}
            </span>
            <span className="text-xs font-medium text-slate-500">Prüfungen fällig</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {overdueInspectionsCount > 0 ? (
              <span className="text-red-600 font-bold">{overdueInspectionsCount} überfällig!</span>
            ) : (
              <span>Nächste in {upcomingInspections[0]?.daysLeft ?? '-'} Tagen</span>
            )}
          </div>
        </div>

        {/* KPI 3: Mobile Units */}
        <div 
          onClick={() => onNavigate('locations')}
          className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-600 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Fahrzeuge &amp; Koffer
            </span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {packableLocations.length}
            </span>
            <span className="text-xs font-medium text-slate-500">Einheiten</span>
          </div>
          <div className="mt-2 text-xs flex items-center space-x-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">{greenLocations} Grün</span>
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 ml-1.5" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">{yellowLocations} Gelb</span>
          </div>
        </div>

        {/* KPI 4: FEFO Batch Expiry */}
        <div 
          onClick={() => onNavigate('stock')}
          className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-400 dark:hover:border-emerald-600 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              FEFO Verfallsdaten
            </span>
            <div className={`p-2 rounded-lg ${expiringBatches.length > 0 ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40'} group-hover:scale-110 transition`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {expiringBatches.length}
            </span>
            <span className="text-xs font-medium text-slate-500">&lt; 60 Tage Restlaufzeit</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {expiringBatches.length > 0 ? 'FEFO Austausch einplanen' : 'Alle Chargen haltbar'}
          </div>
        </div>

      </div>

      {/* Quick Action Bar */}
      <div className="bg-slate-100 dark:bg-slate-800/60 p-3 sm:p-4 rounded-xl flex flex-wrap gap-2.5 items-center justify-between">
        <div className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider px-1">
          Schnellaktionen:
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onOpenScanner}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Kamera / GS1 Scanner</span>
          </button>
          <button
            onClick={onOpenNewReceipt}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition"
          >
            <PlusCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Wareneingang buchen</span>
          </button>
          <button
            onClick={() => onNavigate('locations')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kofferprüfung starten</span>
          </button>
          <button
            onClick={() => printBestandsverzeichnisHTML()}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-600" />
            <span>§ 14 Verzeichnis Drucken</span>
          </button>
          <button
            onClick={() => exportBestandsverzeichnisCSV()}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition"
          >
            <span>§ 14 CSV Export</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Vehicles/Bags & Upcoming Fristen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Vehicles & Bags Status */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-red-600" />
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Einsatzfahrzeuge &amp; Notfallausstattung
              </h2>
            </div>
            <button
              onClick={() => onNavigate('locations')}
              className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center space-x-1"
            >
              <span>Alle Standorte</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {packableLocations.map(loc => {
              const status = loc.readinessStatus || 'GREEN';
              return (
                <div 
                  key={loc.id}
                  onClick={() => onNavigate('locations', loc.id)}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${status === 'GREEN' ? 'bg-emerald-500' : status === 'YELLOW' ? 'bg-amber-500' : 'bg-red-500'}`} />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                        <span>{loc.name}</span>
                        {loc.vehicleRadioCall && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                            {loc.vehicleRadioCall}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Code: <code className="text-slate-500">{loc.code}</code> · Zuletzt geprüft: {loc.lastCheckedAt ? new Date(loc.lastCheckedAt).toLocaleDateString('de-DE') : 'Noch nicht'} durch {loc.lastCheckedBy || '-'}
                      </div>
                    </div>
                  </div>

                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                    status === 'GREEN' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                      : status === 'YELLOW'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                  }`}>
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Inspections (STK & MTK Fristen) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-red-600" />
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Fällige Kontrollfristen (§ 12 STK / § 15 MTK)
              </h2>
            </div>
            <button
              onClick={() => onNavigate('devices')}
              className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center space-x-1"
            >
              <span>Geräteakte</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {upcomingInspections.slice(0, 4).map(item => (
              <div 
                key={item.device.id} 
                onClick={() => onNavigate('devices', item.device.id)}
                className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-lg transition cursor-pointer"
              >
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.device.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Inv.-Nr: <code>{item.device.inventoryNumber}</code> · Zuordnung: {item.device.operationalUnit}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {item.type}: {item.nextDate}
                  </div>
                  <div className={`text-[11px] font-semibold ${item.daysLeft < 0 ? 'text-red-600' : item.daysLeft <= 60 ? 'text-amber-600' : 'text-slate-500'}`}>
                    {item.daysLeft < 0 ? `Überfällig (${Math.abs(item.daysLeft)} Tage)` : `in ${item.daysLeft} Tagen`}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {upcomingInspections.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              Keine anstehenden Fristen im aktuellen Zeitraum.
            </div>
          )}
        </div>

      </div>

      {/* Audit Log Stream */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-red-600" />
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Revisionssicheres Nachweis- &amp; Audit-Protokoll
            </h2>
          </div>
          <span className="text-xs text-slate-400">Letzte Aktionen</span>
        </div>

        <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
          {auditEvents.map(evt => (
            <div key={evt.id} className="py-2.5 flex items-start space-x-3 text-xs">
              <span className="text-slate-400 font-mono flex-shrink-0 pt-0.5">
                {new Date(evt.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className="flex-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {evt.actor}
                </span>
                <span className="text-slate-500 dark:text-slate-400 ml-2">
                  {evt.summary}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
