// utils/notification.ts
import { Dispatch, SetStateAction } from 'react';

/**
 * Display a notification message for a set duration
 * @param setNotification State setter function for notification
 * @param type Type of notification ('success', 'error', etc.)
 * @param message Message to display
 * @param duration Duration in ms to show the notification (default: 3000ms)
 */
export const showNotification = (
  setNotification: Dispatch<SetStateAction<{ type: string; message: string } | null>>,
  type: string,
  message: string,
  duration: number = 3000
) => {
  setNotification({ type, message });
  setTimeout(() => setNotification(null), duration);
};

// utils/formatters.ts
/**
 * Format a number as currency
 * @param amount Number to format
 * @param currency Currency symbol (default: '$')
 * @param decimals Number of decimal places (default: 2)
 */
export const formatCurrency = (
  amount: number, 
  currency: string = '$', 
  decimals: number = 2
): string => {
  return `${currency}${amount.toFixed(decimals)}`;
};

/**
 * Format a date string into a more user-friendly format
 * @param dateString ISO date string
 * @param format Format style ('short', 'medium', 'long')
 */
export const formatDate = (
  dateString: string,
  format: 'short' | 'medium' | 'long' = 'medium'
): string => {
  try {
    const date = new Date(dateString);
    
    if (format === 'short') {
      return date.toLocaleDateString();
    } else if (format === 'medium') {
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } else {
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      });
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

// utils/calculations.ts
import { Expense } from '@/types/expense';
import { Income } from '@/types/income';

/**
 * Calculate totals for income, expenses, and balance
 */
export const calculateTotals = (income: Income[], expenses: Expense[]) => {
  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpenses;
  
  return { totalIncome, totalExpenses, balance };
};

/**
 * Calculate monthly totals based on current month
 */
export const calculateMonthlyTotals = (income: Income[], expenses: Expense[], month?: string) => {
  // Use current month if not specified
  const targetMonth = month || new Date().toISOString().slice(0, 7);
  
  const monthlyIncome = income
    .filter((i) => i.date.startsWith(targetMonth))
    .reduce((sum, i) => sum + i.amount, 0);
    
  const monthlyExpenses = expenses
    .filter((e) => e.date.startsWith(targetMonth))
    .reduce((sum, e) => sum + e.amount, 0);
    
  const monthlyBalance = monthlyIncome - monthlyExpenses;
  
  return { monthlyIncome, monthlyExpenses, monthlyBalance };
};

/**
 * Group expenses by category
 */
export const groupExpensesByCategory = (expenses: Expense[]) => {
  const grouped: { [key: string]: number } = {};
  
  expenses.forEach((expense) => {
    const { category, amount } = expense;
    grouped[category] = (grouped[category] || 0) + amount;
  });
  
  return grouped;
};