import React, { useState } from 'react';
import { 
  Stethoscope, 
  Search, 
  Plus, 
  FileDown, 
  Printer, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Lock, 
  Unlock, 
  FileText, 
  UserCheck, 
  Building, 
  MapPin, 
  Calendar,
  X,
  ShieldCheck,
  History,
  QrCode
} from 'lucide-react';
import { storage, calculateNextInspectionDate } from '../services/storage';
import { exportBestandsverzeichnisCSV, printBestandsverzeichnisHTML, printMedizinproduktebuchHTML } from '../services/exports';
import { Device, DeviceEvent, Instruction, EconomicActor } from '../types/inventory';

interface DevicesViewProps {
  selectedDeviceId?: string;
}

export const DevicesView: React.FC<DevicesViewProps> = ({ selectedDeviceId }) => {
  const [devices, setDevices] = useState(storage.getDevices());
  const [activeDevice, setActiveDevice] = useState<Device | null>(
    selectedDeviceId ? devices.find(d => d.id === selectedDeviceId) || null : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'ANNEX1' | 'ANNEX2' | 'LOCKED'>('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [showDefectModal, setShowDefectModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'MASTER' | 'BOOK' | 'INSTRUCTIONS' | 'INSPECTIONS' | 'LOCKS'>('MASTER');

  const locations = storage.getLocations();
  const actors = storage.getEconomicActors();
  const activeUser = storage.getActiveUser();

  const reloadData = () => {
    const list = storage.getDevices();
    setDevices(list);
    if (activeDevice) {
      setActiveDevice(list.find(d => d.id === activeDevice.id) || null);
    }
  };

  // Filtered devices
  const filteredDevices = devices.filter(d => {
    const matchesSearch = 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.inventoryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.serialOrLotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.modelType.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === 'ANNEX1') return d.annex1Device;
    if (filterType === 'ANNEX2') return d.annex2Device;
    if (filterType === 'LOCKED') return d.activeLocks.length > 0;
    return true;
  });

  // Handle new Device form state
  const [newDevice, setNewDevice] = useState({
    inventoryNumber: `MP-LPH-2026-${(devices.length + 1).toString().padStart(3, '0')}`,
    name: '',
    deviceType: '',
    modelType: '',
    serialOrLotNumber: '',
    acquisitionYear: 2026,
    economicActorId: actors[0]?.id || '',
    locationId: locations[0]?.id || '',
    operationalUnit: 'Bereitschaft Laupheim',
    ceMarking: 'CE 0123',
    mdrClass: 'IIa' as const,
    annex1Device: true,
    annex2Device: false,
    stkIntervalMonths: 24,
    mtkIntervalMonths: 24
  });

  const handleCreateDevice = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    const initialStk = newDevice.annex1Device 
      ? calculateNextInspectionDate('STK', today, newDevice.stkIntervalMonths) 
      : undefined;
    const initialMtk = newDevice.annex2Device 
      ? calculateNextInspectionDate('MTK', today, newDevice.mtkIntervalMonths) 
      : undefined;

    const deviceToSave: Device = {
      id: 'dev-' + Date.now(),
      inventoryNumber: newDevice.inventoryNumber,
      name: newDevice.name,
      deviceType: newDevice.deviceType,
      modelType: newDevice.modelType,
      serialOrLotNumber: newDevice.serialOrLotNumber,
      acquisitionYear: Number(newDevice.acquisitionYear),
      economicActorId: newDevice.economicActorId,
      locationId: newDevice.locationId,
      operationalUnit: newDevice.operationalUnit,
      ceMarking: newDevice.ceMarking,
      mdrClass: newDevice.mdrClass,
      activeNonImplantable: true,
      annex1Device: newDevice.annex1Device,
      annex2Device: newDevice.annex2Device,
      lifecycleState: 'IN_SERVICE',
      activeLocks: [],
      rules: {
        stkRequired: newDevice.annex1Device,
        stkIntervalMonths: newDevice.stkIntervalMonths,
        mtkRequired: newDevice.annex2Device,
        mtkIntervalMonths: newDevice.mtkIntervalMonths,
        dguvV3Required: true,
        dguvV3IntervalMonths: 12,
        maintenanceRequired: true
      },
      nextStkDate: initialStk,
      nextMtkDate: initialMtk
    };

    storage.saveDevice(deviceToSave);

    // Initial event in Medizinproduktebuch (§ 13)
    storage.addDeviceEvent({
      id: 'evt-' + Date.now(),
      deviceId: deviceToSave.id,
      eventType: 'INBETRIEBNAHME',
      occurredAt: new Date().toISOString(),
      recordedBy: activeUser.name,
      summary: `Erstinbetriebnahme gem. § 11 MPBetreibV dokumentiert.`,
      protocolNumber: `IBN-${deviceToSave.inventoryNumber}`
    });

    setShowAddModal(false);
    reloadData();
    setActiveDevice(deviceToSave);
  };

  // Inspection submission handler
  const [inspectionForm, setInspectionForm] = useState({
    type: 'STK' as 'STK' | 'MTK' | 'DGUV_V3',
    inspectorName: activeUser.name,
    inspectorCompany: 'DRK Landesverband Medizintechnik',
    result: 'PASSED' as 'PASSED' | 'DEFECTS_FOUND' | 'FAILED',
    protocolNumber: `STK-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
    notes: 'Prüfung ohne sicherheitsrelevante Beanstandungen durchgeführt.'
  });

  const handleRecordInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDevice) return;

    const today = new Date().toISOString().split('T')[0];
    const interval = inspectionForm.type === 'STK' 
      ? (activeDevice.rules.stkIntervalMonths || 24)
      : (activeDevice.rules.mtkIntervalMonths || 24);

    const nextDueDate = calculateNextInspectionDate(inspectionForm.type, today, interval);

    // Update Device next date
    const updatedDevice = { ...activeDevice };
    if (inspectionForm.type === 'STK') {
      updatedDevice.nextStkDate = nextDueDate;
    } else if (inspectionForm.type === 'MTK') {
      updatedDevice.nextMtkDate = nextDueDate;
    }
    storage.saveDevice(updatedDevice);

    // Record Event in MP-Buch
    storage.addDeviceEvent({
      id: 'evt-' + Date.now(),
      deviceId: activeDevice.id,
      eventType: inspectionForm.type === 'STK' ? 'STK_PRUEFUNG' : 'MTK_PRUEFUNG',
      occurredAt: new Date().toISOString(),
      recordedBy: `${inspectionForm.inspectorName} (${inspectionForm.inspectorCompany})`,
      summary: `${inspectionForm.type}-Prüfung: Ergebnis ${inspectionForm.result}. Nächste Frist: ${nextDueDate}.`,
      protocolNumber: inspectionForm.protocolNumber
    });

    setShowInspectionModal(false);
    reloadData();
  };

  // Instruction submission handler (§ 4 / § 11)
  const [instructionForm, setInstructionForm] = useState({
    personName: '',
    qualification: 'Rettungssanitäter',
    instructorName: activeUser.name,
    type: 'ANWENDER_PARAGRAPH_4' as Instruction['type'],
    manualVersion: 'Aktuelle Gebrauchsanweisung des Herstellers'
  });

  const handleRecordInstruction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDevice) return;

    storage.addInstruction({
      id: 'inst-' + Date.now(),
      deviceId: activeDevice.id,
      personName: instructionForm.personName,
      qualification: instructionForm.qualification,
      instructorName: instructionForm.instructorName,
      instructionDate: new Date().toISOString().split('T')[0],
      type: instructionForm.type,
      manualVersion: instructionForm.manualVersion
    });

    storage.addDeviceEvent({
      id: 'evt-' + Date.now(),
      deviceId: activeDevice.id,
      eventType: 'EINWEISUNG',
      occurredAt: new Date().toISOString(),
      recordedBy: activeUser.name,
      summary: `Einweisung für ${instructionForm.personName} (${instructionForm.type === 'BEAUFTRAGTE_PERSON_PARAGRAPH_11' ? '§ 11 Beauftragte Person' : '§ 4 Anwender'}) dokumentiert.`
    });

    setShowInstructionModal(false);
    reloadData();
  };

  // Defect / Lock handler
  const [defectReason, setDefectReason] = useState('');
  const handleReportDefect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDevice) return;

    const updated = { ...activeDevice };
    if (!updated.activeLocks.includes('DEFECT')) {
      updated.activeLocks.push('DEFECT');
    }
    storage.saveDevice(updated);

    storage.addDeviceEvent({
      id: 'evt-' + Date.now(),
      deviceId: activeDevice.id,
      eventType: 'STOERUNG',
      occurredAt: new Date().toISOString(),
      recordedBy: activeUser.name,
      summary: `Gerätesperre wegen Defekt gesetzt: ${defectReason}`
    });

    setShowDefectModal(false);
    setDefectReason('');
    reloadData();
  };

  const handleReleaseLock = (lock: string) => {
    if (!activeDevice) return;
    const updated = { ...activeDevice };
    updated.activeLocks = updated.activeLocks.filter(l => l !== lock);
    storage.saveDevice(updated);

    storage.addDeviceEvent({
      id: 'evt-' + Date.now(),
      deviceId: activeDevice.id,
      eventType: 'FREIGABE',
      occurredAt: new Date().toISOString(),
      recordedBy: activeUser.name,
      summary: `Sperre [${lock}] aufgehoben nach fachlicher Prüfung und Freigabe durch ${activeUser.name}.`
    });
    reloadData();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action & Export Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
            <span>MPBetreibV · § 14 Bestandsverzeichnis &amp; § 13 MP-Buch</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Medizinprodukte &amp; Geräteakten
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gesetzliches Verzeichnis aller aktiven nichtimplantierbaren Medizinprodukte der Betriebsstätte Laupheim.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Neues Gerät anlegen</span>
          </button>
          <button
            onClick={printBestandsverzeichnisHTML}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <Printer className="w-4 h-4 text-red-600" />
            <span>§ 14 Druckansicht</span>
          </button>
          <button
            onClick={exportBestandsverzeichnisCSV}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <FileDown className="w-4 h-4 text-emerald-600" />
            <span>§ 14 CSV Export</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Suche nach Name, Inv.-Nr, Seriennummer oder Modell..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg transition ${filterType === 'ALL' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Alle ({devices.length})
          </button>
          <button
            onClick={() => setFilterType('ANNEX1')}
            className={`px-3 py-1.5 rounded-lg transition ${filterType === 'ANNEX1' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Anlage 1 (STK)
          </button>
          <button
            onClick={() => setFilterType('ANNEX2')}
            className={`px-3 py-1.5 rounded-lg transition ${filterType === 'ANNEX2' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Anlage 2 (MTK)
          </button>
          <button
            onClick={() => setFilterType('LOCKED')}
            className={`px-3 py-1.5 rounded-lg transition ${filterType === 'LOCKED' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Gesperrt
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Inventarnummer</th>
                <th className="py-3 px-4">Bezeichnung &amp; Typ</th>
                <th className="py-3 px-4">Serien- / Los-Nr.</th>
                <th className="py-3 px-4">Anschaffung</th>
                <th className="py-3 px-4">Standort</th>
                <th className="py-3 px-4">Pflichtkontrollen</th>
                <th className="py-3 px-4">Nächste Frist</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {filteredDevices.map(d => {
                const loc = locations.find(l => l.id === d.locationId);
                const isLocked = d.activeLocks.length > 0;
                return (
                  <tr 
                    key={d.id} 
                    onClick={() => setActiveDevice(d)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-red-600 dark:text-red-400">
                      {d.inventoryNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{d.name}</div>
                      <div className="text-[11px] text-slate-400">{d.modelType}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {d.serialOrLotNumber}
                    </td>
                    <td className="py-3 px-4">
                      {d.acquisitionYear}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{loc?.name || '-'}</div>
                      <div className="text-[10px] text-slate-400">{d.operationalUnit}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {d.annex1Device && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                            STK (§12)
                          </span>
                        )}
                        {d.annex2Device && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                            MTK (§15)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {d.nextStkDate ? (
                        <div className="text-slate-900 dark:text-white font-mono">
                          STK: {d.nextStkDate}
                        </div>
                      ) : d.nextMtkDate ? (
                        <div className="text-slate-900 dark:text-white font-mono">
                          MTK: {d.nextMtkDate}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {isLocked ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                          <Lock className="w-3 h-3" />
                          <span>Gesperrt</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle className="w-3 h-3" />
                          <span>Einsatzbereit</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDevice(d);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-red-50 text-slate-700 dark:text-slate-200 hover:text-red-600 font-semibold text-[11px] transition"
                      >
                        Akte öffnen
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Device Details Modal (§ 13 Medizinproduktebuch) */}
      {activeDevice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {activeDevice.name}
                    </h2>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                      {activeDevice.inventoryNumber}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {activeDevice.modelType} · Seriennummer: {activeDevice.serialOrLotNumber}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => printMedizinproduktebuchHTML(activeDevice.id)}
                  title="Medizinproduktebuch gem. § 13 MPBetreibV drucken"
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-red-600 transition"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveDevice(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 text-xs font-bold overflow-x-auto">
              <button
                onClick={() => setActiveTab('MASTER')}
                className={`py-3 px-3 border-b-2 transition whitespace-nowrap ${activeTab === 'MASTER' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                § 14 Stammdaten
              </button>
              <button
                onClick={() => setActiveTab('BOOK')}
                className={`py-3 px-3 border-b-2 transition whitespace-nowrap ${activeTab === 'BOOK' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                § 13 MP-Buch Ereignisse
              </button>
              <button
                onClick={() => setActiveTab('INSPECTIONS')}
                className={`py-3 px-3 border-b-2 transition whitespace-nowrap ${activeTab === 'INSPECTIONS' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                STK &amp; MTK Fristen
              </button>
              <button
                onClick={() => setActiveTab('INSTRUCTIONS')}
                className={`py-3 px-3 border-b-2 transition whitespace-nowrap ${activeTab === 'INSTRUCTIONS' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Einweisungen (§ 4 / § 11)
              </button>
              <button
                onClick={() => setActiveTab('LOCKS')}
                className={`py-3 px-3 border-b-2 transition whitespace-nowrap ${activeTab === 'LOCKS' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Sperren &amp; Defekte ({activeDevice.activeLocks.length})
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              
              {/* TAB 1: MASTER DATA § 14 */}
              {activeTab === 'MASTER' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold block">Bezeichnung (§ 14 Pflichtfeld)</span>
                      <span className="font-bold text-slate-900 dark:text-white">{activeDevice.name}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-semibold block">Geräte-Art</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{activeDevice.deviceType}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-semibold block">Typ / Modell</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{activeDevice.modelType}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-semibold block">Serien- oder Losnummer</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{activeDevice.serialOrLotNumber}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-semibold block">Anschaffungsjahr (§ 14 Pflicht)</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{activeDevice.acquisitionYear}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-semibold block">CE-Kennzeichen / MDR-Klasse</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{activeDevice.ceMarking || 'CE'} (Klasse {activeDevice.mdrClass || 'IIa'})</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-semibold block">Aktueller Standort</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {locations.find(l => l.id === activeDevice.locationId)?.name || 'Nicht zugewiesen'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-semibold block">Betriebliche Zuordnung</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{activeDevice.operationalUnit}</span>
                    </div>
                  </div>

                  {/* Economic Actor Info */}
                  <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-xl bg-white dark:bg-slate-900">
                    <span className="text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider block mb-1">
                      Wirtschaftsakteur gem. § 14 MPBetreibV
                    </span>
                    {(() => {
                      const actor = actors.find(a => a.id === activeDevice.economicActorId);
                      if (!actor) return <span className="text-slate-400">Kein Wirtschaftsakteur hinterlegt</span>;
                      return (
                        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{actor.name} ({actor.role})</div>
                          <div>{actor.address}, {actor.city}, {actor.country}</div>
                          {actor.contactEmail && <div>Kontakt: {actor.contactEmail}</div>}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* TAB 2: § 13 MP-BUCH TIMELINE */}
              {activeTab === 'BOOK' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      Lückenloser Nachweisverlauf gem. § 13
                    </span>
                    <button
                      onClick={() => printMedizinproduktebuchHTML(activeDevice.id)}
                      className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center space-x-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Buch als PDF/Druck ausgeben</span>
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    {storage.getDeviceEvents(activeDevice.id).map(evt => (
                      <div key={evt.id} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-red-600 dark:text-red-400">
                            {evt.eventType}
                          </span>
                          <span className="text-slate-400 font-mono">
                            {new Date(evt.occurredAt).toLocaleDateString('de-DE')}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1">
                          {evt.summary}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Dokumentiert durch: {evt.recordedBy} {evt.protocolNumber ? `· Protokoll: ${evt.protocolNumber}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: INSPECTIONS & DEADLINES */}
              {activeTab === 'INSPECTIONS' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">Kontrollfristen &amp; Prüfungen</h3>
                      <p className="text-xs text-slate-400">Automatische Fristberechnung nach § 12 (Monatsende) &amp; § 15 (Jahresende)</p>
                    </div>
                    <button
                      onClick={() => setShowInspectionModal(true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition"
                    >
                      Neue Prüfung dokumentieren
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                      <div className="text-xs font-bold text-slate-500 uppercase">Sicherheitstechnische Kontrolle (STK § 12)</div>
                      <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                        {activeDevice.nextStkDate ? activeDevice.nextStkDate : 'Nicht erforderlich'}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Regelintervall: {activeDevice.rules.stkIntervalMonths || 24} Monate zum Monatsende
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                      <div className="text-xs font-bold text-slate-500 uppercase">Messtechnische Kontrolle (MTK § 15)</div>
                      <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                        {activeDevice.nextMtkDate ? activeDevice.nextMtkDate : 'Nicht erforderlich'}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Regelintervall: {activeDevice.rules.mtkIntervalMonths || 24} Monate zum Jahresende
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: INSTRUCTIONS § 4 / § 11 */}
              {activeTab === 'INSTRUCTIONS' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">Dokumentierte Einweisungen</h3>
                      <p className="text-xs text-slate-400">§ 11 (Beauftragte Personen) &amp; § 4 (Benutzer-Einweisungen)</p>
                    </div>
                    <button
                      onClick={() => setShowInstructionModal(true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition"
                    >
                      Einweisung erfassen
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    {storage.getInstructions(activeDevice.id).map(inst => (
                      <div key={inst.id} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {inst.personName} ({inst.qualification})
                          </span>
                          <span className="text-slate-400 font-mono">{inst.instructionDate}</span>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          Unterwiesen durch: <strong>{inst.instructorName}</strong> · Typ: {inst.type === 'BEAUFTRAGTE_PERSON_PARAGRAPH_11' ? '§ 11 Beauftragte Person' : '§ 4 Anwender'}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Handbuch: {inst.manualVersion}
                        </div>
                      </div>
                    ))}
                    {storage.getInstructions(activeDevice.id).length === 0 && (
                      <div className="p-6 text-center text-xs text-slate-400">
                        Noch keine Einweisungen digital hinterlegt.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: LOCKS & DEFECTS */}
              {activeTab === 'LOCKS' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">Sperrungen &amp; Defektmeldungen</h3>
                      <p className="text-xs text-slate-400">Aktive Sperren verhindern die Freigabe des Geräts und warnen im Koffer-Check</p>
                    </div>
                    <button
                      onClick={() => setShowDefectModal(true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition flex items-center space-x-1"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Defekt melden &amp; sperren</span>
                    </button>
                  </div>

                  {activeDevice.activeLocks.length > 0 ? (
                    <div className="space-y-2">
                      {activeDevice.activeLocks.map(lock => (
                        <div key={lock} className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-red-800 dark:text-red-200 text-xs font-bold">
                            <Lock className="w-4 h-4 text-red-600" />
                            <span>Gesperrt: {lock}</span>
                          </div>
                          <button
                            onClick={() => handleReleaseLock(lock)}
                            className="px-2.5 py-1 text-xs font-bold rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
                          >
                            Freigeben / Entsperren
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl text-center text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                      Keine aktiven Sperren. Das Gerät ist einsatzbereit.
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW DEVICE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Neues Medizinprodukt erfassen (§ 14 MPBetreibV)
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDevice} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">Inventarnummer *</label>
                  <input
                    type="text"
                    required
                    value={newDevice.inventoryNumber}
                    onChange={e => setNewDevice({ ...newDevice, inventoryNumber: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">Anschaffungsjahr (§14 Pflicht) *</label>
                  <input
                    type="number"
                    required
                    value={newDevice.acquisitionYear}
                    onChange={e => setNewDevice({ ...newDevice, acquisitionYear: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">Bezeichnung (§ 14) *</label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Defibrillator ZOLL AED 3"
                  value={newDevice.name}
                  onChange={e => setNewDevice({ ...newDevice, name: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">Geräte-Art *</label>
                  <input
                    type="text"
                    required
                    placeholder="z.B. Automatisierter Defibrillator"
                    value={newDevice.deviceType}
                    onChange={e => setNewDevice({ ...newDevice, deviceType: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">Typ / Modell *</label>
                  <input
                    type="text"
                    required
                    placeholder="z.B. AED 3 BLS"
                    value={newDevice.modelType}
                    onChange={e => setNewDevice({ ...newDevice, modelType: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">Serien- / Losnummer *</label>
                  <input
                    type="text"
                    required
                    placeholder="z.B. SN-981244"
                    value={newDevice.serialOrLotNumber}
                    onChange={e => setNewDevice({ ...newDevice, serialOrLotNumber: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">Wirtschaftsakteur (Hersteller) *</label>
                  <select
                    value={newDevice.economicActorId}
                    onChange={e => setNewDevice({ ...newDevice, economicActorId: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {actors.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">Standort *</label>
                  <select
                    value={newDevice.locationId}
                    onChange={e => setNewDevice({ ...newDevice, locationId: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">Betriebliche Zuordnung *</label>
                  <input
                    type="text"
                    required
                    value={newDevice.operationalUnit}
                    onChange={e => setNewDevice({ ...newDevice, operationalUnit: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white block">Regulatorische Einstufung:</span>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newDevice.annex1Device}
                      onChange={e => setNewDevice({ ...newDevice, annex1Device: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span>Anlage 1 Produkt (STK § 12 Pflicht)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newDevice.annex2Device}
                      onChange={e => setNewDevice({ ...newDevice, annex2Device: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span>Anlage 2 Produkt (MTK § 15 Pflicht)</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  Gerät im Bestandsverzeichnis anlegen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DOCUMENT INSPECTION */}
      {showInspectionModal && activeDevice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h2 className="font-bold text-base text-slate-900 dark:text-white mb-3">
              Prüfnachweis erfassen für {activeDevice.name}
            </h2>
            <form onSubmit={handleRecordInspection} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Prüfungsart</label>
                <select
                  value={inspectionForm.type}
                  onChange={e => setInspectionForm({ ...inspectionForm, type: e.target.value as any })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="STK">Sicherheitstechnische Kontrolle (STK gem. § 12)</option>
                  <option value="MTK">Messtechnische Kontrolle (MTK gem. § 15)</option>
                  <option value="DGUV_V3">Elektrische Prüfung DGUV Vorschrift 3</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Protokollnummer</label>
                <input
                  type="text"
                  required
                  value={inspectionForm.protocolNumber}
                  onChange={e => setInspectionForm({ ...inspectionForm, protocolNumber: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Prüfer / Sachverständiger</label>
                <input
                  type="text"
                  required
                  value={inspectionForm.inspectorName}
                  onChange={e => setInspectionForm({ ...inspectionForm, inspectorName: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Prüfende Organisation / Firma</label>
                <input
                  type="text"
                  required
                  value={inspectionForm.inspectorCompany}
                  onChange={e => setInspectionForm({ ...inspectionForm, inspectorCompany: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Ergebnis</label>
                <select
                  value={inspectionForm.result}
                  onChange={e => setInspectionForm({ ...inspectionForm, result: e.target.value as any })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="PASSED">Bestanden (Ohne Mängel)</option>
                  <option value="DEFECTS_FOUND">Geringe Mängel (Behebungsfrist)</option>
                  <option value="FAILED">Nicht bestanden (Gesperrt)</option>
                </select>
              </div>
              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowInspectionModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold"
                >
                  Prüfung speichern &amp; Frist berechnen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DOCUMENT INSTRUCTION */}
      {showInstructionModal && activeDevice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h2 className="font-bold text-base text-slate-900 dark:text-white mb-3">
              Einweisungsnachweis erfassen
            </h2>
            <form onSubmit={handleRecordInstruction} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Name der eingewiesenen Person *</label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Michael Bauer"
                  value={instructionForm.personName}
                  onChange={e => setInstructionForm({ ...instructionForm, personName: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Qualifikation</label>
                <input
                  type="text"
                  required
                  value={instructionForm.qualification}
                  onChange={e => setInstructionForm({ ...instructionForm, qualification: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Einweisungstyp</label>
                <select
                  value={instructionForm.type}
                  onChange={e => setInstructionForm({ ...instructionForm, type: e.target.value as any })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="ANWENDER_PARAGRAPH_4">§ 4 MPBetreibV: Anwendereinweisung</option>
                  <option value="BEAUFTRAGTE_PERSON_PARAGRAPH_11">§ 11 MPBetreibV: Beauftragte Person</option>
                  <option value="HERSTELLEREINWEISUNG">Herstellereinweisung vor Ort</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Gebrauchsanweisungs-Version</label>
                <input
                  type="text"
                  value={instructionForm.manualVersion}
                  onChange={e => setInstructionForm({ ...instructionForm, manualVersion: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowInstructionModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold"
                >
                  Einweisung im Buch speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REPORT DEFECT / LOCK */}
      {showDefectModal && activeDevice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h2 className="font-bold text-base text-slate-900 dark:text-white mb-2 text-red-600 flex items-center space-x-2">
              <Lock className="w-5 h-5" />
              <span>Gerätesperre / Defekt melden</span>
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              Das Gerät wird sofort im System für den Einsatzdienst gesperrt.
            </p>
            <form onSubmit={handleReportDefect} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Mängelbeschreibung / Ursache *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="z.B. Akku lädt nicht mehr vollständig, Fehlermeldung E-04 bei Selbsttest"
                  value={defectReason}
                  onChange={e => setDefectReason(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowDefectModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold"
                >
                  Gerät sperren &amp; protokollieren
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
