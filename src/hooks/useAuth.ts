// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseclient';
import { User, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer la session au chargement
    const initAuth = async () => {
      try {
        setLoading(true);
        
        // Récupérer la session existante
        const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (existingSession) {
          setSession(existingSession);
          setUser(existingSession.user);
        }
      } catch (err) {
        console.error('Erreur initialisation auth:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('🔐 Auth event:', event, currentSession?.user?.email);
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
      
      // Événements spécifiques
      if (event === 'SIGNED_OUT') {
        // Nettoyer les données locales si besoin
        localStorage.removeItem('supabase-auth');
      }
      
      if (event === 'SIGNED_IN') {
        // Recharger les données utilisateur si besoin
        console.log('Utilisateur connecté:', currentSession?.user?.email);
      }
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token rafraîchi');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      setUser(data.user);
      setSession(data.session);
      
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur déconnexion';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inscription';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      setSession(data.session);
      setUser(data.session?.user ?? null);
      return { success: true };
    } catch (err) {
      console.error('Erreur rafraîchissement session:', err);
      return { success: false };
    }
  };

  return {
    user,
    session,
    loading,
    error,
    isAuthenticated: !!user && !!session,
    login,
    logout,
    signUp,
    refreshSession,
  };
};