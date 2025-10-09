import { ExpenseWithSplits } from '@/types/expense';
import { produce } from 'immer';
import { create } from 'zustand';

export interface ExpenseStore {
  expenses: ExpenseWithSplits[];
  setExpenses: (expenses: ExpenseWithSplits[]) => void;
  loading?: boolean;
  setLoading?: (loading: boolean) => void;
}

const useExpenseStore = create<ExpenseStore>((set) => ({
  expenses: [],
  setExpenses: (expenses) =>
    set(
      produce((state) => {
        state.expenses = expenses;
      })
    ),
  loading: false,
  setLoading: (loading) =>
    set(
      produce((state) => {
        state.loading = loading;
      })
    ),
}));

export default useExpenseStore;
