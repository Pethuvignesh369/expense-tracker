'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlusCircle, FiEdit2, FiTrash2, FiLogOut, FiDollarSign, FiCreditCard, FiPieChart, FiArrowUpRight, FiArrowDownRight, FiCalendar } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import BalanceGraph from '@/components/BalanceGraph';
import { Expense } from '@/types/expense';
import { Income } from '@/types/income';
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

// Only import formatters if the files exist, otherwise define inline formatters
let formatIndianCurrency: (amount: number, showSymbol?: boolean, decimals?: number) => string;
let formatDate: (dateString: string, format?: 'short' | 'medium' | 'long') => string;

try {
  const formatters = require('@/utils/formatters');
  formatIndianCurrency = formatters.formatIndianCurrency;
  formatDate = formatters.formatDate;
} catch (e) {
  // Fallback formatters if the imports fail
  formatIndianCurrency = (amount: number, showSymbol: boolean = true, decimals: number = 2): string => {
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

  formatDate = (dateString: string, format: 'short' | 'medium' | 'long' = 'medium'): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };
}

export default function Dashboard() {
  const [income, setIncome] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showIncomeSuccess, setShowIncomeSuccess] = useState<boolean>(false);
  const [showExpenseSuccess, setShowExpenseSuccess] = useState<boolean>(false);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState<boolean>(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('Session error:', sessionError?.message);
        setLoading(false);
        return;
      }

      const [incomeRes, expensesRes] = await Promise.all([
        fetch('/api/incomes', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch('/api/expenses', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ]);

      if (!incomeRes.ok || !expensesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      setIncome(await incomeRes.json());
      setExpenses(await expensesRes.json());
    } catch (error) {
      console.error('Unexpected error fetching data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleIncomeAdded = (newIncome: Income) => {
    setIncome((prev) => [newIncome, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
    setShowIncomeSuccess(true);
    setIsIncomeDialogOpen(false);
    setTimeout(() => setShowIncomeSuccess(false), 3000); // Hide after 3 seconds
  };

  const handleExpenseAdded = (newExpense: Expense) => {
    setExpenses((prev) => [newExpense, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
    setShowExpenseSuccess(true);
    setIsExpenseDialogOpen(false);
    setTimeout(() => setShowExpenseSuccess(false), 3000); // Hide after 3 seconds
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const handleDeleteIncome = async (id: string) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error('Not logged in');

      const response = await fetch(`/api/incomes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Delete income error:', errorData);
        alert(`Failed to delete income: ${errorData.error}`);
        return;
      }

      setIncome((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Unexpected error deleting income:', error);
      alert('An error occurred while deleting income');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error('Not logged in');

      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Delete expense error:', errorData);
        alert(`Failed to delete expense: ${errorData.error}`);
        return;
      }

      setExpenses((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Unexpected error deleting expense:', error);
      alert('An error occurred while deleting expense');
    }
  };

  const handleUpdateIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIncome) return;

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error('Not logged in');

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

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update income error:', errorData);
        alert(`Failed to update income: ${errorData.error}`);
        return;
      }

      const updatedIncome = await response.json();
      setIncome((prev) =>
        prev
          .map((item) => (item.id === updatedIncome.id ? updatedIncome : item))
          .sort((a, b) => b.date.localeCompare(a.date))
      );
      setEditingIncome(null);
    } catch (error) {
      console.error('Unexpected error updating income:', error);
      alert('An error occurred while updating income');
    }
  };

  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error('Not logged in');

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

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update expense error:', errorData);
        alert(`Failed to update expense: ${errorData.error}`);
        return;
      }

      const updatedExpense = await response.json();
      setExpenses((prev) =>
        prev
          .map((item) => (item.id === updatedExpense.id ? updatedExpense : item))
          .sort((a, b) => b.date.localeCompare(a.date))
      );
      setEditingExpense(null);
    } catch (error) {
      console.error('Unexpected error updating expense:', error);
      alert('An error occurred while updating expense');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-blue-700 font-medium">Loading your financial data...</p>
      </div>
    </div>
  );

  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : "0";

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyIncome = income
    .filter((i) => i.date.startsWith(currentMonth))
    .reduce((sum, i) => sum + i.amount, 0);
  const monthlyExpenses = expenses
    .filter((e) => e.date.startsWith(currentMonth))
    .reduce((sum, e) => sum + e.amount, 0);
  const monthlyBalance = monthlyIncome - monthlyExpenses;

  // Group expenses by category for the current month
  const expensesByCategory: Record<string, number> = {};
  expenses
    .filter(e => e.date.startsWith(currentMonth))
    .forEach(expense => {
      expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + expense.amount;
    });

  // Get top expense categories
  const topCategories = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 pb-4 border-b border-blue-200"
        >
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
            Personal Finance Tracker
          </h1>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <FiLogOut /> Logout
          </Button>
        </motion.div>

        {/* Main Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-8"
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
                    {formatIndianCurrency(monthlyBalance)}
                  </h2>
                  <p className="text-blue-100">Net Balance</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Income</span>
                    <span className="font-semibold text-green-300 flex items-center">
                      <FiArrowUpRight className="mr-1" />
                      {formatIndianCurrency(monthlyIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Expenses</span>
                    <span className="font-semibold text-red-300 flex items-center">
                      <FiArrowDownRight className="mr-1" />
                      {formatIndianCurrency(monthlyExpenses)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Savings Rate</span>
                    <span className="font-semibold">
                      {savingsRate}%
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-blue-100">Top Expense Categories</p>
                  <div className="space-y-1">
                    {topCategories.length > 0 ? (
                      topCategories.map(([category, amount]) => (
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                    <FiDollarSign className="h-5 w-5" />
                  </div>
                  <span className="text-gray-700">Monthly Income</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{formatIndianCurrency(monthlyIncome)}</p>
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
                <p className="text-3xl font-bold text-red-600">{formatIndianCurrency(monthlyExpenses)}</p>
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
                <p className={`text-3xl font-bold ${monthlyBalance >= 0 ? "text-blue-600" : "text-red-600"}`}>
                  {formatIndianCurrency(monthlyBalance)}
                </p>
                <p className="text-sm text-gray-500">Current Month</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div 
          className="flex flex-wrap gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2 px-5 py-6 rounded-lg">
                <FiPlusCircle className="h-5 w-5" /> Add Income
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold text-center">Add Income</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const amount = parseFloat(formData.get('amount') as string);
                  const description = formData.get('description') as string;
                  const date = formData.get('date') as string;

                  try {
                    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                    if (sessionError || !session) throw new Error('Not logged in');

                    const response = await fetch('/api/incomes', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.access_token}`,
                      },
                      body: JSON.stringify({ amount, description, date }),
                    });

                    if (!response.ok) {
                      const errorData = await response.json();
                      console.error('API error:', errorData);
                      alert(`Failed to add income: ${errorData.error}`);
                      return;
                    }

                    const newIncome = await response.json();
                    handleIncomeAdded(newIncome);
                  } catch (error) {
                    console.error('Unexpected error adding income:', error);
                    alert('An error occurred while adding income');
                  }
                }}
                className="space-y-5"
              >
                <div>
                  <Label htmlFor="amount" className="text-gray-700">Amount (₹)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 50000"
                    required
                    className="mt-1 p-3 h-12 text-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all rounded-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-gray-700">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    type="text"
                    placeholder="e.g., Salary"
                    className="mt-1 p-3 h-12 text-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all rounded-lg"
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
                    className="mt-1 p-3 h-12 text-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all rounded-lg"
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
              <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2 px-5 py-6 rounded-lg">
                <FiPlusCircle className="h-5 w-5" /> Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold text-center">Add Expense</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const amount = parseFloat(formData.get('amount') as string);
                  const category = formData.get('category') as string;
                  const description = formData.get('description') as string;
                  const date = formData.get('date') as string;

                  try {
                    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                    if (sessionError || !session) throw new Error('Not logged in');

                    const response = await fetch('/api/expenses', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.access_token}`,
                      },
                      body: JSON.stringify({ amount, category, description, date }),
                    });

                    if (!response.ok) {
                      const errorData = await response.json();
                      console.error('API error:', errorData);
                      alert(`Failed to add expense: ${errorData.error}`);
                      return;
                    }

                    const newExpense = await response.json();
                    handleExpenseAdded(newExpense);
                  } catch (error) {
                    console.error('Unexpected error adding expense:', error);
                    alert('An error occurred while adding expense');
                  }
                }}
                className="space-y-5"
              >
                <div>
                  <Label htmlFor="amount" className="text-gray-700">Amount (₹)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 5000"
                    required
                    className="mt-1 p-3 h-12 text-lg border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 transition-all rounded-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-gray-700">Category</Label>
                  <Select name="category" defaultValue="Food">
                    <SelectTrigger className="mt-1 p-3 h-12 text-lg border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 transition-all rounded-lg">
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
                    className="mt-1 p-3 h-12 text-lg border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 transition-all rounded-lg"
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
                    className="mt-1 p-3 h-12 text-lg border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 transition-all rounded-lg"
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

        {/* Success Notifications */}
        <AnimatePresence>
          {showIncomeSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert className="mb-4 bg-green-50 border-green-200 shadow-md">
                <AlertTitle className="text-green-800 font-semibold flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Success!
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  Income added successfully!
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {showExpenseSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert className="mb-4 bg-green-50 border-green-200 shadow-md">
                <AlertTitle className="text-green-800 font-semibold flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Success!
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  Expense added successfully!
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chart Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card className="bg-white shadow-lg p-4">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Financial Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <BalanceGraph expenses={expenses} income={income} useRupees={true} />
              </div>
            </CardContent>
          </Card>
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
                    <FiDollarSign className="h-4 w-4" />
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
                            <td className="px-4 py-3 text-sm text-gray-900">{formatDate(item.date, 'short')}</td>
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
                            <td className="px-4 py-3 text-sm text-gray-900">{formatDate(item.date, 'short')}</td>
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
                    className="mt-1 p-3 h-12 text-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all rounded-lg"
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
                    className="mt-1 p-3 h-12 text-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all rounded-lg"
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
                    className="mt-1 p-3 h-12 text-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all rounded-lg"
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
        )}

        {editingExpense && (
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
                    className="mt-1 p-3 h-12 text-lg border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 transition-all rounded-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="expense-category" className="text-gray-700">Category</Label>
                  <Select 
                    value={editingExpense.category}
                    onValueChange={(value) => setEditingExpense({ ...editingExpense, category: value })}
                  >
                    <SelectTrigger className="mt-1 p-3 h-12 text-lg border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 transition-all rounded-lg">
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
                    className="mt-1 p-3 h-12 text-lg border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 transition-all rounded-lg"
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
                    className="mt-1 p-3 h-12 text-lg border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 transition-all rounded-lg"
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