'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Income } from '@/types/income';

type IncomeFormProps = {
  onIncomeAdded?: (newIncome: Income) => void; // Callback to update dashboard
};

export default function IncomeForm({ onIncomeAdded }: IncomeFormProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('Session error:', sessionError?.message);
        alert('Please log in to add income');
        return;
      }

      const response = await fetch('/api/incomes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description,
          date,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        alert(`Failed to add income: ${errorData.error || 'Unknown error'}`);
        return;
      }

      const newIncome = await response.json();
      if (onIncomeAdded) {
        onIncomeAdded(newIncome); // Notify dashboard immediately
      }

      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      alert('Income added successfully');
    } catch (error) {
      console.error('Unexpected error in IncomeForm:', error);
      alert('An unexpected error occurred while adding income');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g., 5000"
          required
          disabled={loading}
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Salary"
          disabled={loading}
        />
      </div>
      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Income'}
      </Button>
    </form>
  );
}