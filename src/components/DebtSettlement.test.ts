function calculateDebts(expenses, participants, settlements) {
  if (!participants || participants.length === 0) {
    return [];
  }
  const balances = {};
  participants.forEach((p) => (balances[p.id] = 0));
  expenses.forEach((expense) => {
    balances[expense.paid_by] += expense.amount;
    expense.expense_splits.forEach((split) => {
      balances[split.participant_id] -= split.amount;
    });
  });
  settlements.forEach((settlement) => {
    balances[settlement.from_participant_id] += settlement.amount;
    balances[settlement.to_participant_id] -= settlement.amount;
  });
  const debtList = [];
  // Cast amount to number for correct arithmetic
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

describe('Debt Settlement Algorithm', () => {
  function getNetBalances(debts, participants) {
    const balances = {};
    participants.forEach((p) => (balances[p.id] = 0));
    debts.forEach(({ fromId, toId, amount }) => {
      balances[fromId] -= amount;
      balances[toId] += amount;
    });
    return balances;
  }

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
    ];
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
    ];
    const settlements = [];
    const debts = calculateDebts(expenses, participants, settlements);
    const balances = getNetBalances(debts, participants);
    // Final balances should match what is owed/paid
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
    ];
    const settlements = [];
    const debts = calculateDebts(expenses, participants, settlements);
    const balances = getNetBalances(debts, participants);
    console.log({debts, balances});

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
    ];
    const settlements = [
      { from_participant_id: 'B', to_participant_id: 'A', amount: 25 },
    ];
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
    ];
    const settlements = [];
    const debts = calculateDebts(expenses, participants, settlements);
    const balances = getNetBalances(debts, participants);
    expect(balances['A'] + balances['B'] + balances['C']).toBeCloseTo(0);
    expect(balances['A']).toBeCloseTo(0);
    expect(balances['B']).toBeCloseTo(0);
    expect(balances['C']).toBeCloseTo(0);
  });
});
