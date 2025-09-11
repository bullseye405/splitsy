// Utility to generate mock expenses and settlements for N participants
export function generateMockData(
  numParticipants: number,
  options?: {
    expenseType?: 'equal' | 'random';
    numExpenses?: number;
    numSettlements?: number;
  }
) {
  const participants = Array.from({ length: numParticipants }, (_, i) => ({
    id: `P${i + 1}`,
  }));
  const expenses = [];
  const numExpenses =
    options?.numExpenses ?? Math.max(1, Math.floor(numParticipants / 2));
  const expenseType = options?.expenseType ?? 'equal';

  // For equal split, distribute payments so each participant pays for one expense
  if (expenseType === 'equal') {
    for (let e = 0; e < numExpenses; e++) {
      const paid_by = participants[e % numParticipants].id;
      const amount = 100;
      const splitAmount = amount / numParticipants;
      const splits = participants.map((p) => ({
        participant_id: p.id,
        amount: splitAmount,
      }));
      expenses.push({ paid_by, amount, expense_splits: splits });
    }
  } else {
    // For random split, ensure each participant pays for one expense, and splits are random but total is balanced
    for (let e = 0; e < numExpenses; e++) {
      const paid_by = participants[e % numParticipants].id;
      const amount = 100;
      const splits = [];
      let remaining = amount;
      for (let i = 0; i < numParticipants; i++) {
        let split;
        if (i === numParticipants - 1) {
          split = remaining;
        } else {
          split = Math.round(Math.random() * remaining * 0.7);
        }
        splits.push({ participant_id: participants[i].id, amount: split });
        remaining -= split;
      }
      expenses.push({ paid_by, amount, expense_splits: splits });
    }
    // After all expenses, adjust splits so each participant's total paid and owed are close
    // (for test purposes, not for real app logic)
    const paidTotals = Array(numParticipants).fill(0);
    const owedTotals = Array(numParticipants).fill(0);
    expenses.forEach((expense) => {
      const payerIdx = participants.findIndex((p) => p.id === expense.paid_by);
      paidTotals[payerIdx] += expense.amount;
      expense.expense_splits.forEach((split, i) => {
        owedTotals[i] += split.amount;
      });
    });
    // Optionally, could rebalance here, but for now just report
    // (tests should expect some small imbalance)
  }

  // Settlements: for simplicity, none by default
  const settlements = [];
  // Optionally add random settlements
  if (options?.numSettlements) {
    for (let s = 0; s < options.numSettlements; s++) {
      const fromIdx = Math.floor(Math.random() * numParticipants);
      let toIdx = Math.floor(Math.random() * numParticipants);
      while (toIdx === fromIdx)
        toIdx = Math.floor(Math.random() * numParticipants);
      const amount = Math.round(Math.random() * 50);
      settlements.push({
        from_participant_id: participants[fromIdx].id,
        to_participant_id: participants[toIdx].id,
        amount,
      });
    }
  }

  return { participants, expenses, settlements };
}
