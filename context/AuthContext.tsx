import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { router } from 'expo-router';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            email: email,
          },
        },
      });

      if (error) throw error;

      // Iniciar sesión automáticamente después del registro
      if (data?.user) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      alert(error.message);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Intentando iniciar sesión...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Error de inicio de sesión:', error.message);
        throw error;
      }

      console.log('Inicio de sesión exitoso:', data);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Error en inicio de sesión:', error.message);
      alert('Error al iniciar sesión: ' + error.message);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/auth/login');
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      alert(error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        signUp,
        signIn,
        signOut,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
