
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, CheckCircle2, ShieldCheck, 
  ArrowRight, Upload, FileCheck, X, User, 
  MapPin, Phone, Calendar, Heart, Banknote, ShieldAlert,
  FileText, Lock, RefreshCw, AlertCircle, Mail, Info, ChevronDown, Globe, MapPinned
} from 'lucide-react';
import { ApplicationType } from '../types';
import { notifyRegistrationSuccess } from '../services/notification';

const SLIDES = [
  "https://picsum.photos/seed/seniors_ph1/800/600",
  "https://picsum.photos/seed/seniors_ph2/800/600",
  "https://picsum.photos/seed/seniors_ph3/800/600"
];

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
  },
  "Manila": {
    districts: ["District 1", "District 2", "District 3", "District 4", "District 5", "District 6"],
    barangays: {
      "District 1": ["Barangay 1", "Barangay 2", "Barangay 3"],
      "District 2": ["Barangay 147", "Barangay 148"],
      "District 3": ["Binondo", "Quiapo", "San Nicolas", "Santa Cruz"],
      "District 4": ["Sampaloc"],
      "District 5": ["Ermita", "Malate", "Paco", "Intramuros"],
      "District 6": ["Pandacan", "Santa Ana"]
    }
  }
};

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { addApplication } = useApp();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    email: '',
    birthDate: '',
    birthPlace: '',
    sex: '',
    citizenship: 'Filipino',
    civilStatus: '',
    houseNo: '',
    street: '',
    barangay: '',
    district: '',
    city: '',
    province: 'Metro Manila',
    contactNumber: '',
    livingArrangement: '',
    isPensioner: false,
    pensionSource: '',
    pensionAmount: '',
    hasIllness: false,
    illnessDetails: ''
  });

  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      if (name === 'contactNumber') {
         // Prevent non-numeric and limit to 11 digits to avoid SQL range errors
         const val = value.replace(/\D/g, '').slice(0, 11);
         setFormData(prev => ({ ...prev, contactNumber: val }));
      } else if (name === 'city') {
        setFormData(prev => ({ ...prev, city: value, district: '', barangay: '' }));
      } else if (name === 'district') {
        setFormData(prev => ({ ...prev, district: value, barangay: '' }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((f: File) => f.name);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (formData.contactNumber.length < 10) {
        setErrorMsg('Please enter a valid contact number (11 digits).');
        return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    const fullName = `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}${formData.suffix ? ' ' + formData.suffix : ''}`.trim();
    const fullAddress = `${formData.houseNo} ${formData.street}, Brgy. ${formData.barangay}, ${formData.district}, ${formData.city}, ${formData.province}`;
    
    try {
      const response = await addApplication({
        userId: `cit_${Date.now()}`,
        userName: fullName,
        type: ApplicationType.REGISTRATION,
        description: `Portal Registration. Address: ${fullAddress}. Email: ${formData.email}. Contact: ${formData.contactNumber}.`,
        documents: files,
        formData: {
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          suffix: formData.suffix,
          birthDate: formData.birthDate,
          birthPlace: formData.birthPlace,
          sex: formData.sex,
          citizenship: formData.citizenship,
          civilStatus: formData.civilStatus,
          address: fullAddress,
          houseNo: formData.houseNo,
          street: formData.street,
          barangay: formData.barangay,
          district: formData.district,
          city: formData.city,
          province: formData.province,
          contactNumber: formData.contactNumber,
          email: formData.email,
          emergencyContactPerson: '',
          emergencyContactNumber: '',
          joinFederation: false,
          livingArrangement: formData.livingArrangement,
          isPensioner: formData.isPensioner,
          pensionSource: formData.pensionSource,
          pensionAmount: formData.pensionAmount,
          hasIllness: formData.hasIllness,
          illnessDetails: formData.illnessDetails
        }
      });

      if (response && response.ok) {
        setIsSuccess(true);
        await notifyRegistrationSuccess(fullName, formData.contactNumber, formData.email);
        setTimeout(() => {
          navigate('/', { state: { openLogin: true } });
        }, 2000);
      } else {
        setErrorMsg(response.error || 'Cloud submission failed. Gateway rejected the record.');
      }
    } catch (e: any) {
      console.error('Registration failed', e);
      setErrorMsg(e.message || 'A validation error occurred. Please check all fields and internet connectivity.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = 
    formData.firstName && 
    formData.middleName && 
    formData.lastName && 
    formData.email && 
    formData.birthDate && 
    formData.birthPlace && 
    formData.sex && 
    formData.citizenship && 
    formData.civilStatus && 
    formData.houseNo && 
    formData.street && 
    formData.city && 
    formData.district && 
    formData.barangay;

  const isStep2Valid = !!formData.livingArrangement; 
  const isStep3Valid = formData.contactNumber.length >= 10 && files.length > 0;

  const nextStep = () => {
    if (currentStep === 1) {
      if (!isStep1Valid) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!isStep2Valid) return;
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!isStep3Valid) return;
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };

  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden font-sans">
      <div className="hidden lg:flex w-[35%] bg-primary-600 text-white flex-col relative px-12 pt-20 pb-12 items-center justify-between animate-fade-in overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('https://www.phoenix.com.ph/wp-content/uploads/2026/01/Group-81.png')" }}></div>
        <div className="absolute top-10 left-10 z-20">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm font-semibold group">
            <div className="p-1.5 rounded-full border border-white/30 group-hover:bg-white/10 transition-colors"><ArrowLeft size={14}/></div>
            Back to home
          </button>
        </div>
        <div className="space-y-8 relative z-10 flex flex-col items-center text-center max-w-sm">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight drop-shadow-lg uppercase">Mabuhay!</h1>
            <p className="text-lg text-white/90 leading-relaxed font-semibold drop-shadow-sm">Register now to access your Senior Citizen benefits and services in San Juan City.</p>
          </div>
          <div className="relative w-64 h-64 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/20">
            {SLIDES.map((src, idx) => (
              <img key={idx} src={src} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[600ms] ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`} alt="Slideshow" />
            ))}
          </div>
        </div>
        <div className="flex justify-center w-full relative z-10">
          <img src="https://www.phoenix.com.ph/wp-content/uploads/2025/12/Group-74.png" className="h-16 w-auto object-contain drop-shadow-xl" alt="Official Logos" />
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full bg-white relative px-6 md:px-12 lg:px-20 overflow-y-auto custom-scrollbar">
        <div className="py-10 flex items-center justify-center shrink-0">
          <div className="flex items-center gap-3 w-full max-w-md">
            {[1, 2, 3].map((step, i) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    currentStep === step ? 'bg-primary-600 text-white shadow-lg scale-110' : currentStep > step ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>{currentStep > step ? <CheckCircle2 size={20} /> : step}</div>
                  <span className={`text-[10px] font-bold uppercase tracking-tighter ${currentStep === step ? 'text-primary-600' : 'text-slate-400'}`}>{step === 1 ? 'Profile' : step === 2 ? 'Social' : 'Final'}</span>
                </div>
                {i < 2 && <div className={`h-1 flex-1 rounded-full mb-6 ${currentStep > step ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full pb-32">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold animate-fade-in flex items-start gap-3 shadow-sm">
              <AlertCircle size={18} className="shrink-0" />
              <div className="whitespace-pre-line">{errorMsg}</div>
            </div>
          )}

          {isSuccess ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-scale-up">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-xl border border-emerald-100">
                    <CheckCircle2 size={48} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Record Reflected</h2>
                    <p className="text-lg text-slate-500 font-bold">Your application has been received and reflected on the cloud portal.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <RefreshCw size={18} className="text-primary-500 animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Redirecting to Secure Login...</span>
                </div>
            </div>
          ) : currentStep === 1 ? (
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-slate-900">Personal Profile</h2>
                <p className="text-slate-500 font-semibold text-sm">Please provide your basic information as it appears on your birth certificate.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">First Name <span className="text-red-500">*</span></label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-semibold" placeholder="Juan" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Middle Name <span className="text-red-500">*</span></label>
                  <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-semibold" placeholder="Santos" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Last Name <span className="text-red-500">*</span></label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-semibold" placeholder="Dela Cruz" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Suffix <span className="text-[10px] font-normal lowercase">(optional)</span></label>
                  <input type="text" name="suffix" value={formData.suffix} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-semibold" placeholder="Jr." />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Birth Date <span className="text-red-500">*</span></label>
                  <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-semibold" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Birth Place <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <MapPinned className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" name="birthPlace" value={formData.birthPlace} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-semibold" placeholder="City / Province" />
                  </div>
                </div>

                <div className="space-y-1 md:col-span-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Gender <span className="text-red-500">*</span></label>
                  <select name="sex" value={formData.sex} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-semibold">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="space-y-1 md:col-span-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Civil Status <span className="text-red-500">*</span></label>
                  <select name="civilStatus" value={formData.civilStatus} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-semibold">
                    <option value="">Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Citizenship <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" name="citizenship" value={formData.citizenship} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-semibold" placeholder="Filipino" />
                  </div>
                </div>

                <div className="md:col-span-4 pt-4 border-t border-slate-100 mt-2">
                   <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4"><MapPin size={14} className="text-primary-500" /> Residential Address</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">House No. <span className="text-red-500">*</span></label>
                        <input type="text" name="houseNo" value={formData.houseNo} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-primary-500" placeholder="e.g. 123" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Street / Block <span className="text-red-500">*</span></label>
                        <input type="text" name="street" value={formData.street} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-primary-500" placeholder="e.g. F. Blumentritt St." />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Province <span className="text-red-500">*</span></label>
                        <input type="text" name="province" value={formData.province} readOnly className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 cursor-not-allowed outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">City <span className="text-red-500">*</span></label>
                        <select name="city" value={formData.city} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-primary-500">
                           <option value="">Select City</option>
                           {Object.keys(METRO_MANILA_LOCATIONS).sort().map(city => (<option key={city} value={city}>{city}</option>))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">District <span className="text-red-500">*</span></label>
                        <select name="district" value={formData.district} onChange={handleChange} disabled={!formData.city} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-primary-500 disabled:opacity-50">
                           <option value="">Select District</option>
                           {formData.city && METRO_MANILA_LOCATIONS[formData.city]?.districts.map(dist => (<option key={dist} value={dist}>{dist}</option>))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Barangay <span className="text-red-500">*</span></label>
                        <select name="barangay" value={formData.barangay} onChange={handleChange} disabled={!formData.district} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-primary-500 disabled:opacity-50">
                           <option value="">Select Barangay</option>
                           {formData.city && formData.district && METRO_MANILA_LOCATIONS[formData.city]?.barangays[formData.district]?.map(brgy => (<option key={brgy} value={brgy}>{brgy}</option>))}
                        </select>
                      </div>
                   </div>
                </div>

                <div className="md:col-span-4 space-y-1 pt-4 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-semibold" placeholder="juan.delacruz@email.com" />
                  </div>
                </div>
              </div>
            </div>
          ) : currentStep === 2 ? (
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-slate-900">Socio-Economic Info</h2>
                <p className="text-slate-500 font-semibold text-sm">This helps us determine eligibility for various assistance programs.</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Info size={14}/> Living Arrangement <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Owned', 'Rent', 'Living with Relatives', 'Others'].map(opt => (
                      <button key={opt} type="button" onClick={() => setFormData(prev => ({...prev, livingArrangement: opt}))} className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${formData.livingArrangement === opt ? 'bg-primary-50 border-primary-500 text-primary-600 shadow-md' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}>{opt}</button>
                    ))}
                  </div>
                </div>
                <div className="h-px bg-slate-100"></div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Banknote size={16} className="text-emerald-500" /> Are you a Pensioner?</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="isPensioner" checked={formData.isPensioner} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                  {formData.isPensioner && (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in-down">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source (e.g. SSS, GSIS)</label>
                        <input type="text" name="pensionSource" value={formData.pensionSource} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none font-semibold" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount (Monthly)</label>
                        <input type="number" name="pensionAmount" value={formData.pensionAmount} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none font-semibold" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="h-px bg-slate-100"></div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Heart size={16} className="text-red-500" /> Do you have any major illness?</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="hasIllness" checked={formData.hasIllness} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </div>
                  {formData.hasIllness && (
                    <div className="space-y-1 animate-fade-in-down">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Illness Details</label>
                      <textarea name="illnessDetails" value={formData.illnessDetails} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none resize-none font-semibold" rows={2} placeholder="Hypertension, Diabetes, etc."></textarea>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-slate-900">Final Verification</h2>
                <p className="text-slate-500 font-semibold text-sm">Upload documents and provide contact details to complete registration.</p>
              </div>

              <div className="space-y-6">
                <div className="bg-primary-50 p-6 rounded-3xl border border-primary-100">
                  <h3 className="text-sm font-bold text-primary-800 uppercase tracking-wider mb-4 flex items-center gap-2"><FileText size={16}/> Required Documents <span className="text-red-500">*</span></h3>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-primary-100/50 transition-all cursor-pointer group">
                    <input type="file" multiple onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="w-12 h-12 bg-white text-primary-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md"><Upload size={24} /></div>
                    <p className="font-bold text-primary-900">Upload Birth Certificate / Valid ID</p>
                    <p className="text-xs text-primary-600 font-semibold mt-1">Images or PDF (Max 5MB each)</p>
                  </div>
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-primary-100 text-xs text-slate-700 font-semibold">
                          <span className="flex items-center gap-2"><FileCheck size={14} className="text-emerald-500" /> {f}</span>
                          <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500"><X size={14}/></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6 shadow-2xl">
                  <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={16} className="text-primary-400" /> Contact Info <span className="text-red-500">*</span></h3>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Mobile Number (11 digits)</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                      <input 
                        type="tel" 
                        name="contactNumber" 
                        maxLength={11}
                        value={formData.contactNumber} 
                        onChange={handleChange} 
                        className="w-full bg-white/10 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-primary-500 transition-all font-mono font-bold" 
                        placeholder="09171234567" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {!isSuccess && (
          <div className="fixed bottom-0 left-0 lg:left-[35%] right-0 h-32 bg-white/80 backdrop-blur-md border-t border-slate-100 flex items-center justify-between px-8 md:px-20 z-40">
            <button onClick={prevStep} disabled={currentStep === 1 || isSubmitting} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors group disabled:opacity-0">
               <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
               <span className="text-sm font-bold uppercase tracking-widest">Back</span>
            </button>

            <button 
              onClick={nextStep}
              disabled={isSubmitting || (currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid) || (currentStep === 3 && !isStep3Valid)}
              className={`flex items-center gap-3 px-12 py-4 rounded-full font-bold text-sm uppercase tracking-widest shadow-xl transition-all ${
                (currentStep === 3) ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-primary-600 text-white shadow-primary-600/30'
              } disabled:opacity-30 transform hover:-translate-y-1 active:scale-95`}
            >
              {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : null}
              {isSubmitting ? 'Submitting Registry...' : (currentStep === 3 ? 'Finish Registration' : 'Continue')}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
