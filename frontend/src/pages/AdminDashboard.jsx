import React from 'react';
import SentinelleDashboard from '../components/dashboard/SentinelleDashboard';
import { useParams } from 'react-router-dom';

const AdminDashboard = () => {
    const { regionName } = useParams();
    return <SentinelleDashboard initialScope="gouvernorate" initialScopeId={regionName} />;
};

export default AdminDashboard;
