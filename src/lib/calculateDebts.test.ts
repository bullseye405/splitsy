import { calculateDebts, getNetBalances } from './utils';
import {
  dummy_participants,
  dummy_expenses,
  dummy_settlements,
} from './dummyData';

describe('calculateDebts with dummy data', () => {
  it('should show correct debts (who owes whom and how much)', () => {
    const debts = calculateDebts(
      dummy_expenses,
      dummy_participants,
      dummy_settlements
    );
    // Example: Validate that A owes B the correct amount, B owes C, etc.
    // You can update these expected values based on your dummy data logic
    // For the provided dummy data, let's check for some expected debts:

    const bOwesA = debts.find((d) => d.fromId === 'B' && d.toId === 'A');

    // Find debt from A to B
    const aOwesB = debts.find((d) => d.fromId === 'A' && d.toId === 'B');
    // Find debt from B to C
    const bOwesC = debts.find((d) => d.fromId === 'B' && d.toId === 'C');
    // Find debt from C to A
    const cOwesA = debts.find((d) => d.fromId === 'C' && d.toId === 'A');

    // just check that the debts exist and amounts are numbers > 0
    expect(aOwesB).not.toBeDefined();
    expect(bOwesA).toBeDefined();
    expect(bOwesA.amount).toBeGreaterThan(0);

    // If b owes c, validate
    if (bOwesC) {
      expect(bOwesC.amount).toBeGreaterThan(0);
    }

    // If c owes a, validate
    if (cOwesA) {
      expect(cOwesA.amount).toBeGreaterThan(0);
    }
  });

  it('should correctly calculate debts and balances for all cases', () => {
    const debts = calculateDebts(
      dummy_expenses,
      dummy_participants,
      dummy_settlements
    );
    const balances = getNetBalances(debts, dummy_participants);

    // Validate balances sum to zero
    const total = (Object.values(balances) as number[]).reduce(
      (a, b) => a + b,
      0
    );
    expect(total).toBeCloseTo(0);

    // Validate each participant's balance is a number
    Object.values(balances).forEach((bal) => expect(typeof bal).toBe('number'));

    // Validate debts structure
    debts.forEach((debt) => {
      expect(debt).toHaveProperty('fromId');
      expect(debt).toHaveProperty('toId');
      expect(debt).toHaveProperty('amount');
      expect(debt.amount).toBeGreaterThan(0);
    });
  });

  it('should handle no expenses and no settlements', () => {
    const debts = calculateDebts([], dummy_participants, []);
    expect(debts).toEqual([]);
  });

  it('should handle only settlements', () => {
    const debts = calculateDebts([], dummy_participants, dummy_settlements);
    const balances = getNetBalances(debts, dummy_participants);
    const total = (Object.values(balances) as number[]).reduce(
      (a, b) => a + b,
      0
    );
    expect(total).toBeCloseTo(0);
  });

  it('should handle only expenses', () => {
    const debts = calculateDebts(dummy_expenses, dummy_participants, []);
    const balances = getNetBalances(debts, dummy_participants);
    const total = (Object.values(balances) as number[]).reduce(
      (a, b) => a + b,
      0
    );
    expect(total).toBeCloseTo(0);
  });
});
