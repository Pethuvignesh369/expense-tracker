// components/TransactionDialog.tsx
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type TransactionDialogProps = {
  type: 'income' | 'expense';
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Income | Expense;
  isEditing?: boolean;
};

export default function TransactionDialog({
  type,
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}: TransactionDialogProps) {
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [category, setCategory] = useState((initialData as Expense)?.category || 'Food');
  const [description, setDescription] = useState(initialData?.description || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  // Reset form when initialData changes or dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setAmount(initialData?.amount?.toString() || '');
      setCategory((initialData as Expense)?.category || 'Food');
      setDescription(initialData?.description || '');
      setDate(initialData?.date || new Date().toISOString().split('T')[0]);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Not logged in');
      }

      const endpoint = isEditing 
        ? `/api/${type}s/${initialData?.id}` 
        : `/api/${type}s`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const payload: any = {
        amount: parseFloat(amount),
        description,
        date,
      };
      
      // Add category for expense type
      if (type === 'expense') {
        payload.category = category;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'add'} ${type}`);
      }

      const data = await response.json();
      onSubmit(data);
      onClose();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} ${type}:`, error);
      alert(`An error occurred. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit ${type}` : `Add ${type}`}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 50"
              required
              disabled={loading}
            />
          </div>
          
          {type === 'expense' && (
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                name="category" 
                value={category} 
                onValueChange={setCategory}
                disabled={loading}
              >
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
          )}
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`e.g., ${type === 'income' ? 'Salary' : 'Lunch'}`}
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <Button type="submit" disabled={loading}>
            {loading 
              ? `${isEditing ? 'Updating' : 'Adding'}...` 
              : `${isEditing ? 'Update' : 'Add'} ${type}`
            }
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}





