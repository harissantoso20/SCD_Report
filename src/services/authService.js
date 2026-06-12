import { supabase } from '../lib/supabaseClient';

export const authService = {
  initializeAuth: (onSessionChange) => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      onSessionChange(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      onSessionChange(session);
    });
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  },

  logout: async () => {
    await supabase.auth.signOut();
  }
};
