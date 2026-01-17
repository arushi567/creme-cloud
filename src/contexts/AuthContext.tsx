// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Role = 'admin' | 'customer';
interface Profile {
  id: string;
  name: string;
  email: string;
  role: Role; 
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, name: string, role: Role) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error during session initialization:", error);
      } finally {
        setLoading(false);
      }
    };
    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);


  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (profileError) throw profileError;

      const { data: roleData, error: roleError } = await supabase.from('user_roles').select('role').eq('user_id', userId).single();
      if (roleError) console.warn('Could not fetch user role.', roleError);
      
      setProfile({ ...profileData, role: roleData?.role || 'customer' });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: Role) => {
    const { error } = await supabase.auth.signUp({
      email, password, options: { data: { name, role } },
    });
    if (error) toast.error(error.message);
    else toast.success('Account created successfully!');
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
    else toast.success('Welcome back!');
    return { error };
  };

  const signOut = async () => { await supabase.auth.signOut(); };
  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, isAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};