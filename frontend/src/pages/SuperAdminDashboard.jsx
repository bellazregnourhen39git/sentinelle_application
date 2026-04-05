import React from 'react';
import SentinelleDashboard from '../components/dashboard/SentinelleDashboard';

const SUPER_USER = { username: 'Superviseur National', role: 'SUPERADMIN' };

const SuperAdminDashboard = () => {
    return <SentinelleDashboard initialScope="national" forcedUser={SUPER_USER} />;
};

export default SuperAdminDashboard;
