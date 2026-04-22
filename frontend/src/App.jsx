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
import RankingsLab from './pages/RankingsLab';
import QRCodePage from './pages/QRCodePage';
import ScanPage from './pages/ScanPage';
import UserManagement from './pages/UserManagement';

// Mock profile objects — swap with real API data when integrating auth
const MOCK_USER = { username: 'Dr. Ben Ali', role: 'USER', governorate: 1 };
const MOCK_ADMIN = { username: 'Admin Tunis', role: 'ADMIN', governorate: 1 };
const MOCK_SUPER = { username: 'Superviseur National', role: 'SUPER_ADMIN' };

import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import SetPassword from './pages/SetPassword';
import { useState, useEffect } from 'react';
import { TerminologyProvider } from './TerminologyContext';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const activeProfile = user;

  return (
    <TerminologyProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            !user ? <Login setUser={setUser} /> :
              (['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(user.role) ? <Navigate to="/superadmin" replace /> :
                user.role === 'REGIONAL_ANALYST' ? <Navigate to="/admin" replace /> :
                  user.role === 'OPERATOR' ? <Navigate to="/scan" replace /> :
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
            <ProtectedRoute profile={activeProfile} allowedRoles={['REGIONAL_ANALYST', 'GLOBAL_ADMIN', 'SUPER_ADMIN']}>
              <AdminDashboard profile={activeProfile} />
            </ProtectedRoute>
          } />
          <Route path="/admin/:regionName" element={
            <ProtectedRoute profile={activeProfile} allowedRoles={['REGIONAL_ANALYST', 'GLOBAL_ADMIN', 'SUPER_ADMIN']}>
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
          <Route path="/admin/users" element={
            <ProtectedRoute profile={activeProfile} allowedRoles={['SUPER_ADMIN']}>
              <UserManagement />
            </ProtectedRoute>
          } />
          

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </TerminologyProvider>
  );
}

export default App;
