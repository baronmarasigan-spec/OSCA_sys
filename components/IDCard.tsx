
import React from 'react';
import { calculateAge, formatDate } from '../services/dateUtils';
import { User } from '../types';

interface IDCardProps {
  user: User;
}

export const IDCard: React.FC<IDCardProps> = ({ user }) => {

  return (
    <div className="w-[500px] h-[310px] bg-white rounded-xl shadow-2xl overflow-hidden relative flex flex-col font-sans select-none border border-slate-300">
      {/* Top Header - White Section */}
      <div className="bg-white px-4 py-2 flex items-center justify-between border-b border-slate-100">
        <img 
          src="https://dev2.phoenix.com.ph/wp-content/uploads/2025/12/Seal_of_San_Juan_Metro_Manila.png" 
          alt="San Juan Seal" 
          className="h-12 w-12 object-contain"
        />
        <div className="text-center">
          <h4 className="text-[9px] font-black text-slate-800 uppercase tracking-widest leading-tight">Republic of the Philippines</h4>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none my-0.5">City of San Juan</h1>
          <h2 className="text-[9px] font-bold text-slate-700 uppercase tracking-tighter">Office of the Senior Citizen Affairs (OSCA)</h2>
        </div>
        <img 
          src="https://www.phoenix.com.ph/wp-content/uploads/2025/12/Group-74.png" 
          alt="Bagong Pilipinas" 
          className="h-10 w-auto object-contain"
        />
      </div>

      {/* Name Section - Red Bar */}
      <div className="bg-[#dc2626] py-2 flex flex-col items-center">
        <span className="text-[8px] text-white/80 font-bold uppercase tracking-[0.3em] mb-0.5">Name</span>
        <h3 className="text-2xl font-black text-white uppercase tracking-wider leading-none drop-shadow-sm">
          {user.name}
        </h3>
      </div>

      {/* Main Details Section */}
      <div className="flex-1 px-6 pt-4 flex gap-6 relative">
        <div className="flex-1 space-y-4">
          {/* Address Row */}
          <div className="text-center border-b border-slate-300 pb-1">
            <p className="text-xs font-black text-slate-800 uppercase leading-tight">{user.address || '155 F. BLUMENTRITT, SAN JUAN'}</p>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Address</p>
          </div>

          {/* Grid Details Row */}
          <div className="grid grid-cols-4 gap-2 text-center items-end">
            <div>
              <p className="text-[10px] font-bold text-slate-900">{formatDate(user.birthDate || '1955-03-15')}</p>
              <div className="h-px bg-slate-300 w-full my-1"></div>
              <p className="text-[8px] font-black text-slate-500 uppercase">Birthday</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-900">{calculateAge(user.birthDate || '1955-03-15')}</p>
              <div className="h-px bg-slate-300 w-full my-1"></div>
              <p className="text-[8px] font-black text-slate-500 uppercase">Age</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-900">{user.sex || 'Male'}</p>
              <div className="h-px bg-slate-300 w-full my-1"></div>
              <p className="text-[8px] font-black text-slate-500 uppercase">Gender</p>
            </div>
            <div>
              <div className="h-4"></div>
              <div className="h-px bg-slate-300 w-full my-1"></div>
              <p className="text-[8px] font-black text-slate-500 uppercase">Signature</p>
            </div>
          </div>

          {/* Mayor Signature Section */}
          <div className="pt-4 text-left">
            <h5 className="text-[11px] font-black text-slate-900 leading-none">HON. FRANCIS ZAMORA</h5>
            <p className="text-[9px] text-slate-600 font-bold">City Mayor</p>
          </div>
        </div>

        {/* Right Photo Column */}
        <div className="w-32 shrink-0 flex flex-col items-center">
           <p className="text-[9px] font-black text-slate-900 mb-1 whitespace-nowrap">ID No.: <span className="underline">{user.seniorIdNumber || 'SC-2024-DUMMY'}</span></p>
           <div className="w-32 h-36 bg-slate-100 rounded-2xl border-2 border-slate-900 overflow-hidden shadow-md">
             <img src={user.avatarUrl} alt="ID Photo" className="w-full h-full object-cover" />
           </div>
        </div>
      </div>

      {/* Bottom Footer Stripes */}
      <div className="mt-auto">
        <div className="h-2.5 bg-[#001f60]"></div>
        <div className="bg-[#dc2626] py-1 flex items-center justify-center">
          <p className="text-white font-black text-[11px] uppercase tracking-[0.4em]">Senior Citizen ID Card</p>
        </div>
      </div>
    </div>
  );
};
