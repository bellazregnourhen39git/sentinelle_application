import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './i18n';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import QuestionnaireForm from './components/QuestionnaireForm';
import Map3D from './components/Map3D';
import SocialLab from './pages/SocialLab';
import IntegrityLab from './pages/IntegrityLab';
import ComorbidityLab from './pages/ComorbidityLab';
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

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
              (['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(user.role) ? <Navigate to="/superadmin" replace /> :
                (['REGIONAL_ANALYST', 'ADMIN'].includes(user.role)) ? <Navigate to="/admin" replace /> :
                  ['PRACTITIONER', 'OPERATOR'].includes(user.role) ? <Navigate to="/guide" replace /> :
                    <Navigate to="/user" replace />)
          } />

          <Route path="/login" element={
            !user ? <Login setUser={setUser} /> :
              (['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(user.role) ? <Navigate to="/superadmin" replace /> :
                (['REGIONAL_ANALYST', 'ADMIN'].includes(user.role)) ? <Navigate to="/admin" replace /> :
                  ['PRACTITIONER', 'OPERATOR'].includes(user.role) ? <Navigate to="/guide" replace /> :
                    <Navigate to="/user" replace />)
          } />

          <Route path="/set-password" element={<SetPassword />} />

          {/* Standalone Dashboards */}
          <Route path="/user" element={
            <ProtectedRoute profile={activeProfile} allowedRoles={['PRACTITIONER', 'REGIONAL_ANALYST', 'GLOBAL_ADMIN', 'SUPER_ADMIN']}>
              <UserDashboard profile={activeProfile} />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute profile={activeProfile} allowedRoles={['REGIONAL_ANALYST', 'ADMIN', 'GLOBAL_ADMIN', 'SUPER_ADMIN']}>
              <AdminDashboard profile={activeProfile} />
            </ProtectedRoute>
          } />
          <Route path="/admin/:regionName" element={
            <ProtectedRoute profile={activeProfile} allowedRoles={['REGIONAL_ANALYST', 'ADMIN', 'GLOBAL_ADMIN', 'SUPER_ADMIN']}>
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

          <Route path="/lab/integrity" element={
            <ProtectedRoute profile={activeProfile} allowedRoles={['SUPER_ADMIN', 'GLOBAL_ADMIN']}>
              <IntegrityLab profile={activeProfile} />
            </ProtectedRoute>
          } />

          <Route path="/lab/comorbidity" element={
            <ProtectedRoute profile={activeProfile} allowedRoles={['SUPER_ADMIN', 'GLOBAL_ADMIN']}>
              <ComorbidityLab profile={activeProfile} />
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
          <Route path="/scan" element={<ScanPage />} />
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
