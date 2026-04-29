import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock, User, AlertCircle, ArrowRight, LogIn, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';

const Login = ({ setUser }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Step 1: Obtain JWT tokens using email
      const tokenRes = await api.post('auth/login/', { email, password });
      localStorage.setItem('access', tokenRes.data.access);
      localStorage.setItem('refresh', tokenRes.data.refresh);

      // Step 2: Fetch the user profile
      const profileRes = await api.get('auth/profile/');
      const userData = profileRes.data;

      const role = userData.role?.toUpperCase();

      localStorage.setItem('user', JSON.stringify(userData));

      // Step 3: Notify App.jsx of the new auth state
      setUser(userData);

      // Step 4: Redirect based on role
      if (['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(role)) navigate('/superadmin', { replace: true });
      else if (['REGIONAL_ANALYST', 'ADMIN'].includes(role)) navigate('/admin', { replace: true });
      else if (['OPERATOR', 'PRACTITIONER'].includes(role)) navigate('/guide', { replace: true });
      else navigate('/user', { replace: true });

    } catch (err) {
      if (err.message && err.message.includes('Accès refusé')) {
        setError(err.message);
      } else if (!err.response) {
        setError("Erreur réseau: Impossible de contacter le serveur. Le backend est-il lancé ?");
      } else {
        setError(
          err.response?.data?.detail ||
          'Identifiants incorrects. Veuillez vérifier votre nom d\'utilisateur et votre mot de passe.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-[#F8FAFC] relative overflow-hidden font-sans">
      {/* Immersive Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 w-full h-[60vh] bg-gradient-to-b from-brand-50/50 to-transparent" />
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-brand-400/10 rounded-full blur-[100px] mix-blend-multiply"
        />
        <motion.div
          animate={{ rotate: -360, scale: [1, 1.2, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[460px] relative z-10"
      >
        <button 
          onClick={() => navigate('/')}
          className="absolute -top-12 left-4 flex items-center gap-2 text-slate-400 hover:text-brand-600 font-bold uppercase tracking-widest text-[10px] transition-colors group"
        >
          <ArrowRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
          <span>Retour</span>
        </button>
        <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-[0_40px_100px_-20px_rgba(15,23,42,0.1)] rounded-[48px] p-10 md:p-14 relative overflow-hidden group">
          {/* Subtle inner shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-60 pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col items-center mb-12 text-center relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-brand-400 to-brand-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-brand-500/30 mb-8 hover:scale-110 transition-transform duration-500 ring-4 ring-white">
              <ShieldCheck size={36} strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-none mb-3 drop-shadow-sm">
              Sentinelle
            </h1>
            <p className="text-brand-600 font-black text-[10px] uppercase tracking-[6px] italic">
              MedSPAD -4 .Tunisie 2026
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8 animate-fade-in relative z-10" autoComplete="off">
            {/* Email */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[3px] flex items-center gap-2 italic">
                <User size={13} className="text-brand-500" /> Adresse Email
              </label>
              <div className="relative group">
                <input
                  type="email"
                  id="login-email"
                  required
                  value={email}
                  placeholder="votre@email.com"
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 pl-6 pr-12 rounded-2xl bg-white/60 border border-slate-200 focus:bg-white focus:border-brand-500 focus:ring-[4px] focus:ring-brand-500/10 transition-all outline-none font-bold text-slate-800 placeholder:text-slate-400 backdrop-blur-sm group-hover:border-slate-300"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[3px] flex items-center gap-2 italic">
                <Lock size={13} className="text-brand-500" /> {t('Mot de Passe')}
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  required
                  value={password}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 px-6 pr-12 rounded-2xl bg-white/60 border border-slate-200 focus:bg-white focus:border-brand-500 focus:ring-[4px] focus:ring-brand-500/10 transition-all outline-none font-bold text-slate-800 placeholder:text-slate-400 backdrop-blur-sm group-hover:border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-start gap-3 text-rose-600 bg-rose-50 p-5 rounded-2xl border border-rose-100"
              >
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span className="text-[11px] font-black uppercase tracking-wider leading-relaxed">{error}</span>
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="w-full py-5 rounded-2xl flex items-center justify-center gap-3 bg-brand-500 text-white font-black uppercase text-xs tracking-widest hover:bg-brand-600 hover:shadow-2xl hover:shadow-brand-500/30 transition-all duration-300 active:scale-[0.98] mt-4 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  <span>{t('Login')}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-slate-100 flex flex-col items-center gap-3 relative z-10 animate-fade-in text-center">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">
              Système de Surveillance Sentinelle · 2026
            </p>
          </footer>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
