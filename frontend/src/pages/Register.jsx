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
        <div className="pro-card p-10 bg-white shadow-2xl shadow-slate-200/50">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-100 mb-4">
              <ShieldPlus size={32} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Create Account
            </h2>
            <p className="text-slate-500 mt-2 font-medium italic">Sentinelle MedSPAD Platform</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User size={14} /> Username
              </label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="doctor_name"
                className="pro-input h-14 bg-slate-50 border-none shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Mail size={14} /> Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="pro-input h-14 bg-slate-50 border-none shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Lock size={14} /> Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="pro-input h-14 bg-slate-50 border-none shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <UserCog size={14} /> Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="pro-input h-14 bg-slate-50 border-none shadow-inner font-bold text-slate-600"
              >
                <option value="USER">Doctor (User)</option>
                <option value="ADMIN">Governorate Admin</option>
                <option value="SUPERADMIN">National Admin</option>
              </select>
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
                  <span>Sign Up Now</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <footer className="mt-10 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
            <p className="text-sm text-slate-400 font-medium text-center">
              Existing authority member?{' '}
              <Link to="/login" className="text-brand-600 font-bold hover:underline">
                Login here
              </Link>
            </p>
          </footer>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
