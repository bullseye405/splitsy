import { ExpenseWithSplits } from '@/api/expenses';
import { Settlement } from '@/types/settlements';

// Dummy data for all expense types and settlements

export const dummy_participants = [
  { id: 'A', name: 'A' },
  { id: 'B', name: 'B' },
  { id: 'C', name: 'C' },
];

export const dummy_expenses = [
  // Expense type: 'expense' (A pays for all, split variant)
  {
    id: 'exp1',
    paid_by: 'A',
    amount: 90,
    expense_type: 'expense',
    expense_splits: [
      { id: 's1', participant_id: 'A', amount: 30 },
      { id: 's2', participant_id: 'B', amount: 20 },
      { id: 's3', participant_id: 'C', amount: 40 },
    ],
  },
  // Expense type: 'income' (B receives money for group, split variant)
  {
    id: 'exp2',
    paid_by: 'B',
    amount: 60,
    expense_type: 'income',
    expense_splits: [
      { id: 's4', participant_id: 'A', amount: 10 },
      { id: 's5', participant_id: 'B', amount: 30 },
      { id: 's6', participant_id: 'C', amount: 20 },
    ],
  },
  // Expense type: 'transfer' (C pays B directly)
  {
    id: 'exp3',
    paid_by: 'C',
    amount: 50,
    expense_type: 'transfer',
    expense_splits: [{ id: 's7', participant_id: 'B', amount: 50 }],
  },
] as ExpenseWithSplits[];

export const dummy_settlements = [
  // B settles with A
  { id: 'sett1', from_participant_id: 'B', to_participant_id: 'A', amount: 20 },
  // C settles with B
  { id: 'sett2', from_participant_id: 'C', to_participant_id: 'B', amount: 15 },
  // A settles with C
  { id: 'sett3', from_participant_id: 'A', to_participant_id: 'C', amount: 10 },
] as Settlement[];

// This covers:
// - All expense types: 'expense', 'income', 'transfer'
// - Variant split amounts
// - All participants (A, B, C)
// - All settlement directions
