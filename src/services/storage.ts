import {
  OperatorConfig,
  User,
  Location,
  EconomicActor,
  Device,
  DeviceEvent,
  Instruction,
  Inspection,
  ProductType,
  Batch,
  StockBalance,
  StockMovement,
  Packlist,
  ReadinessCheck,
  Incident,
  Recall,
  AuditEvent,
  ThemeMode,
  ReadinessIssue
} from '../types/inventory';

const STORAGE_KEY_PREFIX = 'drk_lph_v2_';

// Initial Seed Fixtures
export const DEFAULT_OPERATOR: OperatorConfig = {
  organizationName: 'Deutsches Rotes Kreuz Ortsverein Laupheim e.V.',
  parentOrg: 'DRK Kreisverband Biberach e.V.',
  siteName: 'Bereitschaftsheim & Fahrzeughalle Laupheim',
  address: 'Bronner Straße 34, 88471 Laupheim',
  mpSafetyOfficerName: 'Florian Mayer (Notfallsanitäter & MPG-Beauftragter)',
  mpSafetyOfficerEmail: 'mpg-sicherheit@drk-laupheim.de',
  isInstalled: true,
  installedAt: '2026-03-01T08:00:00Z',
  defaultTimezone: 'Europe/Berlin',
};

export const DEFAULT_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Florian Mayer',
    email: 'florian.mayer@drk-laupheim.de',
    role: 'ADMIN',
    operationalUnit: 'Bereitschaftsleitung & MPG',
    avatarInitials: 'FM'
  },
  {
    id: 'usr-2',
    name: 'Sarah Bucher',
    email: 'sarah.bucher@drk-laupheim.de',
    role: 'DEVICE_MANAGER',
    operationalUnit: 'Gerätewartung & Medizintechnik',
    avatarInitials: 'SB'
  },
  {
    id: 'usr-3',
    name: 'Markus Weber',
    email: 'markus.weber@drk-laupheim.de',
    role: 'MATERIAL_MANAGER',
    operationalUnit: 'Lager & Nachschub',
    avatarInitials: 'MW'
  },
  {
    id: 'usr-4',
    name: 'Lena Schwarz',
    email: 'lena.schwarz@drk-laupheim.de',
    role: 'HELPER',
    operationalUnit: 'Sanitätsgruppe Laupheim',
    avatarInitials: 'LS'
  },
  {
    id: 'usr-5',
    name: 'Dr. Michael Lang',
    email: 'm.lang@drk-kv-biberach.de',
    role: 'AUDITOR',
    operationalUnit: 'Kreisverbandsarzt / Qualitätsbeauftragter',
    avatarInitials: 'ML'
  }
];

export const DEFAULT_ECONOMIC_ACTORS: EconomicActor[] = [
  {
    id: 'act-weinmann',
    name: 'WEINMANN Emergency Medical Technology GmbH + Co. KG',
    role: 'HERSTELLER',
    address: 'Frohbösestraße 12',
    city: '22525 Hamburg',
    country: 'Deutschland',
    contactEmail: 'info@weinmann-emt.de'
  },
  {
    id: 'act-zoll',
    name: 'ZOLL Medical Deutschland GmbH',
    role: 'HERSTELLER',
    address: 'Emil-Hoffmann-Straße 1a',
    city: '50996 Köln',
    country: 'Deutschland',
    contactEmail: 'kontakt@zoll.com'
  },
  {
    id: 'act-corpuls',
    name: 'GS Elektromedizinische Geräte G. Stemple GmbH (corpuls)',
    role: 'HERSTELLER',
    address: 'Hauswiesenstraße 26',
    city: '86916 Kaufering',
    country: 'Deutschland',
    contactEmail: 'info@corpuls.com'
  },
  {
    id: 'act-boso',
    name: 'Bosch + Sohn GmbH u. Co. KG (boso)',
    role: 'HERSTELLER',
    address: 'Bahnhofstraße 17',
    city: '72417 Jungingen',
    country: 'Deutschland',
    contactEmail: 'zentrale@boso.de'
  },
  {
    id: 'act-braun',
    name: 'B. Braun Melsungen AG',
    role: 'HERSTELLER',
    address: 'Carl-Braun-Straße 1',
    city: '34212 Melsungen',
    country: 'Deutschland'
  },
  {
    id: 'act-soehngen',
    name: 'W. SÖHNGEN GmbH',
    role: 'HERSTELLER',
    address: 'Platter Straße 84',
    city: '65232 Taunusstein',
    country: 'Deutschland'
  }
];

