// lib/api-service.ts - with null check fixes
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { Expense } from '@/types/expense';
import { Income } from '@/types/income';
import { User } from '@supabase/supabase-js';

// Initialize Supabase client (with error handling)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Utility function to get user from authorization token
export async function getUserFromToken(req: NextRequest): Promise<{ user: User | null; error: string | null }> {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return { user: null, error: 'Authorization token required' };
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { user: null, error: error?.message || 'Unauthorized access' };
    }

    return { user, error: null };
  } catch (error: any) {
    console.error('Auth error:', error.message);
    return { user: null, error: 'Authentication failed' };
  }
}

// Common error handler
export function handleApiError(error: any, defaultMessage: string = 'Internal Server Error') {
  console.error(`API error: ${error.message || error}`);
  const statusCode = error.statusCode || 500;
  const message = error.message || defaultMessage;
  
  return NextResponse.json({ error: message }, { status: statusCode });
}

// Reusable API response helper
export function createApiResponse<T>(data: T, statusCode: number = 200) {
  return NextResponse.json(data, { status: statusCode });
}

// Income CRUD operations
export const incomeService = {
  // Get all income records for a user
  async getAll(userId: string) {
    try {
      const { data, error } = await supabase
        .from('income')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw { message: error.message, statusCode: 500 };
      
      return { data: data as Income[], error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  // Create a new income record
  async create(userId: string, incomeData: { amount: number; description?: string; date: string }) {
    try {
      const { data, error } = await supabase
        .from('income')
        .insert([{ ...incomeData, user_id: userId }])
        .select();

      if (error) throw { message: error.message, statusCode: 500 };
      if (!data || data.length === 0) throw { message: 'Failed to create income record', statusCode: 500 };

      return { data: data[0] as Income, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  // Update an income record
  async update(userId: string, id: string, incomeData: { amount: number; description?: string; date: string }) {
    try {
      const { data, error } = await supabase
        .from('income')
        .update(incomeData)
        .eq('id', id)
        .eq('user_id', userId)
        .select();

      if (error) throw { message: error.message, statusCode: 500 };
      if (!data || data.length === 0) throw { message: 'Income record not found', statusCode: 404 };

      return { data: data[0] as Income, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  // Delete an income record
  async delete(userId: string, id: string) {
    try {
      const { error } = await supabase
        .from('income')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw { message: error.message, statusCode: 500 };

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error };
    }
  }
};

// Expense CRUD operations
export const expenseService = {
  // Get all expense records for a user
  async getAll(userId: string) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw { message: error.message, statusCode: 500 };
      
      return { data: data as Expense[], error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  // Create a new expense record
  async create(userId: string, expenseData: { amount: number; category: string; description?: string; date: string }) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{ ...expenseData, user_id: userId }])
        .select();

      if (error) throw { message: error.message, statusCode: 500 };
      if (!data || data.length === 0) throw { message: 'Failed to create expense record', statusCode: 500 };

      return { data: data[0] as Expense, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  // Update an expense record
  async update(userId: string, id: string, expenseData: { amount: number; category: string; description?: string; date: string }) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(expenseData)
        .eq('id', id)
        .eq('user_id', userId)
        .select();

      if (error) throw { message: error.message, statusCode: 500 };
      if (!data || data.length === 0) throw { message: 'Expense record not found', statusCode: 404 };

      return { data: data[0] as Expense, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  // Delete an expense record
  async delete(userId: string, id: string) {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw { message: error.message, statusCode: 500 };

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error };
    }
  }
};

// Validation utilities
export function validateIncomeData(data: any) {
  // Basic field validation
  if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
    return { valid: false, error: 'Valid amount is required' };
  }
  
  if (!data.date || typeof data.date !== 'string' || !isValidDate(data.date)) {
    return { valid: false, error: 'Valid date is required (YYYY-MM-DD)' };
  }

  // Optional field validation
  if (data.description && typeof data.description !== 'string') {
    return { valid: false, error: 'Description must be a string' };
  }

  return { valid: true, error: null };
}

export function validateExpenseData(data: any) {
  // Basic field validation
  if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
    return { valid: false, error: 'Valid amount is required' };
  }
  
  if (!data.category || typeof data.category !== 'string' || data.category.trim() === '') {
    return { valid: false, error: 'Category is required' };
  }
  
  if (!data.date || typeof data.date !== 'string' || !isValidDate(data.date)) {
    return { valid: false, error: 'Valid date is required (YYYY-MM-DD)' };
  }

  // Optional field validation
  if (data.description && typeof data.description !== 'string') {
    return { valid: false, error: 'Description must be a string' };
  }

  return { valid: true, error: null };
}

// Helper function to validate date format
function isValidDate(dateString: string) {
  // Check if date string matches YYYY-MM-DD format
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  // Check if it's a valid date
  const date = new Date(dateString);
  const timestamp = date.getTime();
  if (isNaN(timestamp)) return false;
  
  return date.toISOString().slice(0, 10) === dateString;
}