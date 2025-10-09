import { ExpenseWithSplits } from '@/types/expense';
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
  // Sort by smallest absolute balance to largest to calculate least debts first
  const creditors = Object.entries(balances)
    .filter(([_, amount]) => (amount as number) > 0.01)
    .sort((a, b) => Math.abs(a[1] as number) - Math.abs(b[1] as number));
  const debtors = Object.entries(balances)
    .filter(([_, amount]) => (amount as number) < -0.01)
    .sort((a, b) => Math.abs(a[1] as number) - Math.abs(b[1] as number));

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

// Returns the total cost for a participant (their share of all expenses)
export function getMyCost(
  expenses: ExpenseWithSplits[],
  participantId: string
) {
  const cost = expenses.reduce((sum, expense) => {
    const myShare =
      expense.expense_splits?.find(
        (split) => split.participant_id === participantId
      )?.amount || 0;
    if (expense.expense_type === 'income') {
      // Deduct income share
      return sum - myShare;
    } else if (expense.expense_type === 'expense' || !expense.expense_type) {
      // Add expense share
      return sum + myShare;
    }
    // Ignore other types (e.g., transfer)
    return sum;
  }, 0);
  return cost < 0 ? 0 : cost;
}

// Returns the total paid by a participant
export function getIPaid(expenses: ExpenseWithSplits[], participantId: string) {
  const paid = expenses
    .filter((e) => e.paid_by === participantId)
    .reduce((sum, expense) => sum + expense.amount, 0);
  return paid < 0 ? 0 : paid;
}

// Returns the total income received by a participant
export function getIReceived(
  expenses: ExpenseWithSplits[],
  settlements: Settlement[],
  participantId: string
) {
  // Only consider transfers and settlements received
  const receivedFromTransfers = expenses.reduce((sum, expense) => {
    if (expense.expense_type === 'transfer') {
      const share =
        expense.expense_splits?.find(
          (split) => split.participant_id === participantId
        )?.amount || 0;
      return sum + share;
    }
    return sum;
  }, 0);

  // Add settlements received
  const settlementsReceived = settlements
    .filter((s) => s.to_participant_id === participantId)
    .reduce((sum, s) => sum + s.amount, 0);

  const received = receivedFromTransfers + settlementsReceived;
  return received < 0 ? 0 : received;
}

// Returns the net amount owed by/to a participant
export function getOwned(
  expenses: ExpenseWithSplits[],
  settlements: Settlement[],
  participantId: string
) {
  let balance = 0;
  expenses.forEach((expense) => {
    if (expense.expense_type === 'income') {
      if (expense.paid_by === participantId) {
        // I received income, subtract what I owe to others
        const totalOwedToOthers = expense.expense_splits?.reduce(
          (sum, split) => sum + (split.amount || 0),
          0
        );
        balance -= totalOwedToOthers;
      } else {
        // Someone else received income, add what they owe me
        const myShare =
          expense.expense_splits?.find(
            (split) => split.participant_id === participantId
          )?.amount || 0;
        balance += myShare;
      }
    } else {
      // For expenses and transfers: I paid - my share
      if (expense.paid_by === participantId) {
        balance += expense.amount;
      }
      const myShare =
        expense.expense_splits?.find(
          (split) => split.participant_id === participantId
        )?.amount || 0;
      balance -= myShare;
    }
  });

  settlements.forEach((settlement) => {
    // Both paying and receiving a settlement reduce the amount you are owed
    if (
      settlement.from_participant_id === participantId ||
      settlement.to_participant_id === participantId
    ) {
      balance -= settlement.amount;
    }
  });
  return balance < 0 ? 0 : balance;
}
