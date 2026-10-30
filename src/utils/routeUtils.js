/**
 * ==============================================================================
 * UTILITAS ROUTING & SINKRONISASI URL MORA SCD
 * ==============================================================================
 * Menjaga sinkronisasi antara activeTab dan URL browser (HTML5 History API)
 * sehingga ketika halaman di-refresh (F5), pengguna tetap berada di tab/halaman tersebut.
 * ==============================================================================
 */

export const TAB_PATH_MAP = {
  'Home': '/',
  'Dashboard': '/dashboard',
  'Log Book': '/logbook',
  'Monitoring': '/monitoring',
  'Data Entry': '/data-entry'
};

export const PATH_TAB_MAP = {
  '/': 'Home',
  '/home': 'Home',
  '/dashboard': 'Dashboard',
  '/logbook': 'Log Book',
  '/monitoring': 'Monitoring',
  '/data-entry': 'Data Entry'
};

/**
 * Mendapatkan tab aktif berdasarkan URL saat ini (Pathname atau Hash)
 */
export function getTabFromUrl() {
  if (typeof window === 'undefined') return 'Home';

  // 1. Cek Pathname (contoh: /logbook, /dashboard)
  const path = (window.location.pathname || '').toLowerCase().replace(/\/$/, '') || '/';
  if (PATH_TAB_MAP[path]) {
    return PATH_TAB_MAP[path];
  }

  // 2. Cek Hash sebagai alternatif (contoh: #/logbook atau #logbook)
  if (window.location.hash) {
    const cleanHash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    const hashPath = '/' + cleanHash;
    if (PATH_TAB_MAP[hashPath]) {
      return PATH_TAB_MAP[hashPath];
    }
  }

  // 3. Fallback: Cek sessionStorage / localStorage jika berada di root
  try {
    const sessionTab = sessionStorage.getItem('mora_active_tab');
    if (sessionTab && TAB_PATH_MAP[sessionTab] && path === '/') {
      return sessionTab;
    }
  } catch {
    // Abaikan jika storage disabled
  }

  return 'Home';
}

/**
 * Sinkronisasi URL browser saat tab berpindah tanpa reload halaman
 */
export function syncUrlWithTab(tab, replace = false) {
  if (typeof window === 'undefined') return;

  const targetPath = TAB_PATH_MAP[tab] || '/';
  const currentPath = (window.location.pathname || '').toLowerCase().replace(/\/$/, '') || '/';

  if (currentPath !== targetPath) {
    if (replace) {
      window.history.replaceState({ tab }, '', targetPath);
    } else {
      window.history.pushState({ tab }, '', targetPath);
    }
  }

  try {
    sessionStorage.setItem('mora_active_tab', tab);
    localStorage.setItem('mora_active_tab', tab);
  } catch {
    // Abaikan jika storage disabled
  }
}

