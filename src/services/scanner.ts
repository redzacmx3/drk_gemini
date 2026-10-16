import { storage } from './storage';
import { Device, Location, Batch, ProductType } from '../types/inventory';

export interface ScanResult {
  raw: string;
  type: 'DEVICE' | 'LOCATION' | 'BATCH' | 'PRODUCT' | 'GS1_COMPLEX' | 'UNKNOWN';
  device?: Device;
  location?: Location;
  batch?: Batch;
  product?: ProductType;
  parsedFields?: {
    gtin?: string;
    lotNumber?: string;
    expiryDate?: string;
    serialNumber?: string;
  };
}

export function parseBarcodeOrQr(code: string): ScanResult {
  const cleanCode = code.trim();
  const devices = storage.getDevices();
  const locations = storage.getLocations();
  const batches = storage.getBatches();
  const products = storage.getProductTypes();

  // 1. Direct Match: Internal DRK QR code format
  // Locations
  const matchedLoc = locations.find(
    l => l.qrCode.toLowerCase() === cleanCode.toLowerCase() ||
         l.code.toLowerCase() === cleanCode.toLowerCase() ||
         l.id.toLowerCase() === cleanCode.toLowerCase()
  );
  if (matchedLoc) {
    return { raw: cleanCode, type: 'LOCATION', location: matchedLoc };
  }

  // Devices
  const matchedDevice = devices.find(
    d => d.inventoryNumber.toLowerCase() === cleanCode.toLowerCase() ||
         d.serialOrLotNumber.toLowerCase() === cleanCode.toLowerCase() ||
         d.id.toLowerCase() === cleanCode.toLowerCase() ||
         cleanCode.toLowerCase().includes(d.inventoryNumber.toLowerCase())
  );
  if (matchedDevice) {
    return { raw: cleanCode, type: 'DEVICE', device: matchedDevice };
  }

  // Batches
  const matchedBatch = batches.find(
    b => b.lotNumber.toLowerCase() === cleanCode.toLowerCase() ||
         b.id.toLowerCase() === cleanCode.toLowerCase()
  );
  if (matchedBatch) {
    const prod = products.find(p => p.id === matchedBatch.productId);
    return { raw: cleanCode, type: 'BATCH', batch: matchedBatch, product: prod };
  }

  // Products by GTIN or itemNumber
  const matchedProduct = products.find(
    p => p.gtin === cleanCode ||
         p.itemNumber.toLowerCase() === cleanCode.toLowerCase() ||
         (p.pzn && p.pzn === cleanCode)
  );
  if (matchedProduct) {
    return { raw: cleanCode, type: 'PRODUCT', product: matchedProduct };
  }

  // 2. GS1 Application Identifier Parsing (01, 10, 17, 21)
  // Format examples: (01)04012345678901(17)281231(10)LOT123(21)SN9999
  // or ASCII with ]C1 prefix or plain parentheses
  const gs1Fields: { gtin?: string; lotNumber?: string; expiryDate?: string; serialNumber?: string } = {};

  // Check for (01) or 01 prefix
  const gtinMatch = cleanCode.match(/\(01\)(\d{14})/i) || cleanCode.match(/^01(\d{14})/i);
  if (gtinMatch) {
    gs1Fields.gtin = gtinMatch[1];
  }

  // Check for (17) expiry YYMMDD
  const expMatch = cleanCode.match(/\(17\)(\d{6})/i);
  if (expMatch) {
    const rawExp = expMatch[1];
    const year = 2000 + parseInt(rawExp.substring(0, 2), 10);
    const month = rawExp.substring(2, 4);
    let day = rawExp.substring(4, 6);
    if (day === '00') {
      // Month precision: calculate last day of month
      const lastDay = new Date(year, parseInt(month, 10), 0).getDate();
      day = lastDay.toString().padStart(2, '0');
    }
    gs1Fields.expiryDate = `${year}-${month}-${day}`;
  }

  // Check for (10) lot number
  const lotMatch = cleanCode.match(/\(10\)([A-Za-z0-9\-_]+)/i);
  if (lotMatch) {
    gs1Fields.lotNumber = lotMatch[1];
  }

  // Check for (21) serial
  const snMatch = cleanCode.match(/\(21\)([A-Za-z0-9\-_]+)/i);
  if (snMatch) {
    gs1Fields.serialNumber = snMatch[1];
  }

  if (gs1Fields.gtin || gs1Fields.lotNumber || gs1Fields.serialNumber) {
    // Try to match extracted fields
    let foundProduct: ProductType | undefined;
    if (gs1Fields.gtin) {
      foundProduct = products.find(p => p.gtin === gs1Fields.gtin);
    }
    let foundBatch: Batch | undefined;
    if (gs1Fields.lotNumber) {
      foundBatch = batches.find(b => b.lotNumber.toLowerCase() === gs1Fields.lotNumber?.toLowerCase());
    }
    let foundDevice: Device | undefined;
    if (gs1Fields.serialNumber) {
      foundDevice = devices.find(d => d.serialOrLotNumber.toLowerCase() === gs1Fields.serialNumber?.toLowerCase());
    }

    return {
      raw: cleanCode,
      type: foundDevice ? 'DEVICE' : foundBatch ? 'BATCH' : foundProduct ? 'PRODUCT' : 'GS1_COMPLEX',
      device: foundDevice,
      batch: foundBatch,
      product: foundProduct,
      parsedFields: gs1Fields
    };
  }

  return { raw: cleanCode, type: 'UNKNOWN' };
}
