import React, { useState, useEffect, useRef } from 'react';
import { 
  Scan, 
  Camera, 
  X, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Stethoscope, 
  MapPin, 
  Package, 
  Layers, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { parseBarcodeOrQr, ScanResult } from '../services/scanner';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToDevice: (deviceId: string) => void;
  onNavigateToLocation: (locId: string) => void;
  onNavigateToStock: () => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onNavigateToDevice,
  onNavigateToLocation,
  onNavigateToStock
}) => {
  const [manualCode, setManualCode] = useState('');
  const [resolvedResult, setResolvedResult] = useState<ScanResult | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Sample quick barcodes to test immediately
  const sampleCodes = [
    { label: 'ACCUVAC Pro (Gerät § 14)', code: 'MP-LPH-2023-001' },
    { label: 'ZOLL AED Plus (Gerät)', code: 'MP-LPH-2024-004' },
    { label: 'Notfallrucksack San-A (Koffer-Tag)', code: 'DRK-LPH-LOC-BAG-NF-A' },
    { label: 'KTW-B Crafter (Fahrzeug)', code: 'DRK-LPH-LOC-VEH-1-26-1' },
    { label: 'GS1-128 Jonosteril (GTIN+Exp+Lot)', code: '(01)04033445566778(17)261115(10)BB-JON-24018' },
    { label: 'Tourniquet CAT Charge', code: 'CAT-2025-A91' }
  ];

  const handleResolveCode = (codeToTest: string) => {
    setManualCode(codeToTest);
    const result = parseBarcodeOrQr(codeToTest);
    setResolvedResult(result);
  };

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraActive(true);
        }
      } else {
        setCameraError('Kamerazugriff wird in diesem Browser/iFrame nicht direkt unterstützt. Nutzen Sie die Direkteingabe.');
      }
    } catch (err: unknown) {
      setCameraError('Kamera konnte nicht aktiviert werden: ' + (err instanceof Error ? err.message : String(err)));
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setResolvedResult(null);
      setManualCode('');
    }
    return () => stopCamera();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                DRK Barcode- &amp; QR-Scanner
              </h2>
              <div className="text-[11px] text-slate-400">GS1-128, DataMatrix &amp; interne DRK-Objekt-Tags</div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewfinder Area */}
        <div className="mt-4 relative rounded-xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-slate-700">
          <video 
            ref={videoRef} 
            className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
            playsInline
            muted
          />

          {/* Scanner Reticle Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-32 border-2 border-red-500/80 rounded-lg relative">
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-500" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-500" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-500" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-500" />
              <div className="w-full h-0.5 bg-red-500/80 absolute top-1/2 -translate-y-1/2 animate-pulse" />
            </div>
          </div>

          {!cameraActive && (
            <div className="p-4 text-center text-xs text-slate-400 z-10">
              <Camera className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <div>Kamera-Vorschau inaktiv oder nicht freigegeben.</div>
              {cameraError && <div className="text-red-400 mt-1 text-[11px]">{cameraError}</div>}
              <button
                onClick={startCamera}
                className="mt-2 px-3 py-1 bg-slate-800 text-slate-200 rounded text-xs hover:bg-slate-700"
              >
                Kamera neu starten
              </button>
            </div>
          )}
        </div>

        {/* Manual Input Search */}
        <div className="mt-3">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Code manuell eingeben oder Test-Button wählen..."
              value={manualCode}
              onChange={e => handleResolveCode(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
            />
            <button
              onClick={() => handleResolveCode(manualCode)}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
            >
              Prüfen
            </button>
          </div>
        </div>

        {/* Quick Clickable Test Tags */}
        <div className="mt-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Test-Codes zum Sofort-Klicken:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sampleCodes.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleResolveCode(s.code)}
                className="text-[10px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resolution Card */}
        {resolvedResult && (
          <div className="mt-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-red-600 flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Code erfolgreich erkannt: [{resolvedResult.type}]</span>
              </span>
              <span className="text-slate-400 font-mono text-[11px] truncate max-w-[140px]">
                {resolvedResult.raw}
              </span>
            </div>

            {/* Resolved as Device */}
            {resolvedResult.device && (
              <div className="text-xs space-y-1">
                <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {resolvedResult.device.name}
                </div>
                <div className="text-slate-500">
                  Inventarnummer: <code>{resolvedResult.device.inventoryNumber}</code> · Serien-Nr: {resolvedResult.device.serialOrLotNumber}
                </div>
                <div className="text-slate-500">
                  Nächste STK: {resolvedResult.device.nextStkDate || 'Nicht erforderlich'}
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToDevice(resolvedResult.device!.id);
                    }}
                    className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition text-xs flex items-center justify-center space-x-1"
                  >
                    <span>In Geräteakte öffnen (§ 14 &amp; § 13)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Resolved as Location */}
            {resolvedResult.location && (
              <div className="text-xs space-y-1">
                <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {resolvedResult.location.name}
                </div>
                <div className="text-slate-500">
                  Code: <code>{resolvedResult.location.code}</code> · Typ: {resolvedResult.location.type}
                </div>
                <div className="text-slate-500">
                  Einsatzbereitschaft: <strong>{resolvedResult.location.readinessStatus || 'GREEN'}</strong>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToLocation(resolvedResult.location!.id);
                    }}
                    className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition text-xs flex items-center justify-center space-x-1"
                  >
                    <span>Standort öffnen / Kofferprüfung starten</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Resolved as Batch / Product */}
            {(resolvedResult.batch || resolvedResult.product) && (
              <div className="text-xs space-y-1">
                <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {resolvedResult.product?.name || 'Sanitätsmaterial'}
                </div>
                {resolvedResult.batch && (
                  <div className="text-slate-500">
                    Charge: <code>{resolvedResult.batch.lotNumber}</code> · Verfall: <strong>{resolvedResult.batch.expiryDate}</strong>
                  </div>
                )}
                {resolvedResult.parsedFields?.gtin && (
                  <div className="text-slate-400 text-[10px]">
                    GTIN: {resolvedResult.parsedFields.gtin}
                  </div>
                )}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToStock();
                    }}
                    className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition text-xs flex items-center justify-center space-x-1"
                  >
                    <span>Im Materialbestand anzeigen (FEFO)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {resolvedResult.type === 'UNKNOWN' && (
              <div className="text-xs text-slate-500">
                Dieser Barcode konnte keinem registrierten DRK-Objekt oder GS1-Feld zugeordnet werden.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
