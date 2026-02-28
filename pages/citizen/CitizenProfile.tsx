
import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User, Mail, Calendar, MapPin, Phone, Heart, 
  X, ShieldCheck, Banknote, Stethoscope, 
  Info, Plus, Upload, FileCheck, CheckCircle2,
  Fingerprint, RefreshCw, Camera
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ApplicationType, ApplicationStatus } from '../../types';

export const CitizenProfile: React.FC = () => {
  const { currentUser, addApplication, applications } = useApp();
  const navigate = useNavigate();
  const [showPhilHealthModal, setShowPhilHealthModal] = useState(false);
  const [philhealthId, setPhilhealthId] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Camera States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (!currentUser) return null;

  const philhealthApp = applications.find(
    a => a.userId === currentUser.id && a.type === ApplicationType.PHILHEALTH
  );

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
      setFiles(prev => [...prev.filter(f => !f.includes('Mobile_Capture')), `PhilHealth_Capture_${Date.now()}.jpg`]);
      setIsCameraOpen(false);
      
      if (videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((f: File) => f.name);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleSubmitPhilHealth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call delay
    setTimeout(() => {
      addApplication({
        userId: currentUser.id,
        userName: currentUser.name,
        type: ApplicationType.PHILHEALTH,
        description: `PhilHealth Facilitation Request. ID Number: ${philhealthId}`,
        documents: files
      });
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowPhilHealthModal(false);
        setPhilhealthId('');
        setFiles([]);
        setCapturedImage(null);
      }, 2000);
    }, 1500);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative pb-20">
      {/* Floating Close Button */}
      <button 
        onClick={() => navigate('/citizen/dashboard')}
        className="absolute -top-4 -right-4 md:top-0 md:right-0 p-2.5 bg-white hover:bg-slate-50 rounded-lg shadow-md border border-slate-200 transition-all group z-20"
        aria-label="Close"
      >
        <X size={20} className="text-slate-400 group-hover:text-red-600" />
      </button>

      <header className="pb-4 border-b border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">Citizen Profile</h1>
        <p className="text-slate-600 font-semibold">Official registration data and welfare eligibility records.</p>
      </header>

      <div className="space-y-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
          <div className="h-24 bg-slate-900 relative">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          </div>
          <div className="px-8 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 -mt-10 relative z-10">
            <img 
              src={currentUser.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Senior'} 
              alt="Profile" 
              className="w-32 h-32 rounded-xl border-4 border-white shadow-xl object-cover bg-white"
            />
            <div className="text-center md:text-left mb-2 flex-1">
              <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">{currentUser.name}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                <span className="px-3 py-1 bg-primary-50 text-primary-700 text-[10px] font-bold uppercase tracking-widest rounded border border-primary-100 flex items-center gap-1.5">
                  <ShieldCheck size={12} /> {currentUser.seniorIdNumber || 'ID Issuance Pending'}
                </span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest rounded border border-emerald-100">
                  Active Account
                </span>
              </div>
            </div>
            <div className="shrink-0 pb-1 flex gap-3">
              {philhealthApp ? (
                <div className={`px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 border transition-all ${
                  philhealthApp.status === ApplicationStatus.APPROVED 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                  : 'bg-amber-50 text-amber-600 border-amber-200'
                }`}>
                  <Stethoscope size={14} /> PhilHealth: {philhealthApp.status}
                </div>
              ) : (
                <button
                  onClick={() => setShowPhilHealthModal(true)}
                  className="px-6 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.15em] hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2"
                >
                  <Plus size={14} /> Add PhilHealth Member
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Info Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-8 animate-fade-in-up">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                <Fingerprint size={20} className="text-primary-500" />
                <h3 className="font-bold text-slate-800 uppercase tracking-widest text-sm">Personal Records</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Legal Name</p>
                  <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Birth Date</p>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Calendar size={14} className="text-slate-300" /> {currentUser.birthDate}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Home Address</p>
                  <p className="text-sm font-bold text-slate-800 flex items-start gap-2">
                    <MapPin size={14} className="text-slate-300 shrink-0 mt-0.5" /> {currentUser.address}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Civil Status</p>
                  <p className="text-sm font-bold text-slate-800">{currentUser.civilStatus || 'Married'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile Number</p>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-2 font-mono">
                    <Phone size={14} className="text-slate-300" /> {currentUser.contactNumber || '0917 000 0000'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Identity</p>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Mail size={14} className="text-slate-300" /> {currentUser.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-2 border-b border-slate-50 pb-4 mb-6">
                <Heart size={20} className="text-red-500" />
                <h3 className="font-bold text-slate-800 uppercase tracking-widest text-sm">Health & Pension Profile</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-4">
                  <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Banknote size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Economic Status</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">Verified Pensioner ({currentUser.pensionSource || 'SSS'})</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Monthly Stipend: ₱{currentUser.pensionAmount || '5,000'}.00</p>
                  </div>
                </div>
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-4">
                  <div className="p-2.5 bg-red-100 text-red-600 rounded-lg">
                    <Heart size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Medical Record</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{currentUser.hasIllness ? currentUser.illnessDetails : 'No declared conditions'}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Priority Healthcare Level 1</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck size={100} />
              </div>
              <div className="relative z-10">
                <h3 className="text-xs font-bold text-primary-400 uppercase tracking-[0.2em] mb-4">Registry Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Control Number</p>
                    <p className="text-sm font-bold font-mono tracking-wider">{currentUser.id.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Member Since</p>
                    <p className="text-sm font-bold">January 15, 2024</p>
                  </div>
                  <div className="pt-4 border-t border-white/10 mt-4">
                     <p className="text-[10px] text-white/60 leading-relaxed font-medium">This profile is synced with the Local Civil Registry (LCR) of San Juan City.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl border border-blue-100 p-6 flex items-start gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                <Info size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-1">Data Privacy Notice</h4>
                <p className="text-[10px] text-blue-600 font-medium leading-relaxed">
                  Your personal information is protected under the Data Privacy Act of 2012. Only authorized OSCA personnel can access full record details for benefit verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PhilHealth Facilitation Modal */}
      {showPhilHealthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isSubmitting && !isCameraOpen && setShowPhilHealthModal(false)} />
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl relative z-20 overflow-hidden flex flex-col animate-scale-up max-h-[90vh]">
            <div className="bg-slate-900 p-6 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary-600 rounded-xl">
                  <Stethoscope size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none uppercase tracking-widest">PhilHealth Facilitation</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">Submit MDR/ID for social health coordination</p>
                </div>
              </div>
              {!isSubmitting && (
                <button onClick={() => setShowPhilHealthModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              )}
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar">
              {success ? (
                <div className="py-12 flex flex-col items-center text-center space-y-4 animate-fade-in">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-100">
                    <CheckCircle2 size={32} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Request Submitted</h4>
                    <p className="text-slate-500 text-sm font-medium">Your PhilHealth records have been sent to the OSCA administrator for processing.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitPhilHealth} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">PhilHealth ID Number</label>
                    <div className="relative">
                      <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="text" 
                        required
                        value={philhealthId}
                        onChange={(e) => setPhilhealthId(e.target.value.replace(/[^0-9-]/g, ''))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-slate-800 font-bold font-mono outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                        placeholder="XX-XXXXXXXXX-X"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1 block">Support Documents (ID or MDR)</label>
                    
                    {capturedImage ? (
                       <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-slate-200 group">
                          <img src={capturedImage} className="w-full h-full object-cover" alt="Captured ID" />
                          <button type="button" onClick={() => { setCapturedImage(null); setFiles(files.filter(f => !f.includes('Mobile_Capture'))); }} className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-full shadow-lg group-hover:scale-110 transition-transform">
                            <X size={16} />
                          </button>
                       </div>
                    ) : (
                       <div className="grid grid-cols-2 gap-4">
                          <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 flex flex-col items-center justify-center text-center hover:bg-slate-100/50 transition-all cursor-pointer group">
                             <input type="file" multiple onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={isSubmitting} />
                             <Upload size={24} className="text-slate-400 group-hover:scale-110 transition-transform mb-2" />
                             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Upload Files</p>
                          </div>
                          <button type="button" onClick={() => { setIsCameraOpen(true); startCamera(); }} className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 flex flex-col items-center justify-center text-center hover:bg-slate-100/50 transition-all cursor-pointer group">
                             <Camera size={24} className="text-slate-400 group-hover:scale-110 transition-transform mb-2" />
                             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Take Photo</p>
                          </button>
                       </div>
                    )}

                    {files.length > 0 && (
                      <div className="space-y-2 mt-4">
                        {files.map((f, i) => (
                          <div key={i} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 text-[10px] text-slate-700 font-bold shadow-sm">
                            <span className="flex items-center gap-2 truncate pr-4">
                              <FileCheck size={14} className="text-emerald-500 shrink-0" /> {f}
                            </span>
                            <button type="button" onClick={() => removeFile(i)} className="text-slate-300 hover:text-red-500 transition-colors">
                              <X size={14}/>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPhilHealthModal(false)}
                      disabled={isSubmitting}
                      className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-primary-600/20 hover:bg-primary-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                      {isSubmitting ? 'Submitting...' : 'Send Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {isCameraOpen && (
          <div className="fixed inset-0 z-[200] bg-slate-900/95 flex flex-col items-center justify-center p-4">
              <div className="w-full max-w-xl bg-black rounded-3xl overflow-hidden relative border-4 border-white/10 shadow-2xl">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-[300px] h-[300px] border-4 border-white/50 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"></div>
                  </div>
                  <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                      <div className="bg-primary-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">Document Scan Active</div>
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
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-6">Frame your PhilHealth document for clear capture.</p>
          </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
