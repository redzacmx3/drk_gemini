import React, { useState, useEffect } from 'react';
import { storage } from './services/storage';
import { ThemeMode } from './types/inventory';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { DevicesView } from './components/DevicesView';
import { StockView } from './components/StockView';
import { LocationsAndKoffer } from './components/LocationsAndKoffer';
import { IncidentsAndRecalls } from './components/IncidentsAndRecalls';
import { AdminAndDeployment } from './components/AdminAndDeployment';
import { ScannerModal } from './components/ScannerModal';
import { SetupWizard } from './components/SetupWizard';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(storage.getTheme());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedContextId, setSelectedContextId] = useState<string | undefined>(undefined);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isReceiptModalRequested, setIsReceiptModalRequested] = useState(false);

  // Check if first-run setup wizard is needed
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(!storage.getOperator().isInstalled);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-navy', 'theme-high-contrast');

    if (theme === 'drk-dark') {
      root.classList.add('dark');
    } else if (theme === 'drk-navy') {
      root.classList.add('dark', 'theme-navy');
    } else if (theme === 'high-contrast') {
      root.classList.add('theme-high-contrast');
    }
    storage.setTheme(theme);
  }, [theme]);

  const handleNavigate = (tab: string, contextId?: string) => {
    setActiveTab(tab);
    setSelectedContextId(contextId);
  };

  const handleOpenNewReceipt = () => {
    setActiveTab('stock');
    setIsReceiptModalRequested(true);
  };

  if (isSetupWizardOpen) {
    return (
      <SetupWizard
        onComplete={() => {
          setIsSetupWizardOpen(false);
          setActiveTab('dashboard');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Application Header */}
      <Header
        activeTheme={theme}
        onThemeChange={setTheme}
        onOpenScanner={() => setIsScannerOpen(true)}
        onSelectNav={handleNavigate}
        onStartSetupWizard={() => setIsSetupWizardOpen(true)}
      />

      {/* Main Tab Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setSelectedContextId(undefined);
          setActiveTab(tab);
        }}
      />

      {/* Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            onNavigate={handleNavigate}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenNewReceipt={handleOpenNewReceipt}
          />
        )}

        {activeTab === 'devices' && (
          <DevicesView selectedDeviceId={selectedContextId} />
        )}

        {activeTab === 'stock' && (
          <StockView initialOpenReceipt={isReceiptModalRequested} />
        )}

        {activeTab === 'locations' && (
          <LocationsAndKoffer initialLocationId={selectedContextId} />
        )}

        {activeTab === 'incidents' && (
          <IncidentsAndRecalls />
        )}

        {activeTab === 'admin' && (
          <AdminAndDeployment onStartSetupWizard={() => setIsSetupWizardOpen(true)} />
        )}
      </main>

      {/* Barcode & QR Scanner Modal */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onNavigateToDevice={(deviceId) => handleNavigate('devices', deviceId)}
        onNavigateToLocation={(locId) => handleNavigate('locations', locId)}
        onNavigateToStock={() => handleNavigate('stock')}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 py-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-red-600">DRK Ortsverein Laupheim e.V.</span>
            <span>·</span>
            <span>Medizinprodukte-Betreiberverordnung (MPBetreibV) v2</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span>InvenTree &amp; OpenBoxes inspiriert</span>
            <span>·</span>
            <span>Self-Hosting ready (HTTP / Tailscale)</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
