import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { router } from 'expo-router';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Update last_login when user signs in
      if (session?.user) {
        await supabase
          .from('accounts')
          .update({ last_login: new Date().toISOString() })
          .eq('user_id', session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user && !loading) {
      router.replace('/auth/login');
    }
  }, [user, loading]);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      console.log('1. Iniciando proceso de registro...');

      // First, create the auth user in Supabase
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError || !authData.user) {
        console.error('Error en autenticación:', signUpError);
        throw signUpError || new Error('No se pudo crear el usuario');
      }

      console.log('2. Usuario autenticado:', authData);

      // Then insert into users table using the auth user's ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id, // Usar el ID de auth
            email,
            username,
          },
        ])
        .select()
        .single();

      if (userError) {
        console.error('Error al crear usuario en tabla users:', userError);
        // If users table insert fails, we should delete the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw userError;
      }

      console.log('3. Usuario creado en tabla users:', userData);

      // Finally create account record
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .insert([
          {
            user_id: authData.user.id,
            username,
            email,
            password: await hashPassword(password),
            last_login: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (accountError) {
        console.error('Error al crear cuenta:', accountError);
        // If account creation fails, delete everything
        await supabase
          .from('users')
          .delete()
          .eq('id', authData.user.id);
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw accountError;
      }

      console.log('4. Cuenta creada exitosamente:', accountData);
      return accountData;

    } catch (error) {
      console.error('Error en el proceso de registro:', error);
      throw error;
    }
  };

  // Función para hashear la contraseña
  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Primero autenticamos con Supabase
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (user) {
        // Actualizamos last_login en la tabla accounts
        const { error: updateError } = await supabase
          .from('accounts')
          .update({ 
            last_login: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error actualizando last_login:', updateError);
        }
      }
    } catch (error) {
      console.error('Error en inicio de sesión:', error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
