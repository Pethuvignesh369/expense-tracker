export type Expense = {
    id: string;
    user_id: string;
    amount: number;
    category: string;
    description: string | null;
    date: string;
    created_at: string;
  };
  
  export type Income = {
    id: string;
    user_id: string;
    amount: number;
    description: string | null;
    date: string;
    created_at: string;
  };