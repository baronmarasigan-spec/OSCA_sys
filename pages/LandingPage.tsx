
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { 
  Heart, 
  CreditCard, 
  Wallet, 
  Tag, 
  MapPin, 
  Mail, 
  Phone, 
  ArrowRight,
  X,
  User,
  Headset,
  FileText,
  AlertCircle,
  Globe,
  Clock,
  RefreshCw
} from 'lucide-react';

const Logo = () => (
  <img 
    src="https://dev2.phoenix.com.ph/wp-content/uploads/2025/12/Seal_of_San_Juan_Metro_Manila.png" 
    alt="Seal of San Juan" 
    className="w-24 h-24 drop-shadow-2xl relative z-10 transition-transform hover:scale-105"
  />
);

const ServiceCard = ({ icon: Icon, title, delay }: { icon: any, title: string, delay: number }) => (
  <div 
    className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all duration-300 animate-fade-in-up hover:shadow-lg hover:-translate-y-1 cursor-default"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="w-10 h-10 rounded-xl border-2 border-primary-500 text-primary-500 flex items-center justify-center shrink-0">
      <Icon size={20} />
    </div>
    <span className="text-slate-700 font-semibold text-sm leading-tight">{title}</span>
  </div>
);

const ImageCollage = ({ image1, image2, image3 }: { image1: string, image2: string, image3: string }) => (
  <div className="relative h-[400px] w-full max-w-md mx-auto animate-fade-in">
    <div className="absolute top-10 right-0 w-48 h-48 bg-white p-2 rounded-2xl shadow-xl z-20 transform rotate-3 hover:rotate-0 transition-transform duration-500 animate-float" style={{ animationDelay: '0s' }}>
      <img src={image1} alt="Community" className="w-full h-full object-cover rounded-xl" />
    </div>
    <div className="absolute top-0 left-0 w-40 h-40 bg-white p-2 rounded-2xl shadow-xl z-10 transform -rotate-2 hover:rotate-0 transition-transform duration-500 animate-float" style={{ animationDelay: '2s' }}>
      <img src={image2} alt="Service" className="w-full h-full object-cover rounded-xl" />
    </div>
    <div className="absolute bottom-0 left-10 w-56 h-48 bg-white p-2 rounded-2xl shadow-xl z-30 transform -rotate-1 hover:rotate-0 transition-transform duration-500 animate-float" style={{ animationDelay: '4s' }}>
      <img src={image3} alt="Help" className="w-full h-full object-cover rounded-xl" />
    </div>
  </div>
);

const InfoModal = ({ isOpen, onClose, title, content }: { isOpen: boolean; onClose: () => void; title: string; content: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-20 overflow-hidden flex flex-col max-h-[80vh] animate-scale-up">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
               <FileText size={18} />
             </div>
             <h3 className="font-bold text-xl text-slate-800">{title}</h3>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors"><X size={18} /></button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar">
            {content}
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
             <button onClick={onClose} className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors shadow-lg shadow-slate-800/20">Close</button>
        </div>
      </div>
    </div>
  );
};

