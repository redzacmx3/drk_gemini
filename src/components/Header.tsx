import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Scan, 
  Moon, 
  Sun, 
  Palette, 
  UserCheck, 
  AlertTriangle, 
  Truck, 
  HelpCircle 
} from 'lucide-react';
import { storage } from '../services/storage';
import { ThemeMode, Role } from '../types/inventory';

interface HeaderProps {
  onOpenScanner: () => void;
  onThemeChange: (theme: ThemeMode) => void;
  activeTheme: ThemeMode;
  onSelectNav: (tab: string) => void;
  onStartSetupWizard: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenScanner,
  onThemeChange,
  activeTheme,
  onSelectNav,
  onStartSetupWizard
}) => {
  const operator = storage.getOperator();
  const users = storage.getUsers();
  const activeUser = storage.getActiveUser();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

  const roleLabels: Record<Role, string> = {
    ADMIN: 'Administrator',
    DEVICE_MANAGER: 'Geräteverantwortlicher (§ 13/14)',
    MATERIAL_MANAGER: 'Materialwart (Lager/FEFO)',
    HELPER: 'Helfer / Einsatzkraft',
    AUDITOR: 'Auditor / Leitung',
    VIEWER: 'Betrachter (Nur Lesen)'
  };

  const handleSwitchUser = (userId: string) => {
    storage.setActiveUserId(userId);
    setShowUserDropdown(false);
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      {/* DRK Signature Red Accent Bar */}
      <div className="h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-red-700 w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Operator Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectNav('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold shadow-md shadow-red-500/20 flex-shrink-0">
              <span className="text-xl leading-none">✚</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  DRK WARENBESTAND
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900">
                  MPBetreibV v2
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-xs sm:max-w-md">
                {operator.organizationName} · {operator.siteName.split(' ')[0]}
              </div>
            </div>
          </div>

          {/* Quick Actions & User Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Quick Barcode Scanner Button */}
            <button
              onClick={onOpenScanner}
              title="Barcode & QR Scanner öffnen (GS1-128 & DRK-Tags)"
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm transition-all focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <Scan className="w-4 h-4" />
              <span className="hidden sm:inline">Scannen</span>
            </button>

            {/* Theme Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowThemeDropdown(!showThemeDropdown);
                  setShowUserDropdown(false);
                }}
                title="Farbschema & Dark Mode anpassen"
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
              >
                <Palette className="w-5 h-5 text-red-600 dark:text-red-400" />
              </button>

              {showThemeDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 text-sm">
                  <div className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Design &amp; Farbschema
                  </div>
                  <button
                    onClick={() => { onThemeChange('drk-red'); setShowThemeDropdown(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                      activeTheme === 'drk-red' ? 'bg-red-50 text-red-700 font-semibold dark:bg-red-950/40 dark:text-red-300' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>🔴 DRK Rot (Standard)</span>
                    {activeTheme === 'drk-red' && <span className="text-xs">Aktiv</span>}
                  </button>
                  <button
                    onClick={() => { onThemeChange('drk-dark'); setShowThemeDropdown(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                      activeTheme === 'drk-dark' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>🌙 DRK Nachtdienst (Dark)</span>
                    {activeTheme === 'drk-dark' && <span className="text-xs">Aktiv</span>}
                  </button>
                  <button
                    onClick={() => { onThemeChange('drk-navy'); setShowThemeDropdown(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                      activeTheme === 'drk-navy' ? 'bg-blue-50 text-blue-700 font-semibold dark:bg-blue-950/40 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>🔵 KatS Blau / Sanitätsdienst</span>
                    {activeTheme === 'drk-navy' && <span className="text-xs">Aktiv</span>}
                  </button>
                  <button
                    onClick={() => { onThemeChange('high-contrast'); setShowThemeDropdown(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                      activeTheme === 'high-contrast' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>⚡ Hoher Kontrast (Barrierefrei)</span>
                    {activeTheme === 'high-contrast' && <span className="text-xs">Aktiv</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Active User Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowThemeDropdown(false);
                }}
                className="flex items-center space-x-2 p-1.5 pr-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                title="Benutzer wechseln für Rechte-Simulation"
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                  {activeUser.avatarInitials}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                    {activeUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {roleLabels[activeUser.role].split(' ')[0]}
                  </div>
                </div>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 text-sm">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                    <div className="text-xs text-slate-400 font-medium">Angemeldeter Benutzer</div>
                    <div className="font-bold text-slate-900 dark:text-white">{activeUser.name}</div>
                    <div className="text-xs text-red-600 dark:text-red-400 font-medium">{roleLabels[activeUser.role]}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{activeUser.operationalUnit}</div>
                  </div>

                  <div className="px-2 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Benutzer / Rolle wechseln
                  </div>

                  <div className="space-y-1">
                    {users.map(u => (
                      <button
                        key={u.id}
                        onClick={() => handleSwitchUser(u.id)}
                        className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-left transition ${
                          u.id === activeUser.id 
                            ? 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200 font-semibold' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          {u.avatarInitials}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-medium leading-tight truncate">{u.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{roleLabels[u.role]}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onStartSetupWizard();
                      }}
                      className="w-full text-center px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                    >
                      🛠️ Ersteinrichtungs-Wizard öffnen
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
