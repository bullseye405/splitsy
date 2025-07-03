import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, DollarSign } from 'lucide-react';
import { ExpenseWithSplits } from '@/api/expenses';
import { Participant } from '@/types/participants';

interface Debt {
  from: string;
  to: string;
  amount: number;
  fromName: string;
  toName: string;
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

interface DebtSettlementProps {
  expenses: ExpenseWithSplits[];
  participants: Participant[];
}

export function DebtSettlement({
  expenses,
  participants,
}: DebtSettlementProps) {
  const [settlements, setSettlements] = useState<Settlement[]>([]);

  const calculateDebts = (): Debt[] => {
    const balances: { [key: string]: number } = {};

    // Initialize balances
    participants.forEach((p) => {
      balances[p.id] = 0;
    });

    console.log('INITIALIZED', { balances });

    // Calculate net balances
    expenses.forEach((expense) => {
      // Person who paid gets credited
      balances[expense.paid_by] += expense.amount;

      // People in the split get debited
      expense.expense_splits.forEach((split) => {
        if (split.participant_id) {
          balances[split.participant_id] -= split.amount;
        }
      });
    });

    console.log('Calculate Net Balance', { balances });

    // Calculate who owes whom
    const debts: Debt[] = [];
    const creditors = Object.entries(balances).filter(
      ([_, balance]) => balance > 0
    );
    const debtors = Object.entries(balances).filter(
      ([_, balance]) => balance < 0
    );

    console.log({ creditors, debtors });

    for (const [debtorId, debtAmount] of debtors) {
      let remainingDebt = Math.abs(debtAmount);

      for (const [creditorId, creditAmount] of creditors) {
        if (remainingDebt <= 0 || creditAmount <= 0) continue;

        const settleAmount = Math.min(remainingDebt, creditAmount);

        // Check if this debt has been settled
        const isSettled = settlements.some(
          (s) =>
            s.from === debtorId &&
            s.to === creditorId &&
            s.amount >= settleAmount
        );

        if (!isSettled && settleAmount > 0.01) {
          const debtorName =
            participants.find((p) => p.id === debtorId)?.name || 'Unknown';
          const creditorName =
            participants.find((p) => p.id === creditorId)?.name || 'Unknown';

          debts.push({
            from: debtorId,
            to: creditorId,
            amount: settleAmount,
            fromName: debtorName,
            toName: creditorName,
          });
        }

        console.log({ debts });

        remainingDebt -= settleAmount;
        // Update the creditor's remaining credit
        const creditorIndex = creditors.findIndex(([id]) => id === creditorId);
        if (creditorIndex !== -1) {
          creditors[creditorIndex][1] -= settleAmount;
        }
      }
    }

    return debts;
  };

  const handleSettleDebt = (debt: Debt) => {
    const newSettlement: Settlement = {
      from: debt.from,
      to: debt.to,
      amount: debt.amount,
    };

    setSettlements((prev) => [...prev, newSettlement]);
  };

  const debts = calculateDebts();
  console.log('Calculated Debts:', debts);
  const remainingDebts = debts.filter(
    (debt) =>
      !settlements.some(
        (s) =>
          s.from === debt.from && s.to === debt.to && s.amount >= debt.amount
      )
  );

  console.log({ remainingDebts });

  const settledDebts = debts.filter((debt) =>
    settlements.some(
      (s) => s.from === debt.from && s.to === debt.to && s.amount >= debt.amount
    )
  );

  if (debts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            All Settled!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Everyone is even - no debts to settle!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Outstanding Debts */}
      {remainingDebts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Outstanding Debts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {remainingDebts.map((debt, index) => (
              <div
                key={`${debt.from}-${debt.to}-${index}`}
                className="flex justify-between items-center p-3 rounded-lg bg-muted/50"
              >
                <div>
                  <span className="font-medium">{debt.fromName}</span>
                  <span className="text-muted-foreground"> owes </span>
                  <span className="font-medium text-destructive">
                    ${debt.amount.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground"> to </span>
                  <span className="font-medium">{debt.toName}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSettleDebt(debt)}
                >
                  Settle Debt
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Settled Debts */}
      {settledDebts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Settled Debts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {settledDebts.map((debt, index) => (
              <div
                key={`settled-${debt.from}-${debt.to}-${index}`}
                className="flex justify-between items-center p-3 rounded-lg bg-success/10"
              >
                <div>
                  <span className="font-medium">{debt.fromName}</span>
                  <span className="text-muted-foreground"> paid </span>
                  <span className="font-medium text-success">
                    ${debt.amount.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground"> to </span>
                  <span className="font-medium">{debt.toName}</span>
                </div>
                <Badge variant="secondary" className="text-success">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Settled
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
