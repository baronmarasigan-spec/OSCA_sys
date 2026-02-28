import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { calculateAge, formatDate } from '../../services/dateUtils';
import { ApplicationStatus, ApplicationType, Role, User, RegistryRecord, Application } from '../../types';
import { 
  CheckCircle, XCircle, Clock, Archive, Search, 
  FileText, X, MapPin, Phone, Mail, Edit2, Save,
  Calendar, UserCheck, AlertCircle, Info, Upload,
  ArrowLeft, ArrowRight, User as UserIcon, Heart, Banknote, HelpCircle, UserPlus, Eye, Download, File, UserMinus, RefreshCw, ZoomIn, ZoomOut, ChevronDown, Filter, ArrowUpDown, ArrowUp, ArrowDown, HelpCircle as QuestionMark, Globe, MapPinned, ShieldCheck, Fingerprint, Activity, ShieldAlert, Database, CloudOff, Stethoscope, UserCircle, Briefcase, Home, Layers, ClipboardList
} from 'lucide-react';

const toISODate = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

const METRO_MANILA_LOCATIONS: Record<string, { districts: string[], barangays: Record<string, string[]> }> = {
  "San Juan City": {
    districts: ["District 1", "District 2"],
    barangays: {
      "District 1": [
        "Addition Hills", "Balong-Bato", "Batis", "Corazon de Jesus", "Ermitaño", 
        "Isabelita", "Kabayanan", "Little Baguio", "Maytunas", 
        "Onse", "Pasadeña", "Pedro Cruz", "Progreso", "Rivera", "Salapan", 
        "San Perfecto", "Santa Lucia", "Tibagan"
      ],
      "District 2": ["Greenhills", "West Crame"]
    }
  }
};

