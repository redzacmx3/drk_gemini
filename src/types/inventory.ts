export type Role = 
  | 'VIEWER' 
  | 'HELPER' 
  | 'MATERIAL_MANAGER' 
  | 'DEVICE_MANAGER' 
  | 'AUDITOR' 
  | 'ADMIN';

export type ThemeMode = 'drk-red' | 'drk-dark' | 'drk-navy' | 'high-contrast';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  operationalUnit: string;
  avatarInitials: string;
}

export interface OperatorConfig {
  organizationName: string; // z.B. "Deutsches Rotes Kreuz Ortsverein Laupheim e.V."
  parentOrg: string; // z.B. "DRK Kreisverband Biberach e.V."
  siteName: string; // z.B. "Rettungswache / Bereitschaftsheim Laupheim"
  address: string; // z.B. "Bronner Str. 34, 88471 Laupheim"
  mpSafetyOfficerName: string; // Beauftragter für Medizinproduktesicherheit gem. § 6 MPBetreibV
  mpSafetyOfficerEmail: string; // Öffentliche Funktions-E-Mail (z.B. mpg-sicherheit@drk-laupheim.de)
  isInstalled: boolean;
  installedAt?: string;
  defaultTimezone: string; // "Europe/Berlin"
}

export type LocationType = 'SITE' | 'ROOM' | 'VEHICLE' | 'CONTAINER_BAG' | 'SHELF_COMPARTMENT';

export interface Location {
  id: string;
  code: string; // z.B. "LOC-LPH-HAUPT", "VEH-1-19-1", "BAG-NOTFALL-A"
  name: string;
  type: LocationType;
  parentId?: string; // Hierarchie
  description?: string;
  vehicleRadioCall?: string; // z.B. "Rotkreuz Laupheim 1/19-1"
  qrCode: string;
  isPackable: boolean; // Hat Soll-Packliste
  assignedPacklistId?: string;
  lastCheckedAt?: string;
  lastCheckedBy?: string;
  readinessStatus?: 'GREEN' | 'YELLOW' | 'RED';
}

export interface EconomicActor {
  id: string;
  name: string; // z.B. "WEINMANN Emergency Medical Technology GmbH + Co. KG"
  role: 'HERSTELLER' | 'BEVOLLMAECHTIGTER' | 'IMPORTEUR';
  address: string;
  city: string;
  country: string;
  contactEmail?: string;
}

export type DeviceLifecycle = 'IN_SERVICE' | 'OUT_OF_SERVICE' | 'DISPOSED';

export interface Device {
  id: string;
  inventoryNumber: string; // Betriebliche Identifikationsnummer z.B. "MP-LPH-2024-001"
  name: string; // Bezeichnung z.B. "Absaugpumpe ACCUVAC Pro"
  deviceType: string; // Art z.B. "Elektrische Absaugpumpe"
  modelType: string; // Typ z.B. "WM 11600"
  serialOrLotNumber: string; // Loscode oder Seriennummer
  acquisitionYear: number; // Anschaffungsjahr gem. § 14 MPBetreibV (Pflicht)
  manufacturingYear?: number; // Herstellungsjahr
  economicActorId: string; // Hersteller / Wirtschaftsakteur
  locationId: string; // Aktueller Standort
  operationalUnit: string; // Betriebliche Zuordnung z.B. "Bereitschaft Laupheim - San-Gruppe"
  ceMarking?: string; // CE-Kennzeichen
  mdrClass?: 'I' | 'IIa' | 'IIb' | 'III';
  activeNonImplantable: boolean; // Aktives nichtimplantierbares Produkt (§ 14 Pflicht)
  annex1Device: boolean; // Anlage 1 (STK Pflicht, Einweisung nach § 11)
  annex2Device: boolean; // Anlage 2 (MTK Pflicht nach § 15)
  isAedExemptCandidate?: boolean; // § 12 Abs. 2 AED-Sonderfall
  lifecycleState: DeviceLifecycle;
  activeLocks: string[]; // z.B. ['DEFECT', 'STK_OVERDUE', 'RECALL']
  outOfServiceDate?: string;
  retentionUntilDate?: string; // 5 Jahre nach Außerbetriebnahme gem. § 13
  rules: {
    stkRequired: boolean;
    stkIntervalMonths?: number; // meist 24 Monate
    mtkRequired: boolean;
    mtkIntervalMonths?: number;
    dguvV3Required: boolean;
    dguvV3IntervalMonths?: number; // z.B. 12 oder 24 Monate
    maintenanceRequired: boolean;
  };
  nextStkDate?: string;
  nextMtkDate?: string;
  nextDguvDate?: string;
}

export type DeviceEventType = 
  | 'INBETRIEBNAHME'
  | 'FUNKTIONSPRUEFUNG'
  | 'EINWEISUNG'
  | 'STK_PRUEFUNG'
  | 'MTK_PRUEFUNG'
  | 'DGUV_PRUEFUNG'
  | 'WARTUNG'
  | 'STOERUNG'
  | 'BEDIENUNGSFEHLER'
  | 'SPERRE'
  | 'FREIGABE'
  | 'KORREKTUR'
  | 'AUSSERBETRIEBNAHME';

export interface DeviceEvent {
  id: string;
  deviceId: string;
  eventType: DeviceEventType;
  occurredAt: string;
  recordedBy: string;
  summary: string;
  details?: string;
  documentRef?: string;
  protocolNumber?: string;
  reversalRefId?: string; // Verweis bei Korrektureintrag
}

