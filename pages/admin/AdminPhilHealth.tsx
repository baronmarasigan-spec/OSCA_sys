
import React, { useState, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ApplicationStatus, ApplicationType, Role, Application, User } from '../../types';
import { 
  Stethoscope, CheckCircle, Clock, Archive, Search, 
  X, UserPlus, Fingerprint, Upload, RefreshCw, Eye,
  AlertCircle, XCircle, FileCheck, CheckCircle2, Camera, Download, FileText, ZoomIn, ZoomOut, Printer, ShieldCheck, Database, LayoutDashboard, Layers
} from 'lucide-react';

export const AdminPhilHealth: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const { applications, users, updateApplicationStatus, addApplication, isLiveMode, syncError } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI States
  const [isRegistering, setIsRegistering] = useState<User | null>(null);
  const [viewingApp, setViewingApp] = useState<Application | null>(null);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [philhealthId, setPhilhealthId] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Camera States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const philhealthApps = useMemo(() => 
    applications.filter(a => a.type === ApplicationType.PHILHEALTH),
    [applications]
  );

  const filteredApps = useMemo(() => {
    let list = philhealthApps;
    if (tab === 'approval') list = list.filter(a => a.status === ApplicationStatus.PENDING);
    else if (tab === 'approved') list = list.filter(a => a.status === ApplicationStatus.APPROVED || a.status === ApplicationStatus.ISSUED);
    else if (tab === 'disapproved') list = list.filter(a => a.status === ApplicationStatus.REJECTED);

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(a => a.userName.toLowerCase().includes(q) || a.id.includes(q));
    }
    return list;
  }, [philhealthApps, tab, searchTerm]);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRegistering) return;
    setIsSubmitting(true);
    
    setTimeout(() => {
      addApplication({
        userId: isRegistering.id,
        userName: isRegistering.name,
        type: ApplicationType.PHILHEALTH,
        description: `PhilHealth Walk-in Facilitation (Admin Assisted). ID: ${philhealthId}`,
        documents: files.length > 0 ? files : ['Verified_MDR_Physical.pdf']
      });
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsRegistering(null);
        setPhilhealthId('');
        setFiles([]);
        setCapturedImage(null);
      }, 1500);
    }, 1000);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      const size = Math.min(videoWidth, videoHeight);
      const x = (videoWidth - size) / 2;
      const y = (videoHeight - size) / 2;
      
      canvasRef.current.width = 600;
      canvasRef.current.height = 600;
      ctx?.drawImage(videoRef.current, x, y, size, size, 0, 0, 600, 600);
      
      const dataUrl = canvasRef.current.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
      setFiles(prev => [...prev.filter(f => !f.includes('Admin_Captured')), `Admin_Captured_ID_${Date.now()}.jpg`]);
      setIsCameraOpen(false);
      
      if (videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    }
  };

  const handleDownloadFile = (filename: string) => {
    const dummyContent = `Document: ${filename}\nApplication Reference: PhilHealth Facilitation\nReviewer: OSCA Admin\nDate: ${new Date().toLocaleDateString()}`;
    const blob = new Blob([dummyContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // --- Modal: Application Details ---
  const ApplicationDetailsModal = ({ app, onClose }: { app: Application, onClose: () => void }) => {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
        <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-20 overflow-hidden flex flex-col animate-scale-up max-h-[90vh]">
           <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-600 rounded-2xl">
                      <Stethoscope size={24} />
                  </div>
                  <div>
                      <h2 className="text-xl font-bold uppercase tracking-widest">PhilHealth Request</h2>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">Registry Log Entry #{app.id}</p>
                  </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={24} />
              </button>
           </div>

           <div className="p-8 space-y-8 bg-slate-50 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Applicant Name</label>
                   <p className="font-bold text-slate-800 text-lg uppercase tracking-tight">{app.userName}</p>
                </div>
                <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Date Submitted</label>
                   <p className="font-bold text-slate-800">{app.date}</p>
                </div>
                <div className="col-span-2">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Status Reference</label>
                   <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${app.status === ApplicationStatus.PENDING ? 'bg-amber-50 text-amber-600 border-amber-100' : app.status === ApplicationStatus.APPROVED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                        {app.status}
                      </span>
                      {app.rejectionReason && <p className="text-xs text-red-600 font-bold italic">"{app.rejectionReason}"</p>}
                   </div>
                </div>
                <div className="col-span-2">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Application Summary</label>
                   <div className="bg-white p-4 rounded-2xl border border-slate-200 text-sm font-medium text-slate-600 leading-relaxed">
                      {app.description}
                   </div>
                </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Attachments & Documents</label>
                 <div className="grid grid-cols-1 gap-3">
                    {app.documents?.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl group hover:border-primary-300 transition-all shadow-sm">
                         <div className="flex items-center gap-3 overflow-hidden">
                            <FileText size={18} className="text-blue-500 shrink-0" />
                            <span className="text-xs font-bold text-slate-700 truncate max-w-[250px]">{doc}</span>
                         </div>
                         <div className="flex gap-2">
                            <button onClick={() => setActiveFile(doc)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all" title="View Document"><Eye size={16}/></button>
                            <button onClick={() => handleDownloadFile(doc)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all" title="Download Document"><Download size={16}/></button>
                         </div>
                      </div>
                    ))}
                    {(!app.documents || app.documents.length === 0) && (
                      <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-bold uppercase">No digital copies uploaded</div>
                    )}
                 </div>
              </div>
           </div>

           <div className="p-6 bg-white border-t border-slate-100 flex justify-end gap-3 shrink-0">
               {app.status === ApplicationStatus.PENDING ? (
                 <>
                   <button 
                      onClick={() => { updateApplicationStatus(app.id, ApplicationStatus.REJECTED, "Documents mismatch or incomplete."); onClose(); }}
                      className="px-6 py-3 border-2 border-slate-100 text-slate-500 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all"
                   >
                      Reject Application
                   </button>
                   <button 
                      onClick={() => { updateApplicationStatus(app.id, ApplicationStatus.APPROVED); onClose(); }}
                      className="px-10 py-3 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                   >
                      Approve & Process
                   </button>
                 </>
               ) : (
                 <button onClick={onClose} className="px-10 py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest">Close Entry</button>
               )}
           </div>
        </div>
      </div>
    );
  };

  const DocumentViewer = () => {
    if (!activeFile) return null;
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
         <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={() => setActiveFile(null)} />
         <div className="bg-white w-full max-w-4xl h-full rounded-[2.5rem] relative z-20 flex flex-col overflow-hidden animate-scale-up shadow-2xl">
            <div className="px-8 py-4 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
                     <FileText size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{activeFile}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">PhilHealth Document Scan</p>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><ZoomIn size={18}/></button>
                  <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><ZoomOut size={18}/></button>
                  <button onClick={() => window.print()} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><Printer size={18}/></button>
                  <div className="w-px h-6 bg-slate-200 mx-2"></div>
                  <button onClick={() => setActiveFile(null)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><X size={20}/></button>
               </div>
            </div>
            <div className="flex-1 bg-slate-200 overflow-y-auto p-12 flex justify-center custom-scrollbar">
               <div className="w-full max-w-[700px] aspect-[1/1.4] bg-white shadow-2xl rounded-sm p-16 relative overflow-hidden ring-1 ring-slate-300">
                  <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
                  <div className="flex flex-col items-center text-center mb-12 border-b-2 border-slate-100 pb-8">
                     <img src="https://dev2.phoenix.com.ph/wp-content/uploads/2025/12/Seal_of_San_Juan_Metro_Manila.png" className="w-16 h-16 mb-4 opacity-80" alt="Seal" />
                     <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Republic of the Philippines</h4>
                     <h3 className="text-base font-bold text-slate-800 uppercase">PhilHealth Official Registry</h3>
                     <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Member Data Record (MDR) Verification Copy</p>
                  </div>
                  <div className="space-y-8 animate-pulse">
                     <div className="h-4 bg-slate-50 w-1/3 rounded"></div>
                     <div className="space-y-3">
                        <div className="h-10 bg-slate-50 w-full rounded-lg"></div>
                        <div className="h-10 bg-slate-50 w-full rounded-lg"></div>
                        <div className="h-10 bg-slate-50 w-2/3 rounded-lg"></div>
                     </div>
                     <div className="h-48 bg-slate-50 w-full rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                        <Fingerprint size={48} className="text-slate-200" />
                     </div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-[-30deg] pointer-events-none select-none text-[60px] font-bold whitespace-nowrap uppercase">
                     Administrative Copy
                  </div>
               </div>
            </div>
            <div className="p-6 bg-white border-t border-slate-100 flex justify-between items-center shrink-0">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500"/> Secure Handshake Verified</p>
               <button onClick={() => setActiveFile(null)} className="px-10 py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl">Close Viewer</button>
            </div>
         </div>
      </div>
    );
  };

  // --- RENDERING TABS ---

  if (tab === 'walk-in') {
    const walkinCitizens = users.filter(u => {
        const hasApp = philhealthApps.some(a => a.userId === u.id);
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (u.seniorIdNumber && u.seniorIdNumber.toLowerCase().includes(searchTerm.toLowerCase()));
        return u.role === Role.CITIZEN && !hasApp && matchesSearch;
    });

    return (
      <div className="space-y-6 animate-fade-in">
        <header>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Walk-in PhilHealth</h1>
          <p className="text-slate-500 font-bold">Coordinate health insurance records for on-site seniors.</p>
        </header>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
             <div className="relative max-w-xl">
               <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
               <input 
                  type="text" 
                  placeholder="Search by Name or Senior ID..."
                  className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-black text-sm uppercase"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                  <th className="p-8">Citizen Profile</th>
                  <th className="p-8">ID Control</th>
                  <th className="p-8">PhilHealth Registry</th>
                  <th className="p-8 text-right">Action Grid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {walkinCitizens.map(citizen => (
                  <tr key={citizen.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-8">
                      <p className="font-black text-slate-800 text-sm uppercase tracking-tight leading-tight">{citizen.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{citizen.email}</p>
                    </td>
                    <td className="p-8">
                       <span className="font-mono text-xs font-black text-slate-500 uppercase">{citizen.seniorIdNumber || 'PENDING'}</span>
                    </td>
                    <td className="p-8">
                       <span className="px-2.5 py-1 bg-slate-100 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-200">Not Synced</span>
                    </td>
                    <td className="p-8 text-right">
                        <button 
                            onClick={() => setIsRegistering(citizen)}
                            className="px-6 py-3 bg-primary-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all flex items-center gap-2 float-right"
                        >
                            <UserPlus size={14} /> Facilitate Request
                        </button>
                    </td>
                  </tr>
                ))}
                {walkinCitizens.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-20 text-center">
                       <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Database size={32} className="opacity-10" />
                       </div>
                       <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No unlinked records found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Walk-in Registration Modal */}
        {isRegistering && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => !isSubmitting && !isCameraOpen && setIsRegistering(null)} />
             <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-20 overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
                <div className="bg-slate-900 p-8 text-white shrink-0">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary-600 rounded-2xl shadow-lg">
                         <Stethoscope size={24} />
                      </div>
                      <div>
                         <h3 className="text-xl font-black uppercase tracking-widest leading-none">Registry Handshake</h3>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-2">Applicant: {isRegistering?.name}</p>
                      </div>
                      <button onClick={() => setIsRegistering(null)} className="ml-auto p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                      </button>
                   </div>
                </div>

                <div className="p-10 overflow-y-auto custom-scrollbar bg-slate-50">
                   {success ? (
                      <div className="py-12 flex flex-col items-center text-center space-y-4 animate-scale-up">
                         <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center border border-emerald-100 shadow-sm">
                            <CheckCircle2 size={40} />
                         </div>
                         <div className="space-y-1">
                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Record Pushed</h4>
                            <p className="text-slate-500 text-sm font-bold">PhilHealth request successfully mirrored in central registry.</p>
                         </div>
                      </div>
                   ) : (
                      <form onSubmit={handleRegisterSubmit} className="space-y-8">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">PhilHealth Membership ID</label>
                            <div className="relative">
                               <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                               <input 
                                  type="text" 
                                  required
                                  value={philhealthId}
                                  onChange={(e) => setPhilhealthId(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-800 font-black font-mono outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-lg tracking-wider"
                                  placeholder="XX-XXXXXXXXX-X"
                               />
                            </div>
                         </div>

                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block">Administrative Requirements (MDR)</label>
                            
                            {capturedImage ? (
                               <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden border-2 border-slate-200 group shadow-lg">
                                  <img src={capturedImage} className="w-full h-full object-cover" alt="Captured ID" />
                                  <button onClick={() => { setCapturedImage(null); setFiles(files.filter(f => !f.includes('Admin_Captured'))); }} className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-full shadow-lg group-hover:scale-110 transition-transform">
                                    <X size={16} />
                                  </button>
                               </div>
                            ) : (
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="relative border-2 border-dashed border-slate-300 rounded-3xl p-8 bg-white flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-all cursor-pointer group shadow-sm">
                                     <input type="file" multiple onChange={(e) => { if(e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!).map((f: File) => f.name)]); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                     <Upload size={32} className="text-slate-300 group-hover:text-primary-500 transition-colors mb-2" />
                                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Attach Files</p>
                                  </div>
                                  <button type="button" onClick={() => { setIsCameraOpen(true); startCamera(); }} className="border-2 border-dashed border-slate-300 rounded-3xl p-8 bg-white flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-all cursor-pointer group shadow-sm">
                                     <Camera size={32} className="text-slate-300 group-hover:text-primary-500 transition-colors mb-2" />
                                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Capture</p>
                                  </button>
                               </div>
                            )}

                            {files.length > 0 && (
                               <div className="space-y-2">
                                  {files.map((f, i) => (
                                     <div key={i} className="bg-white p-3 rounded-xl border border-slate-100 text-[10px] font-black text-slate-600 flex items-center justify-between shadow-sm uppercase tracking-tighter">
                                        <span className="flex items-center gap-2 truncate pr-4">
                                           <FileCheck size={14} className="text-emerald-500 shrink-0" /> {f}
                                        </span>
                                        <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-500 transition-colors"><X size={14}/></button>
                                     </div>
                                  ))}
                               </div>
                            )}
                         </div>

                         <button 
                           type="submit"
                           disabled={isSubmitting}
                           className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                         >
                            {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                            {isSubmitting ? 'Syncing...' : 'Finalize Handshake'}
                         </button>
                      </form>
                   )}
                </div>
             </div>
          </div>
        )}

        {/* Camera Modal */}
        {isCameraOpen && (
            <div className="fixed inset-0 z-[200] bg-slate-900/95 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-xl bg-black rounded-[2.5rem] overflow-hidden relative border-4 border-white/10 shadow-2xl">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-[300px] h-[300px] border-4 border-white/50 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"></div>
                    </div>
                    <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                        <div className="bg-primary-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Biometric Scanner Active</div>
                        <button onClick={() => { setIsCameraOpen(false); if(videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop()); }} className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all"><X size={24}/></button>
                    </div>
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                        <button onClick={capturePhoto} className="p-1 bg-white rounded-full shadow-2xl hover:scale-105 transition-all">
                           <div className="w-16 h-16 rounded-full border-4 border-slate-900 flex items-center justify-center">
                              <div className="w-12 h-12 bg-slate-900 rounded-full"></div>
                           </div>
                        </button>
                    </div>
                </div>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mt-8">Position MDR Document inside the frame.</p>
            </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // --- MANAGEMENT VIEWS (Approval, Approved, Disapproved) ---
  return (
    <div className="space-y-6 animate-fade-in">
      {viewingApp && <ApplicationDetailsModal app={viewingApp} onClose={() => setViewingApp(null)} />}
      {activeFile && <DocumentViewer />}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">PhilHealth Facilitation</h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-slate-500 font-bold text-lg">Official Coordination Queue</p>
              <div className={`flex items-center gap-2 px-3 py-1 ${isLiveMode ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'} border rounded-full`}>
                  {isLiveMode ? <ShieldCheck size={14} className="text-emerald-500" /> : <Layers size={14} className="text-amber-500" />}
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isLiveMode ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {isLiveMode ? 'API SYNC ACTIVE' : 'LOCAL CACHE'}
                  </span>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 shadow-xl">
             <RefreshCw size={14} /> Refresh Registry
          </button>
      </header>

      {syncError && (
          <div className="bg-amber-50 border-2 border-amber-100 p-8 rounded-[2.5rem] flex items-start gap-6 animate-fade-in-up shadow-sm">
              <AlertCircle size={32} className="text-amber-600 shrink-0" />
              <div className="space-y-1">
                  <h3 className="text-lg font-black text-amber-900 uppercase tracking-tight">External Node Timeout</h3>
                  <p className="text-amber-700 text-sm font-semibold max-w-2xl italic leading-relaxed">{syncError}</p>
              </div>
          </div>
      )}

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden ring-1 ring-black/5">
          <div className="p-8 border-b border-slate-100 bg-slate-50/40 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="relative max-w-md w-full group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-primary-500" size={20} />
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search records..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-sm font-black uppercase tracking-tight" />
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                     <Database size={12} className="text-primary-500" /> Queue Count: {filteredApps.length}
                  </div>
              </div>
          </div>

          {filteredApps.length === 0 ? (
              <div className="p-32 text-center text-slate-300">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Layers size={60} className="opacity-10" />
                  </div>
                  <p className="font-bold uppercase tracking-[0.3em] text-xs text-slate-400">No matching registry entries found</p>
              </div>
          ) : (
              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                        <tr>
                          <th className="p-8">Applicant Profile</th>
                          <th className="p-8">Handshake Status</th>
                          <th className="p-8">Applied Date</th>
                          <th className="p-8 text-right">Action Grid</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {filteredApps.map(app => (
                              <tr key={app.id} className="hover:bg-slate-50/80 transition-colors group">
                                  <td className="p-8">
                                    <div className="flex flex-col">
                                      <span className="font-black text-slate-900 uppercase tracking-tight text-sm leading-tight">{app.userName}</span>
                                      <span className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-widest">Log #{app.id}</span>
                                    </div>
                                  </td>
                                  <td className="p-8">
                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${app.status === ApplicationStatus.PENDING ? 'bg-amber-50 text-amber-600 border-amber-100' : app.status === ApplicationStatus.APPROVED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                      {app.status}
                                    </span>
                                  </td>
                                  <td className="p-8">
                                    <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                                      <Clock size={14} className="text-slate-300" /> {app.date}
                                    </span>
                                  </td>
                                  <td className="p-8 text-right">
                                    <button 
                                        onClick={() => setViewingApp(app)}
                                        className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2 shadow-sm ml-auto"
                                    >
                                        <Eye size={14} /> Review Log
                                    </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}
      </div>
    </div>
  );
};
