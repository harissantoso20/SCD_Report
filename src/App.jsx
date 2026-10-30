import React, { Suspense, lazy, useEffect } from 'react';
import useAppStore from './store/useAppStore';
import logoPTBA from './assets/logo/logo-ptba.png';
import logoMoraFlat from './assets/logo/logo-mora-flat.png';
import { getTabFromUrl } from './utils/routeUtils';

// Dynamic compile-time metadata from Vite
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '2.1.0';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, background: '#fee2e2', color: '#991b1b', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 10 }}>Oops! Terjadi Kesalahan.</h1>
          <p style={{ fontSize: 16, marginBottom: 20, maxWidth: 600 }}>Sistem mengalami kendala teknis. Kami mohon maaf atas ketidaknyamanan ini. Silakan muat ulang halaman.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ padding: '10px 20px', background: '#991b1b', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
          >
            Muat Ulang Halaman
          </button>
          
          {import.meta.env.DEV && (
            <pre style={{ marginTop: 40, background: '#fef2f2', padding: 15, borderRadius: 8, overflowX: 'auto', maxWidth: '90%', fontSize: 12, textAlign: 'left', border: '1px solid #fca5a5' }}>
              <strong style={{ color: '#dc2626' }}>[DEVELOPMENT MODE ONLY] Stack Trace:</strong>
              <br/><br/>
              {this.state.error && this.state.error.stack}
              <br /><br />
              <strong>COMPONENT STACK:</strong><br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

const HomeView = lazy(() => import('./components/HomeView'));
const DashboardView = lazy(() => import('./components/DashboardView'));
const DataEntryView = lazy(() => import('./components/DataEntryView'));
const MonitoringView = lazy(() => import('./components/MonitoringView'));
const LogbookView = lazy(() => import('./components/LogbookView'));
import LoginView from './components/LoginView';

export default function App() {
  const activeTab = useAppStore((state) => state.activeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const user = useAppStore((state) => state.user);
  const isAuthLoading = useAppStore((state) => state.isAuthLoading);
  const initializeAuth = useAppStore((state) => state.initializeAuth);
  const logout = useAppStore((state) => state.logout);

  useEffect(() => {
    initializeAuth();

    const handlePopState = () => {
      const tab = getTabFromUrl();
      setActiveTab(tab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [initializeAuth, setActiveTab]);

  // View-only / Eksekutif users (Akses: Hanya Home & Dashboard)
  const viewOnlyEmails = [
    'apurnomo@bukitasam.co.id',
    'santoso.official03@gmail.com',
    'listati@bukitasam.co.id'
  ];
  
  const isViewOnly = user && (
    viewOnlyEmails.includes(user.email) ||
    user.user_metadata?.role === 'eksekutif' ||
    user.user_metadata?.role === 'view_only'
  );

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="w-10 h-10 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <GlobalErrorBoundary>
        <LoginView />
      </GlobalErrorBoundary>
    );
  }

  return (
    <GlobalErrorBoundary>
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col w-full">
        <header className="bg-white border-b border-gray-200 sticky top-0 px-4 md:px-6 lg:px-8 xl:px-10 py-3 md:py-4 shadow-sm w-full z-50">
          <div className="w-full max-w-[1800px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
            <div className="flex items-center gap-2.5 md:gap-3.5 shrink-0">
              <img src={logoPTBA} alt="Logo PTBA" className="h-8 md:h-10 w-auto object-contain shrink-0" />
              <div className="h-5 md:h-6 w-[1.5px] bg-gray-200 shrink-0"></div>
              <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                <img src={logoMoraFlat} alt="Logo MORA SCD" className="h-7 md:h-8.5 w-auto object-contain shrink-0" />
                <span className="font-black text-[#1e3a8a] text-xs md:text-sm tracking-wide whitespace-nowrap">MORA SCD</span>
              </div>
            </div>
            <nav className="flex items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 font-bold text-xs md:text-sm uppercase tracking-wide">
              <button 
                onClick={() => setActiveTab("Home")}
                className={`transition-colors ${activeTab === "Home" ? "text-[#1e3a8a] border-b-2 border-[#1e3a8a] pb-1" : "text-gray-400 hover:text-[#1e3a8a]"}`}
              >
                Home
              </button>
              <button 
                onClick={() => setActiveTab("Dashboard")}
                className={`transition-colors ${activeTab === "Dashboard" ? "text-[#1e3a8a] border-b-2 border-[#1e3a8a] pb-1" : "text-gray-400 hover:text-[#1e3a8a]"}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab("Log Book")}
                className={`transition-colors ${activeTab === "Log Book" ? "text-[#1e3a8a] border-b-2 border-[#1e3a8a] pb-1" : "text-gray-400 hover:text-[#1e3a8a]"}`}
              >
                Log Book
              </button>
              <button 
                onClick={() => setActiveTab("Monitoring")}
                className={`transition-colors ${activeTab === "Monitoring" ? "text-[#1e3a8a] border-b-2 border-[#1e3a8a] pb-1" : "text-gray-400 hover:text-[#1e3a8a]"}`}
              >
                Survey / Monitoring & Evaluasi
              </button>
              {!isViewOnly && (
                <button 
                  onClick={() => setActiveTab("Data Entry")}
                  className={`transition-colors ${activeTab === "Data Entry" ? "text-[#1e3a8a] border-b-2 border-[#1e3a8a] pb-1" : "text-gray-400 hover:text-[#1e3a8a]"}`}
                >
                  Data Entry
                </button>
              )}
              <div className="w-[1px] h-6 bg-gray-300 mx-1 hidden md:block"></div>
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-500 font-normal normal-case">
                <span className="truncate max-w-[180px] text-gray-600 font-medium">{user.email}</span>
                {isViewOnly && (
                  <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold uppercase">
                    Eksekutif
                  </span>
                )}
                {user.user_metadata?.program && (
                  <span className="text-[10px] bg-blue-50 text-[#1e3a8a] border border-blue-200 px-2 py-0.5 rounded font-bold uppercase">
                    {user.user_metadata.program}
                  </span>
                )}
              </div>
              <button 
                onClick={logout}
                className="text-red-600 hover:text-red-800 transition-colors font-bold"
              >
                Logout
              </button>
            </nav>
          </div>
        </header>

        <main className="flex-1 w-full p-4 md:p-6 lg:px-8 xl:px-10 max-w-[1800px] mx-auto">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div>
            </div>
          }>
            {activeTab === "Home" && <HomeView />}
            {activeTab === "Dashboard" && <DashboardView />}
            {activeTab === "Log Book" && <LogbookView isViewOnly={isViewOnly} />}
            {activeTab === "Monitoring" && <MonitoringView isViewOnly={isViewOnly} />}
            {activeTab === "Data Entry" && !isViewOnly && <DataEntryView />}
            {activeTab === "Data Entry" && isViewOnly && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <h2 className="text-xl font-bold text-gray-700">Akses Ditolak</h2>
                <p className="text-gray-500 mt-2">Akun Eksekutif hanya memiliki izin untuk melihat data (View Only).</p>
              </div>
            )}
          </Suspense>
        </main>

        <footer className="w-full text-center py-6 mt-auto">
          <p className="text-gray-500 text-[13px] font-medium">
            © {new Date().getFullYear()} Sustainable Community Development
          </p>
          <p className="text-[11px] text-gray-400 mt-1.5 font-mono">
            Version: v{APP_VERSION}
          </p>
        </footer>
      </div>
    </GlobalErrorBoundary>
  );
}