export const DEFAULT_LOCATIONS: Location[] = [
  // Standorte / Räume
  {
    id: 'loc-wache-lager',
    code: 'LOC-LPH-01',
    name: 'Hauptlager & Materialdepot (Wache Laupheim)',
    type: 'ROOM',
    description: 'Zentrales Nachschublager für Sanitätsmaterial, Chargen und Prüfgeräte',
    qrCode: 'DRK-LPH-LOC-HAUPTLAGER',
    isPackable: false
  },
  {
    id: 'loc-wache-werkstatt',
    code: 'LOC-LPH-02',
    name: 'Medizintechnik & Gerätewerkstatt',
    type: 'ROOM',
    description: 'Bereich für STK/MTK-Prüfungen, Wartungen und Quarantäne-Geräte',
    qrCode: 'DRK-LPH-LOC-WERKSTATT',
    isPackable: false
  },
  // Fahrzeuge
  {
    id: 'loc-veh-mtw',
    code: 'VEH-LPH-19-1',
    name: 'MTW – Rotkreuz Laupheim 1/19-1',
    type: 'VEHICLE',
    vehicleRadioCall: 'Rotkreuz Laupheim 1/19-1',
    description: 'Mannschaftstransportwagen Bereitschaft Laupheim (Mercedes Sprinter)',
    qrCode: 'DRK-LPH-LOC-VEH-1-19-1',
    isPackable: true,
    lastCheckedAt: '2026-10-10T14:30:00Z',
    lastCheckedBy: 'Lena Schwarz',
    readinessStatus: 'GREEN'
  },
  {
    id: 'loc-veh-ktw',
    code: 'VEH-LPH-26-1',
    name: 'KTW-B – Rotkreuz Laupheim 1/26-1',
    type: 'VEHICLE',
    vehicleRadioCall: 'Rotkreuz Laupheim 1/26-1',
    description: 'Notfallkrankenwagen Typ B für Sanitätsdienst & KatS (VW Crafter)',
    qrCode: 'DRK-LPH-LOC-VEH-1-26-1',
    isPackable: true,
    lastCheckedAt: '2026-10-12T18:00:00Z',
    lastCheckedBy: 'Sarah Bucher',
    readinessStatus: 'YELLOW' // z.B. Sauerstoff oder Verfall kurz bevor
  },
  {
    id: 'loc-veh-gwsan',
    code: 'VEH-LPH-48-1',
    name: 'GW-San – Rotkreuz Laupheim 1/48-1',
    type: 'VEHICLE',
    vehicleRadioCall: 'Rotkreuz Laupheim 1/48-1',
    description: 'Gerätewagen Sanität (MAN TGM 13.290 Katastrophenschutz)',
    qrCode: 'DRK-LPH-LOC-VEH-1-48-1',
    isPackable: true,
    lastCheckedAt: '2026-09-28T19:30:00Z',
    lastCheckedBy: 'Florian Mayer',
    readinessStatus: 'GREEN'
  },
  // Mobile Einheiten / Koffer / Rucksäcke
  {
    id: 'loc-bag-notfall-a',
    code: 'BAG-LPH-NF-A',
    name: 'Notfallrucksack San-A (Rot)',
    type: 'CONTAINER_BAG',
    parentId: 'loc-veh-mtw',
    description: 'Erstangriffs-Rucksack für Sanitätsdienste auf MTW 1/19-1',
    qrCode: 'DRK-LPH-LOC-BAG-NF-A',
    isPackable: true,
    assignedPacklistId: 'pack-san-a',
    lastCheckedAt: '2026-10-14T09:00:00Z',
    lastCheckedBy: 'Florian Mayer',
    readinessStatus: 'GREEN'
  },
  {
    id: 'loc-bag-aed-mtw',
    code: 'BAG-LPH-AED-1',
    name: 'AED Bereitschaftstasche MTW',
    type: 'CONTAINER_BAG',
    parentId: 'loc-veh-mtw',
    description: 'Tragetasche mit ZOLL AED Plus & Notfallelektroden',
    qrCode: 'DRK-LPH-LOC-BAG-AED-1',
    isPackable: true,
    assignedPacklistId: 'pack-aed',
    lastCheckedAt: '2026-10-10T14:30:00Z',
    lastCheckedBy: 'Lena Schwarz',
    readinessStatus: 'GREEN'
  },
  {
    id: 'loc-bag-ktw-haupt',
    code: 'BAG-LPH-KTW-1',
    name: 'Notfallrucksack Notfallmedizin KTW-B',
    type: 'CONTAINER_BAG',
    parentId: 'loc-veh-ktw',
    description: 'Umfassender Notfallrucksack mit Intubation/Beatmung & Diagnostik',
    qrCode: 'DRK-LPH-LOC-BAG-KTW-1',
    isPackable: true,
    assignedPacklistId: 'pack-san-b',
    lastCheckedAt: '2026-10-12T18:00:00Z',
    lastCheckedBy: 'Sarah Bucher',
    readinessStatus: 'YELLOW'
  },
  {
    id: 'loc-bag-o2-ktw',
    code: 'BAG-LPH-O2-1',
    name: 'Sauerstofftasche 2L (KTW-B)',
    type: 'CONTAINER_BAG',
    parentId: 'loc-veh-ktw',
    description: 'Mobile 2-Liter 200 bar O2-Einheit mit Druckminderer und Flowmeter',
    qrCode: 'DRK-LPH-LOC-BAG-O2-1',
    isPackable: true,
    assignedPacklistId: 'pack-o2',
    lastCheckedAt: '2026-10-12T18:05:00Z',
    lastCheckedBy: 'Sarah Bucher',
    readinessStatus: 'GREEN'
  }
];

export const DEFAULT_DEVICES: Device[] = [
  {
    id: 'dev-accuvac-1',
    inventoryNumber: 'MP-LPH-2023-001',
    name: 'Elektrische Absaugpumpe ACCUVAC Pro',
    deviceType: 'Elektrische Absaugpumpe',
    modelType: 'ACCUVAC Pro (WM 11600)',
    serialOrLotNumber: 'WM-8492019',
    acquisitionYear: 2023,
    manufacturingYear: 2023,
    economicActorId: 'act-weinmann',
    locationId: 'loc-veh-ktw',
    operationalUnit: 'Bereitschaft Laupheim – KTW-B (1/26-1)',
    ceMarking: 'CE 0197',
    mdrClass: 'IIa',
    activeNonImplantable: true,
    annex1Device: true, // STK Pflicht § 12
    annex2Device: false,
    lifecycleState: 'IN_SERVICE',
    activeLocks: [],
    rules: {
      stkRequired: true,
      stkIntervalMonths: 24, // § 12: spätestens 2 Jahre zum Monatsende
      mtkRequired: false,
      dguvV3Required: true,
      dguvV3IntervalMonths: 12,
      maintenanceRequired: true
    },
    nextStkDate: '2027-04-30',
    nextDguvDate: '2027-04-30'
  },
  {
    id: 'dev-zoll-aed-1',
    inventoryNumber: 'MP-LPH-2024-004',
    name: 'Automatisierter Externer Defibrillator ZOLL AED Plus',
    deviceType: 'Halbautomatischer Defibrillator',
    modelType: 'AED Plus Graphic Screen',
    serialOrLotNumber: 'ZOL-892184-DE',
    acquisitionYear: 2024,
    manufacturingYear: 2024,
    economicActorId: 'act-zoll',
    locationId: 'loc-bag-aed-mtw',
    operationalUnit: 'Bereitschaft Laupheim – MTW (1/19-1)',
    ceMarking: 'CE 0123',
    mdrClass: 'IIb',
    activeNonImplantable: true,
    annex1Device: true,
    annex2Device: false,
    isAedExemptCandidate: true, // § 12 Abs. 2: Selbsttestender Laien-AED mit dokumentierter Sichtprüfung
    lifecycleState: 'IN_SERVICE',
    activeLocks: [],
    rules: {
      stkRequired: true,
      stkIntervalMonths: 24,
      mtkRequired: false,
      dguvV3Required: true,
      dguvV3IntervalMonths: 24,
      maintenanceRequired: true
    },
    nextStkDate: '2028-02-29', // Nächste Frist zum Monatsende berechnet
    nextDguvDate: '2028-02-29'
  },
  {
    id: 'dev-corpuls-c3',
    inventoryNumber: 'MP-LPH-2022-009',
    name: 'Defibrillator / Patientenmonitor corpuls3',
    deviceType: 'Kombiniertes Defibrillations- und Monitorsystem',
    modelType: 'corpuls3 SLIM',
    serialOrLotNumber: 'CP3-0092147',
    acquisitionYear: 2022,
    manufacturingYear: 2022,
    economicActorId: 'act-corpuls',
    locationId: 'loc-veh-gwsan',
    operationalUnit: 'Bereitschaft Laupheim – GW-San (1/48-1)',
    ceMarking: 'CE 0124',
    mdrClass: 'IIb',
    activeNonImplantable: true,
    annex1Device: true,
    annex2Device: true, // MTK für NIBP / Temperatur / SpO2
    lifecycleState: 'IN_SERVICE',
    activeLocks: [],
    rules: {
      stkRequired: true,
      stkIntervalMonths: 24,
      mtkRequired: true,
      mtkIntervalMonths: 24, // § 15 & Anlage 2 zum Jahresende
      dguvV3Required: true,
      dguvV3IntervalMonths: 12,
      maintenanceRequired: true
    },
    nextStkDate: '2026-11-30', // In Kürze fällig! (Warnung im System)
    nextMtkDate: '2026-12-31',
    nextDguvDate: '2026-11-30'
  },
  {
    id: 'dev-boso-carat',
    inventoryNumber: 'MP-LPH-2023-012',
    name: 'Blutdruckmessgerät boso carat professional',
    deviceType: 'Nichtinvasives elektronisches Blutdruckmessgerät',
    modelType: 'carat professional',
    serialOrLotNumber: 'BOS-448201',
    acquisitionYear: 2023,
    manufacturingYear: 2023,
    economicActorId: 'act-boso',
    locationId: 'loc-bag-notfall-a',
    operationalUnit: 'Bereitschaft Laupheim – Notfallrucksack San-A',
    ceMarking: 'CE 0124',
    mdrClass: 'IIa',
    activeNonImplantable: true,
    annex1Device: false,
    annex2Device: true, // § 15 & Anlage 2: 2 Jahre zum Jahresende
    lifecycleState: 'IN_SERVICE',
    activeLocks: [],
    rules: {
      stkRequired: false,
      mtkRequired: true,
      mtkIntervalMonths: 24,
      dguvV3Required: false,
      maintenanceRequired: false
    },
    nextMtkDate: '2027-12-31'
  },
  {
    id: 'dev-braun-thermo',
    inventoryNumber: 'MP-LPH-2024-018',
    name: 'Infrarot-Ohrthermometer Braun ThermoScan Pro 6000',
    deviceType: 'Strahlungsthermometer',
    modelType: 'Pro 6000 mit Ladestation',
    serialOrLotNumber: 'BRN-991204',
    acquisitionYear: 2024,
    manufacturingYear: 2024,
    economicActorId: 'act-braun',
    locationId: 'loc-bag-ktw-haupt',
    operationalUnit: 'Bereitschaft Laupheim – KTW-B Notfallrucksack',
    ceMarking: 'CE 0297',
    mdrClass: 'IIa',
    activeNonImplantable: true,
    annex1Device: false,
    annex2Device: true, // Anlage 2: Infrarotthermometer 1 Jahr zum Jahresende!
    lifecycleState: 'IN_SERVICE',
    activeLocks: [],
    rules: {
      stkRequired: false,
      mtkRequired: true,
      mtkIntervalMonths: 12,
      dguvV3Required: false,
      maintenanceRequired: false
    },
    nextMtkDate: '2026-12-31'
  }
];

