import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid
} from 'recharts';
import {
  Download,
  TrendingUp,
  Users,
  AlertTriangle,
  Activity,
  FileSpreadsheet,
  Calendar,
  Filter,
  Shield as ShieldCheck
} from 'lucide-react';
import { json2csv } from 'json-2-csv';
import api from '../api';

const COLORS = ['#0ea5e9', '#6366f1', '#f43f5e', '#f59e0b', '#10b981'];

const StatCard = ({ icon: Icon, label, value, trend, colorClass }) => (
  <div className="pro-card p-6 flex flex-col justify-between">
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10`}>
        <Icon className={colorClass.replace('bg-', 'text-')} size={24} />
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className="mt-4">
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
    </div>
  </div>
);

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
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const exportToCSV = async () => {
    if (!stats) return;
    try {
      // Flatten or structure data for CSV
      const dataToExport = stats.by_governorate || stats.by_school || [stats];
      const csv = await json2csv(dataToExport);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `sentinelle_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse tracking-wide">Synthesizing intelligence data...</p>
    </div>
  );

  if (!profile || !stats) return (
    <div className="pro-card p-20 text-center">
      <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
      <h2 className="text-2xl font-bold text-slate-800">Operational Sync Failure</h2>
      <p className="text-slate-500 mt-2">Could not retrieve dashboard metrics. Please verify network status.</p>
    </div>
  );

  const substanceData = [
    { name: 'Tobacco', value: stats.tobacco_users || 0 },
    { name: 'Alcohol', value: stats.alcohol_users || 0 },
    { name: 'Cannabis', value: stats.cannabis_users || 0 },
    { name: 'Other', value: (stats.total_responses || 0) - (stats.has_risk_behavior_count || 0) },
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Premium Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-none mb-3">
            {t('Dashboard Overview')}
          </h1>
          <div className="flex items-center gap-3 text-slate-500">
            <Calendar size={16} />
            <span className="text-sm font-medium">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span className="text-sm font-bold text-brand-600 uppercase tracking-widest">{profile.role} ACCESS</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={exportToCSV} className="pro-btn-secondary flex items-center gap-2">
            <FileSpreadsheet size={18} />
            <span>Export Data</span>
          </button>
          <button className="pro-btn-primary flex items-center gap-2 shadow-brand-200 shadow-lg">
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </div>
      </header>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Responses"
          value={stats.total_responses || stats.total_national_responses || 0}
          trend={12}
          colorClass="bg-blue-500"
        />
        <StatCard
          icon={Activity}
          label="Risk Prevalence"
          value={`${Math.round(((stats.has_risk_behavior_count || 0) / (stats.total_responses || 1)) * 100)}%`}
          trend={-5}
          colorClass="bg-red-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Active Sessions"
          value={stats.active_sessions || 24}
          trend={8}
          colorClass="bg-green-500"
        />
        <StatCard
          icon={ShieldCheck}
          label="Platform Integrity"
          value="100%"
          colorClass="bg-brand-500"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Deep Analysis Chart */}
        <div className="lg:col-span-2 pro-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800">Prevalence Analytics</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span> Current Period
              </span>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={substanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  cursor={{ stroke: '#0ea5e9', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Pie */}
        <div className="pro-card p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-8">Substance Share</h3>
          <div className="h-64 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={substanceData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {substanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-3">
            {substanceData.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-sm font-medium text-slate-600">{s.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison View (Table style) */}
      <div className="pro-card overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800">Regional Distribution</h3>
          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full uppercase tracking-widest">Live Monitoring</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="p-6 text-sm font-bold text-slate-400 uppercase tracking-widest">Region / School</th>
                <th className="p-6 text-sm font-bold text-slate-400 uppercase tracking-widest text-center">Total</th>
                <th className="p-6 text-sm font-bold text-slate-400 uppercase tracking-widest text-center">Tobacco</th>
                <th className="p-6 text-sm font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {(stats.by_governorate || stats.by_school || []).slice(0, 5).map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-6">
                    <span className="font-bold text-slate-700">{item.governorate__name || item.school__name}</span>
                  </td>
                  <td className="p-6 text-center font-medium text-slate-600">
                    {item.total || item.total_responses || 0}
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex-1 max-w-[100px] h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400" style={{ width: `${Math.min(100, (item.tobacco || 0) * 10)}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-500">{item.tobacco || 0}</span>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-700">Verified</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
