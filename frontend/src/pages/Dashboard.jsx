import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../api';

const COLORS = ['#14b8a6', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

const Dashboard = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get('auth/profile/');
        setProfile(userRes.data);
        const role = userRes.data.role;

        let statsRes;
        if (role === 'USER') {
          statsRes = await api.get('stats/school/');
        } else if (role === 'ADMIN') {
          statsRes = await api.get(`stats/governorate/?governorate_id=${userRes.data.governorate}`);
        } else {
          statsRes = await api.get('stats/national/');
        }
        setStats(statsRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-20 text-brand-600 font-bold animate-pulse">Loading...</div>;
  if (!profile || !stats) return <div className="text-center py-20 text-red-500 font-bold">Error loading dashboard data.</div>;

  const renderUserStats = () => {
    const data = [
      { name: 'Tobacco', value: stats.tobacco_users },
      { name: 'Alcohol', value: stats.alcohol_users },
      { name: 'Cannabis', value: stats.cannabis_users },
      { name: 'Cocaine', value: stats.cocaine_users },
      { name: 'Ecstasy', value: stats.ecstasy_users },
    ];
    
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Substance Use Prevalence (Total: {stats.total_responses})</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '10px' }} />
              <Bar dataKey="value" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderAdminStats = () => {
    const isNational = profile.role === 'SUPERADMIN';
    const list = isNational ? stats.by_governorate : stats.by_school;
    const nameKey = isNational ? 'governorate__name' : 'school__name';

    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          {isNational ? 'Comparison by Governorate' : 'Comparison by School'} (Total Responses: {isNational ? stats.total_national_responses : stats.total_responses})
        </h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={list} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey={nameKey} />
              <YAxis />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '10px' }} />
              <Legend />
              <Bar dataKey="tobacco" fill="#ef4444" name="Tobacco" radius={[4, 4, 0, 0]} />
              <Bar dataKey="alcohol" fill="#f59e0b" name="Alcohol" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cannabis" fill="#14b8a6" name="Cannabis" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="glass-panel p-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-brand-900 mb-2">{t('Dashboard')}</h1>
          <p className="text-gray-500 text-lg">
            Welcome back, <span className="font-bold text-brand-700">{profile.username}</span>. Role: <span className="uppercase tracking-wider text-xs bg-brand-100 text-brand-800 px-2 py-1 rounded inline-block ml-1">{profile.role}</span>
          </p>
        </div>
        <div className="bg-brand-50 rounded-full h-16 w-16 flex items-center justify-center border-4 border-white shadow-sm">
          <span className="text-brand-500 font-bold text-2xl">{profile.username.charAt(0).toUpperCase()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {profile.role === 'USER' ? renderUserStats() : renderAdminStats()}
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Summary Metrics</h3>
          <ul className="space-y-4">
             <li className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
               <span className="text-gray-600 font-medium">Platform</span>
               <span className="text-brand-700 font-bold">Sentinelle MedSPAD</span>
             </li>
             <li className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
               <span className="text-gray-600 font-medium">Your Role Limit</span>
               <span className="text-brand-700 font-bold">{profile.role}</span>
             </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
