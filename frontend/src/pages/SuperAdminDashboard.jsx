import React from 'react';
import SentinelleDashboard from '../components/dashboard/SentinelleDashboard';

const SUPER_USER = { username: 'Superviseur National', role: 'SUPER_ADMIN' };

const SuperAdminDashboard = ({ profile }) => {
    return <SentinelleDashboard initialScope="national" forcedUser={profile || SUPER_USER} profile={profile || SUPER_USER} />;
};

export default SuperAdminDashboard;
