import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';

const Register = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'USER',
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Remove empty strings so DRF doesn't try to parse them as integer PKs
      const payload = { ...formData };
      if (!payload.establishment) delete payload.establishment;
      if (!payload.governorate) delete payload.governorate;

      await api.post('auth/register/', payload);
      alert('Account created successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      console.error(err.response?.data);
      const msg = err.response?.data?.username?.[0] || 'Registration failed. Username may already exist.';
      setError(msg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="glass-panel p-10 max-w-sm w-full mx-auto">
        <h2 className="text-3xl font-extrabold text-center text-brand-900 mb-8">
          {t('Create an Account') || 'S\'inscrire'}
        </h2>
        {error && <div className="mb-4 text-red-600 text-sm font-medium text-center">{error}</div>}
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input 
              type="text" 
              name="username"
              required 
              value={formData.username}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-brand-500 focus:border-brand-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-brand-500 focus:border-brand-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('Password') || 'Mot de passe'}</label>
            <input 
              type="password" 
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-brand-500 focus:border-brand-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-brand-500 focus:border-brand-500 bg-white"
            >
              <option value="USER">Doctor (User)</option>
              <option value="ADMIN">Governorate Admin</option>
              <option value="SUPERADMIN">National Admin</option>
            </select>
          </div>
          <button 
            type="submit" 
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all transform hover:scale-[1.02]"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
