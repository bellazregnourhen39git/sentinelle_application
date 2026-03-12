import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import QuestionnaireForm from './components/QuestionnaireForm';

function App() {
  const { t, i18n } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access'));

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'ar' : 'fr';
    i18n.changeLanguage(newLang);
    document.body.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  useEffect(() => {
    document.body.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800 transition-colors duration-300">
        <nav className="bg-brand-700 text-white shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-2xl font-extrabold tracking-tight">
                  🛡️ {t('Sentinelle')}
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleLanguage}
                  className="bg-brand-500 hover:bg-brand-600 px-4 py-2 rounded-full shadow transition-all duration-300 transform font-semibold text-sm mr-2"
                >
                  🌐 {t('Switch Language')}
                </button>
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" className="hover:text-brand-100 transition-colors">{t('Dashboard')}</Link>
                    <Link to="/questionnaire" className="hover:text-brand-100 transition-colors">{t('Questionnaire')}</Link>
                    <button onClick={handleLogout} className="text-sm font-medium hover:underline">
                      {t('Logout')}
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="hover:text-brand-100 transition-colors">
                    {t('Login')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
            <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/questionnaire" element={isAuthenticated ? <QuestionnaireForm /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
