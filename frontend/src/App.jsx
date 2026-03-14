import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './i18n';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import QuestionnaireForm from './components/QuestionnaireForm';
import Map3D from './components/Map3D';

// Mock profile objects — swap with real API data when integrating auth
const MOCK_USER = { username: 'Dr. Ben Ali', role: 'USER', governorate: 1 };
const MOCK_ADMIN = { username: 'Admin Tunis', role: 'ADMIN', governorate: 1 };
const MOCK_SUPER = { username: 'Superviseur National', role: 'SUPERADMIN' };

function App() {
  return (
    <Router>
      <Routes>
        {/* Default: redirect to user dashboard for quick access */}
        <Route path="/" element={<Navigate to="/user" replace />} />

        {/* Three standalone dashboards – no auth required */}
        <Route path="/user" element={<UserDashboard profile={MOCK_USER} />} />
        <Route path="/admin" element={<AdminDashboard profile={MOCK_ADMIN} />} />
        <Route path="/superadmin" element={<SuperAdminDashboard profile={MOCK_SUPER} />} />

        {/* Other pages */}
        <Route path="/questionnaire" element={<QuestionnaireForm />} />
        <Route path="/map" element={<Map3D />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/user" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
