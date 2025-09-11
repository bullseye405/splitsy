import { supabase } from '@/integrations/supabase/client';
import {
  Expense,
  ExpenseInsert,
  ExpenseSplit,
  ExpenseSplitInsert,
  ExpenseUpdate,
} from '@/types/expense';

export interface ExpenseWithSplits extends Expense {
  expense_splits: ExpenseSplit[];
}

export async function createExpense(
  expense: ExpenseInsert,
  splits: Omit<ExpenseSplitInsert, 'expense_id'>[]
) {
  const { data: expenseData, error: expenseError } = await supabase
    .from('expenses')
    .insert(expense)
    .select()
    .single();

  if (expenseError) {
    console.error('Error creating expense:', expenseError);
    throw expenseError;
  }

  // Create splits
  const splitsWithExpenseId = splits.map((split) => ({
    ...split,
    expense_id: expenseData.id,
  }));

  const { error: splitsError } = await supabase
    .from('expense_splits')
    .insert(splitsWithExpenseId);

  if (splitsError) {
    console.error('Error creating expense splits:', splitsError);
    throw splitsError;
  }

  return expenseData;
}

export async function getExpensesByGroupId(groupId: string) {
  const { data, error } = await supabase
    .from('expenses')
    .select(
      `
      *,
      expense_splits (*)
    `
    )
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }

  return data as ExpenseWithSplits[];
}

export async function updateExpense(
  expenseId: string,
  expense: ExpenseUpdate,
  splits: Omit<ExpenseSplitInsert, 'expense_id'>[]
) {
  const { data: expenseData, error: expenseError } = await supabase
    .from('expenses')
    .update(expense)
    .eq('id', expenseId)
    .select()
    .single();

  if (expenseError) {
    console.error('Error updating expense:', expenseError);
    throw expenseError;
  }

  // Delete existing splits
  const { error: deleteError } = await supabase
    .from('expense_splits')
    .delete()
    .eq('expense_id', expenseId);

  if (deleteError) {
    console.error('Error deleting existing splits:', deleteError);
    throw deleteError;
  }

  // Create new splits
  const splitsWithExpenseId = splits.map((split) => ({
    ...split,
    expense_id: expenseId,
  }));

  const { error: splitsError } = await supabase
    .from('expense_splits')
    .insert(splitsWithExpenseId);

  if (splitsError) {
    console.error('Error creating new expense splits:', splitsError);
    throw splitsError;
  }

  return expenseData;
}

export async function deleteExpense(expenseId: string) {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId);

  if (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
}
