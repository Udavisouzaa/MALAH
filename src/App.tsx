import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import DashboardScreen from './components/DashboardScreen';
import { getActiveUserSession, setActiveUserSession, UserProfile } from './db';

type AppView = 'landing' | 'auth' | 'dashboard';

export default function App() {
  const [view, setView] = useState<AppView>('landing');
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [initialRole, setInitialRole] = useState<'remetente' | 'viajante'>('remetente');

  // Check if user session already exists
  useEffect(() => {
    const session = getActiveUserSession();
    if (session) {
      setActiveUser(session);
      setView('dashboard');
    }
  }, []);

  const handleStart = (role: 'remetente' | 'viajante') => {
    setInitialRole(role);
    setView('auth');
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setActiveUser(user);
    setActiveUserSession(user);
    setView('dashboard');
  };

  const handleLogout = () => {
    setActiveUserSession(null);
    setActiveUser(null);
    setView('landing');
  };

  return (
    <div className="bg-bg-darker min-h-screen text-gray-100 selection:bg-brand-purple/30 selection:text-white">
      {view === 'landing' && (
        <LandingPage onStart={handleStart} />
      )}

      {view === 'auth' && (
        <AuthScreen 
          initialRole={initialRole} 
          onBack={() => setView('landing')} 
          onSuccess={handleAuthSuccess} 
        />
      )}

      {view === 'dashboard' && activeUser && (
        <DashboardScreen 
          user={activeUser} 
          onLogout={handleLogout} 
        />
      )}
    </div>
  );
}
