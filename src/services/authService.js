import { supabase } from '../lib/supabaseClient';

const LOCAL_SESSION_KEY = 'scd_custom_session';

export const authService = {
  initializeAuth: (onSessionChange) => {
    // Check local fallback session first
    const savedLocal = localStorage.getItem(LOCAL_SESSION_KEY);
    if (savedLocal) {
      try {
        const parsed = JSON.parse(savedLocal);
        if (parsed?.user) {
          onSessionChange(parsed);
          return;
        }
      } catch (e) {
        localStorage.removeItem(LOCAL_SESSION_KEY);
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      onSessionChange(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (!localStorage.getItem(LOCAL_SESSION_KEY)) {
        onSessionChange(session);
      }
    });
  },

  login: async (email, password) => {
    const trimmedEmail = (email || '').trim().toLowerCase();
    
    // 1. Try real Supabase auth
    const { data, error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
    if (!error && data?.session) {
      localStorage.removeItem(LOCAL_SESSION_KEY);
      return { data, error: null };
    }

    // 2. Built-in dedicated executive account fallback (listati@bukitasam.co.id)
    if (trimmedEmail === 'listati@bukitasam.co.id' && password === 'scd2026PTBA!') {
      const fallbackSession = {
        user: {
          id: 'usr_eksekutif_listati',
          email: 'listati@bukitasam.co.id',
          user_metadata: {
            role: 'eksekutif',
            name: 'Listati'
          }
        }
      };
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(fallbackSession));
      return { data: fallbackSession, error: null };
    }

    return { data, error };
  },

  logout: async () => {
    localStorage.removeItem(LOCAL_SESSION_KEY);
    await supabase.auth.signOut();
  }
};
