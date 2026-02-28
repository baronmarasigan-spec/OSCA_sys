
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { 
  LogOut, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight, 
  UserCheck, 
  CreditCard, 
  HeartHandshake, 
  Stethoscope, 
  LayoutDashboard, 
  Circle, 
  Users, 
  Database, 
  User as UserIcon 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const SubMenuItem = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 pl-11 pr-4 py-2 w-full text-sm transition-all duration-200 ${
      active 
      ? 'text-primary-600 font-bold bg-primary-50 border-r-4 border-primary-600' 
      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
    }`}
  >
    <Circle size={6} className={`${active ? 'fill-primary-600' : 'fill-transparent'}`} />
    <span className="font-semibold">{label}</span>
  </button>
);

const MenuGroup = ({ icon: Icon, label, children, isOpen, onClick }: any) => (
  <div className="mb-1">
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 ${
        isOpen ? 'bg-slate-100 text-slate-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} />
        <span className="text-left font-bold">{label}</span>
      </div>
      {children && (
        isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
      )}
    </button>
    {isOpen && (
      <div className="mt-1 space-y-1">
        {children}
      </div>
    )}
  </div>
);

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, logout } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    registration: currentPath.includes('/admin/registered/'),
    id: currentPath.includes('/admin/id/'),
    benefits: currentPath.includes('/admin/benefits/'),
    philhealth: currentPath.includes('/admin/philhealth/'),
  });

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const isCitizen = currentUser?.role === Role.CITIZEN;

  if (isCitizen) {
    return (
      <div 
        className="min-h-screen font-sans flex flex-col relative bg-fixed bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: "url('https://www.phoenix.com.ph/wp-content/uploads/2026/01/Group-81.png')" }}
      >
        <div className="absolute inset-0 bg-[#2d2d2d]/50 pointer-events-none -z-10"></div>

        {/* Updated Header with Gradient Effect */}
        <header className="bg-gradient-to-r from-[#dc2626] via-[#e11d48] to-[#991b1b] h-16 md:h-20 flex items-center shadow-2xl relative z-50 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src="https://www.phoenix.com.ph/wp-content/uploads/2025/12/Group-74.png" 
                alt="San Juan Official Logos" 
                className="h-10 md:h-14 w-auto object-contain drop-shadow-md"
              />
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-white font-bold text-sm md:text-base hidden sm:block tracking-tight drop-shadow-sm">
                  {currentUser?.name}
                </span>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#2563eb] to-[#1e3a8a] rounded-full flex items-center justify-center text-white border-2 border-white/20 shadow-lg">
                  <UserIcon size={18} fill="currentColor" />
                </div>
              </div>

              <div className="w-[1px] h-6 md:h-8 bg-white/20 mx-1"></div>

              <button 
                onClick={logout}
                className="flex items-center gap-1.5 text-white/90 hover:text-white transition-all group px-1"
              >
                <span className="font-bold text-sm md:text-base hidden xs:block tracking-wide uppercase text-[10px] md:text-xs">Exit</span>
                <LogOut size={18} className="group-hover:translate-x-1 transition-transform" strokeWidth={2.5} stroke="currentColor" />
              </button>
            </div>
          </div>
          {/* Subtle bottom shine line */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
        </header>

        <main className="flex-1 w-full relative overflow-hidden">
          <div className="relative z-0 h-full overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full py-8 md:py-16">
              {children}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
           <span className="font-bold text-slate-800 text-lg tracking-tight">SeniorConnect Admin</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <aside className={`fixed inset-y-0 left-0 z-10 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3 mb-8 px-2 hidden md:flex">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">SC</div>
            <div>
              <h1 className="font-bold text-slate-800 text-lg leading-tight tracking-tight">SeniorConnect</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{currentUser?.role.replace('_', ' ')}</p>
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <MenuGroup icon={LayoutDashboard} label="Dashboard" onClick={() => handleNavigate('/admin/dashboard')} isOpen={currentPath === '/admin/dashboard'} />
            <MenuGroup icon={UserCheck} label="Registration" isOpen={expandedGroups.registration} onClick={() => toggleGroup('registration')}>
                <SubMenuItem label="Management" active={currentPath === '/admin/registered/all'} onClick={() => handleNavigate('/admin/registered/all')} />
                <SubMenuItem label="Walk-in" active={currentPath === '/admin/registered/walk-in'} onClick={() => handleNavigate('/admin/registered/walk-in')} />
            </MenuGroup>
            <MenuGroup icon={Users} label="Masterlist / Approved" onClick={() => handleNavigate('/admin/masterlist')} isOpen={currentPath === '/admin/masterlist'} />
            <MenuGroup icon={CreditCard} label="ID Issuance" isOpen={expandedGroups.id} onClick={() => toggleGroup('id')}>
                <SubMenuItem label="Management" active={currentPath === '/admin/id/all'} onClick={() => handleNavigate('/admin/id/all')} />
                <SubMenuItem label="Walk-in" active={currentPath === '/admin/id/walk-in'} onClick={() => handleNavigate('/admin/id/walk-in')} />
            </MenuGroup>
            <MenuGroup icon={HeartHandshake} label="Benefits" isOpen={expandedGroups.benefits} onClick={() => toggleGroup('benefits')}>
                <SubMenuItem label="For Approval" active={currentPath === '/admin/benefits/management'} onClick={() => handleNavigate('/admin/benefits/management')} />
                <SubMenuItem label="Walk-in" active={currentPath === '/admin/benefits/walk-in'} onClick={() => handleNavigate('/admin/benefits/walk-in')} />
                <SubMenuItem label="Annual Cash" active={currentPath === '/admin/benefits/annual-cash'} onClick={() => handleNavigate('/admin/benefits/annual-cash')} />
            </MenuGroup>
            <MenuGroup icon={Stethoscope} label="Philhealth Facilitation" isOpen={expandedGroups.philhealth} onClick={() => toggleGroup('philhealth')}>
                <SubMenuItem label="Walk-in" active={currentPath === '/admin/philhealth/walk-in'} onClick={() => handleNavigate('/admin/philhealth/walk-in')} />
                <SubMenuItem label="For Approval" active={currentPath === '/admin/philhealth/approval'} onClick={() => handleNavigate('/admin/philhealth/approval')} />
                <SubMenuItem label="Approved" active={currentPath === '/admin/philhealth/approved'} onClick={() => handleNavigate('/admin/philhealth/approved')} />
                <SubMenuItem label="Disapproved" active={currentPath === '/admin/philhealth/disapproved'} onClick={() => handleNavigate('/admin/philhealth/disapproved')} />
            </MenuGroup>
            <div className="pt-6 pb-2">
                <div className="h-px bg-slate-100 w-full mb-4"></div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4">Registry Reference</p>
            </div>
            <MenuGroup icon={Database} label="LCR/PWD Registry" onClick={() => handleNavigate('/admin/registry')} isOpen={currentPath === '/admin/registry'} />
          </div>

          <div className="pt-6 border-t border-slate-100 mt-4">
            <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-red-500 hover:bg-red-50 transition-colors">
              <LogOut size={18} />
              <span className="font-bold">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 z-0 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <main className="flex-1 overflow-auto h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
};
