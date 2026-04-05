import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock, User, AlertCircle, ArrowRight, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';

const Login = ({ setUser }) => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Step 1: Obtain JWT tokens
      const tokenRes = await api.post('auth/login/', { username, password });
      localStorage.setItem('access', tokenRes.data.access);
      localStorage.setItem('refresh', tokenRes.data.refresh);

      // Step 2: Fetch the user profile to get role, governorate, etc.
      const profileRes = await api.get('auth/profile/');
      const userData = profileRes.data;
      localStorage.setItem('user', JSON.stringify(userData));

      // Step 3: Notify App.jsx of the new auth state
      setUser(userData);

      // Step 4: Redirect based on role
      const role = userData.role?.toUpperCase();
      if (role === 'SUPERADMIN') navigate('/superadmin', { replace: true });
      else if (role === 'ADMIN')  navigate('/admin', { replace: true });
      else                        navigate('/user', { replace: true });

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Identifiants invalides. Vérifiez vos protocoles d\'accès.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full relative"
      >
        <div className="pro-card p-14 bg-white/90 backdrop-blur-xl border border-white shadow-2xl shadow-brand-100/20 rounded-[48px]">
          
          {/* Header */}
          <div className="flex flex-col items-center mb-14 text-center">
            <div className="w-20 h-20 bg-brand-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-brand-500/30 mb-8 hover:scale-110 transition-transform duration-500">
              <ShieldCheck size={40} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase leading-none mb-3">
              Sentinelle
            </h1>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[5px] italic">
              Protocol MedSPAD · v2.0
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            {/* Username */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] flex items-center gap-2 italic">
                <User size={13} className="text-brand-500" /> Identifiant
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="login-username"
                  required
                  value={username}
                  placeholder="nom_utilisateur"
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-14 pl-6 pr-12 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/8 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] flex items-center gap-2 italic">
                <Lock size={13} className="text-brand-500" /> {t('Mot de Passe')}
              </label>
              <input
                type="password"
                id="login-password"
                required
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/8 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300"
              />
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
              className="w-full pro-btn-primary h-16 flex items-center justify-center gap-3 text-base shadow-2xl shadow-brand-500/20 active:scale-95 group rounded-2xl"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  <span className="italic font-black tracking-wide">{t('Authentification')}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <footer className="mt-12 pt-10 border-t border-slate-100 flex flex-col items-center gap-3">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center italic">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-brand-600 hover:text-brand-700 transition-colors">
                Demander un accès
              </Link>
            </p>
          </footer>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
