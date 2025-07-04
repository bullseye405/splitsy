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
  console.log('Creating expense:', expense);

  const { data: expenseData, error: expenseError } = await supabase
    .from('expenses')
    .insert(expense)
    .select()
    .single();

  if (expenseError) {
    console.error('Error creating expense:', expenseError);
    throw expenseError;
  }

  console.log('Expense created:', expenseData);

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

  console.log('Expense splits created');
  return expenseData;
}

export async function getExpensesByGroupId(groupId: string) {
  console.log('Fetching expenses for group:', groupId);

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

  console.log('Expenses fetched:', data);
  return data as ExpenseWithSplits[];
}

export async function updateExpense(
  expenseId: string,
  expense: ExpenseUpdate,
  splits: Omit<ExpenseSplitInsert, 'expense_id'>[]
) {
  console.log('Updating expense:', expenseId, expense);

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

  console.log('Expense updated successfully');
  return expenseData;
}

export async function deleteExpense(expenseId: string) {
  console.log('Deleting expense:', expenseId);

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId);

  if (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }

  console.log('Expense deleted successfully');
}
