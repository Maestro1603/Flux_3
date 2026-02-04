import React, { useState, useEffect } from 'react';
import { ViewState, Guest, Wave, Admin, UserRole } from './types.ts';
import { DBService } from './services/dbService.ts';
import Home from './components/Home.tsx';
import Registration from './components/Registration.tsx';
import Terms from './components/Terms.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import SecurityDashboard from './components/SecurityDashboard.tsx';
import AdminLogin from './components/AdminLogin.tsx';
import TicketView from './components/TicketView.tsx';
import TicketRetrieval from './components/TicketRetrieval.tsx';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [activeGuest, setActiveGuest] = useState<Guest | null>(null);
  const [session, setSession] = useState<Admin | null>(DBService.getSession());
  const [waves, setWaves] = useState<Wave[]>([]);

  useEffect(() => {
    const currentSession = DBService.getSession();
    if (currentSession) {
      setSession(currentSession);
    }
    setWaves(DBService.getWaves());
  }, [view]);

  const handleLoginSuccess = (user: Admin) => {
    setSession(user);
    setView(user.role === UserRole.ADMIN ? 'ADMIN_DASHBOARD' : 'SECURITY_DASHBOARD');
  };

  const handleLogout = () => {
    DBService.logout();
    setSession(null);
    setView('HOME');
  };

  const handleRegistrationSuccess = (guest: Guest) => {
    setActiveGuest(guest);
    setView('TICKET_VIEW');
  };

  const handleRetrievalSuccess = (guest: Guest) => {
    setActiveGuest(guest);
    setView('TICKET_VIEW');
  };

  const navigateTo = (newView: ViewState) => {
    if ((newView === 'ADMIN_DASHBOARD' || newView === 'SECURITY_DASHBOARD') && !session) {
      setView('ADMIN_LOGIN');
    } else if (newView === 'ADMIN_DASHBOARD' && session?.role !== UserRole.ADMIN) {
      setView('SECURITY_DASHBOARD');
    } else {
      setView(newView);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfdff] selection:bg-indigo-100 selection:text-indigo-900">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigateTo('HOME')}
                className="text-xl font-black tracking-tighter text-indigo-600 flex items-center gap-1 hover:opacity-80 transition"
              >
                <i className="fas fa-bolt-lightning text-amber-400"></i>
                <span>FLUX</span>
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigateTo('REGISTER')}
                className="hidden sm:block text-sm font-bold text-gray-500 hover:text-indigo-600 px-4 py-2 transition"
              >
                Tickets
              </button>
              {session ? (
                <button 
                  onClick={() => navigateTo(session.role === UserRole.ADMIN ? 'ADMIN_DASHBOARD' : 'SECURITY_DASHBOARD')} 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 text-sm font-bold border border-indigo-100 hover:bg-indigo-100 transition"
                >
                  <i className={`fas ${session.role === UserRole.ADMIN ? 'fa-table-columns' : 'fa-shield-halved'}`}></i>
                  <span className="hidden sm:inline">{session.role === UserRole.ADMIN ? 'Dashboard' : 'Security'}</span>
                </button>
              ) : (
                <button 
                  onClick={() => navigateTo('ADMIN_LOGIN')} 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition hover:bg-gray-50"
                  title="Staff Login"
                >
                  <i className="fas fa-user-lock"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow container mx-auto px-4 py-6 md:py-10 max-w-7xl">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {view === 'HOME' && (
            <Home 
              onRegister={() => setView('REGISTER')} 
              waves={waves} 
            />
          )}
          {view === 'REGISTER' && (
            <Registration 
              onSuccess={handleRegistrationSuccess} 
              onViewTerms={() => setView('TERMS')} 
              onRetrieve={() => setView('RETRIEVE_TICKET')}
            />
          )}
          {view === 'RETRIEVE_TICKET' && (
            <TicketRetrieval 
              onSuccess={handleRetrievalSuccess}
              onBack={() => setView('REGISTER')}
            />
          )}
          {view === 'TERMS' && <Terms onBack={() => setView('REGISTER')} />}
          {view === 'ADMIN_LOGIN' && <AdminLogin onSuccess={handleLoginSuccess} />}
          {view === 'ADMIN_DASHBOARD' && session && session.role === UserRole.ADMIN && <AdminDashboard onLogout={handleLogout} />}
          {view === 'SECURITY_DASHBOARD' && session && <SecurityDashboard onLogout={handleLogout} />}
          {view === 'TICKET_VIEW' && activeGuest && <TicketView guest={activeGuest} onBack={() => setView('HOME')} />}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-10 mt-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="font-black text-lg text-gray-900 mb-1 uppercase tracking-tighter">Flux Parties</div>
              <p className="text-gray-400 text-sm font-medium tracking-tight">Experience energy redefined.</p>
            </div>
            
            <div className="flex items-center">
              <button onClick={() => setView('TERMS')} className="text-gray-400 hover:text-indigo-600 text-xs font-bold uppercase tracking-widest transition">Terms & Conditions</button>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-300 text-[10px] font-bold uppercase tracking-[0.2em]">
            © 2024 FLUX PARTIES SYSTEM
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;