export const AdminRegistered: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const { applications, updateApplicationStatus, updateApplicationData, syncApplications, syncError, actionError, setActionError, isLiveMode, registryRecords, fetchExternalRegistry, addApplication } = useApp();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  
  // Set default status filter based on the active tab
  const [statusFilter, setStatusFilter] = useState<'all' | ApplicationStatus>('all');

  useEffect(() => {
    if (tab === 'approval') setStatusFilter(ApplicationStatus.PENDING);
    else if (tab === 'approved') setStatusFilter(ApplicationStatus.APPROVED);
    else if (tab === 'disapproved') setStatusFilter(ApplicationStatus.REJECTED);
    else setStatusFilter('all');
  }, [tab]);
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [isRegistering, setIsRegistering] = useState<RegistryRecord | boolean | null>(null);
  const [walkInStep, setWalkInStep] = useState(1);
  
  const [formData, setFormData] = useState({
    firstName: '', middleName: '', lastName: '', suffix: '', email: '', birthDate: '', birthPlace: '', sex: '', citizenship: 'Filipino', civilStatus: '',
    houseNo: '', street: '', barangay: '', district: '', city: 'San Juan City', province: 'Metro Manila', contactNumber: '',
    livingArrangement: '', isPensioner: false, pensionSource: '', pensionAmount: '', hasIllness: false, illnessDetails: '',
    emergencyContactPerson: '', emergencyContactNumber: '', joinFederation: false
  });
  const [files, setFiles] = useState<string[]>([]);

  const [viewingApp, setViewingApp] = useState<Application | null>(null);
  const [rejectingApp, setRejectingApp] = useState<Application | null>(null);
  const [confirmingApproveApp, setConfirmingApproveApp] = useState<Application | null>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState('');

  const triggerManualSync = useCallback(() => {
    setIsSyncing(true);
    setLastSync(new Date().toLocaleTimeString());
    setTimeout(() => setIsSyncing(false), 500);
  }, []);

  useEffect(() => {
    setLastSync(new Date().toLocaleTimeString());
  }, [tab]);

  const handleSearchLCR = useCallback(() => {
    if (!searchTerm.trim()) return;
    setIsSyncing(true);
    setHasSearched(true);
    setTimeout(() => setIsSyncing(false), 500);
  }, [searchTerm]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const getDisplayName = (record: any) => {
    if (record.lastName && record.firstName) {
        return `${record.lastName}, ${record.firstName} ${record.middleName || ''}`.trim().toUpperCase();
    }
    return (record.name || record.full_name || record.fullname || 'Unknown Identity').toUpperCase();
  };

  const startRegistration = (record?: RegistryRecord) => {
    if (record) {
      const rec = record as any;
      let fName = record.firstName || rec.first_name || '';
      let lName = record.lastName || rec.last_name || '';
      let mName = record.middleName || rec.middle_name || '';
      
      // Name Parsing: First Name 2 words, Middle Name 1 word
      if (!fName && !lName) {
        const full = (rec.fullname || rec.name || rec.full_name || '').toUpperCase().trim();
        if (full.includes(',')) {
          // Format: LAST, FIRST MIDDLE
          const [last, rest] = full.split(',').map((s: string) => s.trim());
          lName = last;
          const restParts = rest.split(/\s+/);
          if (restParts.length >= 3) {
            fName = `${restParts[0]} ${restParts[1]}`;
            mName = restParts[2];
          } else if (restParts.length === 2) {
            fName = restParts[0];
            mName = restParts[1];
          } else {
            fName = restParts[0] || '';
            mName = '';
          }
        } else if (full) {
          // Format: FIRST1 FIRST2 MIDDLE LAST
          const parts = full.split(/\s+/);
          if (parts.length >= 4) {
            fName = `${parts[0]} ${parts[1]}`;
            mName = parts[2];
            lName = parts.slice(3).join(' ');
          } else if (parts.length === 3) {
            fName = parts[0];
            mName = parts[1];
            lName = parts[2];
          } else if (parts.length === 2) {
            fName = parts[0];
            lName = parts[1];
            mName = '';
          } else {
            fName = parts[0];
            mName = '';
            lName = '';
          }
        }
      }

      setFormData({
        ...formData,
        firstName: fName.toUpperCase(),
        middleName: mName.toUpperCase(),
        lastName: lName.toUpperCase(),
        suffix: (record.suffix || rec.extension || '').toUpperCase(),
        birthDate: toISODate(record.birthDate || rec.birth_date || rec.birthday),
        birthPlace: (record.birthPlace || rec.birth_place || rec.birthplace || '').toUpperCase(),
        sex: record.sex || rec.gender || record.sex || '',
        civilStatus: record.civilStatus || rec.civil_status || '',
        citizenship: record.citizenship || record.citizenship || 'Filipino',
        houseNo: record.houseNo || rec.house_no || '',
        street: record.street || rec.street || '',
        barangay: record.barangay || rec.barangay || '',
        district: record.district || rec.district || '',
        city: record.city || rec.city_municipality || 'San Juan City',
        province: record.province || record.province || 'Metro Manila',
      });
      setIsRegistering(record);
    } else {
      setIsRegistering(true);
    }
    setWalkInStep(1);
  };

  const handleWalkInSubmit = async () => {
    setIsSyncing(true);
    let fullName = `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName} ${formData.suffix}`.trim().toUpperCase();

    const res = await addApplication({
      userId: `walk_${Date.now()}`,
      userName: fullName,
      type: ApplicationType.REGISTRATION,
      description: `Walk-in Enrollment. Data sourced from registry and verified by admin on-site.`,
      documents: files,
      formData: { 
        ...formData, 
        address: `${formData.houseNo} ${formData.street}, Brgy. ${formData.barangay}, ${formData.city}`,
        emergencyContactPerson: formData.emergencyContactPerson || 'N/A',
        emergencyContactNumber: formData.emergencyContactNumber || 'N/A',
        joinFederation: formData.joinFederation || false
      }
    });

    if (res.ok) {
      setIsRegistering(null);
      setSuccessMessage("Walk-in record successfully reflected. Redirecting to approval queue...");
      setTimeout(() => setSuccessMessage(null), 5000);
      navigate('/admin/registered/approval');
    }
    setIsSyncing(false);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectingApp) {
        await updateApplicationStatus(rejectingApp.id, ApplicationStatus.REJECTED, rejectionRemarks);
        setRejectingApp(null);
        setRejectionRemarks('');
        setViewingApp(null);
        setSuccessMessage(`Application #${rejectingApp.id} status updated to REJECTED.`);
        setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  const handleConfirmApprove = async () => {
    if (confirmingApproveApp) {
      await updateApplicationStatus(confirmingApproveApp.id, ApplicationStatus.APPROVED);
      setConfirmingApproveApp(null);
      setViewingApp(null);
      setSuccessMessage(`Application #${confirmingApproveApp.id} APPROVED. SCID generated and mirrored to Masterlist.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  const counts = useMemo(() => {
    const regs = applications.filter(a => String(a.type || '').toLowerCase() === 'registration');
    return {
      all: regs.length,
      pending: regs.filter(a => a.status === ApplicationStatus.PENDING).length,
      approved: regs.filter(a => a.status === ApplicationStatus.APPROVED).length,
      rejected: regs.filter(a => a.status === ApplicationStatus.REJECTED).length,
    };
  }, [applications]);

  const filteredApps = useMemo(() => {
    const registrations = applications.filter(a => String(a.type || '').toLowerCase() === 'registration');
    let list = registrations;
    if (statusFilter !== 'all') {
      list = list.filter(a => a.status === statusFilter);
    }
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      list = list.filter(a => 
        String(a.userName || '').toLowerCase().includes(query) || 
        String(a.id || '').toLowerCase().includes(query)
      );
    }
    return list;
  }, [applications, statusFilter, searchTerm]);

  // --- COMPONENT: EXPANDED REVIEW MODAL ---
  const ApplicationReviewModal = ({ app, onClose }: { app: Application, onClose: () => void }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const fd = app.formData || {} as any;
    const [editData, setEditData] = useState({
        first_name: fd.firstName || '',
        last_name: fd.lastName || '',
        email: fd.email || '',
        contact_number: fd.contactNumber || ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveEdit = async () => {
        setIsSaving(true);
        const res = await updateApplicationData(app.id, editData);
        if (res.ok) {
            setIsEditMode(false);
            setViewingApp(prev => prev ? { 
                ...prev, 
                userName: `${editData.first_name} ${editData.last_name}`.toUpperCase(),
                formData: prev.formData ? { ...prev.formData, ...editData, firstName: editData.first_name, lastName: editData.last_name } : undefined
            } : null);
        }
        setIsSaving(false);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
        <div className="bg-white w-full max-w-6xl max-h-[95vh] rounded-[2.5rem] shadow-2xl relative z-20 flex flex-col overflow-hidden animate-scale-up">
           <div className="bg-slate-900 p-8 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-600 rounded-2xl"><UserCheck size={24} /></div>
                  <div>
                      <h2 className="text-xl font-black uppercase tracking-widest">Citizen Enrollment Dossier</h2>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Application Registry ID: {app.id}</p>
                  </div>
              </div>
              <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${isEditMode ? 'bg-amber-50 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    {isEditMode ? <X size={14} /> : <Edit2 size={14} />}
                    {isEditMode ? 'Cancel Edit' : 'Modify Record'}
                  </button>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10 bg-slate-50">
              {actionError && (
                  <div className="bg-red-50 border-2 border-red-100 p-6 rounded-[2rem] flex items-start gap-4 animate-shake">
                    <ShieldAlert className="text-red-600 shrink-0" size={24} />
                    <div className="space-y-1 flex-1">
                        <p className="text-xs font-black text-red-900 uppercase tracking-widest">Database Sync Conflict</p>
                        <p className="text-sm text-red-700 font-bold leading-relaxed">{actionError}</p>
                    </div>
                  </div>
              )}

              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-8">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Fingerprint size={14} className="text-primary-500" /> Demographic & Civil Profile
                    </h4>
                    {isEditMode && (
                        <button disabled={isSaving} onClick={handleSaveEdit} className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white text-[10px] font-bold uppercase rounded-lg hover:bg-emerald-700 transition-all">
                            {isSaving ? <RefreshCw className="animate-spin" size={12}/> : <Save size={12}/>} Save Changes
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-2">
                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Legal Full Name</label>
                        {isEditMode ? (
                            <div className="flex gap-2">
                                <input className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold uppercase" value={editData.first_name} onChange={(e) => setEditData({...editData, first_name: e.target.value})} placeholder="First" />
                                <input className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold uppercase" value={editData.last_name} onChange={(e) => setEditData({...editData, last_name: e.target.value})} placeholder="Last" />
                            </div>
                        ) : (
                            <p className="font-black text-slate-800 text-xl uppercase leading-tight">{app.userName}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Birthdate</label>
                        <p className="font-bold text-slate-800 text-sm uppercase">{formatDate(fd.birthDate)}</p>
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Calculated Age</label>
                        <p className="font-black text-primary-600 text-sm uppercase">{calculateAge(fd.birthDate)} Years Old</p>
                    </div>
                    
                    <div><label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Sex</label><p className="font-bold text-slate-800 text-sm uppercase">{fd.sex || '---'}</p></div>
                    <div><label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Civil Status</label><p className="font-bold text-slate-800 text-sm uppercase">{fd.civilStatus || '---'}</p></div>
                    <div><label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Citizenship</label><p className="font-bold text-slate-800 text-sm uppercase">{fd.citizenship || 'Filipino'}</p></div>
                    <div><label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Place of Birth</label><p className="font-bold text-slate-800 text-sm uppercase">{fd.birthPlace || '---'}</p></div>
                </div>
              </div>

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

              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-8">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-4 flex items-center gap-2">
                    <Home size={14} className="text-blue-500" /> Residential & Contact Number
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                    <div className="md:col-span-7 grid grid-cols-2 gap-6">
                        <div className="col-span-2"><label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Primary Address (Full)</label><p className="font-black text-slate-800 text-sm uppercase leading-relaxed">{fd.address}</p></div>
                        <div><label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">House No.</label><p className="font-bold text-slate-800 text-sm uppercase">{fd.houseNo || '---'}</p></div>
                        <div><label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Street</label><p className="font-bold text-slate-800 text-sm uppercase">{fd.street || '---'}</p></div>
                        <div><label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">City</label><p className="font-bold text-slate-800 text-xs uppercase">{fd.city || 'SAN JUAN CITY'}</p></div>
                        <div><label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Province</label><p className="font-bold text-slate-800 text-xs uppercase">{fd.province || 'METRO MANILA'}</p></div>
                        <div><label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">District</label><p className="font-bold text-slate-800 text-xs uppercase">{fd.district || '---'}</p></div>
                        <div><label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Barangay</label><p className="font-bold text-slate-800 text-xs uppercase">{fd.barangay || '---'}</p></div>
                    </div>
                    <div className="md:col-span-5 space-y-6">
                        <div>
                            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Mobile Number</label>
                            {isEditMode ? (
                                <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold" value={editData.contact_number} onChange={(e) => setEditData({...editData, contact_number: e.target.value})} />
                            ) : (
                                <p className="font-black text-primary-600 text-xl font-mono tracking-widest">{fd.contactNumber}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Email</label>
                            {isEditMode ? (
                                <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold" value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} />
                            ) : (
                                <p className="font-bold text-slate-800 text-sm lowercase">{fd.email || 'node@unregistered.gov'}</p>
                            )}
                        </div>
                    </div>
                </div>
              </div>
           </div>

           <div className="p-8 bg-white border-t border-slate-100 flex justify-end gap-3 shrink-0">
               {app.status === ApplicationStatus.PENDING ? (
                   <>
                       <button onClick={() => setRejectingApp(app)} className="px-8 py-3 border-2 border-slate-200 text-slate-500 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all">Reject Record</button>
                       <button disabled={isEditMode || isSaving} onClick={() => setConfirmingApproveApp(app)} className="px-12 py-3 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all disabled:opacity-50">Confirm Approval</button>
                   </>
               ) : (
                   <button onClick={onClose} className="px-12 py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest">Close Record</button>
               )}
           </div>
        </div>
      </div>
    );
  };

  // --- MAIN LAYOUT RENDER ---

  if (tab === 'walk-in') {
    const registryResults = registryRecords.filter(r => r.type === 'LCR' && calculateAge(r.birthDate) >= 60);

    return (
      <div className="space-y-6 animate-fade-in">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Walk-in Enrollment</h1>
            <p className="text-slate-500 font-bold">Initiate enrollment by searching the Local Civil Registry (LCR). <span className="text-primary-600">(Must be 60+ yrs old)</span></p>
          </div>
          <button onClick={() => startRegistration()} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-slate-800 transition-all"><UserPlus size={14} /> New Manual Entry</button>
        </header>

        {successMessage && <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-700 text-xs font-bold animate-fade-in-down flex items-center gap-2"><CheckCircle size={16}/> {successMessage}</div>}

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/40">
             <div className="relative max-w-xl group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={20} />
               <input type="text" placeholder="Search LCR node..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-black text-sm uppercase" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchLCR()} />
             </div>
          </div>
          {hasSearched && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                  <tr><th className="p-8">Name</th><th className="p-8">Birthdate</th><th className="p-8">Current Age</th><th className="p-8 text-right">Enrollment</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registryResults.map(record => (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-8"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors"><UserIcon size={14} /></div><span className="font-black text-slate-900 uppercase tracking-tight text-sm leading-none">{getDisplayName(record)}</span></div></td>
                      <td className="p-8 text-xs font-bold text-slate-500 uppercase"><span className="flex items-center gap-2"><Calendar size={12} className="text-slate-300" /> {formatDate(record.birthDate)}</span></td>
                      <td className="p-8 text-xs font-bold text-primary-600 uppercase">{calculateAge(record.birthDate)} Years Old</td>
                      <td className="p-8 text-right"><button onClick={() => startRegistration(record)} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm">Enroll Citizen</button></td>
                    </tr>
                  ))}
                  {registryResults.length === 0 && !isSyncing && (
                    <tr>
                      <td colSpan={4} className="p-20 text-center">
                         <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Activity size={32} className="opacity-10" />
                         </div>
                         <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No eligible records found (Age 60+ and Name match) in LCR registry node.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Registration Wizard Modal */}
        {isRegistering && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setIsRegistering(null)} />
            <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-20 flex flex-col overflow-hidden animate-scale-up">
              <div className="bg-slate-900 p-8 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-600 rounded-2xl"><UserCheck size={24} /></div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-widest leading-none">Registry Enrollment Form</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5">
                      Step {walkInStep} of 3 {typeof isRegistering === 'object' && isRegistering !== null ? ` - ${(isRegistering as RegistryRecord).lastName}, ${(isRegistering as RegistryRecord).firstName}` : ''}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsRegistering(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-8 bg-slate-50">
                <div className="flex items-center gap-4 px-4 mb-10">
                   {[1, 2, 3].map(s => <div key={s} className={`h-2 flex-1 rounded-full transition-all duration-500 ${walkInStep >= s ? 'bg-primary-600' : 'bg-slate-200'}`}></div>)}
                </div>
                {walkInStep === 1 && (
                  <div className="animate-fade-in-up space-y-8">
                     <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3">Part 1: Identity Profile</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                           <div className="space-y-1">
                             <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">First Name</label>
                             <input name="firstName" value={formData.firstName} onChange={handleFormChange} className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold uppercase bg-slate-50 text-slate-800`} />
                           </div>
                           <div className="space-y-1">
                             <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Middle Name</label>
                             <input name="middleName" value={formData.middleName} onChange={handleFormChange} className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold uppercase bg-slate-50 text-slate-800`} />
                           </div>
                           <div className="space-y-1">
                             <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Last Name</label>
                             <input name="lastName" value={formData.lastName} onChange={handleFormChange} className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold uppercase bg-slate-50 text-slate-800`} />
                           </div>
                           <div className="space-y-1">
                             <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Suffix</label>
                             <input name="suffix" value={formData.suffix} onChange={handleFormChange} className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold uppercase bg-slate-50 text-slate-800`} placeholder="Jr." />
                           </div>
                           <div className="space-y-1">
                             <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Birthdate</label>
                             <input type="date" name="birthDate" value={formData.birthDate} onChange={handleFormChange} className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold bg-slate-50 text-slate-800`} />
                           </div>
                           <div className="space-y-1">
                             <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Sex</label>
                             <select name="sex" value={formData.sex} onChange={handleFormChange} className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold bg-slate-50 text-slate-800`}>
                               <option value="">Select</option>
                               <option value="Male">Male</option>
                               <option value="Female">Female</option>
                             </select>
                           </div>
                           <div className="space-y-1">
                             <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Civil Status</label>
                             <select name="civilStatus" value={formData.civilStatus} onChange={handleFormChange} className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold bg-slate-50 text-slate-800`}>
                               <option value="">Select Status</option>
                               <option value="Single">Single</option>
                               <option value="Married">Married</option>
                               <option value="Widowed">Widowed</option>
                               <option value="Separated">Separated</option>
                             </select>
                           </div>
                           <div className="space-y-1">
                             <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Citizenship</label>
                             <input name="citizenship" value={formData.citizenship} onChange={handleFormChange} className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold uppercase bg-slate-50 text-slate-800`} placeholder="Filipino" />
                           </div>
                           <div className="space-y-1 md:col-span-2">
                             <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Place of Birth</label>
                             <input name="birthPlace" value={formData.birthPlace} onChange={handleFormChange} className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold uppercase bg-slate-50 text-slate-800`} placeholder="City / Province" />
                           </div>
                        </div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3 mt-6">Part 2: Residential Address</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                           <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase ml-1">House No.</label><input name="houseNo" value={formData.houseNo} onChange={handleFormChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold" /></div>
                           <div className="space-y-1 md:col-span-2"><label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Street</label><input name="street" value={formData.street} onChange={handleFormChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold" /></div>
                           <div className="space-y-1"><label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Province</label><input name="province" value={formData.province} readOnly className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 cursor-not-allowed" /></div>
                           <div className="space-y-1">
                             <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">City</label>
                             <select name="city" value={formData.city} onChange={handleFormChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold">
                               <option value="">Select City</option>
                               {Object.keys(METRO_MANILA_LOCATIONS).map(city => (<option key={city} value={city}>{city}</option>))}
                             </select>
                           </div>
                           <div className="space-y-1">
                             <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">District</label>
                             <select name="district" value={formData.district} onChange={handleFormChange} disabled={!formData.city} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold disabled:opacity-50">
                               <option value="">Select District</option>
                               {formData.city && METRO_MANILA_LOCATIONS[formData.city]?.districts.map(dist => (<option key={dist} value={dist}>{dist}</option>))}
                             </select>
                           </div>
                           <div className="space-y-1">
                             <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Barangay</label>
                             <select name="barangay" value={formData.barangay} onChange={handleFormChange} disabled={!formData.district} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold disabled:opacity-50">
                               <option value="">Select Barangay</option>
                               {formData.city && formData.district && METRO_MANILA_LOCATIONS[formData.city]?.barangays[formData.district]?.map(brgy => (<option key={brgy} value={brgy}>{brgy}</option>))}
                             </select>
                           </div>
                           <div className="space-y-1 md:col-span-3"><label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Email</label><input name="email" type="email" value={formData.email} onChange={handleFormChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold" placeholder="juan.delacruz@email.com" /></div>
                        </div>
                     </div>
                  </div>
                )}
                {walkInStep === 2 && (
                  <div className="animate-fade-in-up space-y-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-8">
                       <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3">Part 2: Social & Socio-Economic Status</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4 md:col-span-2">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Info size={14}/> Living Arrangement</label>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {['Owned', 'Rent', 'Living with Relatives', 'Others'].map(opt => (
                                  <button key={opt} type="button" onClick={() => setFormData(prev => ({...prev, livingArrangement: opt}))} className={`px-4 py-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${formData.livingArrangement === opt ? 'bg-primary-50 border-primary-500 text-primary-600 shadow-md' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}>{opt}</button>
                                ))}
                             </div>
                          </div>
                          <div className="h-px bg-slate-50 md:col-span-2"></div>
                          <div className="space-y-4">
                             <div className="flex items-center justify-between"><span className="text-sm font-bold text-slate-700 flex items-center gap-2"><Banknote size={16} className="text-emerald-500" /> Is Pensioner?</span><input type="checkbox" name="isPensioner" checked={formData.isPensioner} onChange={handleFormChange} className="w-6 h-6 rounded-lg text-primary-600" /></div>
                             {formData.isPensioner && (
                                <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-fade-in">
                                   <input name="pensionSource" placeholder="Source (SSS, GSIS, etc.)" value={formData.pensionSource} onChange={handleFormChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold uppercase" />
                                   <input name="pensionAmount" type="number" placeholder="Monthly Amount" value={formData.pensionAmount} onChange={handleFormChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold" />
                                </div>
                             )}
                          </div>
                          <div className="space-y-4">
                             <div className="flex items-center justify-between"><span className="text-sm font-bold text-slate-700 flex items-center gap-2"><Heart size={16} className="text-red-500" /> Major Illness / Conditions?</span><input type="checkbox" name="hasIllness" checked={formData.hasIllness} onChange={handleFormChange} className="w-6 h-6 rounded-lg text-red-600" /></div>
                             {formData.hasIllness && (
                                <textarea name="illnessDetails" value={formData.illnessDetails} onChange={handleFormChange} placeholder="Details (e.g. Hypertension, Diabetes)..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold animate-fade-in" rows={3} />
                             )}
                          </div>
                       </div>
                    </div>
                  </div>
                )}
                {walkInStep === 3 && (
                   <div className="animate-fade-in-up space-y-8">
                      <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2"><Phone size={14} /> Mobile Number</label>
                           <input name="contactNumber" value={formData.contactNumber} onChange={handleFormChange} maxLength={11} className="w-full bg-white/10 border border-white/10 rounded-xl px-6 py-4 text-white font-mono text-xl tracking-widest focus:border-primary-500 outline-none" placeholder="09XXXXXXXXX" />
                        </div>
                      </div>
                      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 space-y-6">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><FileText size={14} /> Physical Requirements (PSA / ID Scans)</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="relative border-2 border-dashed border-slate-200 rounded-2xl aspect-square flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer">
                            <input type="file" multiple onChange={(e) => { if((e.target as HTMLInputElement).files) setFiles([...files, ...Array.from((e.target as HTMLInputElement).files!).map((f: any) => f.name)]); }} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <Upload size={24} className="text-slate-400 mb-2" />
                            <span className="text-[8px] font-black uppercase text-slate-400">Attach REQUIREMENTS</span>
                          </div>
                          {files.map((f, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-2xl aspect-square p-3 flex flex-col justify-between relative shadow-sm">
                              <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"><X size={10}/></button>
                              <FileText className="text-primary-500" size={24} />
                              <span className="text-[8px] font-bold text-slate-500 uppercase truncate">{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex items-start gap-4">
                         <ShieldAlert size={20} className="text-amber-600 shrink-0" />
                         <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase tracking-tighter">I certify that the information provided is true and correct. False statements may result in disqualification and legal liability under the Revised Penal Code.</p>
                      </div>
                   </div>
                )}
              </div>
              <div className="p-8 bg-white border-t border-slate-100 flex justify-between items-center shrink-0">
                <button onClick={() => walkInStep === 1 ? setIsRegistering(null) : setWalkInStep(walkInStep - 1)} className="px-10 py-3 text-slate-400 hover:text-slate-600 font-bold text-[10px] uppercase tracking-widest rounded-xl transition-colors">Previous</button>
                <button onClick={() => walkInStep < 3 ? setWalkInStep(walkInStep + 1) : handleWalkInSubmit()} disabled={isSyncing} className={`px-14 py-3 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl shadow-xl transition-all flex items-center gap-2 ${walkInStep === 3 ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'}`}>{isSyncing && <RefreshCw size={14} className="animate-spin" />}{walkInStep === 3 ? 'Finalize Enrollment' : 'Continue Step'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
        {viewingApp && <ApplicationReviewModal app={viewingApp} onClose={() => setViewingApp(null)} />}
        {successMessage && <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-[2rem] text-emerald-700 text-xs font-bold animate-fade-in-down flex items-start gap-3 shadow-sm"><CheckCircle className="shrink-0 mt-0.5" size={18}/><div className="space-y-1"><p className="font-black uppercase tracking-widest text-[10px]">Operation Successful</p><p>{successMessage}</p></div></div>}
        
        {rejectingApp && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setRejectingApp(null)} />
                <form onSubmit={handleRejectSubmit} className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-20 overflow-hidden animate-scale-up">
                    <div className="bg-red-50 p-6 flex items-center gap-3 border-b border-red-100"><XCircle className="text-red-600" size={20} /><h3 className="font-bold text-red-900 uppercase tracking-widest">Disapproval Reason</h3></div>
                    <div className="p-8 space-y-4">
                        <textarea required value={rejectionRemarks} onChange={(e) => setRejectionRemarks(e.target.value)} placeholder="Provide details..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:border-red-500 transition-all" rows={4} />
                    </div>
                    <div className="p-4 bg-slate-50 flex justify-end gap-3"><button type="button" onClick={() => setRejectingApp(null)} className="px-6 py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">Cancel</button><button type="submit" className="px-8 py-2 bg-red-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg">Confirm Reject</button></div>
                </form>
            </div>
        )}

        {confirmingApproveApp && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setConfirmingApproveApp(null)} />
                <div className="bg-white w-full max-sm rounded-[2rem] shadow-2xl relative z-20 overflow-hidden animate-scale-up text-center p-10 space-y-6">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm border border-emerald-100"><CheckCircle size={40} /></div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Finalize Approval?</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase">System will generate SCID 2026-XXXXX and mirror record to Masterlist.</p>
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3"><button onClick={() => setConfirmingApproveApp(null)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-[10px] uppercase tracking-widest">Cancel</button><button onClick={handleConfirmApprove} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg">Confirm</button></div>
                </div>
            </div>
        )}

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div><h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Registration Management</h1><div className="flex items-center gap-4 mt-2"><p className="text-slate-500 font-bold text-lg">Central Enrollment Registry</p></div></div>
        </header>

        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden ring-1 ring-black/5">
            <div className="p-8 border-b border-slate-100 bg-slate-50/40 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative max-w-md w-full group"><Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-primary-500" size={20} /><input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search queue..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-sm font-black uppercase tracking-tight" /></div>
                    <div className="flex items-center gap-4 pt-2">
                        {[{ id: 'all', label: 'All Records', icon: Layers, count: counts.all }, { id: ApplicationStatus.PENDING, label: 'For Approval', icon: Clock, count: counts.pending }, { id: ApplicationStatus.APPROVED, label: 'Approved', icon: CheckCircle, count: counts.approved }, { id: ApplicationStatus.REJECTED, label: 'Rejected', icon: XCircle, count: counts.rejected }].map(tabOpt => (
                            <button key={tabOpt.id} onClick={() => setStatusFilter(tabOpt.id as any)} className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${statusFilter === tabOpt.id ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}><tabOpt.icon size={14} />{tabOpt.label}<span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${statusFilter === tabOpt.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>{tabOpt.count}</span></button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                      <tr>
                        <th className="p-8">Fullname</th>
                        <th className="p-8">Birthdate</th>
                        <th className="p-8">Registration Status</th>
                        <th className="p-8">Address</th>
                        <th className="p-8 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredApps.map((app, idx) => (
                            <tr key={`${app.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="p-8">
                                    <span className="font-black text-slate-900 uppercase tracking-tight text-sm leading-tight">
                                        {app.userName}
                                    </span>
                                </td>
                                <td className="p-8">
                                    <span className="text-xs font-bold text-slate-600 uppercase">
                                        {formatDate(app.formData?.birthDate || '')}
                                    </span>
                                </td>
                                <td className="p-8">
                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                        app.status === ApplicationStatus.PENDING ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                        app.status === ApplicationStatus.APPROVED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                        'bg-red-50 text-red-600 border-red-100'
                                    }`}>
                                        {app.status}
                                    </span>
                                </td>
                                <td className="p-8">
                                    <span className="text-xs font-bold text-slate-600 uppercase truncate max-w-[200px] block">
                                        {app.formData?.address || '---'}
                                    </span>
                                </td>
                                <td className="p-8 text-right">
                                    <div className="flex justify-end gap-3">
                                        <button onClick={() => setViewingApp(app)} className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2 shadow-sm"><Eye size={14} /> Review</button>
                                        {app.status === ApplicationStatus.PENDING && (
                                            <><button onClick={() => setRejectingApp(app)} className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-95"><XCircle size={18} /></button><button onClick={() => setConfirmingApproveApp(app)} className="px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all active:scale-95"><CheckCircle size={18} /></button></>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};