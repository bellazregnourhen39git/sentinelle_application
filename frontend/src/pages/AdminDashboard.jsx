import React from 'react';
import SentinelleDashboard from '../components/dashboard/SentinelleDashboard';
import { useParams } from 'react-router-dom';

const AdminDashboard = ({ profile }) => {
    const { regionName } = useParams();
    return <SentinelleDashboard initialScope="gouvernorate" initialScopeId={regionName} profile={profile} />;
};

export default AdminDashboard;
