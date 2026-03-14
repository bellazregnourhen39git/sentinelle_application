import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';

const Login = ({ setAuth }) => {
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
      const res = await api.post('auth/login/', { username, password });
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      setAuth(true);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please verify your access tokens.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="pro-card p-10 bg-white shadow-2xl shadow-slate-200/50">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-100 mb-4">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {t('Welcome Back')}
            </h2>
            <p className="text-slate-500 mt-2 font-medium italic">Sentinelle MedSPAD Login</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User size={14} /> Username
              </label>
              <input
                type="text"
                required
                value={username}
                placeholder="doctor_admin"
                onChange={(e) => setUsername(e.target.value)}
                className="pro-input h-14 bg-slate-50 border-none shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Lock size={14} /> {t('Password')}
              </label>
              <input
                type="password"
                required
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                className="pro-input h-14 bg-slate-50 border-none shadow-inner"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 text-sm font-medium"
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full pro-btn-primary h-14 flex items-center justify-center gap-2 text-lg shadow-xl shadow-brand-100"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{t('Login')}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <footer className="mt-10 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
            <p className="text-sm text-slate-400 font-medium">
              New to the platform?{' '}
              <Link to="/register" className="text-brand-600 font-bold hover:underline">
                Register Admin Access
              </Link>
            </p>
          </footer>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
