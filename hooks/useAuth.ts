// hooks/useAuth.ts
'use client';
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        throw error;
      }
      
      // Redirect to dashboard on successful login
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Failed to logout. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (err: any) {
      console.error('Auth check error:', err);
      setError(err.message || 'Authentication check failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    login,
    logout,
    checkAuth,
    loading,
    error
  };
}