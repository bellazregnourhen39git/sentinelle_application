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

// Mock profile objects — swap with real API data when integrating auth
const MOCK_USER = { username: 'Dr. Ben Ali', role: 'USER', governorate: 1 };
const MOCK_ADMIN = { username: 'Admin Tunis', role: 'ADMIN', governorate: 1 };
const MOCK_SUPER = { username: 'Superviseur National', role: 'SUPERADMIN' };

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // Use MOCK_SUPER for national access, MOCK_ADMIN for regional, or MOCK_USER for field access
  const activeProfile = MOCK_SUPER; 

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/user" replace />} />

        {/* Standalone Dashboards */}
        <Route path="/user" element={<UserDashboard profile={MOCK_USER} />} />
        <Route path="/admin" element={<AdminDashboard profile={MOCK_ADMIN} />} />
        <Route path="/admin/:regionName" element={<AdminDashboard profile={MOCK_ADMIN} />} />
        <Route path="/superadmin" element={<SuperAdminDashboard profile={MOCK_SUPER} />} />

        {/* 🔬 Intelligence Labs with RBAC */}
        <Route path="/lab/social" element={
          <ProtectedRoute profile={activeProfile} allowedRoles={['SUPERADMIN']}>
            <SocialLab profile={activeProfile} />
          </ProtectedRoute>
        } />
        
        <Route path="/lab/integrity" element={
          <ProtectedRoute profile={activeProfile} allowedRoles={['SUPERADMIN']}>
            <IntegrityLab profile={activeProfile} />
          </ProtectedRoute>
        } />
        
        <Route path="/lab/comorbidity" element={
          <ProtectedRoute profile={activeProfile} allowedRoles={['SUPERADMIN']}>
            <ComorbidityLab profile={activeProfile} />
          </ProtectedRoute>
        } />
        
        <Route path="/lab/rankings" element={
          <ProtectedRoute profile={activeProfile} allowedRoles={['SUPERADMIN']}>
            <RankingsLab profile={activeProfile} />
          </ProtectedRoute>
        } />

        {/* Other pages */}
        <Route path="/questionnaire" element={<QuestionnaireForm />} />
        <Route path="/map" element={<Map3D />} />
        <Route path="/qr" element={<QRCodePage />} />
        <Route path="/scan" element={<ScanPage />} />

        <Route path="*" element={<Navigate to="/user" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
