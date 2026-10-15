import React from 'react';
import SentinelleDashboard from '../components/dashboard/SentinelleDashboard';

const UserDashboard = ({ profile }) => {
    const scope = profile?.governorate ? 'gouvernorate' : 'national';
    const scopeId = profile?.governorate || null;
    return <SentinelleDashboard initialScope={scope} initialScopeId={scopeId} forcedUser={profile} />;
};

export default UserDashboard;

