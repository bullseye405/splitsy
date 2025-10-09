import { Database } from '@/integrations/supabase/types';

export type Expense = Database['public']['Tables']['expenses']['Row'];
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update'];
export type ExpenseSplit =
  Database['public']['Tables']['expense_splits']['Row'];
export type ExpenseSplitInsert =
  Database['public']['Tables']['expense_splits']['Insert'];
export interface ExpenseWithSplits extends Expense {
  expense_splits: ExpenseSplit[];
}