export const DEFAULT_DEVICE_EVENTS: DeviceEvent[] = [
  {
    id: 'evt-1',
    deviceId: 'dev-accuvac-1',
    eventType: 'INBETRIEBNAHME',
    occurredAt: '2023-04-15T10:00:00Z',
    recordedBy: 'Florian Mayer',
    summary: 'Ordnungsgemäße Inbetriebnahme und Funktionsprüfung am Betriebsort gem. § 11 MPBetreibV durchgeführt.',
    protocolNumber: 'IBN-2023-04-15'
  },
  {
    id: 'evt-2',
    deviceId: 'dev-accuvac-1',
    eventType: 'STK_PRUEFUNG',
    occurredAt: '2025-04-20T14:00:00Z',
    recordedBy: 'Sarah Bucher',
    summary: 'Sicherheitstechnische Kontrolle nach § 12 ohne Mängel bestanden. Nächste STK berechnet zum 30.04.2027.',
    protocolNumber: 'STK-2025-WM-04'
  },
  {
    id: 'evt-3',
    deviceId: 'dev-corpuls-c3',
    eventType: 'STK_PRUEFUNG',
    occurredAt: '2024-11-12T09:30:00Z',
    recordedBy: 'GS Medizintechnik Service',
    summary: 'STK und MTK gem. Herstellerangaben durchgeführt. Nächste Kontrolle fällig Ende 11/2026.',
    protocolNumber: 'CORP-STK-2024-88'
  }
];

export const DEFAULT_INSTRUCTIONS: Instruction[] = [
  {
    id: 'inst-1',
    deviceId: 'dev-accuvac-1',
    personName: 'Sarah Bucher',
    qualification: 'Notfallsanitäterin',
    instructorName: 'Florian Mayer (Beauftragte Person)',
    instructionDate: '2023-04-16',
    type: 'ANWENDER_PARAGRAPH_4',
    manualVersion: 'Rev 3.4 (DE)',
    proofDocumentRef: 'DOC-EINWEISUNG-ACCUVAC-2023.PDF'
  },
  {
    id: 'inst-2',
    deviceId: 'dev-accuvac-1',
    personName: 'Florian Mayer',
    qualification: 'MPG-Beauftragter / Notfallsanitäter',
    instructorName: 'WEINMANN Herstellerschulung (Herr H. Becker)',
    instructionDate: '2023-04-10',
    type: 'BEAUFTRAGTE_PERSON_PARAGRAPH_11',
    manualVersion: 'Rev 3.4 (DE)',
    proofDocumentRef: 'DOC-HERSTELLERZERT-MAYER-2023.PDF'
  },
  {
    id: 'inst-3',
    deviceId: 'dev-zoll-aed-1',
    personName: 'Lena Schwarz',
    qualification: 'Rettungssanitäterin',
    instructorName: 'Sarah Bucher',
    instructionDate: '2024-03-05',
    type: 'ANWENDER_PARAGRAPH_4',
    manualVersion: 'ZOLL AED Plus Handbuch V6',
    proofDocumentRef: 'DOC-EINWEISUNG-ZOLL-SCHWARZ.PDF'
  }
];

export const DEFAULT_PRODUCT_TYPES: ProductType[] = [
  {
    id: 'prod-beatmungsbeutel',
    itemNumber: 'MAT-0101',
    name: 'Silikon-Beatmungsbeutel Erwachsene mit PEEP-Ventil',
    category: 'BEATMUNG_SAUERSTOFF',
    baseUnit: 'STK',
    packSize: 1,
    refNumber: 'WM-2401',
    pzn: '10928374',
    gtin: '4012345678901',
    minShelfLifeDaysRecommended: 365
  },
  {
    id: 'prod-tourniquet',
    itemNumber: 'MAT-0102',
    name: 'C-A-T® Tourniquet Gen 7 (Combat Application Tourniquet)',
    category: 'VERBANDSMATERIAL',
    baseUnit: 'STK',
    packSize: 1,
    refNumber: 'CAT-G7-BK',
    pzn: '11827364',
    gtin: '4098765432109',
    minShelfLifeDaysRecommended: 730
  },
  {
    id: 'prod-israeli-bandage',
    itemNumber: 'MAT-0103',
    name: 'Notverband mit Druckspange (Israeli Bandage 10cm)',
    category: 'VERBANDSMATERIAL',
    baseUnit: 'STK',
    packSize: 1,
    refNumber: 'FCP-01',
    pzn: '09812734',
    gtin: '4011223344556',
    minShelfLifeDaysRecommended: 365
  },
  {
    id: 'prod-kompressen-steril',
    itemNumber: 'MAT-0104',
    name: 'Sterile Wundkompressen 10 x 10 cm (2er steril)',
    category: 'VERBANDSMATERIAL',
    baseUnit: 'PAAR',
    packSize: 25,
    refNumber: 'SOEH-1010',
    pzn: '03491823',
    gtin: '4022334455667',
    minShelfLifeDaysRecommended: 180
  },
  {
    id: 'prod-jonosteril-500',
    itemNumber: 'MAT-0105',
    name: 'Jonosteril Infusionslösung 500 ml Ecoflac Plus',
    category: 'INFUSION_ZUGANG',
    baseUnit: 'FLASCHE',
    packSize: 10,
    refNumber: 'BB-JONO-500',
    pzn: '04128475',
    gtin: '4033445566778',
    minShelfLifeDaysRecommended: 180
  },
  {
    id: 'prod-zoll-statpadz',
    itemNumber: 'MAT-0106',
    name: 'CPR-D-padz® Defibrillationselektroden mit Feedback-Sensor',
    category: 'GERAETEZUBEHOER',
    baseUnit: 'SET',
    packSize: 1,
    refNumber: '8900-0800-01',
    pzn: '07129841',
    gtin: '4044556677889',
    minShelfLifeDaysRecommended: 180
  },
  {
    id: 'prod-sam-splint',
    itemNumber: 'MAT-0107',
    name: 'SAM Splint Universalschiene 91 cm Orange/Blau',
    category: 'IMMOBILISATION',
    baseUnit: 'STK',
    packSize: 1,
    refNumber: 'SAM-SP-XL',
    pzn: '01827493',
    gtin: '4055667788990',
    minShelfLifeDaysRecommended: 1800
  },
  {
    id: 'prod-octenisept-50',
    itemNumber: 'MAT-0108',
    name: 'Octenisept Wund-Desinfektionsspray 50 ml',
    category: 'HYGIENE_DESINFEKTION',
    baseUnit: 'FLASCHE',
    packSize: 1,
    refNumber: 'SCH-OCT-50',
    pzn: '00129384',
    gtin: '4066778899001',
    minShelfLifeDaysRecommended: 180
  }
];

