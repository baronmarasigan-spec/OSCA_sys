
import React from 'react';
import { useApp } from '../../context/AppContext';
import { Accessibility } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CitizenDashboard: React.FC = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  const menuItems = [
    { 
      label: 'My Profile', 
      iconUrl: 'https://dev2.phoenix.com.ph/wp-content/uploads/2026/01/Vector-Profile.png', 
      path: '/citizen/profile',
    },
    { 
      label: 'Benefits', 
      iconUrl: 'https://dev2.phoenix.com.ph/wp-content/uploads/2026/01/Vector-Benefits.png', 
      path: '/citizen/benefits', 
    },
    { 
      label: 'ID Services', 
      iconUrl: 'https://dev2.phoenix.com.ph/wp-content/uploads/2026/01/Vector-ID.png', 
      path: '/citizen/id', // Redirection logic handled inside CitizenID component
    },
    { 
      label: 'Citizen Concerns', 
      iconUrl: 'https://dev2.phoenix.com.ph/wp-content/uploads/2026/01/Vector-Concern.png', 
      path: '/citizen/complaints', 
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-start py-2 md:py-4">
      
      {/* Welcome Message Section */}
      <div className="text-center space-y-2 mt-2 mb-10 md:mb-16 w-full">
        <h1 className="text-[#dc2626] text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight drop-shadow-sm">
          Welcome, {currentUser?.name?.split(' ')[0]}!
        </h1>
        <p className="text-slate-600 text-sm md:text-lg lg:text-xl font-semibold opacity-90 tracking-tight">
          What would you like to do today?
        </p>
      </div>

      {/* Grid of Square Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-14 w-full mb-12 md:mb-20 px-4">
        {menuItems.map((item, index) => (
          <button 
            key={index}
            onClick={() => navigate(item.path)}
            className="group flex flex-col items-center"
          >
            {/* White Rounded Square Tile */}
            <div className="w-20 h-20 md:w-28 md:h-28 lg:w-36 lg:h-36 bg-white rounded-[1.75rem] md:rounded-[2.25rem] shadow-xl shadow-black/15 border border-white/50 flex items-center justify-center mb-5 
                            group-hover:scale-105 group-hover:shadow-[0_20px_40px_rgba(220,38,38,0.2)] transition-all duration-500 relative overflow-hidden p-5 md:p-6 lg:p-8">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <img 
                src={item.iconUrl} 
                alt={item.label} 
                className="w-full h-full object-contain group-hover:scale-110 transition-all duration-500"
              />
            </div>
            
            {/* Label */}
            <span className="text-[10px] md:text-base lg:text-lg font-semibold text-[#1e3a8a] tracking-wide group-hover:text-[#dc2626] transition-all">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Bottom Status Pill Bar */}
      <div className="w-full max-w-4xl px-4 mt-auto mb-6">
        <div className="bg-white rounded-[2rem] md:rounded-[3rem] py-5 md:py-7 px-8 md:px-12 shadow-xl shadow-black/10 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-8">
            {/* Accessibility icon badge */}
            <div className="w-10 h-10 md:w-14 md:h-14 bg-[#2563eb] text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Accessibility size={20} className="md:w-8 md:h-8" />
            </div>
            <div>
              <p className="text-[9px] md:text-[10px] font-bold text-[#dc2626] uppercase tracking-[0.15em] leading-none mb-1.5">Senior Citizen ID</p>
              <p className="text-xs md:text-xl font-bold text-slate-500 font-mono tracking-[0.1em] uppercase">
                {currentUser?.seniorIdNumber || 'SC-2024-DUMMY'}
              </p>
            </div>
          </div>
          
          <div className="text-right hidden sm:flex flex-col items-end">
            <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] leading-none mb-1.5">Need help?</p>
            <p className="font-bold text-slate-900 text-sm md:text-lg lg:text-xl tracking-tight">
              Call <span className="text-[#dc2626] font-mono font-bold">(02) 8888-9900</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
