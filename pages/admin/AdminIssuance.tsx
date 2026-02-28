import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ApplicationStatus, ApplicationType, Role, User, Application } from '../../types';
import { IDCard } from '../../components/IDCard';
import { 
  Printer, CheckCircle, Search, CreditCard, XCircle, Clock, 
  FileText, ShieldCheck, X, UserPlus, Calendar, User as UserIcon, Database,
  Eye, Tag, RefreshCw, Activity, CloudOff, Layers, MapPin,
  ArrowRight, ArrowLeft, AlertCircle, Heart, Camera, Upload, FileCheck, AlertTriangle
} from 'lucide-react';

const calculateAge = (birthDate: string): number => {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return 0;
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age < 0 ? 0 : age;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '---';
  const cleanDateStr = dateStr.includes(' ') ? dateStr.split(' ')[0] : dateStr;
  const date = new Date(cleanDateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const monthName = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${monthName} ${day}, ${year}`;
};

const IDPrintModal = ({ app, onClose }: { app: Application, onClose: () => void }) => {
  const fd = app.formData || {} as any;
  const userForId: User = {
    id: app.userId,
    name: app.userName,
    firstName: fd.first_name || fd.firstName,
    lastName: fd.last_name || fd.lastName,
    middleName: fd.middleName,
    suffix: fd.suffix,
    role: Role.CITIZEN,
    email: fd.email || '',
    birthDate: fd.birthdate || fd.birthDate,
    address: fd.address,
    sex: fd.sex,
    seniorIdNumber: fd.scid_number || 'PENDING',
    avatarUrl: fd.capturedImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Senior'
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      <div className="bg-white rounded-[2.5rem] shadow-2xl relative z-20 flex flex-col items-center p-12 space-y-10 animate-scale-up">
          <div className="text-center space-y-2"><div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl mx-auto inline-block"><ShieldCheck size={40} /></div><h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Generate ID</h3><p className="text-slate-500 font-bold text-[10px] uppercase">{app.userName}</p></div>
          <div className="scale-110 shadow-2xl rounded-xl"><IDCard user={userForId} /></div>
          <div className="flex gap-4 w-full"><button onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold text-[10px] uppercase">Cancel</button><button onClick={() => window.print()} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase shadow-xl flex items-center justify-center gap-2"><Printer size={16} /> Print ID</button></div>
      </div>
    </div>
  );
};

const ApplicationDetailsModal = ({ 
  app, 
  onClose, 
  onApprove, 
  onReject 
}: { 
  app: Application, 
  onClose: () => void,
  onApprove: (id: string) => void,
  onReject: (app: Application) => void
}) => {
  const afd = (app.formData || {}) as any;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-20 overflow-hidden flex flex-col animate-scale-up max-h-[90vh]">
         <div className="bg-slate-900 p-8 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-600 rounded-2xl"><CreditCard size={24} /></div>
                <div><h2 className="text-xl font-bold uppercase tracking-widest">ID Review Dossier</h2><p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Log ID #{app.id}</p></div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
         </div>
         <div className="p-8 space-y-8 bg-slate-50 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <UserIcon size={16} className="text-primary-500" />
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal Profile</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Full Name</label><p className="font-bold text-slate-800 uppercase">{app.userName}</p></div>
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Birthdate</label><p className="font-bold text-slate-800">{formatDate(afd.birthdate || app.formData?.birthDate || '')}</p></div>
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sex</label><p className="font-bold text-slate-800 uppercase">{afd.sex || '---'}</p></div>
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Civil Status</label><p className="font-bold text-slate-800 uppercase">{afd.civilStatus || '---'}</p></div>
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Place of Birth</label><p className="font-bold text-slate-800 uppercase">{afd.birthPlace || afd.birth_place || '---'}</p></div>
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Citizenship</label><p className="font-bold text-slate-800 uppercase">{afd.citizenship || '---'}</p></div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <MapPin size={16} className="text-secondary-500" />
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Residential & Contact Number</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Mobile Number</label><p className="font-bold text-primary-600 font-mono">{afd.contactNumber || '---'}</p></div>
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Email</label><p className="font-bold text-slate-800 text-xs lowercase">{afd.email || '---'}</p></div>
                  <div className="col-span-2"><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Full Address</label><p className="font-bold text-slate-800 text-xs uppercase leading-relaxed">{afd.address || `${afd.houseNo || ''} ${afd.street || ''}, Brgy. ${afd.barangay || ''}, ${afd.cityMunicipality || afd.city || 'SAN JUAN CITY'}, ${afd.province || 'METRO MANILA'}`.trim() || '---'}</p></div>
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">House No.</label><p className="font-bold text-slate-800 uppercase">{afd.houseNo || '---'}</p></div>
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Street</label><p className="font-bold text-slate-800 uppercase">{afd.street || '---'}</p></div>
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Barangay</label><p className="font-bold text-slate-800 uppercase">{afd.barangay || '---'}</p></div>
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">City</label><p className="font-bold text-slate-800 uppercase">{afd.cityMunicipality || afd.city || 'SAN JUAN CITY'}</p></div>
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Province</label><p className="font-bold text-slate-800 uppercase">{afd.province || 'METRO MANILA'}</p></div>
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">District</label><p className="font-bold text-slate-800 uppercase">{afd.district || '---'}</p></div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emergency Contact</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Contact Person</label><p className="font-bold text-slate-800 uppercase">{afd.emergencyContactPerson || '---'}</p></div>
                  <div className="col-span-2"><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Contact Number</label><p className="font-bold text-slate-800 font-mono">{afd.emergencyContactNumber || '---'}</p></div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <FileText size={16} className="text-amber-500" />
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Application Info</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Remarks</label><div className="bg-white p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 leading-relaxed max-h-24 overflow-y-auto">{app.description || 'No remarks provided.'}</div></div>
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Federation</label><p className="font-bold text-slate-800 text-[10px] uppercase">{afd.joinFederation ? 'Joined Federation' : 'Not Joined'}</p></div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Layers size={16} className="text-slate-500" />
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitted Requirements</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {app.documents?.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl group hover:border-primary-300 transition-all shadow-sm">
                       <div className="flex items-center gap-3 overflow-hidden"><FileText size={18} className="text-primary-500 shrink-0" /><span className="text-xs font-bold text-slate-700 truncate">{doc}</span></div>
                       <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"><Eye size={16}/></button>
                    </div>
                  ))}
                  {(!app.documents || app.documents.length === 0) && (
                    <div className="col-span-2 p-8 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No documents attached</p>
                    </div>
                  )}
               </div>
            </div>
         </div>
         <div className="p-6 bg-white border-t border-slate-100 flex justify-end gap-3 shrink-0">
             {app.status === ApplicationStatus.PENDING ? (
               <><button onClick={() => onReject(app)} className="px-6 py-3 border-2 border-slate-100 text-slate-500 rounded-xl font-bold text-[10px] uppercase hover:bg-red-50 hover:text-red-600 transition-all">Reject</button><button onClick={() => onApprove(app.id)} className="px-10 py-3 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase shadow-xl hover:bg-emerald-700 transition-all">Approve</button></>
             ) : <button onClick={onClose} className="px-10 py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest">Close</button>}
         </div>
      </div>
    </div>
  );
};

export const AdminIssuance: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    idIssuances = [], 
    syncIdIssuances, 
    updateApplicationStatus, 
    issueIdCard, 
    isLiveMode,
    masterlistRecords = [],
    fetchMasterlist,
    syncApplications,
    addApplication,
    addIdIssuance
  } = useApp();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [walkinSearchTerm, setWalkinSearchTerm] = useState('');
  
  // Default management filter
  const [statusFilter, setStatusFilter] = useState<'all' | ApplicationStatus>(ApplicationStatus.PENDING);

  useEffect(() => {
    if (tab && tab !== 'walk-in') {
      if (tab === 'all') setStatusFilter('all');
      else if (tab === 'Pending') setStatusFilter(ApplicationStatus.PENDING);
      else if (tab === 'Approved') setStatusFilter(ApplicationStatus.APPROVED);
      else if (tab === 'Rejected') setStatusFilter(ApplicationStatus.REJECTED);
      else if (tab === 'Issued') setStatusFilter(ApplicationStatus.ISSUED);
    }
  }, [tab]);
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [viewingApp, setViewingApp] = useState<Application | null>(null);
  const [viewingIdOnly, setViewingIdOnly] = useState<Application | null>(null);
  const [rejectingApp, setRejectingApp] = useState<Application | null>(null);
  const [confirmingReleaseApp, setConfirmingReleaseApp] = useState<Application | null>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [activeFile, setProjectActiveFile] = useState<string | null>(null);
  
  // Walk-in Processing State
  const [processingWalkin, setProcessingWalkin] = useState<any | null>(null);
  const [walkinStep, setWalkinStep] = useState(1);
  const [walkinFormData, setWalkinFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    birthDate: '',
    birthPlace: '',
    sex: '',
    email: '',
    citizenship: 'Filipino',
    civilStatus: '',
    houseNo: '',
    street: '',
    barangay: '',
    cityMunicipality: 'SAN JUAN CITY',
    province: 'METRO MANILA',
    district: '',
    contactNumber: '',
    emergencyContactPerson: '',
    emergencyContactNumber: '',
    joinFederation: false,
    capturedImage: undefined as string | undefined
  });
  const [walkinFiles, setWalkinFiles] = useState<string[]>([]);
  const [isWalkinCameraOpen, setIsWalkinCameraOpen] = useState(false);
  const walkinVideoRef = React.useRef<HTMLVideoElement>(null);
  const walkinCanvasRef = React.useRef<HTMLCanvasElement>(null);

  const triggerManualSync = useCallback(() => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 500);
  }, []);

  useEffect(() => {
    triggerManualSync();
  }, [tab]);

  const handleApprove = async (id: string) => {
    await updateApplicationStatus(id, ApplicationStatus.APPROVED);
    setViewingApp(null);
    setSuccessMessage(`Approval successful. ID generated.`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectingApp) {
      await updateApplicationStatus(rejectingApp.id, ApplicationStatus.REJECTED, rejectionRemarks);
      setRejectingApp(null);
      setRejectionRemarks('');
      setViewingApp(null);
    }
  };

  const handleConfirmRelease = async () => {
    if (confirmingReleaseApp) {
      await issueIdCard(confirmingReleaseApp.id);
      setConfirmingReleaseApp(null);
      setSuccessMessage(`ID status updated to ISSUED.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  const handleStartIssuance = (record: any) => {
    setProcessingWalkin(record);
    setWalkinStep(1);
    setWalkinFormData({
      firstName: record.firstName || record.first_name || '',
      middleName: record.middleName || record.middle_name || '',
      lastName: record.lastName || record.last_name || '',
      suffix: record.suffix || '',
      birthDate: record.birthDate || record.birthdate || '',
      birthPlace: record.birthPlace || record.birthplace || '',
      sex: record.sex || '',
      citizenship: record.citizenship || 'Filipino',
      civilStatus: record.civilStatus || record.civil_status || '',
      houseNo: record.house_no || record.houseNo || '',
      street: record.street || record.street_name || '',
      barangay: record.barangay || '',
      cityMunicipality: record.city_municipality || record.city || 'SAN JUAN CITY',
      province: record.province || 'METRO MANILA',
      district: record.district || '',
      contactNumber: record.contactNumber || record.contact_number || '',
      email: record.email || '',
      emergencyContactPerson: record.emergency_contact_person || '',
      emergencyContactNumber: record.contact_number || '',
      joinFederation: record.willing_member === 'Yes',
      capturedImage: undefined
    });
    setWalkinFiles([]);
  };

  const handleWalkinInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setWalkinFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const startWalkinCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (walkinVideoRef.current) {
        walkinVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
    }
  };

  const captureWalkinPhoto = () => {
    if (walkinVideoRef.current && walkinCanvasRef.current) {
      const ctx = walkinCanvasRef.current.getContext('2d');
      const videoWidth = walkinVideoRef.current.videoWidth;
      const videoHeight = walkinVideoRef.current.videoHeight;
      const size = Math.min(videoWidth, videoHeight);
      const x = (videoWidth - size) / 2;
      const y = (videoHeight - size) / 2;
      
      walkinCanvasRef.current.width = 600;
      walkinCanvasRef.current.height = 600;
      ctx?.drawImage(walkinVideoRef.current, x, y, size, size, 0, 0, 600, 600);
      
      const dataUrl = walkinCanvasRef.current.toDataURL('image/jpeg');
      setWalkinFormData(prev => ({ ...prev, capturedImage: dataUrl }));
      setWalkinFiles(prev => [...prev.filter(f => !f.includes('Walkin_Selfie')), `Walkin_Selfie_${Date.now()}.jpg`]);
      setIsWalkinCameraOpen(false);
      
      if (walkinVideoRef.current.srcObject) {
        (walkinVideoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    }
  };

  const handleWalkinSubmit = async () => {
    if (!processingWalkin) return;
    
    // Map fields according to requirements
    const mappedData = {
      ...walkinFormData,
      first_name: walkinFormData.firstName,
      last_name: walkinFormData.lastName,
      middle_name: walkinFormData.middleName,
      suffix: walkinFormData.suffix,
      birthdate: walkinFormData.birthDate,
      birth_place: walkinFormData.birthPlace,
      civil_status: walkinFormData.civilStatus,
      house_no: walkinFormData.houseNo,
      street: walkinFormData.street,
      barangay: walkinFormData.barangay,
      city_municipality: walkinFormData.cityMunicipality,
      province: walkinFormData.province,
      district: walkinFormData.district,
      address: `${walkinFormData.houseNo} ${walkinFormData.street}, Brgy. ${walkinFormData.barangay}, ${walkinFormData.cityMunicipality}, ${walkinFormData.province}`.trim(),
      emergency_contact_person: walkinFormData.emergencyContactPerson,
      contact_number: walkinFormData.emergencyContactNumber,
      senior_contact_number: walkinFormData.contactNumber,
      willing_member: walkinFormData.joinFederation ? 'Yes' : 'No',
      req1_url: walkinFiles.filter(f => !f.includes('Walkin_Selfie')).join(', '),
      photo_url: walkinFormData.capturedImage || '',
      status: 'Pending',
      id_status: 'Pending',
      application_status: 'Pending'
    };

    // Validation
    const requiredFields = [
      { key: 'emergency_contact_person', label: 'Contact Person Name' },
      { key: 'contact_number', label: 'Emergency Contact No.' },
      { key: 'senior_contact_number', label: 'Mobile Number' },
      { key: 'willing_member', label: 'Federation' },
      { key: 'req1_url', label: 'Attach Scans' },
      { key: 'photo_url', label: 'Take Selfie Scan' }
    ];

    const missing = requiredFields.filter(f => !mappedData[f.key as keyof typeof mappedData]);
    if (missing.length > 0) {
      alert(`The following fields are required: \n${missing.map(m => `• ${m.label}`).join('\n')}`);
      return;
    }

    setIsSyncing(true);
    try {
      const result = await addIdIssuance({
        userId: processingWalkin.id,
        userName: `${walkinFormData.firstName} ${walkinFormData.lastName}`,
        type: ApplicationType.ID_NEW,
        description: `Walk-in ID Issuance for ${walkinFormData.firstName} ${walkinFormData.lastName}.\nProcessed by Admin.`,
        documents: walkinFiles,
        formData: mappedData
      });

      if (result.ok) {
        setSuccessMessage(`Walk-in ID application for ${walkinFormData.firstName} submitted successfully.`);
        setProcessingWalkin(null);
        
        // Redirect to For Approval
        navigate('/admin/id/all');
        setStatusFilter(ApplicationStatus.PENDING);
        
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        alert(result.error || 'Failed to submit walk-in application.');
      }
    } catch (error) {
      console.error('Walk-in submission error:', error);
      alert('An unexpected error occurred during submission.');
    } finally {
      setIsSyncing(false);
    }
  };


  const counts = useMemo(() => {
    const list = Array.isArray(idIssuances) ? idIssuances : [];
    const allRecords = masterlistRecords || [];
    const walkinCount = allRecords.filter((r: any) => 
      (r.id_status || '').toString().trim().toLowerCase() === 'new'
    ).length;
    
    return {
      all: list.length,
      pending: list.filter(a => a.status === ApplicationStatus.PENDING).length,
      approved: list.filter(a => a.status === ApplicationStatus.APPROVED).length,
      rejected: list.filter(a => a.status === ApplicationStatus.REJECTED).length,
      issued: list.filter(a => a.status === ApplicationStatus.ISSUED).length,
      walkin: walkinCount
    };
  }, [idIssuances, masterlistRecords]);

  const walkinList = useMemo(() => {
    if (tab !== 'walk-in') return [];
    const allRecords = masterlistRecords || [];
    
    // Filter for "New" status (walk-in candidates)
    let list = allRecords.filter((r: any) => 
      (r.id_status || '').toString().trim().toLowerCase() === 'new'
    );

    if (walkinSearchTerm) {
      const q = walkinSearchTerm.toLowerCase();
      list = list.filter((r: any) => 
        (r.fullName || '').toLowerCase().includes(q) ||
        (r.scid_number || '').toLowerCase().includes(q) ||
        (r.last_name || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [masterlistRecords, tab, walkinSearchTerm]);

  const filteredApps = useMemo(() => {
    if (tab === 'walk-in') return [];
    // Management view strictly based on database (idIssuances)
    let list = Array.isArray(idIssuances) ? [...idIssuances] : [];
    if (statusFilter !== 'all') list = list.filter(a => a.status === statusFilter);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(a => {
        const afd = (a.formData || {}) as any;
        return (a.userName || '').toLowerCase().includes(q) || 
               (a.id || '').includes(q) || 
               (afd.last_name || '').toLowerCase().includes(q) ||
               (afd.scid_number || '').toLowerCase().includes(q);
      });
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [idIssuances, statusFilter, searchTerm, tab]);


  return (
    <div className="space-y-6 animate-fade-in">
        {viewingApp && (
          <ApplicationDetailsModal 
            app={viewingApp} 
            onClose={() => setViewingApp(null)}
            onApprove={handleApprove}
            onReject={(app) => setRejectingApp(app)}
          />
        )}
        {viewingIdOnly && <IDPrintModal app={viewingIdOnly} onClose={() => setViewingIdOnly(null)} />}
        
        {activeFile && <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md" onClick={() => setProjectActiveFile(null)}><div className="bg-white p-8 rounded-3xl shadow-2xl text-center"><p className="font-bold text-slate-800 uppercase tracking-widest text-sm mb-4">View: {activeFile}</p><div className="w-64 h-64 bg-slate-100 rounded-xl mb-4 border border-slate-200 flex items-center justify-center"><FileText size={48} className="text-slate-300"/></div><button onClick={() => setProjectActiveFile(null)} className="px-8 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Close</button></div></div>}
        {rejectingApp && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setRejectingApp(null)} />
              <form onSubmit={handleRejectSubmit} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-20 overflow-hidden animate-scale-up">
                 <div className="bg-red-50 p-6 border-b border-red-100 flex items-center gap-3"><XCircle className="text-red-600" size={18}/><h3 className="font-semibold text-red-800 uppercase tracking-widest">Reject Claim</h3></div>
                 <div className="p-8 space-y-4"><textarea className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-bold" rows={4} placeholder="Reason..." value={rejectionRemarks} required onChange={(e) => setRejectionRemarks(e.target.value)} /></div>
                 <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3"><button type="button" onClick={() => setRejectingApp(null)} className="px-6 py-2 text-slate-500 font-bold text-[10px] uppercase">Cancel</button><button type="submit" className="px-8 py-2 bg-red-600 text-white font-bold text-[10px] uppercase rounded-xl shadow-lg">Confirm</button></div>
              </form>
            </div>
        )}
        {confirmingReleaseApp && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setConfirmingReleaseApp(null)} />
                <div className="bg-white w-full max-sm rounded-[2rem] shadow-2xl relative z-20 p-10 text-center space-y-6 animate-scale-up">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border border-emerald-100"><CheckCircle size={40} /></div>
                    <div className="space-y-2"><h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Confirm Release?</h3><p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">Officially marking ID for <strong>{confirmingReleaseApp.userName}</strong> as Released.</p></div>
                    <div className="p-4 flex gap-3"><button onClick={() => setConfirmingReleaseApp(null)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-[10px] uppercase">Cancel</button><button onClick={handleConfirmRelease} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase shadow-lg">Confirm</button></div>
                </div>
            </div>
        )}

        {processingWalkin && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setProcessingWalkin(null)} />
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative z-20 overflow-hidden flex flex-col animate-scale-up max-h-[95vh]">
              <div className="bg-slate-900 p-8 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-600 rounded-2xl"><UserPlus size={24} /></div>
                  <div>
                    <h2 className="text-xl font-bold uppercase tracking-widest">Walk-in ID Application</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Step {walkinStep} of 3: {walkinStep === 1 ? 'Personal Details' : walkinStep === 2 ? 'Documentary Proofs' : 'Biometric Scan'}</p>
                  </div>
                </div>
                <button onClick={() => setProcessingWalkin(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-slate-50 custom-scrollbar">
                {/* STEP 1: PERSONAL DETAILS */}
                {walkinStep === 1 && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { label: 'Last Name', value: walkinFormData.lastName, name: 'lastName' },
                        { label: 'First Name', value: walkinFormData.firstName, name: 'firstName' },
                        { label: 'Middle Name', value: walkinFormData.middleName, name: 'middleName' },
                        { label: 'Suffix', value: walkinFormData.suffix, name: 'suffix' },
                        { label: 'Birthdate', value: walkinFormData.birthDate, name: 'birthDate', type: 'date' },
                        { label: 'Age', value: calculateAge(walkinFormData.birthDate), readOnly: true },
                        { label: 'Place of Birth', value: walkinFormData.birthPlace, name: 'birthPlace' },
                        { label: 'Sex', value: walkinFormData.sex, name: 'sex', type: 'select', options: ['Male', 'Female'] },
                        { label: 'Civil Status', value: walkinFormData.civilStatus, name: 'civilStatus', type: 'select', options: ['Single', 'Married', 'Widowed', 'Separated'] },
                        { label: 'Citizenship', value: walkinFormData.citizenship, name: 'citizenship' },
                        { label: 'Mobile Number', value: walkinFormData.contactNumber, name: 'contactNumber', type: 'tel' },
                        { label: 'Email', value: walkinFormData.email, name: 'email', type: 'email' }
                      ].map((field, idx) => (
                        <div key={idx} className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">{field.label}</label>
                          {field.type === 'select' ? (
                            <select name={field.name} value={field.value} onChange={handleWalkinInputChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-semibold text-sm outline-none focus:ring-2 focus:ring-primary-500/10 transition-all">
                              <option value="">Select</option>
                              {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          ) : (
                            <input 
                              type={field.type || 'text'} 
                              name={field.name} 
                              value={field.value} 
                              onChange={handleWalkinInputChange} 
                              readOnly={field.readOnly}
                              className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-semibold text-sm outline-none focus:ring-2 focus:ring-primary-500/10 transition-all ${field.readOnly ? 'bg-slate-100 text-slate-500' : 'bg-white'}`} 
                            />
                          )}
                        </div>
                      ))}
                      <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-slate-200">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">House No.</label>
                          <input type="text" name="houseNo" value={walkinFormData.houseNo} onChange={handleWalkinInputChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-semibold text-sm outline-none focus:ring-2 focus:ring-primary-500/10" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Street</label>
                          <input type="text" name="street" value={walkinFormData.street} onChange={handleWalkinInputChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-semibold text-sm outline-none focus:ring-2 focus:ring-primary-500/10" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Barangay</label>
                          <input type="text" name="barangay" value={walkinFormData.barangay} onChange={handleWalkinInputChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-semibold text-sm outline-none focus:ring-2 focus:ring-primary-500/10" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">City</label>
                          <input type="text" name="cityMunicipality" value={walkinFormData.cityMunicipality} onChange={handleWalkinInputChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-semibold text-sm outline-none focus:ring-2 focus:ring-primary-500/10" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Province</label>
                          <input type="text" name="province" value={walkinFormData.province} onChange={handleWalkinInputChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-semibold text-sm outline-none focus:ring-2 focus:ring-primary-500/10" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">District</label>
                          <input type="text" name="district" value={walkinFormData.district} onChange={handleWalkinInputChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-semibold text-sm outline-none focus:ring-2 focus:ring-primary-500/10" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-200">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={20} className="text-secondary-600" />
                          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Emergency Contact</h3>
                        </div>
                        <div className="space-y-4">
                          <input type="text" name="emergencyContactPerson" value={walkinFormData.emergencyContactPerson} onChange={handleWalkinInputChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold" placeholder="Contact Person Name" />
                          <input type="tel" name="emergencyContactNumber" value={walkinFormData.emergencyContactNumber} onChange={handleWalkinInputChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold" placeholder="Emergency Contact No." />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Heart size={20} className="text-primary-600" />
                          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Federation</h3>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 h-full flex items-center">
                          <label className="flex items-start gap-4 cursor-pointer select-none">
                            <input type="checkbox" name="joinFederation" checked={walkinFormData.joinFederation} onChange={handleWalkinInputChange} className="w-6 h-6 rounded-lg text-primary-600 border-slate-300 mt-1 transition-all" />
                            <span className="text-xs font-semibold text-slate-700 leading-relaxed uppercase tracking-tight">Join the Federation of Senior Citizen Association?</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: DOCUMENTS */}
                {walkinStep === 2 && (
                  <div className="space-y-8">
                    <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100 space-y-4">
                      <h3 className="text-xs font-bold text-primary-700 uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle size={16} /> Requirements Checklist
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px] leading-relaxed text-slate-600 font-semibold">
                        <div className="space-y-2">
                          <p className="font-bold text-slate-800 uppercase tracking-tighter">1. Identity (Select One):</p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>Birth Certificate / Marriage Certificate</li>
                            <li>Philippine Passport / National ID</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <p className="font-bold text-slate-800 uppercase tracking-tighter">2. Residency (Select One):</p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>Barangay ID / Driver's License</li>
                            <li>Utility Bills with local address</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Upload size={18} className="text-blue-600" /> Upload Scanned Files
                      </h3>
                      <div className="aspect-[16/6] relative border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 bg-white hover:bg-slate-50 transition-all cursor-pointer group">
                        <input type="file" multiple onChange={(e) => { if(e.target.files) setWalkinFiles(prev => [...prev, ...Array.from(e.target.files!).map((f: File) => f.name)]); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className="w-16 h-16 bg-slate-50 text-blue-500 rounded-full flex items-center justify-center shadow-md group-hover:bg-blue-500 group-hover:text-white transition-colors">
                          <Upload size={24} />
                        </div>
                        <p className="text-sm font-bold text-slate-800 uppercase tracking-widest mt-4">Attach Scans</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">PSA Birth Certificate and Valid Government ID required.</p>
                      </div>
                    </div>

                    {walkinFiles.filter(f => !f.includes('Walkin_Selfie')).length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-slate-200">
                        {walkinFiles.filter(f => !f.includes('Walkin_Selfie')).map((f, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                            <span className="text-xs font-semibold text-slate-700 flex items-center gap-2 truncate pr-4">
                              <FileCheck size={14} className="text-emerald-500 shrink-0" /> {f}
                            </span>
                            <button onClick={() => setWalkinFiles(walkinFiles.filter(file => file !== f))} className="text-slate-300 hover:text-red-500 transition-colors shrink-0"><X size={14}/></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3: SELFIE BIO-SCAN */}
                {walkinStep === 3 && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Camera size={18} className="text-primary-600" /> Live Face Capture
                      </h3>
                      <div className="aspect-[4/3] max-w-md mx-auto bg-white border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 relative overflow-hidden group">
                        {walkinFormData.capturedImage ? (
                          <>
                            <img src={walkinFormData.capturedImage} className="absolute inset-0 w-full h-full object-cover" alt="Captured" />
                            <button onClick={() => { setWalkinFormData(prev => ({...prev, capturedImage: undefined})); setWalkinFiles(walkinFiles.filter(f => !f.includes('Walkin_Selfie'))); }} className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-full shadow-lg z-20">
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => { setIsWalkinCameraOpen(true); startWalkinCamera(); }} className="flex flex-col items-center gap-4 transition-all hover:scale-105">
                            <div className="w-20 h-20 bg-slate-50 text-primary-500 rounded-full flex items-center justify-center shadow-xl group-hover:bg-primary-500 group-hover:text-white transition-colors">
                              <Camera size={32} />
                            </div>
                            <p className="text-sm font-bold text-slate-800 uppercase tracking-widest">Take Selfie Scan</p>
                            <p className="text-[10px] text-slate-400 font-semibold max-w-[200px] text-center">Required for digital identity authentication.</p>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                      <AlertTriangle className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5 pointer-events-none" />
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2 text-primary-400">Security Warning:</h4>
                      <p className="text-[10px] leading-relaxed font-semibold opacity-90 uppercase tracking-tighter">
                        UNTRUTHFUL STATEMENTS CONSTITUTE FALSIFICATION OF PUBLIC DOCUMENTS PUNISHABLE UNDER THE REVISED PENAL CODE.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 bg-white border-t border-slate-100 flex justify-between shrink-0">
                <button 
                  onClick={() => walkinStep > 1 ? setWalkinStep(walkinStep - 1) : setProcessingWalkin(null)} 
                  className="px-8 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-[10px] uppercase tracking-widest"
                >
                  {walkinStep === 1 ? 'Cancel' : 'Back'}
                </button>
                <div className="flex gap-3">
                  {walkinStep < 3 ? (
                    <button 
                      onClick={() => setWalkinStep(walkinStep + 1)} 
                      disabled={walkinStep === 2 && walkinFiles.filter(f => !f.includes('Walkin_Selfie')).length < 1}
                      className="px-10 py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-50"
                    >
                      Next Step
                    </button>
                  ) : (
                    <button 
                      onClick={handleWalkinSubmit} 
                      disabled={!walkinFormData.capturedImage || isSyncing}
                      className="px-10 py-3 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                      Final Submit Application
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Walk-in Camera Modal */}
        {isWalkinCameraOpen && (
          <div className="fixed inset-0 z-[130] bg-slate-900/95 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-xl bg-black rounded-3xl overflow-hidden relative border-4 border-white/10 shadow-2xl">
              <video ref={walkinVideoRef} autoPlay playsInline className="w-full h-auto" />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[300px] h-[300px] border-4 border-white/50 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"></div>
              </div>
              <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                <div className="bg-primary-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg">Scan Active</div>
                <button onClick={() => { setIsWalkinCameraOpen(false); if(walkinVideoRef.current?.srcObject) (walkinVideoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop()); }} className="p-3 bg-white/20 text-white rounded-full backdrop-blur-md hover:bg-white/30 transition-all"><X size={24}/></button>
              </div>
              <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                <button onClick={captureWalkinPhoto} className="p-1 bg-white rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 transition-all">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-900 flex items-center justify-center">
                    <div className="w-12 h-12 bg-slate-900 rounded-full"></div>
                  </div>
                </button>
              </div>
            </div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mt-6">Position face inside the frame for 1x1 capture.</p>
          </div>
        )}
        <canvas ref={walkinCanvasRef} className="hidden" />

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">ID Issuance Management</h1>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-slate-500 font-bold text-lg">Central ID Lifecycle Registry</p>
                <div className={`flex items-center gap-2 px-3 py-1 ${isLiveMode ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'} border rounded-full`}>
                  {isLiveMode ? <Activity size={14} className="text-emerald-500" /> : <CloudOff size={14} className="text-amber-500" />}
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isLiveMode ? 'text-emerald-600' : 'text-amber-600'}`}>{isLiveMode ? 'ID-ISSUANCES NODE ACTIVE' : 'CACHE MODE'}</span>
                </div>
              </div>
            </div>
            <button onClick={triggerManualSync} disabled={isSyncing} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 shadow-xl flex items-center gap-2">
                <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} /> {isSyncing ? 'Handshaking...' : 'Poll Node'}
            </button>
        </header>

        {successMessage && <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-[2rem] text-emerald-700 text-xs font-bold animate-fade-in-down flex items-start gap-3 shadow-sm"><CheckCircle className="shrink-0 mt-0.5" size={18}/><div className="space-y-1"><p className="font-black uppercase tracking-widest text-[10px]">Update Success</p><p>{successMessage}</p></div></div>}

        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden ring-1 ring-black/5">
            <div className="p-8 border-b border-slate-100 bg-slate-50/40 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative max-w-md w-full group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            value={tab === 'walk-in' ? walkinSearchTerm : searchTerm} 
                            onChange={e => tab === 'walk-in' ? setWalkinSearchTerm(e.target.value) : setSearchTerm(e.target.value)} 
                            placeholder={tab === 'walk-in' ? "Search walk-in queue..." : "Search queue..."} 
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-sm font-black uppercase tracking-tight" 
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {[
                        { id: 'all', label: 'All ID Records', icon: Layers, count: counts.all },
                        { id: ApplicationStatus.PENDING, label: 'Management', icon: Clock, count: counts.pending },
                        { id: ApplicationStatus.APPROVED, label: 'Approved', icon: CheckCircle, count: counts.approved },
                        { id: ApplicationStatus.ISSUED, label: 'Released', icon: ShieldCheck, count: counts.issued },
                        { id: ApplicationStatus.REJECTED, label: 'Rejected', icon: XCircle, count: counts.rejected },
                        { id: 'walk-in', label: 'Walk-in Queue', icon: UserPlus, count: counts.walkin }
                        ].map(tabOpt => (
                            <button key={tabOpt.id} onClick={() => {
                                if (tabOpt.id === 'walk-in') navigate('/admin/id/walk-in');
                                else {
                                    if (tab === 'walk-in') navigate('/admin/id/all');
                                    setStatusFilter(tabOpt.id as any);
                                }
                            }} className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${((tab === 'walk-in' && tabOpt.id === 'walk-in') || (tab !== 'walk-in' && statusFilter === tabOpt.id)) ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}><tabOpt.icon size={14} />{tabOpt.label}<span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${((tab === 'walk-in' && tabOpt.id === 'walk-in') || (tab !== 'walk-in' && statusFilter === tabOpt.id)) ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>{tabOpt.count}</span></button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                      <tr>
                        <th className="p-8">SCID Number</th>
                        <th className="p-8">Fullname</th>
                        <th className="p-8">Birthdate</th>
                        <th className="p-8">ID Status</th>
                        {statusFilter === ApplicationStatus.ISSUED && <th className="p-8">Released Date</th>}
                        <th className="p-8">Address</th>
                        <th className="p-8 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {tab === 'walk-in' ? (
                            walkinList.map((record: any, idx: number) => (
                                <tr key={`walkin-${record.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="p-8">
                                        <span className="font-mono text-sm font-black text-slate-800 tracking-wider uppercase">{record.scid_number || 'NEW'}</span>
                                    </td>
                                    <td className="p-8">
                                        <span className="font-black text-slate-900 uppercase tracking-tight text-sm leading-tight">{record.fullName || `${record.last_name || ''}, ${record.first_name || ''}`.trim().toUpperCase()}</span>
                                    </td>
                                    <td className="p-8">
                                        <span className="text-xs font-bold text-slate-600 uppercase">{formatDate(record.birthdate || record.birthDate)}</span>
                                    </td>
                                    <td className="p-8">
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                            (record.id_status || 'New').toLowerCase() === 'released' || (record.id_status || 'New').toLowerCase() === 'issued'
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                            : (record.id_status || 'New').toLowerCase() === 'approved'
                                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                                            : (record.id_status || 'New').toLowerCase() === 'pending'
                                            ? 'bg-amber-50 text-amber-600 border-amber-100'
                                            : 'bg-slate-50 text-slate-600 border-slate-100'
                                        }`}>
                                            {record.id_status || 'New'}
                                        </span>
                                    </td>
                                    <td className="p-8">
                                        <span className="text-xs font-bold text-slate-600 uppercase truncate max-w-[200px] block">
                                            {record.address || `${record.house_no || ''} ${record.street || ''}, Brgy. ${record.barangay || ''}, ${record.city_municipality || 'SAN JUAN CITY'}`.trim() || '---'}
                                        </span>
                                    </td>
                                    <td className="p-8 text-right">
                                        <button 
                                            onClick={() => handleStartIssuance(record)}
                                            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm ml-auto"
                                        >
                                            <CreditCard size={14} /> Process ID
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            filteredApps.map((app, idx) => {
                                const afd = (app.formData || {}) as any;
                                const scidVal = afd.scid_number || '---';
                                const birthday = afd.birthdate || '---';
                                
                                // Use Masterlist as single source of truth for ID Status
                                const masterRecord = masterlistRecords.find(r => r.id === app.userId);
                                const idStatus = masterRecord?.id_status || app.status;
                                
                                return (
                                    <tr key={`${app.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="p-8">
                                            <span className="font-mono text-sm font-black text-slate-800 tracking-wider uppercase">{scidVal}</span>
                                        </td>
                                        <td className="p-8">
                                            <span className="font-black text-slate-900 uppercase tracking-tight text-sm leading-tight">{`${afd.last_name || '---'}, ${afd.first_name || '---'}`.toUpperCase()}</span>
                                        </td>
                                        <td className="p-8">
                                            <span className="text-xs font-bold text-slate-600 uppercase">{formatDate(birthday)}</span>
                                        </td>
                                        <td className="p-8">
                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                idStatus.toLowerCase() === 'released' || idStatus.toLowerCase() === 'issued'
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                : idStatus.toLowerCase() === 'approved'
                                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                : idStatus.toLowerCase() === 'pending'
                                                ? 'bg-amber-50 text-amber-600 border-amber-100'
                                                : 'bg-slate-50 text-slate-600 border-slate-100'
                                            }`}>
                                                {idStatus}
                                            </span>
                                        </td>
                                        {statusFilter === ApplicationStatus.ISSUED && (
                                            <td className="p-8">
                                                <span className="text-xs font-bold text-slate-600 uppercase">
                                                    {app.releasedDate ? formatDate(app.releasedDate) : '---'}
                                                </span>
                                            </td>
                                        )}
                                        <td className="p-8">
                                            <span className="text-xs font-bold text-slate-600 uppercase truncate max-w-[200px] block">
                                                {afd.address || `${afd.house_no || ''} ${afd.street || ''}, Brgy. ${afd.barangay || ''}, ${afd.city_municipality || 'SAN JUAN CITY'}`.trim() || '---'}
                                            </span>
                                        </td>
                                        <td className="p-8 text-right">
                                            <div className="flex justify-end gap-3">
                                                {app.status === ApplicationStatus.PENDING ? (
                                                    <>
                                                        <button onClick={() => setViewingApp(app)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2 shadow-sm">
                                                            <Eye size={14} /> Details
                                                        </button>
                                                        <button onClick={() => setRejectingApp(app)} className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-95">
                                                            <XCircle size={18} />
                                                        </button>
                                                        <button onClick={() => handleApprove(app.id)} className="px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all active:scale-95">
                                                            <CheckCircle size={18} />
                                                        </button>
                                                    </>
                                                ) : app.status === ApplicationStatus.APPROVED ? (
                                                    <>
                                                        <button onClick={() => setViewingIdOnly(app)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                                                            <Printer size={14} /> Print ID
                                                        </button>
                                                        <button onClick={() => setConfirmingReleaseApp(app)} className="px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all">
                                                            <Tag size={18}/>
                                                        </button>
                                                    </>
                                                ) : app.status === ApplicationStatus.REJECTED ? (
                                                    <div className="flex items-center gap-3">
                                                        <button onClick={() => setViewingApp(app)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2 shadow-sm">
                                                            <Eye size={14} /> Details
                                                        </button>
                                                        <button 
                                                            onClick={() => updateApplicationStatus(app.id, ApplicationStatus.PENDING)}
                                                            className="px-6 py-3 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all flex items-center gap-2 shadow-sm"
                                                        >
                                                            <RefreshCw size={14} /> Revert to Check Again
                                                        </button>
                                                    </div>
                                                ) : app.status === ApplicationStatus.ISSUED ? (
                                                    <div className="flex justify-end gap-3">
                                                        <button onClick={() => setViewingIdOnly(app)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                                                            <Printer size={14} /> Print ID
                                                        </button>
                                                        <button onClick={() => setViewingApp(app)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2 shadow-sm">
                                                            <Eye size={14} /> Details
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => setViewingApp(app)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2 shadow-sm">
                                                        <Eye size={14} /> Details
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        {((tab === 'walk-in' && walkinList.length === 0) || (tab !== 'walk-in' && filteredApps.length === 0)) && (
                            <tr>
                                <td colSpan={6} className="p-32 text-center text-slate-300 font-black uppercase tracking-[0.3em] text-xs">
                                    No records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};