export const DEFAULT_BATCHES: Batch[] = [
  // Tourniquets
  {
    id: 'bat-tourniquet-1',
    productId: 'prod-tourniquet',
    lotNumber: 'CAT-2025-A91',
    expiryDate: '2029-06-30',
    expiryPrecision: 'DAY',
    globalState: 'AVAILABLE',
    receivedAt: '2025-07-01T10:00:00Z',
    supplier: 'DRK Landesverband Logistikzentrum'
  },
  // Israeli Bandages
  {
    id: 'bat-israeli-1',
    productId: 'prod-israeli-bandage',
    lotNumber: 'ISR-88192-B',
    expiryDate: '2028-12-31',
    expiryPrecision: 'DAY',
    globalState: 'AVAILABLE',
    receivedAt: '2024-01-15T09:00:00Z',
    supplier: 'Söhngen Sanitätsfachhandel'
  },
  // Jonosteril (eines bald fällig für FEFO Test, eines noch lang gut!)
  {
    id: 'bat-jono-soon',
    productId: 'prod-jonosteril-500',
    lotNumber: 'BB-JON-24018',
    expiryDate: '2026-11-15', // In ca. 30 Tagen fällig!
    expiryPrecision: 'DAY',
    globalState: 'AVAILABLE',
    receivedAt: '2024-06-10T11:00:00Z',
    supplier: 'B. Braun Hospital Care'
  },
  {
    id: 'bat-jono-fresh',
    productId: 'prod-jonosteril-500',
    lotNumber: 'BB-JON-25099',
    expiryDate: '2028-05-31',
    expiryPrecision: 'DAY',
    globalState: 'AVAILABLE',
    receivedAt: '2025-08-01T14:00:00Z',
    supplier: 'B. Braun Hospital Care'
  },
  // Kompressen mit einer Quarantäne-Charge wegen Hersteller-Prüfung
  {
    id: 'bat-kompressen-ok',
    productId: 'prod-kompressen-steril',
    lotNumber: 'SOEH-KMP-2024',
    expiryDate: '2027-08-31',
    expiryPrecision: 'MONTH',
    globalState: 'AVAILABLE',
    receivedAt: '2024-09-01T08:00:00Z',
    supplier: 'DRK KV Biberach Zentrallager'
  },
  {
    id: 'bat-kompressen-quarantine',
    productId: 'prod-kompressen-steril',
    lotNumber: 'SOEH-KMP-2023-QC',
    expiryDate: '2027-01-31',
    expiryPrecision: 'MONTH',
    globalState: 'QUARANTINED',
    quarantineReason: 'MDR-Nachprüfung: Siegelnaht-Integrität vom Hersteller angefragt',
    receivedAt: '2023-10-15T12:00:00Z',
    supplier: 'Söhngen Sanitätsfachhandel'
  },
  // ZOLL Defi-Elektroden
  {
    id: 'bat-zoll-pads-1',
    productId: 'prod-zoll-statpadz',
    lotNumber: 'ZOL-CPRD-9821',
    expiryDate: '2027-04-30',
    expiryPrecision: 'DAY',
    globalState: 'AVAILABLE',
    receivedAt: '2025-04-10T09:00:00Z',
    supplier: 'ZOLL Medical Deutschland'
  },
  // Desinfektion
  {
    id: 'bat-octenisept-1',
    productId: 'prod-octenisept-50',
    lotNumber: 'SCH-OCT-24-3',
    expiryDate: '2027-10-31',
    expiryPrecision: 'MONTH',
    globalState: 'AVAILABLE',
    receivedAt: '2024-11-20T10:00:00Z',
    supplier: 'Apotheke am Marktplatz Laupheim'
  },
  // Beatmungsbeutel
  {
    id: 'bat-beatmungsbeutel-1',
    productId: 'prod-beatmungsbeutel',
    lotNumber: 'WM-BB-2024-11',
    expiryDate: '2030-12-31',
    expiryPrecision: 'DAY',
    globalState: 'AVAILABLE',
    receivedAt: '2024-12-01T08:00:00Z',
    supplier: 'WEINMANN EMT'
  },
  // Sam Splint
  {
    id: 'bat-sam-1',
    productId: 'prod-sam-splint',
    lotNumber: 'SAM-SP-2023',
    expiryDate: '2033-01-01',
    expiryPrecision: 'DAY',
    globalState: 'AVAILABLE',
    receivedAt: '2023-05-10T10:00:00Z',
    supplier: 'DRK KV Biberach'
  }
];

