import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './i18n';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import QuestionnaireForm from './components/QuestionnaireForm';
import Map3D from './components/Map3D';
import SocialLab from './pages/SocialLab';
import ComorbidityLab from './pages/ComorbidityLab';
import CorrelationLab from './pages/CorrelationLab';
import ClassReportPage from './pages/ClassReportPage';
import SessionCollectionView from './pages/SessionCollectionView';
import PractitionerGuide from './pages/PractitionerGuide';
import RankingsLab from './pages/RankingsLab';
import QRCodePage from './pages/QRCodePage';
import ScanPage from './pages/ScanPage';
import UserManagement from './pages/UserManagement';
import SubmissionsViewer from './components/dashboard/SubmissionsViewer';
import RegionalDeepDivePage from './pages/RegionalDeepDivePage';

// Mock profile objects — swap with real API data when integrating auth
const MOCK_USER = { username: 'Dr. Ben Ali', role: 'USER', governorate: 1 };
const MOCK_ADMIN = { username: 'Admin Tunis', role: 'ADMIN', governorate: 1 };
const MOCK_SUPER = { username: 'Superviseur National', role: 'SUPER_ADMIN' };

import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import SetPassword from './pages/SetPassword';
import { useState, useEffect } from 'react';
import { TerminologyProvider } from './TerminologyContext';

const normalizeRole = (role) => String(role || '').toUpperCase().replace(/_/g, '');

