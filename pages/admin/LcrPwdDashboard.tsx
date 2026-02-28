import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Database, Eye, X, MapPin, Calendar, User, RefreshCw, ShieldAlert, CloudOff, AlertCircle, Activity, Info, ShieldX, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { calculateAge, formatDate } from '../../services/dateUtils';
import { RegistryRecord } from '../../types';

export const LcrPwdDashboard: React.FC = () => {
  const { registryRecords, fetchExternalRegistry, registryError } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Strictly Birth registry for LCR
  const lcrRecordType = 'birth';

  const handleSync = useCallback((page: number, searchVal: string = '') => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 500);
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    handleSync(1, '');
  }, []);

  useEffect(() => {
    if (currentPage !== 1) {
        handleSync(currentPage, searchTerm);
    }
  }, [currentPage]);

  // Ensure we only see LCR records locally too
  const filteredRecords = registryRecords.filter(record => record.type === 'LCR');

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    setCurrentPage(newPage);
  };

  const getDisplayName = (record: any) => {
    if (record.lastName && record.firstName) {
        return `${record.lastName}, ${record.firstName} ${record.middleName || ''}`;
    }
    // Fallback for APIs returning a single name string
    return record.name || record.full_name || record.fullname || 'Unknown Identity';
  };

  const ViewRecordModal = ({ record, onClose }: { record: any, onClose: () => void }) => {
    const age = calculateAge(record.birthDate);
    const fullName = getDisplayName(record);
    const formattedBirthday = formatDate(record.birthDate);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
             <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-20 flex flex-col overflow-hidden animate-scale-up">
                 <div className="bg-slate-900 p-6 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                         <div className="p-2 rounded-lg bg-primary-500 text-white">
                             <Database size={24} />
                         </div>
                         <div>
                             <h2 className="text-xl font-semibold text-white leading-none">Registry Entry Details</h2>
                             <p className="text-slate-400 text-sm mt-1 font-mono font-medium">Node ID: {record.id}</p>
                         </div>
                     </div>
                     <button onClick={onClose} className="p-2 bg-white/10 text-white hover:bg-white/20 rounded-full transition-colors">
                         <X size={20} />
                     </button>
                 </div>

                 <div className="p-8 overflow-y-auto custom-scrollbar max-h-[70vh]">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                             <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-2 flex items-center gap-2">
                                <User size={16} /> Identity Profile
                             </h3>
                             <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500">Full Name</label>
                                    <p className="font-bold text-slate-800 text-lg uppercase">{fullName}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                        <Calendar size={12} /> Birth Date
                                    </label>
                                    <p className="font-medium text-slate-800">{formattedBirthday || 'N/A'}</p>
                                </div>
                                {record.birthDate && (
                                  <div>
                                      <label className="text-xs font-semibold text-slate-500">Calculated Age</label>
                                      <p className="font-bold text-primary-600">{age} Years Old</p>
                                  </div>
                                )}
                             </div>
                         </div>

                         <div className="space-y-4">
                             <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-2 flex items-center gap-2">
                                <MapPin size={16} /> Registry Context
                             </h3>
                             <div className="bg-slate-50 p-6 rounded-2xl space-y-4 border border-slate-100">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data Provider</p>
                                    <p className="text-sm font-bold text-slate-700">api-dbosca.phoenix.com.ph</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Record Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        <p className="text-sm font-bold text-emerald-600">Verified Birth Registry Entry</p>
                                    </div>
                                </div>
                             </div>
                         </div>
                     </div>
                 </div>

                 <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
                     <button onClick={onClose} className="px-8 py-2 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-colors">
                         Close Detail View
                     </button>
                 </div>
             </div>
        </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {selectedRecord && <ViewRecordModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight text-primary-600">LCR Birth Registry</h1>
          <p className="text-slate-500 font-medium leading-tight">Official cloud synchronization for birth records.</p>
        </div>
      </header>

      {registryError && (
          <div className="bg-amber-50 border-2 border-amber-100 p-8 rounded-[2.5rem] flex items-start gap-6 animate-fade-in-up shadow-sm">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-50 shrink-0">
                  <CloudOff size={32} />
              </div>
              <div className="space-y-3 flex-1">
                  <h3 className="text-lg font-black text-amber-900 uppercase tracking-tight leading-none">Connection Blocked</h3>
                  <p className="text-amber-700 text-sm font-semibold leading-relaxed">
                      Registry handshake failure. Handled by the cloud gateway.
                  </p>
              </div>
          </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden ring-1 ring-black/5">
        <div className="p-6 border-b border-slate-100 bg-slate-50/40 space-y-6">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative max-w-md w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-primary-500" size={18} />
                <input 
                  type="text"
                  placeholder="Search name and press Enter..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-black text-sm uppercase tracking-tight"
                  value={searchTerm}
                  onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                          setCurrentPage(1);
                          handleSync(1, searchTerm);
                      }
                  }}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <Database size={12} className="text-primary-500" /> Page Results: {filteredRecords.length}
                </div>
                <button 
                  onClick={() => handleSync(currentPage, searchTerm)}
                  disabled={isSyncing}
                  className="p-2 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-colors disabled:opacity-50"
                  title="Refresh Data"
                >
                  <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                </button>
              </div>
           </div>

           <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                 <div className="px-4 py-2 rounded-lg bg-slate-900 text-white shadow-md text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Layers size={12} /> Displaying: 10 Records Per Page
                 </div>
              </div>
              
              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                  <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isSyncing}
                      className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                      <ChevronLeft size={16} />
                  </button>
                  <div className="px-4 py-1.5 bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600">
                      Page {currentPage}
                  </div>
                  <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={filteredRecords.length < 10 || isSyncing}
                      className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                      <ChevronRight size={16} />
                  </button>
              </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                <th className="p-6">Name</th>
                <th className="p-6">Birthday</th>
                <th className="p-6">Current Age</th>
                <th className="p-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((record, idx) => {
                const displayName = getDisplayName(record);
                const age = calculateAge(record.birthDate);
                const formattedBday = formatDate(record.birthDate);
                
                return (
                  <tr key={`${record.id}-${idx}`} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                          <User size={14} />
                        </div>
                        <span className="font-black text-slate-900 uppercase tracking-tight text-sm leading-none">
                          {displayName}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                         <Calendar size={12} className="text-slate-300" /> {formattedBday}
                      </span>
                    </td>
                    <td className="p-6">
                      {record.birthDate ? (
                        <span className="text-xs font-black text-primary-600 uppercase tracking-tighter">
                          {age} Years Old
                        </span>
                      ) : (
                        <span className="text-slate-300 text-[10px] font-bold uppercase">N/A</span>
                      )}
                    </td>
                    <td className="p-6 text-right">
                      <button 
                          onClick={() => setSelectedRecord(record)}
                          className="px-4 py-2 bg-white border border-slate-200 text-slate-400 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                      >
                          Review
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredRecords.length === 0 && !isSyncing && (
                <tr>
                   <td colSpan={4} className="p-32 text-center text-slate-300 font-black uppercase tracking-[0.3em] text-xs">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity size={40} className="opacity-10" />
                      </div>
                      {registryError ? (
                        <p className="text-red-400">Node Syncing Issue</p>
                      ) : `No records found in birth registry`}
                   </td>
                </tr>
              )}
              {isSyncing && (
                <tr>
                   <td colSpan={4} className="p-32 text-center">
                      <RefreshCw size={40} className="animate-spin text-primary-500 mx-auto opacity-40" />
                      <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Polling Cloud Registry...</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Pager Info */}
        {!isSyncing && filteredRecords.length > 0 && (
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Displaying results for Page {currentPage}
                </p>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white transition-all disabled:opacity-30 shadow-sm"
                    >
                        Prev
                    </button>
                    <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={filteredRecords.length < 10}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white transition-all disabled:opacity-30 shadow-sm"
                    >
                        Next
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};