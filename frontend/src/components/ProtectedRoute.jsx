import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Higher-Order Component for Role-Based Access Control
 * @param {Object} profile - Current user profile (from mock or API)
 * @param {Array} allowedRoles - List of roles permitted to view this route
 */
const ProtectedRoute = ({ children, profile, allowedRoles }) => {
    // If no profile, redirect to login (placeholder)
    if (!profile) return <Navigate to="/user" replace />;

    // Check if user's role is in the allowed list
    const isAuthorized = allowedRoles.includes(profile.role);

    if (!isAuthorized) {
        // You could redirect to a custom "Access Denied" page here
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
                <div className="max-w-md w-full bg-slate-800 rounded-[32px] border border-rose-500/30 p-12 text-center shadow-2xl">
                    <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-rose-500/20">
                        <span className="text-4xl">🚫</span>
                    </div>
                    <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">Accès Restreint</h1>
                    <p className="text-slate-400 text-sm font-bold italic leading-relaxed mb-8">
                        Votre profil médical ({profile.role}) n'est pas autorisé à accéder aux outils d'audit forensique. Veuillez contacter l'administration nationale.
                    </p>
                    <button 
                        onClick={() => window.history.back()}
                        className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-[2px] text-[10px] italic shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all"
                    >
                        Retour en Lieu Sûr
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