const getAdminRedirect = (user) => {
  const role = normalizeRole(user?.role);
  if (role === 'REGIONALANALYST') {
    const gov = user?.governorate || user?.gouvernorat || user?.region || 'unknown';
    return `/admin/${encodeURIComponent(gov)}?scope_type=gouvernorate&scope_id=${encodeURIComponent(gov)}`;
  }
  return '/admin';
};

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-8">
        {/* Branded logo */}
        <div className="relative flex items-center justify-center">
          {/* Outer ring */}
          <div className="absolute w-24 h-24 rounded-full border-2 border-emerald-500/20 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute w-20 h-20 rounded-full border-2 border-emerald-500/30" />
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 6l5 6 5-6 5 6 5-6" />
              <circle cx="12" cy="18" r="2" />
            </svg>
          </div>
        </div>
        {/* Brand name */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-white font-black text-xl uppercase tracking-[6px] italic">Sentinelle</span>
          <span className="text-emerald-500/60 font-black text-[9px] uppercase tracking-[5px]">Initialisation du Hub Clinique...</span>
        </div>
        {/* Progress bar */}
        <div className="w-48 h-0.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full animate-[progress_1.5s_ease-in-out_infinite]" style={{ width: '60%', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      </div>
    );
  }


  const activeProfile = user;

  return (
    <TerminologyProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            !user ? <LandingPage /> :
              (['SUPERADMIN', 'GLOBALADMIN'].includes(normalizeRole(user.role)) ? <Navigate to="/superadmin" replace /> :
                (['REGIONALADMIN', 'ADMIN', 'REGIONALANALYST'].includes(normalizeRole(user.role))) ? <Navigate to={getAdminRedirect(user)} replace /> :
                  ['PRACTITIONER', 'OPERATOR'].includes(normalizeRole(user.role)) ? <Navigate to="/guide" replace /> :
                    <Navigate to="/user" replace />)
          } />

          <Route path="/login" element={
            !user ? <Login setUser={setUser} /> :
              (['SUPERADMIN', 'GLOBALADMIN'].includes(normalizeRole(user.role)) ? <Navigate to="/superadmin" replace /> :
                (['REGIONALADMIN', 'ADMIN', 'REGIONALANALYST'].includes(normalizeRole(user.role))) ? <Navigate to={getAdminRedirect(user)} replace /> :
                  ['PRACTITIONER', 'OPERATOR'].includes(normalizeRole(user.role)) ? <Navigate to="/guide" replace /> :
                    <Navigate to="/user" replace />)
          } />

          <Route path="/set-password" element={<SetPassword />} />

          {/* Standalone Dashboards */}
          <Route path="/user" element={
            <ProtectedRoute profile={activeProfile} allowedRoles={['PRACTITIONER', 'REGIONAL_ADMIN', 'GLOBAL_ADMIN', 'SUPER_ADMIN']}>
              <UserDashboard profile={activeProfile} />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute profile={activeProfile} allowedRoles={['REGIONAL_ADMIN', 'REGIONAL_ANALYST', 'ADMIN', 'GLOBAL_ADMIN', 'SUPER_ADMIN']}>
              <AdminDashboard profile={activeProfile} />
            </ProtectedRoute>
          } />
          <Route path="/admin/:regionName" element={
            <ProtectedRoute profile={activeProfile} allowedRoles={['REGIONAL_ADMIN', 'REGIONAL_ANALYST', 'ADMIN', 'GLOBAL_ADMIN', 'SUPER_ADMIN']}>
              <AdminDashboard profile={activeProfile} />
            </ProtectedRoute>
          } />
          <Route path="/superadmin" element={
            <ProtectedRoute profile={activeProfile} allowedRoles={['SUPER_ADMIN', 'GLOBAL_ADMIN']}>
              <SuperAdminDashboard profile={activeProfile} />
            </ProtectedRoute>
          } />

          {/* 🔬 Intelligence Labs with RBAC */}
          <Route path="/lab/social" element={
            <ProtectedRoute profile={activeProfile} allowedRoles={['SUPER_ADMIN', 'GLOBAL_ADMIN']}>
              <SocialLab profile={activeProfile} />
            </ProtectedRoute>
          } />


          <Route path="/lab/comorbidity" element={
            <ProtectedRoute profile={activeProfile} allowedRoles={['SUPER_ADMIN', 'GLOBAL_ADMIN']}>
              <ComorbidityLab profile={activeProfile} />
            </ProtectedRoute>
          } />

          <Route path="/lab/correlation" element={
            <ProtectedRoute profile={activeProfile} allowedRoles={['SUPER_ADMIN', 'GLOBAL_ADMIN']}>
              <CorrelationLab profile={activeProfile} />
            </ProtectedRoute>
          } />

          <Route path="/lab/rankings" element={
            <ProtectedRoute profile={activeProfile} allowedRoles={['SUPER_ADMIN', 'GLOBAL_ADMIN']}>
              <RankingsLab profile={activeProfile} />
            </ProtectedRoute>
          } />

          {/* Other pages */}
          <Route path="/questionnaire" element={<QuestionnaireForm />} />
          <Route path="/map" element={<Map3D />} />
          <Route path="/qr" element={<QRCodePage />} />
          <Route path="/scan" element={
            <ProtectedRoute profile={activeProfile} allowedRoles={['SUPER_ADMIN', 'GLOBAL_ADMIN', 'PRACTITIONER', 'OPERATOR']}>
              <ScanPage />
            </ProtectedRoute>
          } />
          <Route path="/class-report" element={<ClassReportPage />} />
          <Route path="/session/:reportId/collect" element={<SessionCollectionView />} />
          <Route path="/guide" element={
            <ProtectedRoute profile={activeProfile} allowedRoles={['PRACTITIONER', 'OPERATOR']}>
              <PractitionerGuide user={activeProfile} />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute profile={activeProfile} allowedRoles={['SUPER_ADMIN']}>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/submissions" element={
            <ProtectedRoute profile={activeProfile} allowedRoles={['SUPER_ADMIN', 'GLOBAL_ADMIN']}>
              <SubmissionsViewer />
            </ProtectedRoute>
          } />
          

          {/* Regional Deep Dive */}
          <Route path="/region/:govName" element={
            <ProtectedRoute profile={activeProfile} allowedRoles={['SUPER_ADMIN', 'GLOBAL_ADMIN']}>
              <RegionalDeepDivePage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </TerminologyProvider>
  );
}

export default App;