export const DEFAULT_STOCK_BALANCES: StockBalance[] = [
  // Hauptlager (Wache Laupheim)
  { batchId: 'bat-tourniquet-1', locationId: 'loc-wache-lager', localState: 'AVAILABLE', quantity: 20, version: 1 },
  { batchId: 'bat-israeli-1', locationId: 'loc-wache-lager', localState: 'AVAILABLE', quantity: 35, version: 1 },
  { batchId: 'bat-jono-soon', locationId: 'loc-wache-lager', localState: 'AVAILABLE', quantity: 8, version: 1 },
  { batchId: 'bat-jono-fresh', locationId: 'loc-wache-lager', localState: 'AVAILABLE', quantity: 40, version: 1 },
  { batchId: 'bat-kompressen-ok', locationId: 'loc-wache-lager', localState: 'AVAILABLE', quantity: 150, version: 1 },
  { batchId: 'bat-kompressen-quarantine', locationId: 'loc-wache-lager', localState: 'QUARANTINED', quantity: 25, version: 1 },
  { batchId: 'bat-zoll-pads-1', locationId: 'loc-wache-lager', localState: 'AVAILABLE', quantity: 6, version: 1 },
  { batchId: 'bat-octenisept-1', locationId: 'loc-wache-lager', localState: 'AVAILABLE', quantity: 15, version: 1 },
  { batchId: 'bat-beatmungsbeutel-1', locationId: 'loc-wache-lager', localState: 'AVAILABLE', quantity: 4, version: 1 },
  { batchId: 'bat-sam-1', locationId: 'loc-wache-lager', localState: 'AVAILABLE', quantity: 8, version: 1 },

  // Notfallrucksack San-A (MTW 1/19-1)
  { batchId: 'bat-tourniquet-1', locationId: 'loc-bag-notfall-a', localState: 'AVAILABLE', quantity: 2, version: 1 },
  { batchId: 'bat-israeli-1', locationId: 'loc-bag-notfall-a', localState: 'AVAILABLE', quantity: 4, version: 1 },
  { batchId: 'bat-kompressen-ok', locationId: 'loc-bag-notfall-a', localState: 'AVAILABLE', quantity: 10, version: 1 },
  { batchId: 'bat-octenisept-1', locationId: 'loc-bag-notfall-a', localState: 'AVAILABLE', quantity: 1, version: 1 },
  { batchId: 'bat-beatmungsbeutel-1', locationId: 'loc-bag-notfall-a', localState: 'AVAILABLE', quantity: 1, version: 1 },
  { batchId: 'bat-sam-1', locationId: 'loc-bag-notfall-a', localState: 'AVAILABLE', quantity: 1, version: 1 },

  // AED Tasche MTW
  { batchId: 'bat-zoll-pads-1', locationId: 'loc-bag-aed-mtw', localState: 'AVAILABLE', quantity: 2, version: 1 },

  // Notfallrucksack KTW-B (1/26-1)
  { batchId: 'bat-tourniquet-1', locationId: 'loc-bag-ktw-haupt', localState: 'AVAILABLE', quantity: 2, version: 1 },
  { batchId: 'bat-israeli-1', locationId: 'loc-bag-ktw-haupt', localState: 'AVAILABLE', quantity: 4, version: 1 },
  { batchId: 'bat-jono-soon', locationId: 'loc-bag-ktw-haupt', localState: 'AVAILABLE', quantity: 2, version: 1 }, // Dies löst die Warnung für KTW-B aus!
  { batchId: 'bat-kompressen-ok', locationId: 'loc-bag-ktw-haupt', localState: 'AVAILABLE', quantity: 12, version: 1 },
  { batchId: 'bat-octenisept-1', locationId: 'loc-bag-ktw-haupt', localState: 'AVAILABLE', quantity: 1, version: 1 },
  { batchId: 'bat-beatmungsbeutel-1', locationId: 'loc-bag-ktw-haupt', localState: 'AVAILABLE', quantity: 1, version: 1 }
];

export const DEFAULT_PACKLISTS: Packlist[] = [
  {
    id: 'pack-san-a',
    name: 'Soll-Packliste Notfallrucksack San-A (Erstversorgung)',
    version: '2026.1',
    approvedBy: 'Florian Mayer (Bereitschaftsleitung)',
    approvedAt: '2026-01-10',
    items: [
      { productId: 'prod-beatmungsbeutel', requiredQuantity: 1, minRemainingShelfLifeDays: 90, mandatory: true },
      { productId: 'prod-tourniquet', requiredQuantity: 2, minRemainingShelfLifeDays: 90, mandatory: true },
      { productId: 'prod-israeli-bandage', requiredQuantity: 4, minRemainingShelfLifeDays: 60, mandatory: true },
      { productId: 'prod-kompressen-steril', requiredQuantity: 10, minRemainingShelfLifeDays: 30, mandatory: true },
      { productId: 'prod-octenisept-50', requiredQuantity: 1, minRemainingShelfLifeDays: 30, mandatory: true },
      { productId: 'prod-sam-splint', requiredQuantity: 1, minRemainingShelfLifeDays: 90, mandatory: false }
    ]
  },
  {
    id: 'pack-san-b',
    name: 'Soll-Packliste KTW-B Notfallrucksack (Erweitert)',
    version: '2026.2',
    approvedBy: 'Dr. Michael Lang (Kreisverbandsarzt)',
    approvedAt: '2026-02-01',
    items: [
      { productId: 'prod-beatmungsbeutel', requiredQuantity: 1, minRemainingShelfLifeDays: 90, mandatory: true },
      { productId: 'prod-tourniquet', requiredQuantity: 2, minRemainingShelfLifeDays: 90, mandatory: true },
      { productId: 'prod-israeli-bandage', requiredQuantity: 4, minRemainingShelfLifeDays: 60, mandatory: true },
      { productId: 'prod-jonosteril-500', requiredQuantity: 2, minRemainingShelfLifeDays: 60, mandatory: true }, // FEFO Schwellenwert 60 Tage!
      { productId: 'prod-kompressen-steril', requiredQuantity: 10, minRemainingShelfLifeDays: 30, mandatory: true },
      { productId: 'prod-octenisept-50', requiredQuantity: 1, minRemainingShelfLifeDays: 30, mandatory: true }
    ]
  },
  {
    id: 'pack-aed',
    name: 'Soll-Packliste AED-Bereitschaftstasche',
    version: '2026.1',
    approvedBy: 'Sarah Bucher (Gerätebeauftragte)',
    approvedAt: '2026-01-05',
    items: [
      { productId: 'prod-zoll-statpadz', requiredQuantity: 2, minRemainingShelfLifeDays: 60, mandatory: true }
    ]
  }
];

export const DEFAULT_INCIDENTS: Incident[] = [
  {
    id: 'inc-2026-01',
    deviceId: 'dev-accuvac-1',
    occurredAt: '2026-07-14T16:20:00Z',
    reportedAt: '2026-07-14T17:00:00Z',
    reporterName: 'Lena Schwarz',
    reporterRole: 'Sanitätshelferin',
    status: 'CLOSED',
    severity: 'BEINAHE_VORKOMMNIS',
    description: 'Vakuum-Schnellkupplung rastete erst beim zweiten Versuch mit erhöhtem Kraftaufwand ein. Keine Patientenbehinderung.',
    patientHarmOccurred: false,
    immediateMeasures: 'Dichtungsring überprüft, gereinigt und Funktionsprüfung gem. § 4 durchgeführt. Gerät wieder freigegeben.',
    resolvedAt: '2026-07-15T09:00:00Z'
  }
];

export const DEFAULT_RECALLS: Recall[] = [
  {
    id: 'rec-2026-002',
    title: 'Sicherheitsmitteilung: Sterile Wundkompressen Chargenprüfung',
    manufacturer: 'W. SÖHNGEN GmbH',
    referenceNumber: 'FSCA-SOEH-2026-04',
    issuedAt: '2026-09-15',
    receivedAt: '2026-09-17',
    targetProductIds: ['prod-kompressen-steril'],
    targetLotNumbers: ['SOEH-KMP-2023-QC'],
    instructions: 'Chargen mit Zusatz "QC" sofort sperren, in Quarantäne überführen und Rückmeldung an Hersteller senden.',
    activeStatus: 'ACTIVE',
    affectedLocationIds: ['loc-wache-lager']
  }
];

