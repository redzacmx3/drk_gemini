import React from 'react';
import { 
  LayoutDashboard, 
  Stethoscope, 
  Package, 
  BriefcaseMedical, 
  AlertOctagon, 
  Settings, 
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';
import { storage } from '../services/storage';

interface NavigationProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab }) => {
  const devices = storage.getDevices();
  const now = new Date();
  
  // Calculate badges
  const overdueDevices = devices.filter(d => {
    if (d.nextStkDate && new Date(d.nextStkDate) < now) return true;
    if (d.nextMtkDate && new Date(d.nextMtkDate) < now) return true;
    return false;
  }).length;

  const batches = storage.getBatches();
  const expiringBatches = batches.filter(b => {
    const days = Math.round((new Date(b.expiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24));
    return days <= 60 && b.globalState === 'AVAILABLE';
  }).length;

  const recalls = storage.getRecalls().filter(r => r.activeStatus === 'ACTIVE').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Übersicht',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'devices',
      label: 'Medizinprodukte § 14 / § 13',
      icon: Stethoscope,
      badge: overdueDevices > 0 ? { count: overdueDevices, color: 'bg-red-600 text-white' } : null
    },
    {
      id: 'stock',
      label: 'Material & Chargen (FEFO)',
      icon: Package,
      badge: expiringBatches > 0 ? { count: expiringBatches, color: 'bg-amber-600 text-white' } : null
    },
    {
      id: 'locations',
      label: 'Standorte & Kofferprüfungen',
      icon: BriefcaseMedical,
      badge: null
    },
    {
      id: 'incidents',
      label: 'Vorkommnisse & Rückrufe',
      icon: AlertOctagon,
      badge: recalls > 0 ? { count: recalls, color: 'bg-red-700 text-white animate-pulse' } : null
    },
    {
      id: 'admin',
      label: 'Admin & Docker Deploy',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <nav className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-sm shadow-red-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badge.color}`}>
                    {item.badge.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
