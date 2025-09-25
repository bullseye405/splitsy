import { ExpenseWithSplits } from '@/api/expenses';
import { Expense } from '@/types/expense';
import { Settlement } from '@/types/settlements';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateDebts(
  expenses: Partial<ExpenseWithSplits>[],
  participants: { id: string }[],
  settlements: Settlement[]
) {
  if (!participants || participants.length === 0) {
    return [];
  }
  const balances = {};
  participants.forEach((p) => (balances[p.id] = 0));
  expenses.forEach((expense) => {
    if (expense.expense_type === 'income') {
      // For income, the receiver owes each participant their split
      expense.expense_splits.forEach((split) => {
        balances[expense.paid_by] -= split.amount;
        balances[split.participant_id] += split.amount;
      });
    } else {
      // For expense and transfer, as before
      balances[expense.paid_by] += expense.amount;
      expense.expense_splits.forEach((split) => {
        balances[split.participant_id] -= split.amount;
      });
    }
  });
  settlements.forEach((settlement) => {
    balances[settlement.from_participant_id] += settlement.amount;
    balances[settlement.to_participant_id] -= settlement.amount;
  });
  const debtList = [];
  const creditors = Object.entries(balances).filter(
    ([_, amount]) => (amount as number) > 0.01
  );
  const debtors = Object.entries(balances).filter(
    ([_, amount]) => (amount as number) < -0.01
  );
  debtors.forEach(([debtorId, debtAmount]) => {
    let remainingDebt = Math.abs(debtAmount as number);
    creditors.forEach(([creditorId, creditAmount]) => {
      if (remainingDebt > 0.01 && (creditAmount as number) > 0.01) {
        const settlementAmount = Math.min(
          remainingDebt,
          creditAmount as number
        );
        debtList.push({
          fromId: debtorId,
          toId: creditorId,
          amount: settlementAmount,
          settled: false,
        });
        remainingDebt -= settlementAmount;
        const creditorIndex = creditors.findIndex(([id]) => id === creditorId);
        if (creditorIndex !== -1) {
          creditors[creditorIndex][1] =
            (creditors[creditorIndex][1] as number) - settlementAmount;
        }
      }
    });
  });
  return debtList;
}

export function getNetBalances(debts, participants) {
  const balances = {};
  participants.forEach((p) => (balances[p.id] = 0));
  debts.forEach(({ fromId, toId, amount }) => {
    balances[fromId] -= amount;
    balances[toId] += amount;
  });
  return balances;
}
