// hooks/useTransactions.ts
import { useState, useCallback, useReducer } from 'react';
import { supabase } from '@/lib/supabase';
import { Expense } from '@/types/expense';
import { Income } from '@/types/income';

type TransactionsState = {
  income: Income[];
  expenses: Expense[];
  loading: boolean;
  error: string | null;
};

type TransactionsAction = 
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; income: Income[]; expenses: Expense[] }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'ADD_INCOME'; income: Income }
  | { type: 'ADD_EXPENSE'; expense: Expense }
  | { type: 'UPDATE_INCOME'; income: Income }
  | { type: 'UPDATE_EXPENSE'; expense: Expense }
  | { type: 'DELETE_INCOME'; id: string }
  | { type: 'DELETE_EXPENSE'; id: string };

const initialState: TransactionsState = {
  income: [],
  expenses: [],
  loading: true,
  error: null
};

function transactionsReducer(state: TransactionsState, action: TransactionsAction): TransactionsState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { 
        ...state, 
        income: action.income, 
        expenses: action.expenses, 
        loading: false 
      };
    case 'FETCH_ERROR':
      return { ...state, error: action.error, loading: false };
    case 'ADD_INCOME':
      return { 
        ...state, 
        income: [action.income, ...state.income].sort((a, b) => b.date.localeCompare(a.date)) 
      };
    case 'ADD_EXPENSE':
      return { 
        ...state, 
        expenses: [action.expense, ...state.expenses].sort((a, b) => b.date.localeCompare(a.date)) 
      };
    case 'UPDATE_INCOME':
      return { 
        ...state, 
        income: state.income
          .map(item => item.id === action.income.id ? action.income : item)
          .sort((a, b) => b.date.localeCompare(a.date)) 
      };
    case 'UPDATE_EXPENSE':
      return { 
        ...state, 
        expenses: state.expenses
          .map(item => item.id === action.expense.id ? action.expense : item)
          .sort((a, b) => b.date.localeCompare(a.date)) 
      };
    case 'DELETE_INCOME':
      return { 
        ...state, 
        income: state.income.filter(item => item.id !== action.id) 
      };
    case 'DELETE_EXPENSE':
      return { 
        ...state, 
        expenses: state.expenses.filter(item => item.id !== action.id) 
      };
    default:
      return state;
  }
}

export function useTransactions() {
  const [state, dispatch] = useReducer(transactionsReducer, initialState);

  // Get auth session
  const getAuthSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      throw new Error('Not authenticated');
    }
    return session;
  };

  // Fetch all transactions
  const fetchTransactions = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    
    try {
      const session = await getAuthSession();
      
      // Fetch income and expenses in parallel
      const [incomeRes, expensesRes] = await Promise.all([
        fetch('/api/incomes', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch('/api/expenses', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ]);

      if (!incomeRes.ok || !expensesRes.ok) {
        throw new Error('Failed to fetch transaction data');
      }

      const income = await incomeRes.json();
      const expenses = await expensesRes.json();
      
      dispatch({ type: 'FETCH_SUCCESS', income, expenses });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      dispatch({ type: 'FETCH_ERROR', error: 'Failed to load data' });
    }
  }, []);

  // Add new income
  const addIncome = useCallback(async (newIncome: Income) => {
    dispatch({ type: 'ADD_INCOME', income: newIncome });
  }, []);

  // Add new expense
  const addExpense = useCallback(async (newExpense: Expense) => {
    dispatch({ type: 'ADD_EXPENSE', expense: newExpense });
  }, []);

  // Delete income
  const deleteIncome = useCallback(async (id: string) => {
    try {
      const session = await getAuthSession();
      
      const response = await fetch(`/api/incomes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete income');
      }

      dispatch({ type: 'DELETE_INCOME', id });
    } catch (error) {
      console.error('Error deleting income:', error);
      throw error;
    }
  }, []);

  // Delete expense
  const deleteExpense = useCallback(async (id: string) => {
    try {
      const session = await getAuthSession();
      
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete expense');
      }

      dispatch({ type: 'DELETE_EXPENSE', id });
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }, []);

  // Update income
  const updateIncome = useCallback(async (updatedIncome: Income) => {
    try {
      const session = await getAuthSession();
      
      const response = await fetch(`/api/incomes/${updatedIncome.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          amount: updatedIncome.amount,
          description: updatedIncome.description,
          date: updatedIncome.date,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update income');
      }

      const updatedData = await response.json();
      dispatch({ type: 'UPDATE_INCOME', income: updatedData });
    } catch (error) {
      console.error('Error updating income:', error);
      throw error;
    }
  }, []);

  // Update expense
  const updateExpense = useCallback(async (updatedExpense: Expense) => {
    try {
      const session = await getAuthSession();
      
      const response = await fetch(`/api/expenses/${updatedExpense.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          amount: updatedExpense.amount,
          category: updatedExpense.category,
          description: updatedExpense.description,
          date: updatedExpense.date,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update expense');
      }

      const updatedData = await response.json();
      dispatch({ type: 'UPDATE_EXPENSE', expense: updatedData });
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }, []);

  return {
    income: state.income,
    expenses: state.expenses,
    loading: state.loading,
    error: state.error,
    fetchTransactions,
    addIncome,
    addExpense,
    deleteIncome,
    deleteExpense,
    updateIncome,
    updateExpense
  };
}