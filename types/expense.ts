// types/expense.ts
export type Expense = {
    id: string;
    user_id: string;
    amount: number;
    category: string;
    description: string | null;
    date: string;
    created_at: string;
  };
  
  export type ExpenseRequestBody = Partial<Pick<Expense, 'amount' | 'category' | 'description' | 'date'>>;