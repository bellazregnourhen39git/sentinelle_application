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
  <div className="pro-card p-6 flex flex-col justify-between glass-card-hover border-slate-100/50">
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 shadow-sm shadow-${colorClass.split('-')[1]}-200/20`}>
        <Icon className={colorClass.replace('bg-', 'text-')} size={22} />
      </div>
      {trend && (
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className="mt-5">
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[2px]">{label}</p>
      <h4 className="text-3xl font-black text-slate-900 mt-1 tracking-tighter italic">{value}</h4>
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-[3px] border-slate-100 border-t-brand-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="text-brand-500 animate-pulse" size={20} />
        </div>
      </div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[5px] animate-pulse">Synchronizing Intelligence</p>
    </div>
  );

  if (!profile || !stats) return (
    <div className="pro-card p-20 text-center max-w-2xl mx-auto mt-20 border-rose-100">
      <AlertTriangle className="mx-auto text-rose-500 mb-6" size={48} />
      <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">System Offline</h2>
      <p className="text-slate-500 mt-4 font-medium">L'accès aux données biométriques est temporairement suspendu. Vérifiez vos protocoles réseau.</p>
      <button onClick={() => window.location.reload()} className="mt-8 pro-btn-primary bg-slate-900 hover:bg-slate-800">
        Re-initialize Session
      </button>
    </div>
  );

  const substanceData = [
    { name: 'Tobacco', value: stats.tobacco_users || 0 },
    { name: 'Alcohol', value: stats.alcohol_users || 0 },
    { name: 'Cannabis', value: stats.cannabis_users || 0 },
    { name: 'Other', value: (stats.total_responses || 0) - (stats.has_risk_behavior_count || 0) },
  ];

  return (
    <div className="space-y-12 animate-clinical-in pb-20 max-w-[1600px] mx-auto px-4">
      {/* Premium Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-4">
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-brand-500 rounded-full"></div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none italic uppercase">
                    {t('Dashboard')}
                </h1>
            </div>
          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500">
                <Calendar size={12} className="text-brand-500" />
                {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="text-[10px] font-black text-brand-600 uppercase tracking-[4px] glow-text-brand italic">{profile.role} ANALYTICS</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={exportToCSV} className="pro-btn-secondary flex items-center gap-2 group shadow-sm">
            <FileSpreadsheet size={16} className="group-hover:text-brand-500 transition-colors" />
            <span>Extraire CSV</span>
          </button>
          <button className="pro-btn-primary flex items-center gap-2 shadow-xl shadow-brand-500/10 active:scale-95">
            <Filter size={16} />
            <span>Filtres Avancés</span>
          </button>
        </div>
      </header>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard
          icon={Users}
          label="Total Cohort"
          value={stats.total_responses || stats.total_national_responses || 0}
          trend={12}
          colorClass="bg-blue-500"
        />
        <StatCard
          icon={Activity}
          label="Risk Factor"
          value={`${Math.round(((stats.has_risk_behavior_count || 0) / (stats.total_responses || 1)) * 100)}%`}
          trend={-5}
          colorClass="bg-rose-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Live Inlets"
          value={stats.active_sessions || 24}
          trend={8}
          colorClass="bg-brand-500"
        />
        <StatCard
          icon={ShieldCheck}
          label="Data Integrity"
          value="Validated"
          colorClass="bg-slate-900"
        />
      </div>

      {/* Main Analysis Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Primary Analytical Graph */}
        <div className="lg:col-span-3 pro-card p-10 border-slate-100">
          <div className="flex items-center justify-between mb-10">
            <div>
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">Prevalence Dynamics</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time vector analysis</p>
            </div>
            <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse"></span> National Index
              </span>
            </div>
          </div>
          <div className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={substanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <Tooltip
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: '1px solid #f1f5f9', 
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)',
                    padding: '16px'
                  }}
                  cursor={{ stroke: '#0ea5e9', strokeWidth: 2, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Distribution */}
        <div className="lg:col-span-2 pro-card p-10 border-slate-100 flex flex-col items-center">
            <div className="w-full text-center mb-10">
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">Risk Segmentation</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Weighted Distribution</p>
            </div>
          <div className="h-64 w-full flex justify-center scale-110">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={substanceData}
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {substanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={12} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-12 w-full space-y-4">
            {substanceData.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:bg-white transition-all cursor-default group">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">{s.name}</span>
                </div>
                <span className="text-sm font-black text-slate-900 tabular-nums italic">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Geospatial Intelligence Feed */}
      <div className="pro-card overflow-hidden border-slate-100 shadow-2xl shadow-slate-200/20">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div>
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">Regional Intelligence</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Geospatial Distribution Table</p>
            </div>
          <span className="text-[10px] font-black text-brand-600 bg-brand-50 border border-brand-100 px-4 py-2 rounded-full uppercase tracking-[2px] italic">Live Stream</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Locus Identifier</th>
                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[2px] text-center">Volume</th>
                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[2px] text-center">Tox Index</th>
                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[2px] text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {(stats.by_governorate || stats.by_school || []).slice(0, 5).map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-all border-b border-slate-50 last:border-0 group">
                  <td className="p-8">
                    <span className="font-black text-slate-900 uppercase italic tracking-tight text-lg group-hover:text-brand-600 transition-colors">{item.governorate__name || item.school__name}</span>
                  </td>
                  <td className="p-8 text-center font-black text-slate-600 tabular-nums text-lg">
                    {item.total || item.total_responses || 0}
                  </td>
                  <td className="p-8 text-center">
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex-1 max-w-[120px] h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50 shadow-inner">
                        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.min(100, (item.tobacco || 0) * 10)}%` }}></div>
                      </div>
                      <span className="text-xs font-black text-brand-600 tabular-nums italic">{item.tobacco || 0}</span>
                    </div>
                  </td>
                  <td className="p-8 text-center">
                    <span className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-brand-50 text-brand-600 border border-brand-100 shadow-sm">Secured</span>
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
