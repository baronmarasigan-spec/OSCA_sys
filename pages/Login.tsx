import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const user = await login(username, password);
      if (user) {
        // Redirection logic based on role categories
        // Admin side roles: SUPER_ADMIN (1), ADMIN (2), ENCODER (3), APPROVER (4)
        if (user.role === Role.CITIZEN) {
          navigate('/citizen/dashboard');
        } else {
          navigate('/admin/dashboard');
        }
      } else {
        setError('Invalid username or password.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center relative bg-cover bg-center"
      style={{
        backgroundImage: "url('https://www.phoenix.com.ph/wp-content/uploads/2026/01/Group-81.png')"
      }}
    >
      <div className="absolute inset-0 bg-[#2d2d2d]/50 backdrop-blur-[2px]"></div>

      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-2 text-white hover:text-primary-200 transition-colors font-medium z-30 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 animate-fade-in-right"
      >
        <ArrowLeft size={18} />
        <span className="hidden md:inline">Back to Home</span>
      </button>

      <div className="bg-white w-full max-w-[500px] rounded-[2rem] shadow-2xl overflow-hidden relative z-20 mx-4 animate-scale-up">
        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
           <svg width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EF4444" d="M45.7,-76.4C58.9,-69.3,69.1,-56.3,76.5,-42.1C83.9,-27.9,88.5,-12.4,85.6,1.7C82.7,15.8,72.3,28.5,62.3,40.3C52.3,52.1,42.7,62.9,30.8,69.6C18.9,76.3,4.7,78.9,-8.6,77.5C-21.9,76.1,-34.3,70.7,-45.5,62.6C-56.7,54.5,-66.7,43.7,-73.4,30.9C-80.1,18.1,-83.5,3.3,-79.9,-9.8C-76.3,-22.9,-65.7,-34.3,-53.9,-42.3C-42.1,-50.3,-29.1,-54.9,-16.2,-57.6C-3.3,-60.3,9.5,-61.1,22.6,-61.8" transform="translate(100 100)" />
           </svg>
        </div>

        <div className="p-10 md:px-14 md:py-12 relative">
           <h2 className="text-4xl font-bold text-center text-[#dc2626] mb-10 tracking-tight">Log in</h2>
           
           <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium animate-pulse">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="space-y-2 group">
                 <label className="text-[#1e3a8a] font-bold text-sm ml-1 group-focus-within:text-[#dc2626] transition-colors">Username</label>
                 <input 
                   type="text" 
                   value={username}
                   onChange={(e) => setUsername(e.target.value)}
                   disabled={loading}
                   className="w-full border-b border-slate-300 px-1 py-2 focus:outline-none focus:border-[#dc2626] transition-colors bg-transparent placeholder:text-slate-300 text-slate-800 disabled:opacity-50"
                   placeholder="enter your username"
                 />
              </div>

              <div className="space-y-2 group">
                 <label className="text-[#1e3a8a] font-bold text-sm ml-1 group-focus-within:text-[#dc2626] transition-colors">Password</label>
                 <input 
                   type="password" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   disabled={loading}
                   className="w-full border-b border-slate-300 px-1 py-2 focus:outline-none focus:border-[#dc2626] transition-colors bg-transparent placeholder:text-slate-300 text-slate-800 disabled:opacity-50"
                   placeholder="enter your password"
                 />
              </div>

              <div className="flex justify-end pt-1">
                 <button type="button" className="text-xs text-slate-400 hover:text-slate-600 italic">
                   Forgot password?
                 </button>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1e3a8a] text-white rounded-full py-3.5 font-bold text-lg hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/20 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100"
                >
                  {loading && <RefreshCw size={20} className="animate-spin" />}
                  {loading ? 'Logging in...' : 'Log in'}
                </button>
                <div className="text-center text-xs text-slate-400 mt-2 space-y-1">
                    <p>Try admin: <span className="font-bold text-slate-600">admin / asd</span></p>
                    <p>Try user: <span className="font-bold text-slate-600">juan / asd</span></p>
                </div>
              </div>

              <div className="text-center text-sm text-slate-500 mt-8">
                 Not registered yet? <button type="button" onClick={() => navigate('/register')} className="text-[#dc2626] border-b border-[#dc2626] ml-1 hover:text-red-700 hover:border-red-700 transition-colors font-medium">Register Here</button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
};