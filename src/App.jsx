import React, { Suspense, lazy, useEffect } from 'react';
import useAppStore from './store/useAppStore';
import logoPTBA from './assets/logo-ptba.png';

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
        <div style={{ padding: 20, background: '#fee2e2', color: '#991b1b', minHeight: '100vh' }}>
          <h1 style={{ fontSize: 24, fontWeight: 'bold' }}>Something went wrong.</h1>
          <pre style={{ marginTop: 20, background: '#fef2f2', padding: 15, borderRadius: 8, overflowX: 'auto' }}>
            {this.state.error && this.state.error.stack}
            <br />
            <br />
            COMPONENT STACK:
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
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
            <button 
              onClick={() => setActiveTab("Data Entry")}
              className={`transition-colors ${activeTab === "Data Entry" ? "text-[#1e3a8a] border-b-2 border-[#1e3a8a] pb-1" : "text-gray-400 hover:text-[#1e3a8a]"}`}
            >
              Data Entry
            </button>
            <div className="w-[1px] h-6 bg-gray-300 mx-1 hidden md:block"></div>
            <button 
              onClick={logout}
              className="text-red-600 hover:text-red-800 transition-colors"
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
            {activeTab === "Data Entry" && <DataEntryView />}
          </Suspense>
        </main>

        <footer className="w-full text-center py-6 mt-auto">
          <p className="text-gray-500 text-[13px] font-medium">© 2026 Sustainable Community Development</p>
          <p className="text-[11px] text-gray-400 mt-1.5 font-mono">Version: v1.0.7</p>
        </footer>
      </div>
    </GlobalErrorBoundary>
  );
}