export const DEFAULT_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'aud-01',
    timestamp: '2026-10-14T09:00:00Z',
    actor: 'Florian Mayer',
    action: 'READINESS_CHECK',
    entityType: 'LOCATION',
    entityId: 'loc-bag-notfall-a',
    summary: 'Kofferprüfung Notfallrucksack San-A durchgeführt: Status GRÜN (vollständig und fristgerecht).'
  },
  {
    id: 'aud-02',
    timestamp: '2026-10-12T18:00:00Z',
    actor: 'Sarah Bucher',
    action: 'READINESS_CHECK',
    entityType: 'LOCATION',
    entityId: 'loc-bag-ktw-haupt',
    summary: 'Kofferprüfung Notfallrucksack KTW-B durchgeführt: Status GELB (Jonosteril Charge BB-JON-24018 verfällt in < 45 Tagen).'
  }
];

// Helper to calculate next legal inspection date based on § 12 (STK) and § 15 (MTK)
export function calculateNextInspectionDate(
  type: 'STK' | 'MTK' | 'DGUV_V3',
  basisDate: string,
  intervalMonths: number
): string {
  const date = new Date(basisDate);
  if (isNaN(date.getTime())) return basisDate;

  if (type === 'STK') {
    // § 12 MPBetreibV: Frist endet grundsätzlich zum Monatsende nach Intervall
    date.setMonth(date.getMonth() + intervalMonths);
    // Letzter Tag des Zielmonats
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return nextMonth.toISOString().split('T')[0];
  } else if (type === 'MTK') {
    // § 15 & Anlage 2 MPBetreibV: Frist beginnt mit Ablauf des Inbetriebnahme-/Prüfjahres -> Fristende zum 31.12. des Zieljahres
    const targetYear = date.getFullYear() + Math.round(intervalMonths / 12);
    return `${targetYear}-12-31`;
  } else {
    // Standard Monatsintervall
    date.setMonth(date.getMonth() + intervalMonths);
    return date.toISOString().split('T')[0];
  }
}

