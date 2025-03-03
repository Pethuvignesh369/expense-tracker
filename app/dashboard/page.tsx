'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ExpenseForm from '@/components/ExpenseForm';
import IncomeForm from '@/components/IncomeForm';
import BalanceGraph from '@/components/BalanceGraph';
import { Expense, Income } from '@/types/expense';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Dashboard() {
  const [income, setIncome] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: incomeData } = await supabase
        .from('income')
        .select('*')
        .order('date', { ascending: false });
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      setIncome(incomeData || []);
      setExpenses(expensesData || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const incomeSubscription = supabase
      .channel('income-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'income' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setIncome((prev) => [payload.new as Income, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setIncome((prev) =>
              prev.map((item) =>
                item.id === payload.new.id ? (payload.new as Income) : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setIncome((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const expensesSubscription = supabase
      .channel('expenses-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setExpenses((prev) => [payload.new as Expense, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setExpenses((prev) =>
              prev.map((item) =>
                item.id === payload.new.id ? (payload.new as Expense) : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setExpenses((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      incomeSubscription.unsubscribe();
      expensesSubscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const handleDeleteIncome = async (id: string) => {
    await supabase.from('income').delete().eq('id', id);
  };

  const handleDeleteExpense = async (id: string) => {
    await supabase.from('expenses').delete().eq('id', id);
  };

  const handleUpdateIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIncome) return;
    await supabase
      .from('income')
      .update({
        amount: editingIncome.amount,
        description: editingIncome.description,
        date: editingIncome.date,
      })
      .eq('id', editingIncome.id);
    setEditingIncome(null);
  };

  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    await supabase
      .from('expenses')
      .update({
        amount: editingExpense.amount,
        category: editingExpense.category,
        description: editingExpense.description,
        date: editingExpense.date,
      })
      .eq('id', editingExpense.id);
    setEditingExpense(null);
  };

  if (loading) return <div>Loading...</div>;

  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Monthly Summary Logic
  const currentMonth = new Date().toISOString().slice(0, 7); // e.g., "2025-03"
  const monthlyIncome = income
    .filter((i) => i.date.startsWith(currentMonth))
    .reduce((sum, i) => sum + i.amount, 0);
  const monthlyExpenses = expenses
    .filter((e) => e.date.startsWith(currentMonth))
    .reduce((sum, e) => sum + e.amount, 0);
  const monthlyBalance = monthlyIncome - monthlyExpenses;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Balance: ${balance.toFixed(2)}</h1>
        <Button onClick={handleLogout}>Logout</Button>
      </div>

      {/* Monthly Summary */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg shadow">
        <h2 className="text-xl mb-2">
          Summary for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Income</p>
            <p className="text-lg font-semibold text-green-600">${monthlyIncome.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Expenses</p>
            <p className="text-lg font-semibold text-red-600">${monthlyExpenses.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Balance</p>
            <p
              className={`text-lg font-semibold ${
                monthlyBalance >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}
            >
              ${monthlyBalance.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <IncomeForm />
        <ExpenseForm />
      </div>

      {/* Income Table */}
      <h2 className="text-xl mb-2">Income</h2>
      <table className="w-full mb-6 border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Date</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {income.map((item) => (
            <tr key={item.id}>
              <td className="border p-2">{item.date}</td>
              <td className="border p-2">${item.amount.toFixed(2)}</td>
              <td className="border p-2">{item.description || '-'}</td>
              <td className="border p-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2"
                  onClick={() => setEditingIncome(item)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteIncome(item.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Expenses Table */}
      <h2 className="text-xl mb-2">Expenses</h2>
      <table className="w-full mb-6 border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Date</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((item) => (
            <tr key={item.id}>
              <td className="border p-2">{item.date}</td>
              <td className="border p-2">${item.amount.toFixed(2)}</td>
              <td className="border p-2">{item.category}</td>
              <td className="border p-2">{item.description || '-'}</td>
              <td className="border p-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2"
                  onClick={() => setEditingExpense(item)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteExpense(item.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Income Modal */}
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

      {/* Edit Expense Modal */}
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

      <BalanceGraph expenses={expenses} income={income} />
    </div>
  );
}