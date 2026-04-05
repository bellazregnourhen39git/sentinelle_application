import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldPlus, User, Mail, Lock, UserCog, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';

const Register = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'USER',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('auth/register/', formData);
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.username?.[0] || 'Registration failed. Authority protocols not met.';
      setError(msg);
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
        <div className="pro-card p-12 bg-white/80 backdrop-blur-xl border border-white shadow-2xl shadow-brand-100/20 rounded-[40px]">
          <div className="flex flex-col items-center mb-12 text-center">
            <div className="w-20 h-20 bg-brand-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-brand-500/30 mb-6 group hover:scale-110 transition-transform duration-500">
              <ShieldPlus size={40} className="glow-brand" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">
              Recrutement
            </h2>
            <p className="text-slate-400 mt-2 font-black text-[10px] uppercase tracking-[4px] italic">Accès Sentinelle MedSPAD</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2 italic">
                <User size={14} className="text-brand-500" /> Identifiant
              </label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="nom_utilisateur"
                className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none font-bold text-slate-700"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2 italic">
                <Mail size={14} className="text-brand-500" /> Email Professionnel
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="dr.nom@hopital.tn"
                className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none font-bold text-slate-700"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2 italic">
                <Lock size={14} className="text-brand-500" /> Mot de Passe
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none font-bold text-slate-700"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2 italic">
                <UserCog size={14} className="text-brand-500" /> Prérogatives
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none font-bold text-slate-600 cursor-pointer"
              >
                <option value="USER">Médecin (Utilisateur)</option>
                <option value="ADMIN">Administrateur Gouvernorat</option>
                <option value="SUPERADMIN">Administrateur National</option>
              </select>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 text-rose-600 bg-rose-50 p-4 rounded-2xl border border-rose-100 text-xs font-black uppercase tracking-wider"
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full pro-btn-primary h-16 flex items-center justify-center gap-3 text-lg shadow-2xl shadow-brand-500/20 active:scale-95 group"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="italic">Initialiser l'Accès</span>
                  <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <footer className="mt-12 pt-10 border-t border-slate-50 flex flex-col items-center gap-4">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center italic">
              Déjà membre de l'autorité ?{' '}
              <Link to="/login" className="text-brand-600 hover:text-brand-700 transition-colors">
                Se connecter
              </Link>
            </p>
          </footer>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
