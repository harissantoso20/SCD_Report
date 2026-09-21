import React, { Suspense, lazy, useEffect } from 'react';
import useAppStore from './store/useAppStore';
import logoPTBA from './assets/logo/logo-ptba.png';
import { version as appVersion } from '../package.json';

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
  }, [initializeAuth]);

  // View-only users
  const viewOnlyEmails = [
    'apurnomo@bukitasam.co.id',
    'santoso.official03@gmail.com'
  ];
  
  const isViewOnly = user && viewOnlyEmails.includes(user.email);

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
        <header className="bg-white border-b border-gray-200 sticky top-0 px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0 shadow-sm w-full z-50">
          <div className="flex items-center gap-3">
            <img src={logoPTBA} alt="Logo PTBA" className="h-12 md:h-16 w-auto object-contain" />
          </div>
          <nav className="flex items-center gap-4 md:gap-6 font-bold text-xs md:text-sm uppercase tracking-wide">
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
        </header>

        <main className="flex-1 w-full p-4 md:p-6 lg:max-w-7xl lg:mx-auto">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div>
            </div>
          }>
            {activeTab === "Home" && <HomeView />}
            {activeTab === "Dashboard" && <DashboardView />}
            {activeTab === "Data Entry" && !isViewOnly && <DataEntryView />}
            {activeTab === "Data Entry" && isViewOnly && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <h2 className="text-xl font-bold text-gray-700">Akses Ditolak</h2>
                <p className="text-gray-500 mt-2">Akun Anda hanya memiliki izin untuk melihat data (View Only).</p>
              </div>
            )}
          </Suspense>
        </main>

        <footer className="w-full text-center py-6 mt-auto">
          <p className="text-gray-500 text-[13px] font-medium">© 2026 Sustainable Community Development</p>
          <p className="text-[11px] text-gray-400 mt-1.5 font-mono">Version: v{appVersion}</p>
        </footer>
      </div>
    </GlobalErrorBoundary>
  );
}
