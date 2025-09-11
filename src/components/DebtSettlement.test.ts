import { calculateDebts, getNetBalances } from '../lib/utils';
import { generateMockData } from '../lib/transaction-mock';
import { Expense } from '@/types/expense';
import { ExpenseWithSplits } from '@/api/expenses';
import { Settlement } from '@/types/settlements';

describe('Debt Settlement Algorithm', () => {
  it('should be accurate for small group (5 participants, equal split)', () => {
    const { participants, expenses, settlements } = generateMockData(5, {
      expenseType: 'equal',
      numExpenses: 5,
    });
    const debts = calculateDebts(expenses, participants, settlements);
    const balances = getNetBalances(debts, participants);
    // All balances should sum to zero
    const total = (Object.values(balances) as number[]).reduce(
      (a, b) => a + b,
      0
    );
    expect(total).toBeCloseTo(0);
    // Each participant should have a balance close to zero
    (Object.values(balances) as number[]).forEach((bal) =>
      expect(Math.abs(bal)).toBeLessThan(0.01)
    );
  });

  it('should be accurate for large group (100 participants, equal split)', () => {
    const { participants, expenses, settlements } = generateMockData(100, {
      expenseType: 'equal',
      numExpenses: 100,
    });
    const debts = calculateDebts(expenses, participants, settlements);
    const balances = getNetBalances(debts, participants);
    const total = (Object.values(balances) as number[]).reduce(
      (a, b) => a + b,
      0
    );
    expect(total).toBeCloseTo(0);
    (Object.values(balances) as number[]).forEach((bal) =>
      expect(Math.abs(bal)).toBeLessThan(0.01)
    );
  });

  it('should be accurate for large group (100 participants, random split)', () => {
    const { participants, expenses, settlements } = generateMockData(100, {
      expenseType: 'random',
      numExpenses: 100,
    });
    const debts = calculateDebts(expenses, participants, settlements);
    const balances = getNetBalances(debts, participants);
    const total = (Object.values(balances) as number[]).reduce(
      (a, b) => a + b,
      0
    );
    // Only check that the sum of all balances is close to zero
    expect(total).toBeCloseTo(0);
  });

  it('should handle simple equal split', () => {
    const participants = [{ id: 'A' }, { id: 'B' }, { id: 'C' }];
    const expenses = [
      {
        paid_by: 'A',
        amount: 90,
        expense_splits: [
          { participant_id: 'A', amount: 30 },
          { participant_id: 'B', amount: 30 },
          { participant_id: 'C', amount: 30 },
        ],
      },
    ] as ExpenseWithSplits[];
    const settlements = [];
    const debts = calculateDebts(expenses, participants, settlements);
    const balances = getNetBalances(debts, participants);
    expect(balances['A']).toBeCloseTo(60);
    expect(balances['B']).toBeCloseTo(-30);
    expect(balances['C']).toBeCloseTo(-30);
  });

  it('should handle multiple payers', () => {
    const participants = [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }];
    const expenses = [
      {
        paid_by: 'A',
        amount: 100,
        expense_splits: [
          { participant_id: 'A', amount: 25 },
          { participant_id: 'B', amount: 25 },
          { participant_id: 'C', amount: 25 },
          { participant_id: 'D', amount: 25 },
        ],
      },
      {
        paid_by: 'B',
        amount: 80,
        expense_splits: [
          { participant_id: 'A', amount: 20 },
          { participant_id: 'B', amount: 20 },
          { participant_id: 'C', amount: 20 },
          { participant_id: 'D', amount: 20 },
        ],
      },
      {
        paid_by: 'C',
        amount: 40,
        expense_splits: [
          { participant_id: 'C', amount: 20 },
          { participant_id: 'D', amount: 20 },
        ],
      },
    ] as ExpenseWithSplits[];
    const settlements = [];
    const debts = calculateDebts(expenses, participants, settlements);
    const balances = getNetBalances(debts, participants);
    expect(
      balances['A'] + balances['B'] + balances['C'] + balances['D']
    ).toBeCloseTo(0);
    expect(balances['A']).toBeGreaterThan(0);
    expect(balances['B']).toBeGreaterThan(0);
    expect(balances['C']).toBeLessThan(0);
    expect(balances['D']).toBeLessThan(0);
  });

  it('should handle custom split', () => {
    const participants = [{ id: 'A' }, { id: 'B' }, { id: 'C' }];
    const expenses = [
      {
        paid_by: 'A',
        amount: 60,
        expense_splits: [
          { participant_id: 'A', amount: 10 },
          { participant_id: 'B', amount: 20 },
          { participant_id: 'C', amount: 30 },
        ],
      },
    ] as ExpenseWithSplits[];
    const settlements = [];
    const debts = calculateDebts(expenses, participants, settlements);
    const balances = getNetBalances(debts, participants);
    expect(balances['A'] + balances['B'] + balances['C']).toBeCloseTo(0);
    expect(balances['A']).toBeGreaterThan(0);
    expect(balances['B']).toBeLessThan(0);
    expect(balances['C']).toBeLessThan(0);
  });

  it('should handle settlements applied', () => {
    const participants = [{ id: 'A' }, { id: 'B' }];
    const expenses = [
      {
        paid_by: 'A',
        amount: 50,
        expense_splits: [
          { participant_id: 'A', amount: 25 },
          { participant_id: 'B', amount: 25 },
        ],
      },
    ] as ExpenseWithSplits[];
    const settlements = [
      { from_participant_id: 'B', to_participant_id: 'A', amount: 25 },
    ] as Settlement[];
    const debts = calculateDebts(expenses, participants, settlements);
    const balances = getNetBalances(debts, participants);

    expect(balances['A'] + balances['B']).toBeCloseTo(0);
    expect(balances['A']).toBeCloseTo(0);
    expect(balances['B']).toBeCloseTo(0);
  });

  it('should handle all paid their share (no debts)', () => {
    const participants = [{ id: 'A' }, { id: 'B' }, { id: 'C' }];
    const expenses = [
      {
        paid_by: 'A',
        amount: 30,
        expense_splits: [
          { participant_id: 'A', amount: 10 },
          { participant_id: 'B', amount: 10 },
          { participant_id: 'C', amount: 10 },
        ],
      },
      {
        paid_by: 'B',
        amount: 30,
        expense_splits: [
          { participant_id: 'A', amount: 10 },
          { participant_id: 'B', amount: 10 },
          { participant_id: 'C', amount: 10 },
        ],
      },
      {
        paid_by: 'C',
        amount: 30,
        expense_splits: [
          { participant_id: 'A', amount: 10 },
          { participant_id: 'B', amount: 10 },
          { participant_id: 'C', amount: 10 },
        ],
      },
    ] as ExpenseWithSplits[];
    const settlements = [];
    const debts = calculateDebts(expenses, participants, settlements);
    const balances = getNetBalances(debts, participants);
    expect(balances['A'] + balances['B'] + balances['C']).toBeCloseTo(0);
    expect(balances['A']).toBeCloseTo(0);
    expect(balances['B']).toBeCloseTo(0);
    expect(balances['C']).toBeCloseTo(0);
  });
});