// Storage Manager Class
class StorageService {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }

  // Operator
  getOperator(): OperatorConfig {
    return this.get<OperatorConfig>('operator', DEFAULT_OPERATOR);
  }
  setOperator(config: OperatorConfig): void {
    this.set('operator', config);
  }

  // Active User / Session
  getActiveUserId(): string {
    return this.get<string>('active_user_id', DEFAULT_USERS[0].id);
  }
  setActiveUserId(id: string): void {
    this.set('active_user_id', id);
  }
  getUsers(): User[] {
    return this.get<User[]>('users', DEFAULT_USERS);
  }
  setUsers(users: User[]): void {
    this.set('users', users);
  }
  getActiveUser(): User {
    const users = this.getUsers();
    const activeId = this.getActiveUserId();
    return users.find(u => u.id === activeId) || users[0];
  }

  // Theme
  getTheme(): ThemeMode {
    return this.get<ThemeMode>('theme', 'drk-red');
  }
  setTheme(theme: ThemeMode): void {
    this.set('theme', theme);
  }

  // Economic Actors
  getEconomicActors(): EconomicActor[] {
    return this.get<EconomicActor[]>('economic_actors', DEFAULT_ECONOMIC_ACTORS);
  }
  saveEconomicActor(actor: EconomicActor): void {
    const list = this.getEconomicActors();
    const idx = list.findIndex(a => a.id === actor.id);
    if (idx >= 0) list[idx] = actor;
    else list.push(actor);
    this.set('economic_actors', list);
  }

  // Locations
  getLocations(): Location[] {
    return this.get<Location[]>('locations', DEFAULT_LOCATIONS);
  }
  setLocations(locations: Location[]): void {
    this.set('locations', locations);
  }
  saveLocation(loc: Location): void {
    const list = this.getLocations();
    const idx = list.findIndex(l => l.id === loc.id);
    if (idx >= 0) list[idx] = loc;
    else list.push(loc);
    this.setLocations(list);
  }

  // Devices & MP-Buch
  getDevices(): Device[] {
    return this.get<Device[]>('devices', DEFAULT_DEVICES);
  }
  setDevices(devices: Device[]): void {
    this.set('devices', devices);
  }
  saveDevice(device: Device): void {
    const list = this.getDevices();
    const idx = list.findIndex(d => d.id === device.id);
    if (idx >= 0) list[idx] = device;
    else list.push(device);
    this.setDevices(list);
    this.logAudit('DEVICE', device.id, `Gerät aktualisiert: ${device.name} (${device.inventoryNumber})`);
  }

  getDeviceEvents(deviceId?: string): DeviceEvent[] {
    const events = this.get<DeviceEvent[]>('device_events', DEFAULT_DEVICE_EVENTS);
    if (deviceId) {
      return events.filter(e => e.deviceId === deviceId);
    }
    return events;
  }
  addDeviceEvent(event: DeviceEvent): void {
    const events = this.getDeviceEvents();
    events.unshift(event);
    this.set('device_events', events);
    this.logAudit('DEVICE_EVENT', event.deviceId, `Ereignis im Medizinproduktebuch erfasst: ${event.eventType} - ${event.summary}`);
  }

  getInstructions(deviceId?: string): Instruction[] {
    const inst = this.get<Instruction[]>('instructions', DEFAULT_INSTRUCTIONS);
    if (deviceId) {
      return inst.filter(i => i.deviceId === deviceId);
    }
    return inst;
  }
  addInstruction(instruction: Instruction): void {
    const list = this.getInstructions();
    list.unshift(instruction);
    this.set('instructions', list);
    this.logAudit('INSTRUCTION', instruction.deviceId, `Einweisungsnachweis erfasst für ${instruction.personName} (${instruction.type})`);
  }

  // Products & Batches
  getProductTypes(): ProductType[] {
    return this.get<ProductType[]>('product_types', DEFAULT_PRODUCT_TYPES);
  }
  saveProductType(prod: ProductType): void {
    const list = this.getProductTypes();
    const idx = list.findIndex(p => p.id === prod.id);
    if (idx >= 0) list[idx] = prod;
    else list.push(prod);
    this.set('product_types', list);
  }

  getBatches(): Batch[] {
    return this.get<Batch[]>('batches', DEFAULT_BATCHES);
  }
  setBatches(batches: Batch[]): void {
    this.set('batches', batches);
  }
  saveBatch(batch: Batch): void {
    const list = this.getBatches();
    const idx = list.findIndex(b => b.id === batch.id);
    if (idx >= 0) list[idx] = batch;
    else list.push(batch);
    this.setBatches(list);
  }

  getStockBalances(): StockBalance[] {
    return this.get<StockBalance[]>('stock_balances', DEFAULT_STOCK_BALANCES);
  }
  setStockBalances(balances: StockBalance[]): void {
    this.set('stock_balances', balances);
  }

  getStockMovements(): StockMovement[] {
    return this.get<StockMovement[]>('stock_movements', []);
  }

  // Atomic Stock Booking (Section 6.2 Blueprint)
  executeMovement(
    operation: StockMovement['operation'],
    reason: string,
    lines: { batchId: string; locationId: string; localState: StockBalance['localState']; delta: number }[]
  ): { success: boolean; error?: string; movement?: StockMovement } {
    const balances = this.getStockBalances();
    const activeUser = this.getActiveUser();

    // 1. Validation: Prevent negative balances
    for (const line of lines) {
      if (line.delta < 0) {
        const existing = balances.find(
          b => b.batchId === line.batchId && b.locationId === line.locationId && b.localState === line.localState
        );
        const currentQty = existing ? existing.quantity : 0;
        if (currentQty + line.delta < 0) {
          return {
            success: false,
            error: `Nicht genügend Bestand für Charge an Standort (Aktuell: ${currentQty}, Anforderung: ${Math.abs(line.delta)})`
          };
        }
      }
    }

    // 2. Apply deltas
    for (const line of lines) {
      let balance = balances.find(
        b => b.batchId === line.batchId && b.locationId === line.locationId && b.localState === line.localState
      );
      if (!balance) {
        balance = {
          batchId: line.batchId,
          locationId: line.locationId,
          localState: line.localState,
          quantity: 0,
          version: 0
        };
        balances.push(balance);
      }
      balance.quantity += line.delta;
      balance.version += 1;
    }

    // Clean up 0 balance items if desired or keep with quantity 0
    this.setStockBalances(balances);

    const movement: StockMovement = {
      id: 'mov-' + Date.now(),
      operation,
      actorId: activeUser.id,
      actorName: activeUser.name,
      occurredAt: new Date().toISOString(),
      recordedAt: new Date().toISOString(),
      reason,
      lines: lines.map(l => ({ ...l }))
    };

    const movements = this.getStockMovements();
    movements.unshift(movement);
    this.set('stock_movements', movements);

    this.logAudit(
      'STOCK_MOVEMENT',
      movement.id,
      `Materialbuchung [${operation}]: ${reason} (${lines.length} Positionen) durch ${activeUser.name}`
    );

    return { success: true, movement };
  }

  // Packlists
  getPacklists(): Packlist[] {
    return this.get<Packlist[]>('packlists', DEFAULT_PACKLISTS);
  }
  savePacklist(packlist: Packlist): void {
    const list = this.getPacklists();
    const idx = list.findIndex(p => p.id === packlist.id);
    if (idx >= 0) list[idx] = packlist;
    else list.push(packlist);
    this.set('packlists', list);
  }

  // Readiness Check Calculator for a Location
  calculateLocationReadiness(locationId: string): {
    status: 'GREEN' | 'YELLOW' | 'RED';
    issues: ReadinessIssue[];
    packlist?: Packlist;
    evaluatedItems: Array<{
      product: ProductType;
      required: number;
      available: number;
      expiringSoonCount: number;
      expiredCount: number;
      isOk: boolean;
    }>;
    assignedDevices: Array<{
      device: Device;
      isOverdue: boolean;
      isLocked: boolean;
    }>;
  } {
    const loc = this.getLocations().find(l => l.id === locationId);
    if (!loc) {
      return { status: 'GREEN', issues: [], evaluatedItems: [], assignedDevices: [] };
    }

    const issues: ReadinessIssue[] = [];
    const balances = this.getStockBalances();
    const batches = this.getBatches();
    const products = this.getProductTypes();
    const devices = this.getDevices().filter(d => d.locationId === locationId);

    // Evaluate Devices assigned directly to this location / vehicle
    const now = new Date();
    const assignedDevices = devices.map(device => {
      let isOverdue = false;
      let isLocked = device.activeLocks.length > 0;

      if (device.nextStkDate) {
        const stkDate = new Date(device.nextStkDate);
        if (stkDate < now) {
          isOverdue = true;
          issues.push({
            type: 'INSPECTION_OVERDUE',
            severity: 'CRITICAL',
            description: `STK überfällig seit ${device.nextStkDate} für ${device.name} (${device.inventoryNumber})`
          });
        }
      }
      if (device.nextMtkDate) {
        const mtkDate = new Date(device.nextMtkDate);
        if (mtkDate < now) {
          isOverdue = true;
          issues.push({
            type: 'INSPECTION_OVERDUE',
            severity: 'CRITICAL',
            description: `MTK überfällig seit ${device.nextMtkDate} für ${device.name} (${device.inventoryNumber})`
          });
        }
      }
      if (isLocked) {
        issues.push({
          type: 'DEVICE_LOCKED',
          severity: 'CRITICAL',
          description: `Gerät gesperrt (${device.activeLocks.join(', ')}) für ${device.name}`
        });
      }

      return { device, isOverdue, isLocked };
    });

    const packlists = this.getPacklists();
    const packlist = packlists.find(p => p.id === loc.assignedPacklistId);
    const evaluatedItems: Array<{
      product: ProductType;
      required: number;
      available: number;
      expiringSoonCount: number;
      expiredCount: number;
      isOk: boolean;
    }> = [];

    if (packlist) {
      for (const item of packlist.items) {
        const product = products.find(p => p.id === item.productId);
        if (!product) continue;

        // Find available stock for this product at this location
        const productBatches = batches.filter(b => b.productId === product.id);
        let usableQty = 0;
        let expiringSoonCount = 0;
        let expiredCount = 0;

        for (const batch of productBatches) {
          const bal = balances.find(
            b => b.batchId === batch.id && b.locationId === locationId && b.localState === 'AVAILABLE'
          );
          if (!bal || bal.quantity <= 0) continue;

          // Check global batch state
          if (batch.globalState !== 'AVAILABLE') {
            issues.push({
              type: 'QUARANTINED_ITEM',
              severity: 'CRITICAL',
              description: `Charge ${batch.lotNumber} von ${product.name} ist global gesperrt (${batch.globalState})`
            });
            continue;
          }

          // Check expiration
          const expDate = new Date(batch.expiryDate);
          const daysLeft = Math.round((expDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

          if (daysLeft < 0) {
            expiredCount += bal.quantity;
            issues.push({
              type: 'EXPIRED',
              severity: 'CRITICAL',
              description: `Abgelaufen (${batch.expiryDate}): ${bal.quantity}x ${product.name} (Charge ${batch.lotNumber})`
            });
          } else if (daysLeft < item.minRemainingShelfLifeDays) {
            expiringSoonCount += bal.quantity;
            usableQty += bal.quantity; // still usable until exact date, but marked warning
            issues.push({
              type: 'EXPIRING_SOON',
              severity: 'WARNING',
              description: `FEFO Vorwarnung: ${product.name} Charge ${batch.lotNumber} verfällt in ${daysLeft} Tagen (Soll-Mindestlaufzeit: ${item.minRemainingShelfLifeDays} Tage)`
            });
          } else {
            usableQty += bal.quantity;
          }
        }

        const isOk = usableQty >= item.requiredQuantity;
        if (!isOk) {
          issues.push({
            type: 'MISSING_QUANTITY',
            severity: item.mandatory ? 'CRITICAL' : 'WARNING',
            description: `Fehlmenge: ${product.name} – Soll: ${item.requiredQuantity} ${product.baseUnit}, Verfügbar: ${usableQty}`
          });
        }

        evaluatedItems.push({
          product,
          required: item.requiredQuantity,
          available: usableQty,
          expiringSoonCount,
          expiredCount,
          isOk
        });
      }
    }

    // Determine readiness color:
    // RED: any CRITICAL issue
    // YELLOW: any WARNING issue
    // GREEN: no issues
    let status: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
    if (issues.some(i => i.severity === 'CRITICAL')) {
      status = 'RED';
    } else if (issues.length > 0) {
      status = 'YELLOW';
    }

    return { status, issues, packlist, evaluatedItems, assignedDevices };
  }

  // Save a completed physical Readiness Check
  recordReadinessCheck(check: ReadinessCheck): void {
    const checks = this.get<ReadinessCheck[]>('readiness_checks', []);
    checks.unshift(check);
    this.set('readiness_checks', checks);

    // Update location cached status
    const locations = this.getLocations();
    const loc = locations.find(l => l.id === check.locationId);
    if (loc) {
      loc.lastCheckedAt = check.checkedAt;
      loc.lastCheckedBy = check.checkedBy;
      loc.readinessStatus = check.readiness;
      this.setLocations(locations);
    }

    this.logAudit(
      'READINESS_CHECK',
      check.locationId,
      `Physische Kofferprüfung abgeschlossen: Status ${check.readiness} durch ${check.checkedBy}`
    );
  }

  // Incidents & Recalls
  getIncidents(): Incident[] {
    return this.get<Incident[]>('incidents', DEFAULT_INCIDENTS);
  }
  saveIncident(incident: Incident): void {
    const list = this.getIncidents();
    const idx = list.findIndex(i => i.id === incident.id);
    if (idx >= 0) list[idx] = incident;
    else list.unshift(incident);
    this.set('incidents', list);
    this.logAudit('INCIDENT', incident.id, `Vorkommnis § 3 MPAMIV erfasst: ${incident.description.slice(0, 50)}...`);
  }

  getRecalls(): Recall[] {
    return this.get<Recall[]>('recalls', DEFAULT_RECALLS);
  }
  saveRecall(recall: Recall): void {
    const list = this.getRecalls();
    const idx = list.findIndex(r => r.id === recall.id);
    if (idx >= 0) list[idx] = recall;
    else list.unshift(recall);
    this.set('recalls', list);

    // If active recall, quarantine targeted batches
    if (recall.activeStatus === 'ACTIVE') {
      const batches = this.getBatches();
      let updated = false;
      for (const b of batches) {
        if (
          recall.targetLotNumbers.includes(b.lotNumber) ||
          recall.targetProductIds.includes(b.productId)
        ) {
          b.globalState = 'RECALLED';
          b.quarantineReason = `Hersteller-Rückruf: ${recall.title} (${recall.referenceNumber})`;
          updated = true;
        }
      }
      if (updated) this.setBatches(batches);
    }

    this.logAudit('RECALL', recall.id, `Rückrufaktion registriert: ${recall.title}`);
  }

  // Audit Log
  getAuditEvents(): AuditEvent[] {
    return this.get<AuditEvent[]>('audit_events', DEFAULT_AUDIT_EVENTS);
  }
  logAudit(entityType: string, entityId: string, summary: string): void {
    const user = this.getActiveUser();
    const evts = this.getAuditEvents();
    const event: AuditEvent = {
      id: 'aud-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      actor: user ? user.name : 'System',
      action: entityType,
      entityType,
      entityId,
      summary
    };
    evts.unshift(event);
    // Keep max 500 audit events in storage
    if (evts.length > 500) evts.pop();
    this.set('audit_events', evts);
  }

  // Backup & Restore Simulation (Blueprint § 12)
  createBackupManifest(): {
    timestamp: string;
    operator: string;
    version: string;
    schemaVersion: string;
    stats: {
      devicesCount: number;
      batchesCount: number;
      locationsCount: number;
      movementsCount: number;
      auditCount: number;
    };
    dataSnapshot: Record<string, unknown>;
  } {
    const operator = this.getOperator();
    const devices = this.getDevices();
    const batches = this.getBatches();
    const locations = this.getLocations();
    const balances = this.getStockBalances();
    const movements = this.getStockMovements();
    const audit = this.getAuditEvents();
    const incidents = this.getIncidents();
    const recalls = this.getRecalls();
    const packlists = this.getPacklists();
    const products = this.getProductTypes();
    const actors = this.getEconomicActors();

    return {
      timestamp: new Date().toISOString(),
      operator: operator.organizationName,
      version: '2.0.0-DRK-LPH',
      schemaVersion: '2026.10',
      stats: {
        devicesCount: devices.length,
        batchesCount: batches.length,
        locationsCount: locations.length,
        movementsCount: movements.length,
        auditCount: audit.length
      },
      dataSnapshot: {
        operator,
        devices,
        batches,
        locations,
        balances,
        movements,
        audit,
        incidents,
        recalls,
        packlists,
        products,
        actors
      }
    };
  }

  restoreFromBackup(backupJson: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(backupJson);
      if (!parsed.dataSnapshot || !parsed.schemaVersion) {
        return { success: false, message: 'Ungültiges DRK-Backup-Format oder fehlendes Schema-Manifest.' };
      }
      const data = parsed.dataSnapshot;
      if (data.operator) this.setOperator(data.operator);
      if (data.devices) this.setDevices(data.devices);
      if (data.batches) this.setBatches(data.batches);
      if (data.locations) this.setLocations(data.locations);
      if (data.balances) this.setStockBalances(data.balances);
      if (data.movements) this.set('stock_movements', data.movements);
      if (data.audit) this.set('audit_events', data.audit);
      if (data.incidents) this.set('incidents', data.incidents);
      if (data.recalls) this.set('recalls', data.recalls);
      if (data.packlists) this.set('packlists', data.packlists);
      if (data.products) this.set('product_types', data.products);
      if (data.actors) this.set('economic_actors', data.actors);

      this.logAudit('SYSTEM', 'RESTORE', `Vollständiges Restore aus Backup vom ${parsed.timestamp} eingespielt.`);
      return { success: true, message: `Backup erfolgreich wiederhergestellt! (${parsed.stats?.devicesCount || 0} Geräte)` };
    } catch (e: unknown) {
      return { success: false, message: 'Fehler beim Parsen der Backup-Datei: ' + (e instanceof Error ? e.message : String(e)) };
    }
  }

  resetToDefaults(): void {
    localStorage.clear();
    this.setOperator(DEFAULT_OPERATOR);
    this.setUsers(DEFAULT_USERS);
    this.setLocations(DEFAULT_LOCATIONS);
    this.setDevices(DEFAULT_DEVICES);
    this.set('device_events', DEFAULT_DEVICE_EVENTS);
    this.set('instructions', DEFAULT_INSTRUCTIONS);
    this.set('economic_actors', DEFAULT_ECONOMIC_ACTORS);
    this.set('product_types', DEFAULT_PRODUCT_TYPES);
    this.setBatches(DEFAULT_BATCHES);
    this.setStockBalances(DEFAULT_STOCK_BALANCES);
    this.set('packlists', DEFAULT_PACKLISTS);
    this.set('incidents', DEFAULT_INCIDENTS);
    this.set('recalls', DEFAULT_RECALLS);
    this.set('audit_events', DEFAULT_AUDIT_EVENTS);
    this.setTheme('drk-red');
  }
}

export const storage = new StorageService();