export interface Instruction {
  id: string;
  deviceId: string;
  personName: string;
  qualification: string; // z.B. "Rettungssanitäter", "Notfallsanitäter", "Sanitätshelfer"
  instructorName: string;
  instructionDate: string;
  type: 'BEAUFTRAGTE_PERSON_PARAGRAPH_11' | 'ANWENDER_PARAGRAPH_4' | 'HERSTELLEREINWEISUNG';
  manualVersion: string; // Version der Gebrauchsanweisung
  proofDocumentRef?: string;
}

export interface Inspection {
  id: string;
  deviceId: string;
  inspectionType: 'STK' | 'MTK' | 'DGUV_V3' | 'HERSTELLER_WARTUNG';
  executedAt: string;
  inspectorName: string;
  inspectorCompany: string; // z.B. "DRK Landesverband Medizintechnik" oder "Herstellerservice"
  result: 'PASSED' | 'DEFECTS_FOUND' | 'FAILED';
  protocolNumber: string;
  measuredValues?: string;
  notes?: string;
  nextCalculatedDueDate: string;
}

export type ProductCategory = 
  | 'VERBANDSMATERIAL'
  | 'BEATMUNG_SAUERSTOFF'
  | 'DIAGNOSTIK'
  | 'INFUSION_ZUGANG'
  | 'IMMOBILISATION'
  | 'HYGIENE_DESINFEKTION'
  | 'MEDIKAMENTE_ANHANG'
  | 'GERAETEZUBEHOER';

export interface ProductType {
  id: string;
  itemNumber: string; // z.B. "MAT-0102"
  name: string; // z.B. "Beatmungsmaske Gr. 4 mit Luftwulst"
  category: ProductCategory;
  baseUnit: 'STK' | 'PAAR' | 'SET' | 'ROLLE' | 'FLASCHE' | 'LITER';
  packSize: number;
  refNumber?: string; // Artikelnummer des Herstellers
  pzn?: string; // Pharmazentralnummer
  gtin?: string; // EAN/GTIN Barcode
  minShelfLifeDaysRecommended: number; // FEFO Schwellenwert
  notes?: string;
}

export interface Batch {
  id: string;
  productId: string;
  lotNumber: string; // Chargennummer des Herstellers
  expiryDate: string; // Format YYYY-MM-DD
  expiryPrecision: 'DAY' | 'MONTH' | 'UNKNOWN' | 'NOT_APPLICABLE';
  globalState: 'AVAILABLE' | 'QUARANTINED' | 'RECALLED';
  quarantineReason?: string;
  receivedAt: string;
  supplier?: string;
}

export interface StockBalance {
  batchId: string;
  locationId: string;
  localState: 'AVAILABLE' | 'QUARANTINED' | 'DAMAGED';
  quantity: number;
  version: number;
}

export interface MovementLine {
  batchId: string;
  locationId: string;
  localState: 'AVAILABLE' | 'QUARANTINED' | 'DAMAGED';
  delta: number; // positiv für Eingang, negativ für Abgang
}

export interface StockMovement {
  id: string;
  operation: 'RECEIPT' | 'CONSUME' | 'TRANSFER' | 'ADJUSTMENT' | 'REVERSAL' | 'DISPOSAL';
  actorId: string;
  actorName: string;
  occurredAt: string;
  recordedAt: string;
  reason: string;
  reversesId?: string;
  lines: MovementLine[];
}

export interface PacklistItem {
  productId: string;
  requiredQuantity: number;
  minRemainingShelfLifeDays: number;
  mandatory: boolean;
  alternativeProductIds?: string[];
}

export interface Packlist {
  id: string;
  name: string; // z.B. "Soll-Packliste Notfallrucksack Sanitätsdienst (DRK OV Laupheim)"
  version: string;
  approvedBy: string;
  approvedAt: string;
  items: PacklistItem[];
}

export interface ReadinessIssue {
  type: 'MISSING_QUANTITY' | 'EXPIRING_SOON' | 'EXPIRED' | 'DEVICE_LOCKED' | 'INSPECTION_OVERDUE' | 'QUARANTINED_ITEM';
  severity: 'WARNING' | 'CRITICAL';
  description: string;
  itemId?: string;
}

export interface ReadinessCheck {
  id: string;
  locationId: string;
  packlistVersion: string;
  checkedAt: string;
  checkedBy: string;
  readiness: 'GREEN' | 'YELLOW' | 'RED';
  visualCheckOk: boolean;
  tamperSealIntact?: boolean;
  tamperSealNumber?: string;
  issues: ReadinessIssue[];
  notes?: string;
}

export interface Incident {
  id: string;
  deviceId?: string;
  batchId?: string;
  occurredAt: string;
  reportedAt: string;
  reporterName: string;
  reporterRole: string;
  status: 'ASSESSMENT_REQUIRED' | 'REPORT_PENDING' | 'REPORTED' | 'FOLLOW_UP' | 'CLOSED';
  severity: 'LEICHT' | 'SCHWERWIEGEND' | 'BEINAHE_VORKOMMNIS';
  bfarmReference?: string;
  description: string;
  patientHarmOccurred: boolean;
  immediateMeasures: string;
  resolvedAt?: string;
}

export interface Recall {
  id: string;
  title: string;
  manufacturer: string;
  referenceNumber: string;
  issuedAt: string;
  receivedAt: string;
  targetProductIds: string[];
  targetLotNumbers: string[];
  instructions: string;
  activeStatus: 'ACTIVE' | 'RESOLVED';
  affectedLocationIds: string[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
}
