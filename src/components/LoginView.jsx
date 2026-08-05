import React, { useState } from 'react';
import useAppStore from '../store/useAppStore';
import logoPTBA from '../assets/logo/logo ptba putih.png';
import logoSDGs from '../assets/logo/Logo-SDGs-bundar.png';
import { AlertTriangle } from './Icons';
import bgLogin from '../assets/banner/background log in.png';

export default function LoginView() {
  const login = useAppStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const { error } = await login(email, password);
    if (error) {
      if (error.message && error.message.toLowerCase().includes('fetch')) {
        setErrorMsg('Gagal terhubung ke server Supabase (Failed to fetch). Periksa koneksi internet Anda, atau matikan VPN / Adblocker / Firewall yang memblokir akses ke server.');
      } else {
        setErrorMsg(error.message);
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-slate-900 font-sans items-center justify-center p-4">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={bgLogin} 
          alt="Background" 
          className="w-full h-full object-cover object-bottom"
        />
        {/* Neutral dark overlay to make the glass card stand out without changing image colors */}
        <div className="absolute inset-0 bg-black/25"></div>
      </div>

      {/* Centered Large Glass Panel */}
      <div className="relative z-10 w-full max-w-4xl backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-white/20 rounded-3xl overflow-hidden flex flex-col md:flex-row m-4 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Left Side: SDGs Logo (White Glass) */}
        <div className="hidden md:flex flex-1 items-center justify-center p-10 bg-white/60 border-r border-white/20">
          <img 
            src={logoSDGs} 
            alt="Sustainable Development Goals" 
            className="w-full max-w-[320px] h-auto object-contain hover:scale-105 transition-transform duration-500" 
          />
        </div>

        {/* Right Side: Login Form (Dark Glass) */}
        <div className="w-full md:w-[420px] flex-shrink-0 flex flex-col p-8 sm:p-12 bg-black/50">
        
          <div className="flex flex-col items-center mb-8">
            <img src={logoPTBA} alt="Logo PTBA" className="h-14 w-auto object-contain mb-6 drop-shadow-lg" />
            <h2 className="text-3xl font-normal text-white mb-2 text-center tracking-wide">
              Welcome <span className="font-bold">back!</span>
            </h2>
            <p className="text-sm text-blue-100/80 font-medium text-center">
              Sign in to access report
            </p>
          </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {errorMsg && (
            <div className="bg-red-500/20 p-3 rounded-xl flex items-start gap-3 border border-red-500/30 backdrop-blur-sm">
              <AlertTriangle size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-100 font-medium leading-relaxed">{errorMsg}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-blue-100/80 mb-1.5 ml-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-4 py-3.5 bg-transparent border border-white/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent focus:bg-white/5 sm:text-sm transition-all"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-blue-100/80 mb-1.5 ml-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-4 py-3.5 bg-transparent border border-white/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent focus:bg-white/5 sm:text-sm transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3.5 px-4 rounded-full shadow-lg text-sm font-bold text-[#1e3a8a] bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0d1b42]/40 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? "Signing in..." : "Log In"}
            </button>
          </div>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-[10px] text-white/50 font-medium uppercase tracking-widest">
            &copy; {new Date().getFullYear()} SUSTAINABLE COMMUNITY DEVELOPMENT
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
