
import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateAge } from '../../services/dateUtils';
import { ApplicationType, ApplicationStatus } from '../../types';
import { HeartHandshake, Banknote, CheckCircle2, X, Car, Film, Gift, Landmark, Trophy, Info, ChevronRight, Check, Bookmark, Upload, FileCheck, RefreshCw, CalendarDays, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CENTENNIAL_DATA = [
  { age: 70, national: 0, city: 10000, total: 10000 },
  { age: 80, national: 10000, city: 25000, total: 35000 },
  { age: 85, national: 10000, city: 0, total: 10000 },
  { age: 90, national: 10000, city: 30000, total: 40000 },
  { age: 95, national: 10000, city: 0, total: 10000 },
  { age: 100, national: 100000, city: 50000, total: 150000 },
];

export const CitizenBenefits: React.FC = () => {
  const { currentUser, applications, addApplication } = useApp();
  const navigate = useNavigate();
  const [selectedDetail, setSelectedDetail] = useState<any | null>(null);
  const [applyingBenefit, setApplyingBenefit] = useState<any | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userAge = useMemo(() => calculateAge(currentUser?.birthDate || ''), [currentUser]);

  const currentEligibility = useMemo(() => {
    // Find the highest bracket the user has reached
    const brackets = [...CENTENNIAL_DATA].reverse();
    return brackets.find(b => userAge >= b.age) || null;
  }, [userAge]);

  const benefits = [
    {
      id: 'annual_indigent',
      type: ApplicationType.BENEFIT_CASH,
      title: 'Annual Benefits (Indigent)',
      amount: '₱2,000.00 / Year',
      description: 'Yearly financial assistance for medicines and basic daily needs of qualified indigent senior citizens.',
      icon: Banknote,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      details: {
        subtitle: 'Financial Support (Ordinance)',
        inclusions: [
          '₱2,000.00 yearly financial assistance',
          'For medicines and basic daily needs'
        ],
        qualifications: [
          'Must be Registered with CSWD',
          'No pension from SSS, GSIS, AFP, PNP, or similar institutions'
        ],
        note: 'This ordinance ensures that the most financially vulnerable senior citizens receive regular city support for their health and daily living needs.'
      }
    },
    {
      id: 'centennial_consolidated',
      type: ApplicationType.BENEFIT_CASH,
      title: 'Centennial Cash Gifts',
      amount: currentEligibility ? `₱${currentEligibility.total.toLocaleString()} Eligible` : 'Milestone Cash Grants',
      description: 'Milestone financial recognition for senior citizens reaching the ages of 70, 80, 85, 90, 95, and 100.',
      icon: Trophy,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      isCentennial: true,
      details: {
        subtitle: 'Milestone Longevity Grant',
        inclusions: [
          'Combined National (RA 10868) and City Cash Gifts',
          'Automatic eligibility check via Birth Registry',
          'Commemorative Certificate of Longevity'
        ],
        qualifications: [
          'Registered San Juan Senior Citizen',
          'Must reach the specific age milestones (70-100)',
          'Resident of San Juan City for at least 5 years'
        ],
        note: 'The cash gift is distributed in batches following the birthday month verification process.'
      }
    },
    {
      id: 'ordinance_merged',
      type: ApplicationType.BENEFIT_CASH,
      title: 'City Ordinances (81, 58th Wedding Anniversary)',
      amount: '₱50,000.00 Incentive',
      description: 'Qualified married couples celebrating their 50th wedding anniversary are entitled to a ₱50,000 cash incentive from the City Government of San Juan.',
      icon: HeartHandshake,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      requiresDocs: true,
      details: {
        subtitle: 'Anniversary Recognition Grant',
        inclusions: [
          '₱50,000.00 one-time cash incentive',
          'Official Recognition Plaque'
        ],
        qualifications: [
          'Celebrating 50th Wedding Anniversary',
          'Registered San Juan Senior Citizens',
          'Marriage must be legally verified'
        ],
        note: 'This ordinance significantly honors the institution of marriage and the elderly\'s contribution to the local community.'
      }
    },
    {
      id: 'social_pension',
      type: ApplicationType.BENEFIT_CASH,
      title: 'Social Pension - DSWD',
      amount: 'Monthly Stipend',
      description: 'Regular stipend from the DSWD for indigent senior citizens to support daily needs.',
      icon: Bookmark,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ];

  const perks = [
    {
      title: 'Free Parking',
      description: 'Daily free parking for first 3 hours (Mon-Sun & Holidays). Valid for all San Juan OSCA ID holders.',
      icon: Car,
      color: 'text-blue-600',
      details: {
        subtitle: '3 hrs + 20% discount beyond (10:00am–5:00pm)',
        inclusions: [
          'Free parking for 3 hours daily',
          'Valid Monday to Sunday, including holidays',
          '20% discount after 3 hours',
          'Must have San Juan OSCA ID',
          'Must be present in the vehicle'
        ],
        exclusions: [
          'Overnight parking',
          'Non-San Juan residents',
          'Seniors without San Juan OSCA ID'
        ],
        note: 'This ordinance significantly expands senior citizens’ benefits by making free parking available every day and all day, not just on weekdays.'
      }
    },
    {
      title: 'Free Movies',
      description: 'Available every Monday and Tuesday from 10:00 AM to 5:00 PM in all San Juan City Cinemas.',
      icon: Film,
      color: 'text-purple-600',
      details: {
        subtitle: 'Monday & Tuesday Access',
        inclusions: [
          'Free admission to all movies',
          'Valid in all San Juan City Cinemas',
          'Time: 10:00 AM to 5:00 PM',
          'Requires valid San Juan Senior ID'
        ],
        exclusions: [
          'Blockbuster premieres (first week)',
          'IMAX or Director\'s Club screenings',
          'Snacks or beverages'
        ]
      }
    }
  ];

  const getStatus = (title: string) => {
    return applications.find(a => a.userId === currentUser?.id && a.description.includes(title) && a.status !== ApplicationStatus.REJECTED);
  };

  const handleApplyClick = (benefit: any) => {
    if (benefit.requiresDocs) {
      setApplyingBenefit(benefit);
      setAttachedFiles([]);
    } else {
      handleFinalSubmit(benefit);
    }
  };

  const handleFinalSubmit = async (benefit: any) => {
    setIsSubmitting(true);
    await addApplication({
      userId: currentUser!.id,
      userName: currentUser!.name,
      type: benefit.type,
      description: `Application for ${benefit.title}${benefit.isCentennial ? ` (Age ${userAge})` : ''}`,
      documents: attachedFiles.length > 0 ? attachedFiles : undefined
    });
    setIsSubmitting(false);
    setApplyingBenefit(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((f: File) => f.name);
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 relative pb-20">
      <button 
        onClick={() => navigate('/citizen/dashboard')}
        className="absolute -top-4 -right-4 md:top-0 md:right-0 p-2.5 bg-white hover:bg-slate-50 rounded-lg shadow-md border border-slate-200 transition-all group z-20"
        aria-label="Close"
      >
        <X size={20} className="text-slate-400 group-hover:text-red-600" />
      </button>

      <header className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welfare & Benefits</h1>
        <p className="text-slate-600 font-medium mt-1">Apply for financial assistance and view your entitled city privileges.</p>
      </header>

      {/* Actionable Benefits Section */}
      <section className="space-y-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2 px-1">
            Apply for Assistance
        </h2>
        <div className="grid grid-cols-1 gap-4">
            {benefits.map((benefit) => {
            const status = getStatus(benefit.title);
            const isApplied = !!status;

            return (
                <div key={benefit.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row group transition-all hover:border-primary-200">
                <div className={`w-2 md:w-3 ${isApplied ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>
                
                <div className="p-6 flex-1 flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className={`w-14 h-14 ${benefit.bgColor} ${benefit.color} rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                    <benefit.icon size={28} strokeWidth={2.5} />
                    </div>

                    <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">{benefit.title}</h3>
                        {isApplied && (
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                                status.status === ApplicationStatus.ISSUED || status.status === ApplicationStatus.APPROVED 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                                {status.status}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-secondary-600 font-bold text-xs uppercase tracking-widest">{benefit.amount}</p>
                      {benefit.isCentennial && (
                        <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                          Age: {userAge}
                        </div>
                      )}
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-2xl font-medium">{benefit.description}</p>
                    {benefit.details && (
                      <button 
                        onClick={() => setSelectedDetail(benefit)}
                        className="mt-2 text-[10px] font-black uppercase text-primary-600 hover:text-primary-800 transition-colors flex items-center gap-1"
                      >
                        See Qualifications & Details <ChevronRight size={12} />
                      </button>
                    )}
                    </div>

                    <div className="w-full md:w-48 shrink-0 flex flex-col gap-2">
                        <button
                            onClick={() => handleApplyClick(benefit)}
                            disabled={isApplied || (benefit.isCentennial && !currentEligibility)}
                            className={`w-full py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 shadow-sm ${
                            isApplied 
                                ? 'bg-slate-100 text-slate-400 cursor-allowed border border-slate-200' 
                                : (benefit.isCentennial && !currentEligibility)
                                  ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100'
                                  : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg'
                            }`}
                        >
                            {isApplied ? <CheckCircle2 size={14} /> : null}
                            {isApplied ? 'Application Sent' : (benefit.isCentennial && !currentEligibility) ? 'Not Yet Eligible' : 'Submit Application'}
                        </button>
                    </div>
                </div>
                </div>
            );
            })}
        </div>
      </section>

      {/* View Only Perks Section */}
      <section className="space-y-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2 px-1">
            Entitled Privileges & Perks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {perks.map((perk, idx) => (
                <div key={idx} className="bg-slate-50 rounded-3xl p-8 border border-slate-200 flex items-start gap-6 group hover:bg-white transition-all shadow-sm relative">
                    <div className={`w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center ${perk.color} group-hover:border-primary-100 transition-all shadow-sm`}>
                        <perk.icon size={24} />
                    </div>
                    <div className="space-y-2 flex-1">
                        <h4 className="text-lg font-bold text-slate-800 tracking-tight">{perk.title}</h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{perk.description}</p>
                        <button 
                          onClick={() => setSelectedDetail(perk)}
                          className="mt-4 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
                        >
                          See More Details <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* Perk/Benefit Detail Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedDetail(null)} />
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-20 overflow-hidden flex flex-col animate-scale-up border border-white/20">
            <div className="bg-slate-900 p-8 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center ${selectedDetail.color}`}>
                  <selectedDetail.icon size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-widest">{selectedDetail.title}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{selectedDetail.details.subtitle}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDetail(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8 bg-slate-50 overflow-y-auto max-h-[70vh] custom-scrollbar">
              {/* SPECIAL CASE: Centennial Cash Gifts Table */}
              {selectedDetail.isCentennial && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                        <CalendarDays size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Your Current Age</p>
                        <p className="text-xl font-black text-slate-900">{userAge} Years Old</p>
                      </div>
                    </div>
                    {currentEligibility && (
                      <div className="text-right">
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Eligibility Status</p>
                        <p className="text-sm font-bold text-emerald-600">₱{currentEligibility.total.toLocaleString()} (Age {currentEligibility.age})</p>
                      </div>
                    )}
                  </div>

                  <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm bg-white">
                    <table className="w-full text-center border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest">
                          <th className="py-4 border-r border-white/10">Age</th>
                          <th className="py-4 border-r border-white/10">National Gift</th>
                          <th className="py-4 border-r border-white/10">City Gift</th>
                          <th className="py-4">Total Possible Cash</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs font-bold text-slate-700">
                        {CENTENNIAL_DATA.map((row) => (
                          <tr key={row.age} className={`border-b border-slate-100 last:border-0 ${userAge >= row.age && userAge < (CENTENNIAL_DATA[CENTENNIAL_DATA.indexOf(row)+1]?.age || 150) ? 'bg-amber-50/50' : ''}`}>
                            <td className="py-4 border-r border-slate-100">{row.age}</td>
                            <td className="py-4 border-r border-slate-100">{row.national === 0 ? '—' : `₱${row.national.toLocaleString()}`}</td>
                            <td className="py-4 border-r border-slate-100">{row.city === 0 ? '—' : `₱${row.city.toLocaleString()}`}</td>
                            <td className={`py-4 ${userAge >= row.age && userAge < (CENTENNIAL_DATA[CENTENNIAL_DATA.indexOf(row)+1]?.age || 150) ? 'text-emerald-600 font-black' : 'text-slate-900'}`}>
                              ₱{row.total.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Inclusions / Entitlements */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Entitlements</h4>
                <div className="space-y-3">
                  {selectedDetail.details.inclusions.map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 group">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} className="text-emerald-600" strokeWidth={3} />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Qualifications - Specific for Actionable Benefits */}
              {selectedDetail.details.qualifications && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">📌 Required Qualifications</h4>
                  <div className="space-y-3">
                    {selectedDetail.details.qualifications.map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                          <Info size={12} className="text-blue-500" strokeWidth={3} />
                        </div>
                        <span className="text-sm font-semibold text-slate-500 leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exclusions - Specific for Automatic Perks */}
              {selectedDetail.details.exclusions && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Not valid for</h4>
                  <div className="space-y-3">
                    {selectedDetail.details.exclusions.map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                          <X size={12} className="text-red-500" strokeWidth={3} />
                        </div>
                        <span className="text-sm font-semibold text-slate-500 leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDetail.details.note && (
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
                   <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <Info size={18} />
                   </div>
                   <p className="text-xs font-bold text-slate-600 leading-relaxed italic">{selectedDetail.details.note}</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t border-slate-100 flex justify-center">
              <button 
                onClick={() => setSelectedDetail(null)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Requirement Attachment Modal */}
      {applyingBenefit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => !isSubmitting && setApplyingBenefit(null)} />
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-20 overflow-hidden flex flex-col animate-scale-up border border-white/20">
            <div className="bg-slate-900 p-8 text-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-600 rounded-xl">
                  <Upload size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-widest">Requirement Checklist</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Step: Attach Marriage Certificate</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6 bg-slate-50">
               <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
                  <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-semibold text-amber-800 leading-relaxed">
                    To apply for the <strong>{applyingBenefit.title}</strong>, you must provide a scanned copy or photo of your <strong>Official Marriage Certificate</strong>.
                  </p>
               </div>

               <div className="relative">
                  <div className="border-2 border-dashed border-slate-300 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center bg-white hover:bg-slate-100 transition-all cursor-pointer group">
                    <input type="file" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={isSubmitting} />
                    <div className="w-12 h-12 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md">
                      <Upload size={20} />
                    </div>
                    <p className="font-bold text-slate-800 text-sm">Upload Certificate</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Images or PDF (Max 5MB)</p>
                  </div>
               </div>

               {attachedFiles.length > 0 && (
                 <div className="space-y-2">
                    {attachedFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 font-bold shadow-sm">
                        <span className="flex items-center gap-2 truncate pr-4">
                          <FileCheck size={14} className="text-emerald-500 shrink-0" /> {f}
                        </span>
                        <button 
                          onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-slate-300 hover:text-red-500"
                        >
                          <X size={14}/>
                        </button>
                      </div>
                    ))}
                 </div>
               )}

               <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setApplyingBenefit(null)}
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-slate-200 text-slate-600 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-300 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleFinalSubmit(applyingBenefit)}
                    disabled={isSubmitting || attachedFiles.length === 0}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                  >
                    {isSubmitting && <RefreshCw size={14} className="animate-spin" />}
                    {isSubmitting ? 'Sending...' : 'Confirm & Apply'}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Notice */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-start gap-4 shadow-sm ring-1 ring-black/5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Info size={20} />
          </div>
          <div className="space-y-1">
            <h5 className="text-sm font-bold text-slate-800">Need Assistance?</h5>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Program eligibilities are cross-referenced with your registered profile. For manual appeals or centennial grant inquiries, please visit the <strong>OSCA Office</strong> at the San Juan City Hall.
            </p>
          </div>
      </div>
    </div>
  );
};
