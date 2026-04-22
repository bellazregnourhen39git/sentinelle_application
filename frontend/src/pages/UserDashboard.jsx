import React from 'react';
import SentinelleDashboard from '../components/dashboard/SentinelleDashboard';

const UserDashboard = ({ profile }) => {
    return <SentinelleDashboard initialScope="user_school" profile={profile} />;
};

export default UserDashboard;
