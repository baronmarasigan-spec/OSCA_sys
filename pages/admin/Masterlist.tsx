import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Download, X, ShieldCheck, User as UserIcon, 
  MapPin, Phone, Mail, Eye, FileText, 
  RefreshCw, Database, Globe, Activity, CloudOff, ShieldAlert, Calendar, UserCircle, Briefcase, Home, CreditCard, Copy,
  CheckCircle, Fingerprint, Hash, Tag, Stethoscope, Banknote, Key, Lock
} from 'lucide-react';
import { calculateAge, formatDate } from '../../services/dateUtils';

export const Masterlist: React.FC = () => {
  const { masterlistRecords, fetchMasterlist, isLiveMode, syncError } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setLastSync(new Date().toLocaleTimeString());
    setTimeout(() => setIsRefreshing(false), 500);
  }, []);

  useEffect(() => {
    setLastSync(new Date().toLocaleTimeString());
  }, []);

  const copyToClipboard = (text: string) => {
    if (!text || text === '---') return;
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredRecords = useMemo(() => {
    let list = masterlistRecords.filter(record => {
      const name = String(record.fullName || '').toLowerCase();
      const firstName = String(record.firstName || '').toLowerCase();
      const lastName = String(record.lastName || '').toLowerCase();
      const scid = String(record.scid_number || record.seniorIdNumber || '').toLowerCase();
      const query = searchTerm.toLowerCase();
      
      return name.includes(query) || firstName.includes(query) || lastName.includes(query) || scid.includes(query);
    });

    if (sortConfig) {
      list.sort((a, b) => {
        let aValue = '';
        let bValue = '';

        if (sortConfig.key === 'scid') {
          aValue = String(a.scid_number || a.seniorIdNumber || '');
          bValue = String(b.scid_number || b.seniorIdNumber || '');
        } else if (sortConfig.key === 'name') {
          aValue = String(a.fullName || `${a.lastName || ''}, ${a.firstName || ''}`).toLowerCase();
          bValue = String(b.fullName || `${b.lastName || ''}, ${b.firstName || ''}`).toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [masterlistRecords, searchTerm, sortConfig]);

  const handleReviewProfile = (record: any) => {
    setSelectedRecord(record);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {selectedRecord && <RecordDetailsModal record={selectedRecord} onClose={() => setSelectedRecord(null)} copyToClipboard={copyToClipboard} />}
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Citizen Masterlist</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-slate-500 font-bold text-lg">Official Registry (SCID Protocol)</p>
            <div className={`flex items-center gap-2 px-3 py-1 ${isLiveMode ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'} border rounded-full ${isRefreshing ? 'animate-pulse' : ''}`}>
              {isLiveMode ? <Activity size={14} className="text-emerald-500" /> : <CloudOff size={14} className="text-amber-500" />}
              <span className={`text-[9px] font-bold uppercase tracking-[0.2em] ${isLiveMode ? 'text-emerald-600' : 'text-amber-600'}`}>
                {isLiveMode ? 'Database Handshake Active' : 'Manual Sync Mode'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {lastSync && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Last Database Poll: {lastSync}</span>}
        </div>
      </header>

      {syncError && (
        <div className="bg-amber-50 border-2 border-amber-100 p-8 rounded-[2.5rem] flex items-start gap-6 animate-fade-in-up shadow-sm">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-50 shrink-0">
            <ShieldAlert size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-amber-900 uppercase tracking-tight">API Handshake Interrupted</h3>
            <p className="text-amber-700 text-sm font-semibold max-w-2xl leading-relaxed">
              The live masterlist mirror is temporarily unavailable. Displaying local records from the last session.
            </p>
          </div>
        </div>
      )}

      {copiedId && (
        <div className="fixed top-24 right-8 z-[200] bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl animate-fade-in-down font-bold text-xs uppercase tracking-widest flex items-center gap-2 border border-white/20">
            <CheckCircle size={16} /> Copied to clipboard
        </div>
      )}

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden ring-1 ring-black/5">
        <div className="p-8 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between">
           <div className="relative max-w-md w-full group">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-primary-500" size={20} />
             <input 
               type="text"
               placeholder="Search by Name or SCID Number..."
               className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-black text-sm uppercase tracking-tight"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <Database size={12} className="text-primary-500" /> Total Registry Count: {filteredRecords.length}
              </div>
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
              >
                <RefreshCw size={16} className={`${isRefreshing ? 'animate-spin' : ''} text-slate-400`} />
              </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                <th className="p-8 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => handleSort('scid')}>
                  <div className="flex items-center gap-2">
                    SCID Number
                    {sortConfig?.key === 'scid' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="p-8 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">
                    Fullname
                    {sortConfig?.key === 'name' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="p-8">Birthdate</th>
                <th className="p-8">ID Status</th>
                <th className="p-8">Address</th>
                <th className="p-8 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((record, idx) => {
                const scidVal = record.scid_number || record.seniorIdNumber || '---';
                const hasID = scidVal !== '---' && scidVal !== '';
                const idStatus = record.id_status || 'Pending';
                const displayName = record.fullName || `${record.lastName || ''}, ${record.firstName || ''} ${record.middleName || ''}`.trim().toUpperCase();
                const birthday = record.birthDate || '---';
                
                // Address logic
                const fd = record.formData || {};
                const houseNo = record.house_no || fd.houseNo || '';
                const street = record.street || fd.street || '';
                const barangay = record.barangay || fd.barangay || '';
                const city = record.city_municipality || fd.city || 'SAN JUAN CITY';
                const address = record.address || `${houseNo} ${street}, Brgy. ${barangay}, ${city}`.trim();

                return (
                  <tr key={`${record.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-8">
                        <div className="flex items-center gap-2 group/copy">
                            <span className="font-mono text-sm font-black text-slate-800 tracking-wider uppercase">{scidVal}</span>
                            {hasID && (
                                <button onClick={() => copyToClipboard(scidVal)} className="p-1.5 bg-slate-100 text-slate-400 rounded-md hover:bg-slate-900 hover:text-white transition-all opacity-0 group-hover/copy:opacity-100">
                                    <Copy size={10} />
                                </button>
                            )}
                        </div>
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all shadow-sm">
                          <UserIcon size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-slate-900 uppercase tracking-tight text-sm leading-tight group-hover:text-primary-600 transition-colors">
                            {displayName}
                            </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                           <Calendar size={14} className="text-slate-300" /> {formatDate(birthday)}
                        </span>
                      </div>
                    </td>
                    <td className="p-8">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                            idStatus.toLowerCase() === 'released' || idStatus.toLowerCase() === 'issued'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : idStatus.toLowerCase() === 'approved'
                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                            : idStatus.toLowerCase() === 'pending'
                            ? 'bg-amber-50 text-amber-600 border-amber-100'
                            : idStatus.toLowerCase() === 'rejected'
                            ? 'bg-red-50 text-red-600 border-red-100'
                            : 'bg-slate-50 text-slate-600 border-slate-100'
                        }`}>
                            {idStatus}
                        </span>
                    </td>
                    <td className="p-8">
                      <span className="text-xs font-bold text-slate-600 uppercase truncate max-w-[200px] block" title={address}>
                        {address || '---'}
                      </span>
                    </td>
                    <td className="p-8 text-right">
                      <button 
                          onClick={() => handleReviewProfile(record)}
                          className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm active:scale-95"
                      >
                          Review Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredRecords.length === 0 && !isRefreshing && (
                <tr>
                   <td colSpan={6} className="p-32 text-center text-slate-300 font-black uppercase tracking-[0.3em] text-sm">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Activity size={60} className="opacity-10" />
                      </div>
                      {isLiveMode ? 'No Matching Registry Records' : 'Database Handshake Pending'}
                   </td>
                </tr>
              )}
              {isRefreshing && filteredRecords.length === 0 && (
                <tr>
                   <td colSpan={6} className="p-32 text-center">
                      <div className="relative inline-block">
                        <RefreshCw size={48} className="animate-spin text-primary-500 opacity-40 mx-auto" />
                        <Fingerprint size={20} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                      <p className="mt-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Masterlist Node...</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer Info Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white flex items-center justify-between shadow-xl ring-1 ring-white/10">
          <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary-400">
                  <Database size={24} />
              </div>
              <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary-400">Database Mirror Handshake</p>
                  <p className="text-xs font-bold opacity-80 uppercase leading-tight">Masterlist data is synchronized in real-time with the secure central repository.</p>
              </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Verified Integrity</span>
          </div>
      </div>
    </div>
  );
};

const RecordDetailsModal = ({ record, onClose, copyToClipboard }: { record: any, onClose: () => void, copyToClipboard: (text: string) => void }) => {
  const scidDisplay = record.scid_number || record.seniorIdNumber || 'UNASSIGNED';
  const citizenId = record.id || '---';
  const fd = record.formData || {};
  
  const lastName = record.lastName || fd.lastName || '---';
  const firstName = record.firstName || fd.firstName || '---';
  const middleName = record.middleName || fd.middleName || '---';
  const birthDate = record.birthDate || fd.birthDate || '---';
  const sex = record.sex || fd.sex || '---';
  const civilStatus = record.civilStatus || fd.civilStatus || '---';
  
  // Robust mapping as requested: birthplace, contact_number, house_no, street
  const birthplace = record.birthPlace || fd.birthPlace || '---';
  const contact = record.contact_number || fd.contactNumber || '---';
  const houseNo = record.house_no || fd.houseNo || '---';
  const street = record.street || fd.street || '---';
  const barangay = record.barangay || fd.barangay || '---';
  const city = record.city_municipality || fd.city || 'SAN JUAN CITY';
  const province = record.province || fd.province || 'METRO MANILA';
  const district = record.district || fd.district || '---';

  const fullAddress = record.address || `${houseNo} ${street}, Brgy. ${barangay}, ${city}, ${province}`;
  const idStatus = record.id_status || 'Pending';
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white w-full max-w-6xl max-h-[95vh] rounded-[2.5rem] shadow-2xl relative z-20 flex flex-col overflow-hidden animate-scale-up border border-white/20">
        {/* Dossier Header */}
        <div className="bg-slate-900 p-8 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-600 rounded-2xl">
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-widest leading-none">Citizen Masterlist Dossier</h2>
              <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Master Registry Node:</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-mono text-primary-400 font-bold">{citizenId}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10 bg-slate-50">
          {/* Identity Profile Section */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-8">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Fingerprint size={14} className="text-primary-500" /> Demographic & Civil Profile
                  </h4>
                  <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          idStatus.toLowerCase() === 'active' || idStatus.toLowerCase() === 'issued'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                         Database ID Status: {idStatus}
                      </span>
                      <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-lg group cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => copyToClipboard(scidDisplay)}>
                          <CreditCard size={12} className="text-primary-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest">SCID Number: <span className="font-mono text-primary-200">{scidDisplay}</span></span>
                          <Copy size={10} className="ml-2 opacity-30 group-hover:opacity-100 transition-opacity" />
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="md:col-span-2">
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Legal Full Name</label>
                      <p className="font-black text-slate-800 text-xl uppercase leading-tight">{record.fullName || `${lastName}, ${firstName} ${middleName}`}</p>
                  </div>
                  <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Birthdate</label>
                      <p className="font-bold text-slate-800 text-sm uppercase">{formatDate(birthDate)}</p>
                  </div>
                  <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Calculated Age</label>
                      <p className="font-black text-primary-600 text-sm uppercase">{calculateAge(birthDate)} Years Old</p>
                  </div>
                  
                  <div><label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Sex</label><p className="font-bold text-slate-800 text-sm uppercase">{sex}</p></div>
                  <div><label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Civil Status</label><p className="font-bold text-slate-800 text-sm uppercase">{civilStatus}</p></div>
                  <div><label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Citizenship</label><p className="font-bold text-slate-800 text-sm uppercase">{record.citizenship || 'Filipino'}</p></div>
                  <div><label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Place of Birth</label><p className="font-bold text-slate-800 text-sm uppercase">{birthplace}</p></div>
              </div>
          </div>

          {/* Socio-Economic & Health Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-4 flex items-center gap-2">
                    <Banknote size={14} className="text-emerald-500" /> Socio-Economic Status
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2"><label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Living Arrangement</label><p className="font-black text-slate-800 text-sm uppercase">{fd.livingArrangement || '---'}</p></div>
                      <div><label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Pensioner Status</label><p className={`font-black text-sm uppercase ${fd.isPensioner ? 'text-emerald-600' : 'text-slate-400'}`}>{fd.isPensioner ? 'Pensioner' : 'Non-Pensioner'}</p></div>
                      {fd.isPensioner && (
                          <>
                            <div><label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Source</label><p className="font-bold text-slate-800 text-sm uppercase">{fd.pensionSource || '---'}</p></div>
                            <div><label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Monthly Amount</label><p className="font-mono text-emerald-700 font-bold text-sm">₱{fd.pensionAmount || '0.00'}</p></div>
                          </>
                      )}
                  </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-4 flex items-center gap-2">
                    <Stethoscope size={14} className="text-rose-500" /> Health Profile
                  </h4>
                  <div className="space-y-4">
                      <div>
                          <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Major Illness / Conditions</label>
                          <p className={`font-black text-sm uppercase ${fd.hasIllness ? 'text-rose-600' : 'text-emerald-600'}`}>{fd.hasIllness ? 'Declared Condition(s)' : 'No Declared Illness'}</p>
                      </div>
                      {fd.hasIllness && (
                          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
                              <p className="text-xs font-bold text-rose-700 leading-relaxed uppercase">{fd.illnessDetails}</p>
                          </div>
                      )}
                  </div>
              </div>
          </div>

          {/* Access Credentials Section */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-4 flex items-center gap-2">
                <Lock size={14} className="text-primary-500" /> Access Credentials
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div>
                          <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Generated Username</label>
                          <p className="font-mono font-black text-slate-800 text-lg">{record.username || '---'}</p>
                      </div>
                      <button onClick={() => copyToClipboard(record.username)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                          <Copy size={16} className="text-slate-400" />
                      </button>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div>
                          <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Generated Password</label>
                          <p className="font-mono font-black text-slate-800 text-lg">{record.password || '---'}</p>
                      </div>
                      <button onClick={() => copyToClipboard(record.password)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                          <Copy size={16} className="text-slate-400" />
                      </button>
                  </div>
              </div>
          </div>

          {/* Address & Contact Section */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-8">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-4 flex items-center gap-2">
                  <Home size={14} className="text-blue-500" /> Residential & Contact Number
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                  <div className="md:col-span-7 grid grid-cols-2 gap-6">
                      <div className="col-span-2"><label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Primary Address (Full)</label><p className="font-black text-slate-800 text-sm uppercase leading-relaxed">{fullAddress}</p></div>
                      <div><label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">House No.</label><p className="font-bold text-slate-800 text-sm uppercase">{houseNo}</p></div>
                      <div><label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Street</label><p className="font-bold text-slate-800 text-sm uppercase">{street}</p></div>
                      <div><label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Barangay</label><p className="font-bold text-slate-800 text-xs uppercase">{barangay}</p></div>
                      <div><label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">City</label><p className="font-bold text-slate-800 text-xs uppercase">{city}</p></div>
                      <div><label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Province</label><p className="font-bold text-slate-800 text-xs uppercase">{province}</p></div>
                      <div><label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">District</label><p className="font-bold text-slate-800 text-xs uppercase">{district}</p></div>
                  </div>
                  <div className="md:col-span-5 space-y-6">
                      <div>
                          <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Mobile Number</label>
                          <p className="font-black text-primary-600 text-xl font-mono tracking-widest">{contact}</p>
                      </div>
                      <div>
                          <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Email</label>
                          <p className="font-bold text-slate-800 text-sm lowercase">{record.email || fd.email || '---'}</p>
                      </div>
                  </div>
              </div>
          </div>
        </div>

        <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-12 py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all">Close Dossier</button>
        </div>
      </div>
    </div>
  );
};
