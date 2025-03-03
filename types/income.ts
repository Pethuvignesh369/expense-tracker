// types/income.ts
export type Income = {
    id: string;
    user_id: string;
    amount: number;
    description: string | null;
    date: string;
    created_at: string;
  };
  
  export type IncomeRequestBody = Partial<Pick<Income, 'amount' | 'description' | 'date'>>;