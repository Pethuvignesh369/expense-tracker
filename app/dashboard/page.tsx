'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlusCircle, 
  FiEdit2, 
  FiTrash2, 
  FiLogOut, 
  FiCreditCard, 
  FiPieChart, 
  FiArrowUpRight, 
  FiArrowDownRight, 
  FiCalendar 
} from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import { Expense } from '@/types/expense';
import { Income } from '@/types/income';
import { RupeeSvg } from '@/components/RupeeSvg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type NotificationType = {
  type: 'income' | 'expense';
  action: 'add' | 'update' | 'delete';
  show: boolean;
} | null;

export default function Dashboard() {
  // State
  const [income, setIncome] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [notifications, setNotifications] = useState<NotificationType>(null);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState<boolean>(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState<boolean>(false);

  // Formatters
  const formatIndianCurrency = (amount: number, showSymbol: boolean = true, decimals: number = 2): string => {
    try {
      const formatter = new Intl.NumberFormat('en-IN', {
        style: showSymbol ? 'currency' : 'decimal',
        currency: 'INR',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
      return formatter.format(amount);
    } catch (e) {
      return showSymbol ? '₹' + amount.toFixed(decimals) : amount.toFixed(decimals);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  // Auth Session
  const getAuthSession = useCallback(async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Not authenticated');
      }
      return session;
    } catch (error) {
      console.error('Session error:', error);
      throw error;
    }
  }, []);

  // Fetch Data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const session = await getAuthSession();
      
      // Fetch both resources in parallel
      const [incomeRes, expensesRes] = await Promise.all([
        fetch('/api/incomes', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch('/api/expenses', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ]);

      if (!incomeRes.ok || !expensesRes.ok) {
        throw new Error(`Failed to fetch data`);
      }

      const incomeData = await incomeRes.json();
      const expensesData = await expensesRes.json();

      setIncome(incomeData);
      setExpenses(expensesData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError('Failed to load your financial data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [getAuthSession]);

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Notification helper
  const showNotification = useCallback((type: 'income' | 'expense', action: 'add' | 'update' | 'delete') => {
    setNotifications({ type, action, show: true });
    setTimeout(() => setNotifications(null), 3000);
  }, []);

  // Income operations
  const handleIncomeAdded = useCallback((newIncome: Income) => {
    setIncome(prev => [newIncome, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
    setIsIncomeDialogOpen(false);
    showNotification('income', 'add');
  }, [showNotification]);

  const handleIncomeUpdated = useCallback((updatedIncome: Income) => {
    setIncome(prev => prev.map(item => item.id === updatedIncome.id ? updatedIncome : item)
      .sort((a, b) => b.date.localeCompare(a.date)));
    setEditingIncome(null);
    showNotification('income', 'update');
  }, [showNotification]);

  const handleDeleteIncome = useCallback(async (id: string) => {
    try {
      const session = await getAuthSession();
      const response = await fetch(`/api/incomes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) throw new Error('Failed to delete income');
      setIncome(prev => prev.filter(item => item.id !== id));
      showNotification('income', 'delete');
    } catch (error) {
      console.error('Error deleting income:', error);
      setError('Failed to delete income. Please try again.');
    }
  }, [getAuthSession, showNotification]);

  // Expense operations
  const handleExpenseAdded = useCallback((newExpense: Expense) => {
    setExpenses(prev => [newExpense, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
    setIsExpenseDialogOpen(false);
    showNotification('expense', 'add');
  }, [showNotification]);

  const handleExpenseUpdated = useCallback((updatedExpense: Expense) => {
    setExpenses(prev => prev.map(item => item.id === updatedExpense.id ? updatedExpense : item)
      .sort((a, b) => b.date.localeCompare(a.date)));
    setEditingExpense(null);
    showNotification('expense', 'update');
  }, [showNotification]);

  const handleDeleteExpense = useCallback(async (id: string) => {
    try {
      const session = await getAuthSession();
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) throw new Error('Failed to delete expense');
      setExpenses(prev => prev.filter(item => item.id !== id));
      showNotification('expense', 'delete');
    } catch (error) {
      console.error('Error deleting expense:', error);
      setError('Failed to delete expense. Please try again.');
    }
  }, [getAuthSession, showNotification]);

  // Form handlers
  const handleSubmitIncomeForm = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const amount = parseFloat(formData.get('amount') as string);
      const description = formData.get('description') as string;
      const date = formData.get('date') as string;

      if (!amount || !date) {
        throw new Error('Amount and date are required');
      }
      
      const session = await getAuthSession();
      const response = await fetch('/api/incomes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ amount, description, date }),
      });

      if (!response.ok) throw new Error('Failed to add income');
      const newIncome = await response.json();
      handleIncomeAdded(newIncome);
    } catch (error: any) {
      console.error('Error adding income:', error);
      setError('Failed to add income. Please check your inputs and try again.');
    }
  }, [getAuthSession, handleIncomeAdded]);

  const handleSubmitExpenseForm = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const amount = parseFloat(formData.get('amount') as string);
      const category = formData.get('category') as string;
      const description = formData.get('description') as string;
      const date = formData.get('date') as string;

      if (!amount || !category || !date) {
        throw new Error('Amount, category, and date are required');
      }
      
      const session = await getAuthSession();
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ amount, category, description, date }),
      });

      if (!response.ok) throw new Error('Failed to add expense');
      const newExpense = await response.json();
      handleExpenseAdded(newExpense);
    } catch (error: any) {
      console.error('Error adding expense:', error);
      setError('Failed to add expense. Please check your inputs and try again.');
    }
  }, [getAuthSession, handleExpenseAdded]);

  const handleUpdateIncome = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIncome) return;

    try {
      const session = await getAuthSession();
      const response = await fetch(`/api/incomes/${editingIncome.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          amount: editingIncome.amount,
          description: editingIncome.description,
          date: editingIncome.date,
        }),
      });

      if (!response.ok) throw new Error('Failed to update income');
      const updatedIncome = await response.json();
      handleIncomeUpdated(updatedIncome);
    } catch (error: any) {
      console.error('Error updating income:', error);
      setError('Failed to update income. Please try again.');
    }
  }, [editingIncome, getAuthSession, handleIncomeUpdated]);

  const handleUpdateExpense = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    try {
      const session = await getAuthSession();
      const response = await fetch(`/api/expenses/${editingExpense.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          amount: editingExpense.amount,
          category: editingExpense.category,
          description: editingExpense.description,
          date: editingExpense.date,
        }),
      });

      if (!response.ok) throw new Error('Failed to update expense');
      const updatedExpense = await response.json();
      handleExpenseUpdated(updatedExpense);
    } catch (error: any) {
      console.error('Error updating expense:', error);
      setError('Failed to update expense. Please try again.');
    }
  }, [editingExpense, getAuthSession, handleExpenseUpdated]);

  // Logout
  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to log out. Please try again.');
    }
  }, []);

  // Financial data calculations
  const financialData = useMemo(() => {
    // Calculate totals
    const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : "0";

    // Monthly totals
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyIncome = income.filter(i => i.date.startsWith(currentMonth)).reduce((sum, i) => sum + i.amount, 0);
    const monthlyExpenses = expenses.filter(e => e.date.startsWith(currentMonth)).reduce((sum, e) => sum + e.amount, 0);
    const monthlyBalance = monthlyIncome - monthlyExpenses;

    // Categories
    const expensesByCategory: Record<string, number> = {};
    expenses.filter(e => e.date.startsWith(currentMonth)).forEach(expense => {
      expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + expense.amount;
    });

    const topCategories = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]).slice(0, 3);

    return {
      totalIncome, totalExpenses, balance, savingsRate,
      monthlyIncome, monthlyExpenses, monthlyBalance,
      topCategories, currentMonth
    };
  }, [income, expenses]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-700 font-medium">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="max-w-lg w-full bg-white shadow-lg border-red-200">
          <CardHeader>
            <CardTitle className="text-xl text-red-600 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Error Loading Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">{error}</p>
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <FiLogOut className="h-4 w-4" /> Sign Out
              </Button>
              <Button 
                onClick={() => { setError(null); fetchData(); }}
                className="flex items-center gap-2"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 pb-4 border-b border-blue-200"
        >
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
            RupeeTracker
          </h1>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600"
          >
            <FiLogOut /> Logout
          </Button>
        </motion.div>

        {/* Notifications */}
        <AnimatePresence>
          {notifications && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="mb-4"
            >
              <Alert className="bg-green-50 border-green-200 shadow-md">
                <AlertTitle className="text-green-800 font-semibold flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Success!
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  {notifications.type === 'income' ? 'Income ' : 'Expense '}
                  {notifications.action === 'add' ? 'added' : notifications.action === 'update' ? 'updated' : 'deleted'} successfully!
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-blue-100 flex items-center gap-1">
                    <FiCalendar className="h-4 w-4" />
                    <span>Current Month</span>
                  </p>
                  <h2 className="text-3xl sm:text-4xl font-bold">
                    {formatIndianCurrency(financialData.monthlyBalance)}
                  </h2>
                  <p className="text-blue-100">Net Balance</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Income</span>
                    <span className="font-semibold text-green-300 flex items-center">
                      <FiArrowUpRight className="mr-1" />
                      {formatIndianCurrency(financialData.monthlyIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Expenses</span>
                    <span className="font-semibold text-red-300 flex items-center">
                      <FiArrowDownRight className="mr-1" />
                      {formatIndianCurrency(financialData.monthlyExpenses)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Savings Rate</span>
                    <span className="font-semibold">{financialData.savingsRate}%</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-blue-100">Top Expense Categories</p>
                  <div className="space-y-1">
                    {financialData.topCategories.length > 0 ? (
                      financialData.topCategories.map(([category, amount]) => (
                        <div key={category} className="flex justify-between items-center">
                          <span className="text-sm text-blue-100">{category}</span>
                          <span className="font-medium">{formatIndianCurrency(amount)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-blue-200">No expenses this month</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: 0.2,
              hover: { type: "spring", stiffness: 300 }
            }}
          >
            <Card className="bg-white shadow-lg overflow-hidden border border-green-100">
              <div className="h-2 bg-green-500"></div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <div className="bg-green-100 p-2 rounded-full text-green-600">
                    <RupeeSvg className="h-5 w-5" />
                  </div>
                  <span className="text-gray-700">Monthly Income</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{formatIndianCurrency(financialData.monthlyIncome)}</p>
                <p className="text-sm text-gray-500">Current Month</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: 0.3,
              hover: { type: "spring", stiffness: 300 }
            }}
          >
            <Card className="bg-white shadow-lg overflow-hidden border border-red-100">
              <div className="h-2 bg-red-500"></div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <div className="bg-red-100 p-2 rounded-full text-red-600">
                    <FiCreditCard className="h-5 w-5" />
                  </div>
                  <span className="text-gray-700">Monthly Expenses</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">{formatIndianCurrency(financialData.monthlyExpenses)}</p>
                <p className="text-sm text-gray-500">Current Month</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: 0.4,
              hover: { type: "spring", stiffness: 300 }
            }}
          >
            <Card className="bg-white shadow-lg overflow-hidden border border-blue-100">
              <div className="h-2 bg-blue-500"></div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                    <FiPieChart className="h-5 w-5" />
                  </div>
                  <span className="text-gray-700">Net Balance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${financialData.monthlyBalance >= 0 ? "text-blue-600" : "text-red-600"}`}>
                  {formatIndianCurrency(financialData.monthlyBalance)}
                </p>
                <p className="text-sm text-gray-500">Current Month</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div 
          className="flex flex-wrap gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg flex items-center gap-2 px-5 py-6 rounded-lg">
                <FiPlusCircle className="h-5 w-5" /> Add Income
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold text-center">Add Income</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitIncomeForm} className="space-y-5">
                <div>
                  <Label htmlFor="amount" className="text-gray-700">Amount (₹)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 50000"
                    required
                    className="mt-1 p-3 h-12 text-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-gray-700">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    type="text"
                    placeholder="e.g., Salary"
                    className="mt-1 p-3 h-12 text-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="date" className="text-gray-700">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required
                    className="mt-1 p-3 h-12 text-lg"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 rounded-lg"
                >
                  Add Income
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg flex items-center gap-2 px-5 py-6 rounded-lg">
                <FiPlusCircle className="h-5 w-5" /> Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold text-center">Add Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitExpenseForm} className="space-y-5">
                <div>
                  <Label htmlFor="amount" className="text-gray-700">Amount (₹)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 5000"
                    required
                    className="mt-1 p-3 h-12 text-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-gray-700">Category</Label>
                  <Select name="category" defaultValue="Food">
                    <SelectTrigger className="mt-1 p-3 h-12 text-lg">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Travel">Travel</SelectItem>
                      <SelectItem value="Medicine">Medicine</SelectItem>
                      <SelectItem value="Loans">Loans</SelectItem>
                      <SelectItem value="Rent">Rent</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Shopping">Shopping</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description" className="text-gray-700">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    type="text"
                    placeholder="e.g., Lunch"
                    className="mt-1 p-3 h-12 text-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="date" className="text-gray-700">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required
                    className="mt-1 p-3 h-12 text-lg"
                  />
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-3 rounded-lg"
                >
                  Add Expense
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Transactions Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Income Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <Card className="bg-white shadow-lg overflow-hidden border border-green-100">
              <div className="h-2 bg-green-500"></div>
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                  <div className="bg-green-100 p-1 rounded-full text-green-600">
                    <RupeeSvg className="h-4 w-4" />
                  </div>
                  Recent Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Description</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {income.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                            No income records found. Add your first income!
                          </td>
                        </tr>
                      ) : (
                        income.slice(0, 5).map((item) => (
                          <motion.tr 
                            key={item.id}
                            whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                            className="transition-colors"
                          >
                            <td className="px-4 py-3 text-sm text-gray-900">{formatDate(item.date)}</td>
                            <td className="px-4 py-3 text-sm font-medium text-green-600">
                              {formatIndianCurrency(item.amount)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">{item.description || '-'}</td>
                            <td className="px-4 py-3 text-right space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingIncome(item)}
                                className="hover:text-blue-600 hover:bg-blue-50"
                              >
                                <FiEdit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteIncome(item.id)}
                                className="hover:text-red-600 hover:bg-red-50"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {income.length > 5 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" className="text-green-600 hover:bg-green-50">
                      View All Income
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Expenses Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <Card className="bg-white shadow-lg overflow-hidden border border-red-100">
              <div className="h-2 bg-red-500"></div>
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                  <div className="bg-red-100 p-1 rounded-full text-red-600">
                    <FiCreditCard className="h-4 w-4" />
                  </div>
                  Recent Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Category</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Description</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {expenses.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                            No expense records found. Add your first expense!
                          </td>
                        </tr>
                      ) : (
                        expenses.slice(0, 5).map((item) => (
                          <motion.tr 
                            key={item.id}
                            whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                            className="transition-colors"
                          >
                            <td className="px-4 py-3 text-sm text-gray-900">{formatDate(item.date)}</td>
                            <td className="px-4 py-3 text-sm font-medium text-red-600">
                              {formatIndianCurrency(item.amount)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {item.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">{item.description || '-'}</td>
                            <td className="px-4 py-3 text-right space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingExpense(item)}
                                className="hover:text-blue-600 hover:bg-blue-50"
                              >
                                <FiEdit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteExpense(item.id)}
                                className="hover:text-red-600 hover:bg-red-50"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {expenses.length > 5 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" className="text-red-600 hover:bg-red-50">
                      View All Expenses
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Edit Dialogs */}
        {editingIncome && (
          <Dialog open={!!editingIncome} onOpenChange={() => setEditingIncome(null)}>
            <DialogContent className="bg-white rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold text-center">Edit Income</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateIncome} className="space-y-5">
                <div>
                  <Label htmlFor="income-amount" className="text-gray-700">Amount (₹)</Label>
                  <Input
                    id="income-amount"
                    type="number"
                    step="0.01"
                    value={editingIncome.amount}
                    onChange={(e) =>
                      setEditingIncome({ ...editingIncome, amount: parseFloat(e.target.value) })
                    }
                    required
                    className="mt-1 p-3 h-12 text-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="income-description" className="text-gray-700">Description</Label>
                  <Input
                    id="income-description"
                    type="text"
                    value={editingIncome.description || ''}
                    onChange={(e) =>
                      setEditingIncome({ ...editingIncome, description: e.target.value })
                    }
                    className="mt-1 p-3 h-12 text-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="income-date" className="text-gray-700">Date</Label>
                  <Input
                    id="income-date"
                    type="date"
                    value={editingIncome.date}
                    onChange={(e) =>
                      setEditingIncome({ ...editingIncome, date: e.target.value })
                    }
                    required
                    className="mt-1 p-3 h-12 text-lg"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setEditingIncome(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}{editingExpense && (
          <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
            <DialogContent className="bg-white rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold text-center">Edit Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateExpense} className="space-y-5">
                <div>
                  <Label htmlFor="expense-amount" className="text-gray-700">Amount (₹)</Label>
                  <Input
                    id="expense-amount"
                    type="number"
                    step="0.01"
                    value={editingExpense.amount}
                    onChange={(e) =>
                      setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) })
                    }
                    required
                    className="mt-1 p-3 h-12 text-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="expense-category" className="text-gray-700">Category</Label>
                  <Select 
                    value={editingExpense.category}
                    onValueChange={(value) => setEditingExpense({ ...editingExpense, category: value })}
                  >
                    <SelectTrigger className="mt-1 p-3 h-12 text-lg">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Travel">Travel</SelectItem>
                      <SelectItem value="Medicine">Medicine</SelectItem>
                      <SelectItem value="Loans">Loans</SelectItem>
                      <SelectItem value="Rent">Rent</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Shopping">Shopping</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expense-description" className="text-gray-700">Description</Label>
                  <Input
                    id="expense-description"
                    type="text"
                    value={editingExpense.description || ''}
                    onChange={(e) =>
                      setEditingExpense({ ...editingExpense, description: e.target.value })
                    }
                    className="mt-1 p-3 h-12 text-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="expense-date" className="text-gray-700">Date</Label>
                  <Input
                    id="expense-date"
                    type="date"
                    value={editingExpense.date}
                    onChange={(e) =>
                      setEditingExpense({ ...editingExpense, date: e.target.value })
                    }
                    required
                    className="mt-1 p-3 h-12 text-lg"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setEditingExpense(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}