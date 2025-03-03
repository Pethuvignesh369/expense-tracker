// services/api.ts
import { supabase } from '@/lib/supabase';
import { Expense, ExpenseRequestBody } from '@/types/expense';
import { Income, IncomeRequestBody } from '@/types/income';

/**
 * Get authenticated session
 */
export const getAuthSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    throw new Error('Authentication required');
  }
  
  return session;
};

/**
 * Base fetch wrapper with authentication
 */
const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const session = await getAuthSession();
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...options.headers,
    };
    
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Income API methods
 */
export const incomeApi = {
  // Get all income records
  getAll: async (): Promise<Income[]> => {
    return apiFetch<Income[]>('/api/incomes');
  },
  
  // Add new income
  add: async (data: IncomeRequestBody): Promise<Income> => {
    return apiFetch<Income>('/api/incomes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Update income
  update: async (id: string, data: IncomeRequestBody): Promise<Income> => {
    return apiFetch<Income>(`/api/incomes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Delete income
  delete: async (id: string): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/api/incomes/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Expense API methods
 */
export const expenseApi = {
  // Get all expense records
  getAll: async (): Promise<Expense[]> => {
    return apiFetch<Expense[]>('/api/expenses');
  },
  
  // Add new expense
  add: async (data: ExpenseRequestBody): Promise<Expense> => {
    return apiFetch<Expense>('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Update expense
  update: async (id: string, data: ExpenseRequestBody): Promise<Expense> => {
    return apiFetch<Expense>(`/api/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Delete expense
  delete: async (id: string): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/api/expenses/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Authentication API methods
 */
export const authApi = {
  // Login
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },
  
  // Logout
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },
};