
import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ApplicationStatus } from '../../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { generateExecutiveSummary, isAiConfigured } from '../../services/gemini';
// Fixed: Added Clock, Layers, and aliased BarChart as BarChartIcon to resolve naming collision
import { Sparkles, Users, FileText, AlertCircle, TrendingUp, Calendar, ShieldCheck, Database, RefreshCw, Activity, CloudOff, Clock, Layers, BarChart as BarChartIcon } from 'lucide-react';

// Color Palette: San Juan Red, Corporate Blue, Goldenrod, Emerald
const COLORS = ['#dc2626', '#1e3a8a', '#d97706', '#059669'];

export const AdminDashboard: React.FC = () => {
  const { applications, complaints, users, isLiveMode, syncApplications } = useApp();
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const aiReady = isAiConfigured();

  // Stats logic
  const pendingApps = applications.filter(a => a.status === 'Pending').length;
  const approvedToday = applications.filter(a => a.status === 'Approved').length;
  const openComplaints = complaints.filter(c => c.status === 'Open').length;
  const totalSeniors = users.filter(u => u.role === 'CITIZEN').length;

  const dataStatus = [
    { name: 'Pending', value: pendingApps },
    { name: 'Approved', value: approvedToday },
    { name: 'Released', value: applications.filter(a => a.status === ApplicationStatus.ISSUED).length },
    { name: 'Rejected', value: applications.filter(a => a.status === 'Rejected').length },
  ];

  const appTypeData = [
    { name: 'Enrollment', count: applications.filter(a => a.type === 'Registration').length },
    { name: 'ID Process', count: applications.filter(a => a.type.includes('ID')).length },
    { name: 'Benefits', count: applications.filter(a => a.type.includes('Benefit')).length },
    { name: 'Health', count: applications.filter(a => a.type === 'PhilHealth').length },
  ];

  const handleGenerateInsight = async () => {
    setLoadingAi(true);
    const summary = await generateExecutiveSummary(applications, complaints);
    setAiSummary(summary);
    setLoadingAi(false);
  };

  const handleManualSync = async () => {
    setIsRefreshing(true);
    await syncApplications();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="animate-fade-in-down">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Executive Control</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-slate-500 font-bold text-lg">System Command & Real-time Analytics</p>
            <div className={`flex items-center gap-2 px-3 py-1 ${isLiveMode ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'} border rounded-full`}>
                {isLiveMode ? <Activity size={14} className="text-emerald-500" /> : <CloudOff size={14} className="text-amber-500" />}
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isLiveMode ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {isLiveMode ? 'CLOUD CONNECTED' : 'LOCAL CACHE MODE'}
                </span>
            </div>
          </div>
        </div>
        <button 
           onClick={handleManualSync}
           disabled={isRefreshing}
           className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Handshaking...' : 'Sync Database'}
        </button>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Registered Seniors', value: totalSeniors, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', trend: '+12% Registry Growth' },
          // Fixed line 131: Clock is now imported correctly
          { label: 'Pending Applications', value: pendingApps, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', trend: 'Needs Approval' },
          { label: 'Approved Handshakes', value: approvedToday, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', trend: 'Verified Today' },
          { label: 'System Inquiries', value: openComplaints, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', trend: 'Unresolved Concerns' },
        ].map((stat, i) => (
          <div 
             key={i} 
             className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-6 animate-fade-in-up transition-all hover:shadow-xl hover:shadow-slate-200/50 group"
             style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex justify-between items-start">
                <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                    <stat.icon size={28} />
                </div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.trend}</div>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
              <p className="text-4xl font-black text-slate-900 mt-1 tracking-tight">{stat.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 min-w-0 flex flex-col ring-1 ring-black/5">
          <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Status Lifecycle</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Application Distribution</p>
              </div>
              {/* Fixed line 162: Layers icon is now imported correctly */}
              <Layers size={20} className="text-slate-200" />
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {dataStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {dataStatus.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <div className="flex-1">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{entry.name}</p>
                    <p className="text-sm font-black text-slate-800">{entry.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 min-w-0 flex flex-col ring-1 ring-black/5">
           <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Service Volume</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Classification Breakdown</p>
              </div>
              {/* Fixed: Using aliased BarChartIcon to avoid collision with recharts BarChart */}
              <BarChartIcon size={20} className="text-slate-200" />
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appTypeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip 
                   cursor={{ fill: '#f8fafc' }}
                   contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                />
                <Bar dataKey="count" fill="#dc2626" radius={[12, 12, 0, 0]} barSize={50}>
                   {appTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#dc2626' : '#1e3a8a'} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-auto p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary-500">
                  <TrendingUp size={20} />
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed tracking-tight">
                  <span className="text-slate-900 font-black">Enrollment Services</span> show a significant volume increase this month. Recommend scaling registry node capacity.
              </p>
          </div>
        </div>
      </div>
    </div>
  );
};
