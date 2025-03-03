'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlusCircle, FiEdit2, FiTrash2, FiLogOut, FiDollarSign, FiCreditCard, FiPieChart } from 'react-icons/fi';
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

export default function Dashboard() {
  const [income, setIncome] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showIncomeSuccess, setShowIncomeSuccess] = useState(false);
  const [showExpenseSuccess, setShowExpenseSuccess] = useState(false);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

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
        const incomeText = await incomeRes.text();
        const expensesText = await expensesRes.text();
        console.error('Income response:', incomeText);
        console.error('Expenses response:', expensesText);
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

  if (loading) return <div>Loading...</div>;

  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpenses;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyIncome = income
    .filter((i) => i.date.startsWith(currentMonth))
    .reduce((sum, i) => sum + i.amount, 0);
  const monthlyExpenses = expenses
    .filter((e) => e.date.startsWith(currentMonth))
    .reduce((sum, e) => sum + e.amount, 0);
  const monthlyBalance = monthlyIncome - monthlyExpenses;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800">Expense Tracker</h1>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2 hover:bg-red-50"
          >
            <FiLogOut /> Logout
          </Button>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="bg-white shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <FiDollarSign className="text-green-600" />
                  <span className="text-green-600">Monthly Income</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">${monthlyIncome.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Current Month</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="bg-white shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <FiCreditCard className="text-red-600" />
                  <span className="text-red-600">Monthly Expenses</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">${monthlyExpenses.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Current Month</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="bg-white shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <FiPieChart className={monthlyBalance >= 0 ? "text-blue-600" : "text-red-600"} />
                  <span className={monthlyBalance >= 0 ? "text-blue-600" : "text-red-600"}>
                    Net Balance
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">${monthlyBalance.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Current Month</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                <FiPlusCircle /> Add Income
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Income</DialogTitle>
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
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 5000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    type="text"
                    placeholder="e.g., Salary"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <Button type="submit">Add Income</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700 flex items-center gap-2">
                <FiPlusCircle /> Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Expense</DialogTitle>
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
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 50"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue="Food">
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Travel">Travel</SelectItem>
                      <SelectItem value="Medicine">Medicine</SelectItem>
                      <SelectItem value="Loans">Loans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    type="text"
                    placeholder="e.g., Lunch"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <Button type="submit">Add Expense</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Success Notifications */}
        <AnimatePresence>
          {showIncomeSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert className="mb-4 bg-green-50 border-green-200">
                <AlertTitle className="text-green-800">Success!</AlertTitle>
                <AlertDescription className="text-green-600">
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
              <Alert className="mb-4 bg-green-50 border-green-200">
                <AlertTitle className="text-green-800">Success!</AlertTitle>
                <AlertDescription className="text-green-600">
                  Expense added successfully!
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transactions Tables */}
        <div className="grid grid-cols-1 gap-8">
          {/* Income Table */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Recent Income</CardTitle>
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
                    {income.map((item) => (
                      <motion.tr 
                        key={item.id}
                        whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                      >
                        <td className="px-4 py-3 text-sm text-gray-900">{item.date}</td>
                        <td className="px-4 py-3 text-sm font-medium text-green-600">
                          ${item.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.description || '-'}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingIncome(item)}
                            className="hover:text-blue-600"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteIncome(item.id)}
                            className="hover:text-red-600"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Table - Similar structure as Income Table */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Recent Expenses</CardTitle>
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
                    {expenses.map((item) => (
                      <motion.tr 
                        key={item.id}
                        whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                      >
                        <td className="px-4 py-3 text-sm text-gray-900">{item.date}</td>
                        <td className="px-4 py-3 text-sm font-medium text-red-600">
                          ${item.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.category}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.description || '-'}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingExpense(item)}
                            className="hover:text-blue-600"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteExpense(item.id)}
                            className="hover:text-red-600"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Keep existing dialog components and graph */}
        <div className="mt-8">
          <BalanceGraph expenses={expenses} income={income} />
        </div>

        {/* Keep existing edit dialogs */}
        {editingIncome && (
          <Dialog open={!!editingIncome} onOpenChange={() => setEditingIncome(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Income</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateIncome} className="space-y-4">
                <div>
                  <Label htmlFor="income-amount">Amount</Label>
                  <Input
                    id="income-amount"
                    type="number"
                    step="0.01"
                    value={editingIncome.amount}
                    onChange={(e) =>
                      setEditingIncome({ ...editingIncome, amount: parseFloat(e.target.value) })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="income-description">Description</Label>
                  <Input
                    id="income-description"
                    type="text"
                    value={editingIncome.description || ''}
                    onChange={(e) =>
                      setEditingIncome({ ...editingIncome, description: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="income-date">Date</Label>
                  <Input
                    id="income-date"
                    type="date"
                    value={editingIncome.date}
                    onChange={(e) =>
                      setEditingIncome({ ...editingIncome, date: e.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {editingExpense && (
          <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateExpense} className="space-y-4">
                <div>
                  <Label htmlFor="expense-amount">Amount</Label>
                  <Input
                    id="expense-amount"
                    type="number"
                    step="0.01"
                    value={editingExpense.amount}
                    onChange={(e) =>
                      setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expense-category">Category</Label>
                  <Input
                    id="expense-category"
                    type="text"
                    value={editingExpense.category}
                    onChange={(e) =>
                      setEditingExpense({ ...editingExpense, category: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expense-description">Description</Label>
                  <Input
                    id="expense-description"
                    type="text"
                    value={editingExpense.description || ''}
                    onChange={(e) =>
                      setEditingExpense({ ...editingExpense, description: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="expense-date">Date</Label>
                  <Input
                    id="expense-date"
                    type="date"
                    value={editingExpense.date}
                    onChange={(e) =>
                      setEditingExpense({ ...editingExpense, date: e.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}