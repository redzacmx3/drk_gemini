import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  ArrowRightLeft, 
  MinusCircle, 
  AlertTriangle, 
  CheckCircle, 
  History, 
  ShieldAlert, 
  Clock, 
  Calendar,
  X,
  Layers,
  ArrowDownToLine,
  Filter
} from 'lucide-react';
import { storage } from '../services/storage';
import { ProductType, Batch, StockBalance, StockMovement, ProductCategory } from '../types/inventory';

interface StockViewProps {
  initialOpenReceipt?: boolean;
}

export const StockView: React.FC<StockViewProps> = ({ initialOpenReceipt = false }) => {
  const [products, setProducts] = useState(storage.getProductTypes());
  const [batches, setBatches] = useState(storage.getBatches());
  const [balances, setBalances] = useState(storage.getStockBalances());
  const [locations] = useState(storage.getLocations());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modals
  const [showReceiptModal, setShowReceiptModal] = useState(initialOpenReceipt);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showConsumeModal, setShowConsumeModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedBatchForQuarantine, setSelectedBatchForQuarantine] = useState<Batch | null>(null);

  const activeUser = storage.getActiveUser();
  const now = new Date();

  const reloadData = () => {
    setProducts(storage.getProductTypes());
    setBatches(storage.getBatches());
    setBalances(storage.getStockBalances());
  };

  // Receipt form state
  const [receiptForm, setReceiptForm] = useState({
    productId: products[0]?.id || '',
    lotNumber: '',
    expiryDate: '',
    expiryPrecision: 'DAY' as 'DAY' | 'MONTH',
    quantity: 10,
    locationId: locations[0]?.id || '',
    supplier: 'DRK Zentrallager',
    reason: 'Regulärer Wareneingang / Nachbestellung'
  });

  const handleExecuteReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptForm.productId || !receiptForm.lotNumber || !receiptForm.expiryDate) return;

    // Check if batch exists or create new
    let batch = storage.getBatches().find(
      b => b.productId === receiptForm.productId && b.lotNumber.toLowerCase() === receiptForm.lotNumber.toLowerCase()
    );

    if (!batch) {
      batch = {
        id: 'bat-' + Date.now(),
        productId: receiptForm.productId,
        lotNumber: receiptForm.lotNumber,
        expiryDate: receiptForm.expiryDate,
        expiryPrecision: receiptForm.expiryPrecision,
        globalState: 'AVAILABLE',
        receivedAt: new Date().toISOString(),
        supplier: receiptForm.supplier
      };
      storage.saveBatch(batch);
    }

    // Execute atomic movement
    const res = storage.executeMovement('RECEIPT', receiptForm.reason, [
      {
        batchId: batch.id,
        locationId: receiptForm.locationId,
        localState: 'AVAILABLE',
        delta: Number(receiptForm.quantity)
      }
    ]);

    if (res.success) {
      setShowReceiptModal(false);
      reloadData();
    } else {
      alert(res.error || 'Fehler beim Buchen');
    }
  };

  // Transfer form state
  const [transferForm, setTransferForm] = useState({
    batchId: batches[0]?.id || '',
    fromLocationId: locations[0]?.id || '',
    toLocationId: locations[1]?.id || '',
    quantity: 2,
    reason: 'Umlagerung in Notfallausstattung'
  });

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferForm.fromLocationId === transferForm.toLocationId) {
      alert('Quell- und Zielstandort müssen unterschiedlich sein.');
      return;
    }

    const res = storage.executeMovement('TRANSFER', transferForm.reason, [
      {
        batchId: transferForm.batchId,
        locationId: transferForm.fromLocationId,
        localState: 'AVAILABLE',
        delta: -Number(transferForm.quantity)
      },
      {
        batchId: transferForm.batchId,
        locationId: transferForm.toLocationId,
        localState: 'AVAILABLE',
        delta: Number(transferForm.quantity)
      }
    ]);

    if (res.success) {
      setShowTransferModal(false);
      reloadData();
    } else {
      alert(res.error || 'Fehler beim Transfer');
    }
  };

  // Consume form state
  const [consumeForm, setConsumeForm] = useState({
    batchId: batches[0]?.id || '',
    locationId: locations[0]?.id || '',
    quantity: 1,
    reason: 'Verbrauch bei Sanitätswachdienst (Patientenversorgung)'
  });

  const handleExecuteConsume = (e: React.FormEvent) => {
    e.preventDefault();
    const res = storage.executeMovement('CONSUME', consumeForm.reason, [
      {
        batchId: consumeForm.batchId,
        locationId: consumeForm.locationId,
        localState: 'AVAILABLE',
        delta: -Number(consumeForm.quantity)
      }
    ]);

    if (res.success) {
      setShowConsumeModal(false);
      reloadData();
    } else {
      alert(res.error || 'Fehler bei Entnahme');
    }
  };

  // Quarantine / Lock batch
  const handleToggleQuarantine = (batch: Batch, reason: string) => {
    const updated = { ...batch };
    if (updated.globalState === 'AVAILABLE') {
      updated.globalState = 'QUARANTINED';
      updated.quarantineReason = reason || 'Manuell durch Materialwart gesperrt';
    } else {
      updated.globalState = 'AVAILABLE';
      updated.quarantineReason = undefined;
    }
    storage.saveBatch(updated);
    storage.logAudit(
      'BATCH',
      batch.id,
      `Chargenstatus geändert: ${batch.lotNumber} -> ${updated.globalState} (${reason})`
    );
    setSelectedBatchForQuarantine(null);
    reloadData();
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.itemNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.pzn && p.pzn.includes(searchQuery)) ||
      (p.gtin && p.gtin.includes(searchQuery));

    if (!matchesSearch) return false;
    if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
            <span>Materialwirtschaft · First Expired, First Out (FEFO)</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Sanitätsmaterial &amp; Chargenverwaltung
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Atomare Buchungen, standortbezogene Bestände und automatische Haltbarkeitswarnungen.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowReceiptModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Wareneingang buchen</span>
          </button>
          <button
            onClick={() => setShowTransferModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <ArrowRightLeft className="w-4 h-4 text-blue-600" />
            <span>Umlagern</span>
          </button>
          <button
            onClick={() => setShowConsumeModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <MinusCircle className="w-4 h-4 text-amber-600" />
            <span>Entnahme buchen</span>
          </button>
          <button
            onClick={() => setShowHistoryModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <History className="w-4 h-4 text-slate-600" />
            <span>Buchungshistorie</span>
          </button>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Artikel, PZN, GTIN-Barcode oder REF-Nummer suchen..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="p-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="ALL">Alle Kategorien</option>
            <option value="VERBANDSMATERIAL">Verbandsmaterial</option>
            <option value="BEATMUNG_SAUERSTOFF">Beatmung &amp; Sauerstoff</option>
            <option value="INFUSION_ZUGANG">Infusion &amp; Zugang</option>
            <option value="GERAETEZUBEHOER">Gerätezubehör &amp; Elektroden</option>
            <option value="IMMOBILISATION">Immobilisation</option>
            <option value="HYGIENE_DESINFEKTION">Hygiene &amp; Desinfektion</option>
          </select>
        </div>
      </div>

      {/* Products & Batches Grid */}
      <div className="space-y-4">
        {filteredProducts.map(prod => {
          const prodBatches = batches.filter(b => b.productId === prod.id);
          
          // Calculate total available quantity across all locations
          let totalQty = 0;
          for (const b of prodBatches) {
            const bBals = balances.filter(bl => bl.batchId === b.id && bl.localState === 'AVAILABLE');
            for (const bl of bBals) totalQty += bl.quantity;
          }

          return (
            <div 
              key={prod.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                      {prod.itemNumber}
                    </span>
                    <h2 className="font-bold text-slate-900 dark:text-white text-base">
                      {prod.name}
                    </h2>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-2">
                    <span>Kategorie: <strong>{prod.category}</strong></span>
                    <span>·</span>
                    <span>Basiseinheit: <strong>{prod.baseUnit}</strong></span>
                    {prod.pzn && <span>· PZN: <code>{prod.pzn}</code></span>}
                    {prod.gtin && <span>· GTIN: <code>{prod.gtin}</code></span>}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Gesamtbestand:</div>
                    <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {totalQty} {prod.baseUnit}
                    </div>
                  </div>
                </div>
              </div>

              {/* Batches Table for this Product */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="py-2 px-3">Herstellercharge (Lot)</th>
                      <th className="py-2 px-3">Verfallsdatum (FEFO)</th>
                      <th className="py-2 px-3">Restlaufzeit</th>
                      <th className="py-2 px-3">Standort-Bestände</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3 text-right">Aktion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                    {prodBatches.map(b => {
                      const expDate = new Date(b.expiryDate);
                      const daysLeft = Math.round((expDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
                      const isExpired = daysLeft < 0;
                      const isDueSoon = daysLeft >= 0 && daysLeft <= 60;
                      
                      const batchBalances = balances.filter(bl => bl.batchId === b.id && bl.quantity > 0);

                      return (
                        <tr key={b.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 font-mono font-bold">
                            {b.lotNumber}
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            {b.expiryDate} {b.expiryPrecision === 'MONTH' && <span className="text-[10px] text-slate-400">(Monat)</span>}
                          </td>
                          <td className="py-2.5 px-3 font-semibold">
                            {isExpired ? (
                              <span className="text-red-600 font-bold">Abgelaufen!</span>
                            ) : isDueSoon ? (
                              <span className="text-amber-600 font-bold">Noch {daysLeft} Tage (FEFO Vorrang!)</span>
                            ) : (
                              <span className="text-emerald-600">Noch {daysLeft} Tage</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="space-y-1">
                              {batchBalances.map(bl => {
                                const loc = locations.find(l => l.id === bl.locationId);
                                return (
                                  <div key={bl.locationId + bl.localState} className="flex items-center space-x-1.5 text-[11px]">
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                      {bl.quantity}x
                                    </span>
                                    <span className="text-slate-500">
                                      in {loc?.name || 'Unbekannt'}
                                    </span>
                                    {bl.localState !== 'AVAILABLE' && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-100 text-red-800">
                                        {bl.localState}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                              {batchBalances.length === 0 && (
                                <span className="text-slate-400 italic">Kein lokaler Bestand</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            {b.globalState === 'AVAILABLE' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Freigegeben
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" title={b.quarantineReason}>
                                {b.globalState}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => setSelectedBatchForQuarantine(b)}
                              className="text-[11px] font-semibold text-slate-500 hover:text-red-600 transition"
                            >
                              {b.globalState === 'AVAILABLE' ? 'Sperren' : 'Freigeben'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {prodBatches.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-3 px-3 text-center text-slate-400 italic">
                          Bisher keine Chargen für dieses Produkt erfasst.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: WARENEINGANG (RECEIPT) */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <ArrowDownToLine className="w-5 h-5 text-red-600" />
                <span>Wareneingang buchen (RECEIPT)</span>
              </h2>
              <button onClick={() => setShowReceiptModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteReceipt} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Produkt / Artikel *</label>
                <select
                  value={receiptForm.productId}
                  onChange={e => setReceiptForm({ ...receiptForm, productId: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.itemNumber})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Hersteller-Chargennummer (Lot) *</label>
                  <input
                    type="text"
                    required
                    placeholder="z.B. LOT-2026-X88"
                    value={receiptForm.lotNumber}
                    onChange={e => setReceiptForm({ ...receiptForm, lotNumber: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Menge *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={receiptForm.quantity}
                    onChange={e => setReceiptForm({ ...receiptForm, quantity: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Verfallsdatum (YYYY-MM-DD) *</label>
                  <input
                    type="date"
                    required
                    value={receiptForm.expiryDate}
                    onChange={e => setReceiptForm({ ...receiptForm, expiryDate: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Ziel-Lagerort *</label>
                  <select
                    value={receiptForm.locationId}
                    onChange={e => setReceiptForm({ ...receiptForm, locationId: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Lieferant / Bezugsquelle</label>
                <input
                  type="text"
                  value={receiptForm.supplier}
                  onChange={e => setReceiptForm({ ...receiptForm, supplier: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Buchungsgrund</label>
                <input
                  type="text"
                  value={receiptForm.reason}
                  onChange={e => setReceiptForm({ ...receiptForm, reason: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold"
                >
                  Wareneingang buchen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UMLAGERUNG (TRANSFER) */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                <span>Umlagerung buchen (TRANSFER)</span>
              </h2>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Charge &amp; Artikel *</label>
                <select
                  value={transferForm.batchId}
                  onChange={e => setTransferForm({ ...transferForm, batchId: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  {batches.map(b => {
                    const p = products.find(prod => prod.id === b.productId);
                    return (
                      <option key={b.id} value={b.id}>
                        {p?.name} (Lot: {b.lotNumber} | Verfall: {b.expiryDate})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Von Standort *</label>
                  <select
                    value={transferForm.fromLocationId}
                    onChange={e => setTransferForm({ ...transferForm, fromLocationId: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Nach Standort *</label>
                  <select
                    value={transferForm.toLocationId}
                    onChange={e => setTransferForm({ ...transferForm, toLocationId: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Menge *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={transferForm.quantity}
                  onChange={e => setTransferForm({ ...transferForm, quantity: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Grund / Zweck der Umlagerung</label>
                <input
                  type="text"
                  value={transferForm.reason}
                  onChange={e => setTransferForm({ ...transferForm, reason: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold"
                >
                  Umlagerung atomar verbuchen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ENTNAHME (CONSUME) */}
      {showConsumeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h2 className="font-bold text-base text-slate-900 dark:text-white mb-3 flex items-center space-x-2">
              <MinusCircle className="w-5 h-5 text-amber-600" />
              <span>Materialentnahme buchen (CONSUME)</span>
            </h2>

            <form onSubmit={handleExecuteConsume} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Charge *</label>
                <select
                  value={consumeForm.batchId}
                  onChange={e => setConsumeForm({ ...consumeForm, batchId: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  {batches.map(b => {
                    const p = products.find(prod => prod.id === b.productId);
                    return (
                      <option key={b.id} value={b.id}>
                        {p?.name} (Lot: {b.lotNumber})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Entnahme aus Standort *</label>
                <select
                  value={consumeForm.locationId}
                  onChange={e => setConsumeForm({ ...consumeForm, locationId: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Entnommene Menge *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={consumeForm.quantity}
                  onChange={e => setConsumeForm({ ...consumeForm, quantity: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Einsatz / Verwendungszweck *</label>
                <input
                  type="text"
                  required
                  value={consumeForm.reason}
                  onChange={e => setConsumeForm({ ...consumeForm, reason: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowConsumeModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold"
                >
                  Entnahme buchen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QUARANTINE TOGGLE */}
      {selectedBatchForQuarantine && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h2 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Chargenstatus anpassen: {selectedBatchForQuarantine.lotNumber}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Aktueller Status: <strong>{selectedBatchForQuarantine.globalState}</strong>
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSelectedBatchForQuarantine(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
              >
                Abbrechen
              </button>
              <button
                onClick={() => handleToggleQuarantine(
                  selectedBatchForQuarantine, 
                  selectedBatchForQuarantine.globalState === 'AVAILABLE' ? 'Qualitätsprüfung durch Materialwart angeordnet' : ''
                )}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white ${selectedBatchForQuarantine.globalState === 'AVAILABLE' ? 'bg-red-600' : 'bg-emerald-600'}`}
              >
                {selectedBatchForQuarantine.globalState === 'AVAILABLE' ? 'In Quarantäne sperren' : 'Wieder freigeben'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MOVEMENT HISTORY AUDIT */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div>
                <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                  <History className="w-5 h-5 text-red-600" />
                  <span>Unveränderbares Bewegungsprotokoll (§ 6.1 Blueprint)</span>
                </h2>
                <div className="text-xs text-slate-400 mt-0.5">Append-only Bestandsbuchungen mit Akteur und Zeitstempel</div>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 flex-1">
              {storage.getStockMovements().map(m => (
                <div key={m.id} className="py-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-600">[{m.operation}] {m.reason}</span>
                    <span className="text-slate-400 font-mono">{new Date(m.occurredAt).toLocaleString('de-DE')}</span>
                  </div>
                  <div className="text-slate-500 mt-1">
                    Gebucht durch: <strong>{m.actorName}</strong>
                  </div>
                  <div className="mt-1 space-y-0.5 pl-2 border-l-2 border-slate-200 dark:border-slate-700">
                    {m.lines.map((l, i) => {
                      const b = batches.find(bat => bat.id === l.batchId);
                      const p = b ? products.find(prod => prod.id === b.productId) : null;
                      const loc = locations.find(loca => loca.id === l.locationId);
                      return (
                        <div key={i} className="text-[11px] text-slate-600 dark:text-slate-300">
                          {l.delta > 0 ? `+${l.delta}` : l.delta}x {p?.name} (Lot: {b?.lotNumber}) an {loc?.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {storage.getStockMovements().length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400">
                  Noch keine manuellen Buchungen im aktuellen Durchlauf erfasst.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
