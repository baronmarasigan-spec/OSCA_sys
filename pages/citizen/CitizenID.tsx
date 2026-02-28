
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateAge } from '../../services/dateUtils';
import { ApplicationType, ApplicationStatus, User } from '../../types';
import { Upload, FileCheck, Camera, X, CheckCircle, RefreshCw, AlertTriangle, Calendar, ShieldAlert, CreditCard, ChevronRight, User as UserIcon, MapPin, Phone, ShieldCheck, Heart, AlertCircle, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IDCard } from '../../components/IDCard';

export const CitizenID: React.FC = () => {
  const { currentUser, addApplication, applications } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [step, setStep] = useState(1);
  const [formMode, setFormMode] = useState<ApplicationType | null>(null);
  const hasIssuedID = !!currentUser?.seniorIdNumber;

  // Form State
  const [files, setFiles] = useState<string[]>([]);
  const [idFormData, setIdFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    birthDate: '',
    birthPlace: '',
    sex: '',
    citizenship: 'Filipino',
    civilStatus: '',
    houseNo: '',
    street: '',
    barangay: '',
    city: 'SAN JUAN CITY',
    province: 'METRO MANILA',
    district: '',
    email: '',
    contactNumber: '',
    emergencyContactPerson: '',
    emergencyContactNumber: '',
    joinFederation: false,
    capturedImage: undefined as string | undefined
  });
  
  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize formMode based on URL tab or user status
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'renew') setFormMode(ApplicationType.ID_RENEWAL);
    else if (tab === 'new') setFormMode(ApplicationType.ID_NEW);
    else if (tab === 'replace') setFormMode(ApplicationType.ID_REPLACEMENT);
    else if (!hasIssuedID) setFormMode(ApplicationType.ID_NEW);
  }, [searchParams, hasIssuedID]);

  // Robust pre-fill from current user
  useEffect(() => {
    if (currentUser && formMode) {
      const nameParts = currentUser.name.split(' ');
      setIdFormData({
        firstName: currentUser.firstName || nameParts[0] || '',
        middleName: currentUser.middleName || '',
        lastName: currentUser.lastName || nameParts[nameParts.length - 1] || '',
        suffix: currentUser.suffix || '',
        birthDate: currentUser.birthDate || '',
        birthPlace: currentUser.birthPlace || '',
        sex: currentUser.sex || '',
        citizenship: currentUser.citizenship || 'Filipino',
        civilStatus: currentUser.civilStatus || '',
        houseNo: currentUser.houseNo || '',
        street: currentUser.street || '',
        barangay: currentUser.barangay || '',
        city: currentUser.city || 'SAN JUAN CITY',
        province: currentUser.province || 'METRO MANILA',
        district: currentUser.district || '',
        email: currentUser.email || '',
        contactNumber: currentUser.contactNumber || '',
        emergencyContactPerson: currentUser.emergencyContactPerson || '',
        emergencyContactNumber: currentUser.emergencyContactNumber || '',
        joinFederation: currentUser.joinFederation || false,
        capturedImage: undefined
      });
    }
  }, [currentUser, formMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setIdFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
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
      
      // Calculate 1x1 crop area
      const size = Math.min(videoWidth, videoHeight);
      const x = (videoWidth - size) / 2;
      const y = (videoHeight - size) / 2;
      
      canvasRef.current.width = 600; // Final ID size
      canvasRef.current.height = 600;
      
      ctx?.drawImage(videoRef.current, x, y, size, size, 0, 0, 600, 600);
      
      const dataUrl = canvasRef.current.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
      setIdFormData(prev => ({ ...prev, capturedImage: dataUrl }));
      setFiles(prev => [...prev.filter(f => !f.includes('Live_Selfie')), `Biometric_ID_Photo_${Date.now()}.jpg`]);
      setIsCameraOpen(false);
      
      if (videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    }
  };

  const handleSubmit = () => {
    const type = formMode || ApplicationType.ID_NEW;
    const fullAddress = `${idFormData.houseNo} ${idFormData.street}, Brgy. ${idFormData.barangay}, ${idFormData.city}, ${idFormData.province}`;
    addApplication({
      userId: currentUser!.id,
      userName: `${idFormData.firstName} ${idFormData.lastName}`,
      type: type,
      description: `Official ID Application submitted through Citizen Portal.\nResidential Address: ${fullAddress}\nPlace of Birth: ${idFormData.birthPlace}\nJoin Federation: ${idFormData.joinFederation ? 'YES' : 'NO'}\nEmergency Contact: ${idFormData.emergencyContactPerson} (${idFormData.emergencyContactNumber})\nValidated with Digital Signature & Selfie Biometrics.`,
      documents: files,
      formData: { ...idFormData, address: fullAddress }
    });
    navigate('/citizen/dashboard');
  };

  const activeApplication = applications.find(
      a => a.userId === currentUser?.id && 
      [ApplicationType.ID_NEW, ApplicationType.ID_RENEWAL, ApplicationType.ID_REPLACEMENT].includes(a.type) &&
      a.status === ApplicationStatus.PENDING
  );

  if (activeApplication) {
      return (
          <div className="max-w-2xl mx-auto text-center space-y-6 pt-10 relative">
              <button onClick={() => navigate('/citizen/dashboard')} className="absolute top-0 right-0 p-2.5 bg-white rounded-lg shadow-md border border-slate-200 group transition-all">
                  <X size={20} className="text-slate-400 group-hover:text-red-600" />
              </button>
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto border border-blue-100">
                  <RefreshCw size={32} className="animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Processing Application</h2>
              <p className="text-slate-600 text-sm font-semibold">
                  We are currently reviewing your request for <strong>{activeApplication.type}</strong>.
                  You will receive an SMS update once verified.
              </p>
          </div>
      );
  }

  if (hasIssuedID && !formMode) {
      return (
          <div className="max-w-5xl mx-auto space-y-6 relative">
              <button onClick={() => navigate('/citizen/dashboard')} className="absolute top-0 right-0 p-2.5 bg-white rounded-lg shadow-md border border-slate-200 group transition-all z-20">
                  <X size={20} className="text-slate-400 group-hover:text-red-600" />
              </button>
              
              <header className="pb-4 border-b border-slate-200">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">Identification Services</h1>
                  <p className="text-slate-600 font-semibold">Manage your digital credentials and ID lifecycle.</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center justify-center shadow-sm">
                        <div className="mb-8">
                            <IDCard user={currentUser!} />
                        </div>
                        <div className="flex gap-4 w-full max-w-sm">
                            <button className="flex-1 py-3 bg-white border border-slate-200 text-slate-900 rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-sm">Download PDF</button>
                            <button className="flex-1 py-3 bg-slate-900 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-md">Print Copy</button>
                        </div>
                  </div>

                  <div className="lg:col-span-5 space-y-4">
                      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                             <Calendar size={14} /> ID Validity & Status
                          </h3>
                          <div className="space-y-4">
                              <div className="flex justify-between items-end pb-3 border-b border-slate-50">
                                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Expiration Date</span>
                                  <span className="text-slate-900 font-bold text-sm">{currentUser?.seniorIdExpiryDate || 'N/A'}</span>
                              </div>
                              <div className={`p-4 rounded-lg flex items-start gap-3 bg-emerald-50 text-emerald-800 border border-emerald-100`}>
                                  <CheckCircle size={18} />
                                  <div>
                                      <p className="text-xs font-bold uppercase tracking-wide">Valid Document</p>
                                      <p className="text-[10px] font-semibold opacity-80 mt-1 leading-relaxed">Your Senior Citizen ID is currently active and valid for all merchant discounts.</p>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-2">
                        <button 
                            onClick={() => setFormMode(ApplicationType.ID_RENEWAL)}
                            className="w-full py-4 bg-primary-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg hover:bg-primary-700"
                        >
                            <RefreshCw size={16} /> Renew Existing ID
                        </button>
                        <button 
                            onClick={() => setFormMode(ApplicationType.ID_REPLACEMENT)}
                            className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center justify-center gap-3"
                        >
                            <ShieldAlert size={16} /> Report Lost / Damaged
                        </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  const stepTitles = ["Masterlist Review", "Documentary Proofs", "Biometric Scan"];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 relative animate-fade-in-up">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">ID Application Wizard</h1>
                <p className="text-slate-600 font-semibold">Step {step} of 3: {stepTitles[step-1]}</p>
            </div>
            <button onClick={() => { if(hasIssuedID) setFormMode(null); else navigate('/citizen/dashboard'); }} className="p-2.5 bg-white rounded-lg shadow-md border border-slate-200 group transition-all">
                <X size={20} className="text-slate-400 group-hover:text-red-600" />
            </button>
        </div>

        {/* Stepper Visual */}
        <div className="flex items-center gap-4 px-4">
            <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-primary-600' : 'bg-slate-200'}`}></div>
            <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-primary-600' : 'bg-slate-200'}`}></div>
            <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= 3 ? 'bg-primary-600' : 'bg-slate-200'}`}></div>
        </div>

        {/* STEP 1: PERSONAL DETAILS */}
        {step === 1 && (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <UserIcon size={24} className="text-primary-500" />
                        <h2 className="text-xl font-bold uppercase tracking-widest">Personal Details</h2>
                    </div>
                    <div className="bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tighter border border-white/20">
                        Registry Information
                    </div>
                </div>

                <div className="p-8 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { label: 'Last Name', value: idFormData.lastName, name: 'lastName' },
                            { label: 'First Name', value: idFormData.firstName, name: 'firstName' },
                            { label: 'Middle Name', value: idFormData.middleName, name: 'middleName' },
                            { label: 'Suffix', value: idFormData.suffix, name: 'suffix' },
                            { label: 'Birthdate', value: idFormData.birthDate, name: 'birthDate', type: 'date' },
                            { label: 'Age', value: calculateAge(idFormData.birthDate), readOnly: true },
                            { label: 'Place of Birth', value: idFormData.birthPlace, name: 'birthPlace' },
                            { label: 'Sex', value: idFormData.sex, name: 'sex', type: 'select', options: ['Male', 'Female'] },
                            { label: 'Civil Status', value: idFormData.civilStatus, name: 'civilStatus', type: 'select', options: ['Single', 'Married', 'Widowed', 'Separated'] },
                            { label: 'Citizenship', value: idFormData.citizenship, name: 'citizenship' },
                            { label: 'Mobile Number', value: idFormData.contactNumber, name: 'contactNumber', type: 'tel' },
                            { label: 'Email', value: idFormData.email, name: 'email', type: 'email' }
                        ].map((field, idx) => (
                            <div key={idx} className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">{field.label}</label>
                                {field.type === 'select' ? (
                                    <select name={field.name} value={field.value} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-slate-800 font-semibold text-sm outline-none focus:ring-2 focus:ring-primary-500/10 transition-all">
                                        <option value="">Select</option>
                                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                ) : (
                                    <input 
                                        type={field.type || 'text'} 
                                        name={field.name} 
                                        value={field.value} 
                                        onChange={handleInputChange} 
                                        readOnly={field.readOnly}
                                        className={`w-full border border-slate-100 rounded-xl px-4 py-2.5 text-slate-800 font-semibold text-sm outline-none focus:ring-2 focus:ring-primary-500/10 transition-all ${field.readOnly ? 'bg-slate-100 text-slate-500' : 'bg-slate-50'}`} 
                                    />
                                )}
                            </div>
                        ))}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">House No.</label><input type="text" name="houseNo" value={idFormData.houseNo} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-slate-800 font-semibold text-sm outline-none focus:ring-2 focus:ring-primary-500/10" /></div>
                            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Street</label><input type="text" name="street" value={idFormData.street} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-slate-800 font-semibold text-sm outline-none focus:ring-2 focus:ring-primary-500/10" /></div>
                            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Barangay</label><input type="text" name="barangay" value={idFormData.barangay} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-slate-800 font-semibold text-sm outline-none focus:ring-2 focus:ring-primary-500/10" /></div>
                            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">City</label><input type="text" name="city" value={idFormData.city} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-slate-800 font-semibold text-sm outline-none focus:ring-2 focus:ring-primary-500/10" /></div>
                            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Province</label><input type="text" name="province" value={idFormData.province} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-slate-800 font-semibold text-sm outline-none focus:ring-2 focus:ring-primary-500/10" /></div>
                            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">District</label><input type="text" name="district" value={idFormData.district} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-slate-800 font-semibold text-sm outline-none focus:ring-2 focus:ring-primary-500/10" /></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-100">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={20} className="text-secondary-600" />
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Emergency Contact</h3>
                            </div>
                            <div className="space-y-4">
                                <input type="text" name="emergencyContactPerson" value={idFormData.emergencyContactPerson} onChange={handleInputChange} className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold" placeholder="Contact Person Name" />
                                <input type="tel" name="emergencyContactNumber" value={idFormData.emergencyContactNumber} onChange={handleInputChange} className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold" placeholder="Emergency Contact No." />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Heart size={20} className="text-primary-600" />
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Federation</h3>
                            </div>
                            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 h-full flex items-center">
                                <label className="flex items-start gap-4 cursor-pointer select-none">
                                    <input type="checkbox" name="joinFederation" checked={idFormData.joinFederation} onChange={handleInputChange} className="w-6 h-6 rounded-lg text-primary-600 border-slate-300 mt-1 transition-all" />
                                    <span className="text-xs font-semibold text-slate-700 leading-relaxed uppercase tracking-tight">Join the Federation of Senior Citizen Association?</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                        <button onClick={() => setStep(2)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:bg-slate-800 transition-all transform hover:-translate-y-1">
                            Next: Documentary Proofs <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* STEP 2: DOCUMENTS */}
        {step === 2 && (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <FileText size={24} className="text-primary-500" />
                        <h2 className="text-xl font-bold uppercase tracking-widest">Documentary Proofs</h2>
                    </div>
                    <button onClick={() => setStep(1)} className="text-[10px] font-bold uppercase tracking-widest hover:text-primary-400 transition-colors flex items-center gap-1">
                        <ArrowLeft size={12} /> Back to Details
                    </button>
                </div>

                <div className="p-8 space-y-10">
                    <div className="bg-primary-50/50 p-6 rounded-[2rem] border border-primary-100 space-y-4">
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
                        <div className="aspect-[16/6] relative border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-slate-100/50 transition-all cursor-pointer group">
                            <input type="file" multiple onChange={(e) => { if(e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!).map((f: File) => f.name)]); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <div className="w-16 h-16 bg-white text-blue-500 rounded-full flex items-center justify-center shadow-md group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <Upload size={24} />
                            </div>
                            <p className="text-sm font-bold text-slate-800 uppercase tracking-widest mt-4">Attach Scans</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1">PSA Birth Certificate and Valid Government ID required.</p>
                        </div>
                    </div>

                    {files.filter(f => !f.includes('Biometric')).length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-slate-100">
                            {files.filter(f => !f.includes('Biometric')).map((f, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-2 truncate pr-4">
                                        <FileCheck size={14} className="text-emerald-500 shrink-0" /> {f}
                                    </span>
                                    <button onClick={() => setFiles(files.filter(file => file !== f))} className="text-slate-300 hover:text-red-500 transition-colors shrink-0"><X size={14}/></button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                        <button onClick={() => setStep(3)} disabled={files.filter(f => !f.includes('Biometric')).length < 1} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:bg-slate-800 transition-all transform hover:-translate-y-1 disabled:opacity-50">
                            Next: Biometric Selfie <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* STEP 3: SELFIE BIO-SCAN */}
        {step === 3 && (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Camera size={24} className="text-primary-500" />
                        <h2 className="text-xl font-bold uppercase tracking-widest">Biometric Verification</h2>
                    </div>
                    <button onClick={() => setStep(2)} className="text-[10px] font-bold uppercase tracking-widest hover:text-primary-400 transition-colors flex items-center gap-1">
                        <ArrowLeft size={12} /> Back to Documents
                    </button>
                </div>

                <div className="p-8 space-y-10">
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <Camera size={18} className="text-primary-600" /> Live Face Capture
                        </h3>
                        <div className="aspect-[4/3] max-w-md mx-auto bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-6 relative overflow-hidden group">
                            {capturedImage ? (
                                <>
                                    <img src={capturedImage} className="absolute inset-0 w-full h-full object-cover" alt="Captured" />
                                    <button onClick={() => { setCapturedImage(null); setFiles(files.filter(f => !f.includes('Biometric'))); setIdFormData(prev => ({...prev, capturedImage: undefined})); }} className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-full shadow-lg z-20">
                                        <X size={16} />
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => { setIsCameraOpen(true); startCamera(); }} className="flex flex-col items-center gap-4 transition-all hover:scale-105">
                                    <div className="w-20 h-20 bg-white text-primary-500 rounded-full flex items-center justify-center shadow-xl group-hover:bg-primary-500 group-hover:text-white transition-colors">
                                        <Camera size={32} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-800 uppercase tracking-widest">Take Selfie Scan</p>
                                    <p className="text-[10px] text-slate-400 font-semibold max-w-[200px] text-center">Required for digital identity authentication.</p>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                        <AlertTriangle className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 pointer-events-none" />
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 text-primary-400">Security Warning:</h4>
                        <p className="text-xs leading-relaxed font-semibold opacity-90 uppercase tracking-tighter">
                            UNTRUTHFUL STATEMENTS CONSTITUTE FALSIFICATION OF PUBLIC DOCUMENTS PUNISHABLE UNDER THE REVISED PENAL CODE.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={() => setStep(2)} className="px-8 py-5 bg-white border-2 border-slate-100 text-slate-500 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all">Review Docs</button>
                        <button onClick={handleSubmit} disabled={!capturedImage} className="flex-1 py-5 bg-primary-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-primary-600/30 hover:bg-primary-700 transition-all transform hover:-translate-y-1 disabled:opacity-50">
                            Final Submit Application
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Camera Modal */}
        {isCameraOpen && (
            <div className="fixed inset-0 z-[100] bg-slate-900/95 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-xl bg-black rounded-3xl overflow-hidden relative border-4 border-white/10 shadow-2xl">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
                    
                    {/* 1x1 Framing Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-[300px] h-[300px] border-4 border-white/50 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"></div>
                    </div>

                    <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                        <div className="bg-primary-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg">Scan Active</div>
                        <button onClick={() => { setIsCameraOpen(false); if(videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop()); }} className="p-3 bg-white/20 text-white rounded-full backdrop-blur-md hover:bg-white/30 transition-all"><X size={24}/></button>
                    </div>
                    
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                        <button onClick={capturePhoto} className="p-1 bg-white rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 transition-all">
                            <div className="w-16 h-16 rounded-full border-4 border-slate-900 flex items-center justify-center">
                                <div className="w-12 h-12 bg-slate-900 rounded-full"></div>
                            </div>
                        </button>
                    </div>
                </div>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mt-6">Position face inside the frame for 1x1 capture.</p>
            </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};