const LoginModal = ({ isOpen, onClose, defaultAdmin = false }: { isOpen: boolean; onClose: () => void, defaultAdmin?: boolean }) => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const success = await login(username, password);
      
      if (success) {
          if (username.toLowerCase().includes('admin')) {
            navigate('/admin/dashboard');
          } else {
            navigate('/citizen/dashboard');
          }
      } else {
          setError('Invalid username or password.');
      }
    } catch (err) {
      setError('Connection failed. Please check your internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in" 
        onClick={onClose}
      />
      
      <div className="bg-white w-full max-w-[450px] rounded-[2.5rem] shadow-2xl overflow-hidden relative z-20 animate-scale-up ring-4 ring-white/30">
        <div className="absolute inset-0 z-0">
           <div 
             className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-20 mix-blend-multiply"
             style={{
               backgroundImage: "url('https://www.phoenix.com.ph/wp-content/uploads/2026/01/Group-81.png')"
             }}
           ></div>
           <div className="absolute inset-0 bg-white/90"></div>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 z-30 p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="relative z-10 px-10 py-12 flex flex-col items-center">
           <h2 className="text-3xl font-bold text-[#dc2626] mb-8 tracking-tight">Log in</h2>
           
           <form onSubmit={handleSubmit} className="w-full space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-medium animate-pulse">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}
              <div className="space-y-1">
                 <label className="text-[#1e3a8a] font-bold text-sm ml-1">Username</label>
                 <input 
                   type="text" 
                   value={username}
                   onChange={(e) => setUsername(e.target.value)}
                   disabled={loading}
                   className="w-full border-b border-slate-300 px-1 py-2 focus:outline-none focus:border-[#dc2626] transition-colors bg-transparent placeholder:text-slate-400 placeholder:font-light text-slate-800 disabled:opacity-50"
                   placeholder={defaultAdmin ? "enter admin username" : "enter your username"}
                 />
              </div>

              <div className="space-y-1">
                 <label className="text-[#1e3a8a] font-bold text-sm ml-1">Password</label>
                 <input 
                   type="password" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   disabled={loading}
                   className="w-full border-b border-slate-300 px-1 py-2 focus:outline-none focus:border-[#dc2626] transition-colors bg-transparent placeholder:text-slate-400 placeholder:font-light text-slate-800 disabled:opacity-50"
                   placeholder="enter your password"
                 />
              </div>

              <div className="flex justify-end">
                 <button type="button" className="text-xs text-slate-500 hover:text-[#dc2626] font-medium italic transition-colors">
                   Forgot password?
                 </button>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#1e3a8a] text-white rounded-full py-3.5 font-bold text-lg hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/30 transform hover:translate-y-[-2px] active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-70 disabled:translate-y-0"
              >
                {loading && <RefreshCw size={18} className="animate-spin" />}
                {loading ? 'Logging in...' : 'Log in'}
              </button>

              <div className="text-center text-sm text-slate-500 mt-6 font-medium">
                 Not registered yet? <button type="button" onClick={() => { onClose(); navigate('/register'); }} className="text-[#dc2626] font-semibold border-b border-[#dc2626] hover:text-red-700 ml-1">Register Here</button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (location.state && (location.state as any).openLogin) {
      setShowLogin(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const termsContent = (
    <div className="space-y-6 text-slate-600 leading-relaxed font-medium">
        <div>
            <h4 className="font-bold text-slate-800 mb-2">1. Acceptance of Terms</h4>
            <p className="text-sm">By accessing and using the SeniorConnect portal, you agree to comply with and be bound by these Terms and Conditions. If you do not agree, please do not use this system.</p>
        </div>
        <div>
            <h4 className="font-bold text-slate-800 mb-2">2. Eligibility</h4>
            <p className="text-sm">Registration is strictly reserved for verified residents of San Juan City who are 60 years of age or older. Any false representation of age or residency is a violation of the law and will result in immediate disqualification and potential legal action.</p>
        </div>
        <div>
            <h4 className="font-bold text-slate-800 mb-2">3. User Responsibilities</h4>
            <p className="text-sm">You are responsible for maintaining the confidentiality of your account credentials (username and password). You agree to provide accurate, current, and complete information during the registration process. All activities that occur under your account are your sole responsibility.</p>
        </div>
        <div>
            <h4 className="font-bold text-slate-800 mb-2">4. Data Privacy</h4>
            <p className="text-sm">We are committed to protecting your personal information in compliance with the Data Privacy Act of 2012. Your data is collected and used solely for the purpose of validating your identity and delivering social services, benefits, and assistance programs.</p>
        </div>
        <div>
            <h4 className="font-bold text-slate-800 mb-2">5. System Usage</h4>
            <p className="text-sm">Any attempt to hack, disrupt, manipulate, or gain unauthorized access to the system is strictly prohibited. We reserve the right to suspend or terminate accounts that violate these terms.</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      <InfoModal 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
        title="Terms and Conditions" 
        content={termsContent} 
      />

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm h-20' 
          : 'bg-transparent h-48'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            <div className="flex gap-6 items-center text-sm font-bold text-slate-800 bg-white/80 backdrop-blur-md px-8 py-3 rounded-full shadow-lg border border-white/50 animate-fade-in-down" style={{ animationDelay: '200ms' }}>
              <button onClick={() => scrollToSection('home')} className="hover:text-primary-600 transition-colors uppercase tracking-widest">Home</button>
              <button onClick={() => navigate('/register')} className="hover:text-primary-600 transition-colors uppercase tracking-widest">Register</button>
              <button onClick={() => scrollToSection('benefits')} className="hover:text-primary-600 transition-colors uppercase tracking-widest">Services</button>
              <button onClick={() => scrollToSection('contact')} className="hover:text-primary-600 transition-colors uppercase tracking-widest">Contact Us</button>
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-2">
              <Logo />
            </div>

            <button 
              onClick={() => setShowLogin(true)}
              className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-6 py-2 rounded-full text-primary-600 font-bold uppercase tracking-tighter hover:bg-white hover:text-primary-700 hover:shadow-lg transition-all border border-white/50 animate-fade-in-down shadow-md" style={{ animationDelay: '300ms' }}
            >
              Login <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        id="home" 
        className="relative min-h-screen flex items-center justify-center pt-44 pb-40 px-4 bg-cover bg-center bg-no-repeat scroll-mt-24"
        style={{
          backgroundImage: "url('https://www.phoenix.com.ph/wp-content/uploads/2026/01/Group-81.png')"
        }}
      >
        <div className="max-w-7xl mx-auto text-center space-y-8 relative z-10 w-full mt-10">
          <h1 className="text-5xl md:text-7xl font-bold text-primary-600 tracking-tight drop-shadow-2xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Senior Citizen Management System
          </h1>
          
          <div className="max-w-4xl mx-auto">
             <p className="text-slate-900 text-base font-semibold leading-relaxed drop-shadow-md max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                SeniorConnect is a centralized LGU platform that streamlines welfare assistance for senior citizens, 
                improves application tracking, and ensures faster, more transparent service delivery for the community of San Juan.
             </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <button 
              onClick={() => navigate('/register')}
              className="px-10 py-4 bg-[#dc2626] text-white rounded-full font-bold uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all hover:scale-105 active:scale-95"
            >
              Get Started
            </button>
            <button 
              onClick={() => scrollToSection('benefits')}
              className="px-10 py-4 bg-white text-slate-800 border-2 border-slate-200 rounded-full font-bold uppercase tracking-widest hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Senior Services */}
      <section id="benefits" className="py-24 px-4 overflow-hidden scroll-mt-24 bg-white relative">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 relative">
             <div className="pl-12">
                <ImageCollage 
                  image1="https://picsum.photos/seed/comm1/300/300"
                  image2="https://picsum.photos/seed/comm2/300/300"
                  image3="https://picsum.photos/seed/comm3/300/300"
                />
             </div>
          </div>
          
          <div className="flex-1 space-y-8">
            <h2 className="text-4xl font-bold text-primary-500 animate-slide-in-right uppercase tracking-tighter">Senior Citizen Services</h2>
            <p className="text-slate-600 font-medium leading-relaxed animate-slide-in-right" style={{ animationDelay: '100ms' }}>
              Our system ensures that senior citizens can access welfare services quickly, safely, 
              and transparently. From registration to ID issuance and cash grants, seniors can 
              manage their benefits online.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ServiceCard icon={Heart} title="Healthcare Privileges Access" delay={200} />
              <ServiceCard icon={CreditCard} title="Senior Citizen ID Issuance" delay={300} />
              <ServiceCard icon={Wallet} title="Cash Grant Eligibility" delay={400} />
              <ServiceCard icon={Tag} title="Discounts in Partner Merchants" delay={500} />
            </div>

            <button 
              onClick={() => navigate('/register')}
              className="bg-secondary-600 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest shadow-lg shadow-secondary-500/30 hover:bg-secondary-700 transition-all hover:scale-105 animate-scale-up"
              style={{ animationDelay: '600ms' }}
            >
              Apply for Senior ID
            </button>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-20 px-4 bg-white relative overflow-hidden scroll-mt-24">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
             <div className="text-center mb-16">
                 <h2 className="text-4xl font-bold text-primary-500 mb-4 uppercase tracking-tighter">Contact Us</h2>
                 <p className="text-slate-500 font-medium max-w-2xl mx-auto">We are here to assist you. Reach out to our dedicated Senior Citizen Affairs team for inquiries, support, or feedback.</p>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 transform hover:-translate-y-1 transition-transform duration-300">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <User size={18} className="text-primary-500" /> Key Officials
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-default">
                                <div className="w-12 h-12 rounded-xl border-2 border-primary-500 text-primary-500 flex items-center justify-center shrink-0">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">OSCA Head</p>
                                    <h3 className="font-bold text-slate-800 text-lg">Ms. Elena Cruz</h3>
                                    <p className="text-sm text-slate-500 font-medium mt-1">Office of Senior Citizens Affairs</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-default">
                                <div className="w-12 h-12 rounded-xl border-2 border-primary-500 text-primary-500 flex items-center justify-center shrink-0">
                                    <Headset size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Technical Support</p>
                                    <h3 className="font-bold text-slate-800 text-lg">IT System Support</h3>
                                    <p className="text-sm text-slate-500 font-medium mt-1">System & Registration Assistance</p>
                                    <p className="text-sm font-mono text-primary-600 font-bold mt-1">(02) 8888-9900</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6 transform hover:-translate-y-1 transition-transform duration-300">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Phone size={18} className="text-primary-500" /> Direct Lines
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                <Mail className="text-slate-400" size={18} />
                                <div>
                                    <p className="text-xs text-slate-400 font-bold">Email Address</p>
                                    <p className="text-slate-700 font-semibold">publicinfo@sanjuancity.gov.ph</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                <Phone className="text-slate-400" size={18} />
                                <div>
                                    <p className="text-xs text-slate-400 font-bold">Hotline</p>
                                    <p className="text-slate-700 font-semibold">(02) 7729 0005</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                <Clock className="text-slate-400" size={18} />
                                <div>
                                    <p className="text-xs text-slate-400 font-bold">Office Hours</p>
                                    <p className="text-slate-700 font-semibold">Mon - Fri, 8:00 AM - 5:00 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-3 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 h-full min-h-[500px] flex flex-col transform hover:-translate-y-1 transition-transform duration-300">
                        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <MapPin size={18} className="text-primary-500" /> Visit Us
                                </h2>
                                <p className="text-slate-500 font-medium text-sm mt-1">City Government of San Juan, Pinaglabanan, San Juan City</p>
                            </div>
                            <a 
                                href="https://maps.google.com/maps?ll=14.604085,121.033361&z=16&t=m&hl=en&gl=PH&mapclient=embed&cid=7082357770932580798" 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-2 text-sm font-bold text-primary-600 bg-primary-50 px-4 py-2 rounded-xl hover:bg-primary-100 transition-colors"
                            >
                                <Globe size={14} /> Open in Google Maps
                            </a>
                        </div>
                        
                        <div className="flex-1 w-full rounded-2xl overflow-hidden bg-slate-100 relative">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3860.916847847424!2d121.03138831484032!3d14.60384698979986!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b7d780f2d843%3A0x62913076735a770!2sCity%20Government%20of%20San%20Juan!5e0!3m2!1sen!2sph!4v1629876543210!5m2!1sen!2sph" 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0, minHeight: '400px' }} 
                                allowFullScreen={true} 
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="San Juan City Hall Map"
                            ></iframe>
                        </div>
                    </div>
                </div>
             </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 pt-16 relative overflow-hidden">
         <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10 pb-12">
           <div className="flex flex-col items-center md:items-start text-center md:text-left">
             <img 
               src="https://www.phoenix.com.ph/wp-content/uploads/2025/12/Group-74.png" 
               alt="Official Seals" 
               className="h-12 w-auto object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300"
             />
             <h3 className="font-bold text-slate-800 mt-4 text-lg">Dakilang Lungsod ng San Juan</h3>
             <p className="text-slate-500 font-medium text-sm">Kalakhang Maynila</p>
           </div>
           
           <div className="flex flex-col gap-4 text-slate-600 text-sm items-center md:items-start">
               <h4 className="font-bold text-slate-800 mb-1">Quick Links</h4>
               <button onClick={() => scrollToSection('home')} className="hover:text-primary-600 transition-colors font-medium">Home</button>
               <button onClick={() => scrollToSection('benefits')} className="hover:text-primary-600 transition-colors font-medium">Services</button>
               <button onClick={() => scrollToSection('contact')} className="hover:text-primary-600 transition-colors font-medium">Contact Support</button>
               <button onClick={() => navigate('/register')} className="hover:text-primary-600 transition-colors text-left font-medium">Register</button>
           </div>

           <div className="flex flex-col items-center justify-center md:items-end gap-2">
              <div className="flex gap-4">
                  <button onClick={() => setShowTerms(true)} className="text-slate-400 hover:text-primary-600 text-xs font-semibold transition-colors">Terms & Conditions</button>
                  <span className="text-slate-300">|</span>
                  <button className="text-slate-400 hover:text-primary-600 text-xs font-semibold transition-colors cursor-not-allowed">Privacy Policy</button>
              </div>
              <p className="text-slate-400 text-xs font-medium">
                © 2024 SeniorConnect. All rights reserved.
              </p>
           </div>
         </div>

         <div className="w-full">
            <img 
                src="https://www.phoenix.com.ph/wp-content/uploads/2025/12/subfooter.png" 
                alt="" 
                className="w-full h-auto object-cover block"
            />
         </div>
      </footer>
    </div>
  );
};
