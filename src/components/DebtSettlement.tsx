import { ExpenseWithSplits } from '@/api/expenses';
import { createSettlement, getSettlementsByGroupId } from '@/api/settlements';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Participant } from '@/types/participants';
import { Settlement } from '@/types/settlements';
import { CheckCircle, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Debt {
  from: string;
  to: string;
  amount: number;
  fromName: string;
  toName: string;
}

interface DebtSettlementProps {
  expenses: ExpenseWithSplits[];
  participants: Participant[];
  groupId: string;
}

export function DebtSettlement({
  expenses,
  participants,
  groupId,
}: DebtSettlementProps) {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettlements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const fetchSettlements = async () => {
    try {
      const data = await getSettlementsByGroupId(groupId);
      setSettlements(data);
    } catch (error) {
      console.error('Error fetching settlements:', error);
    }
  };

  const calculateDebts = (): Debt[] => {
    const balances: { [key: string]: number } = {};

    // Initialize balances
    participants.forEach((p) => {
      balances[p.id] = 0;
    });

    // Calculate net balances from expenses
    expenses.forEach((expense) => {
      const expenseType = expense.expense_type || 'expense';

      if (expenseType === 'income') {
        // For income: person who received it owes less (gets debited)
        balances[expense.paid_by] -= expense.amount;

        // People who benefit from income are owed more (get credited)
        expense.expense_splits.forEach((split) => {
          if (split.participant_id) {
            balances[split.participant_id] += split.amount;
          }
        });
      } else {
        // For expenses and transfers: person who paid gets credited
        balances[expense.paid_by] += expense.amount;

        // People in the split get debited
        expense.expense_splits.forEach((split) => {
          if (split.participant_id) {
            balances[split.participant_id] -= split.amount;
          }
        });
      }
    });

    // Subtract settled amounts
    settlements.forEach((settlement) => {
      balances[settlement.from_participant_id] += settlement.amount;
      balances[settlement.to_participant_id] -= settlement.amount;
    });

    // Calculate who owes whom
    const debts: Debt[] = [];
    const creditors = Object.entries(balances).filter(
      ([_, balance]) => balance > 0
    );
    const debtors = Object.entries(balances).filter(
      ([_, balance]) => balance < 0
    );

    for (const [debtorId, debtAmount] of debtors) {
      let remainingDebt = Math.abs(debtAmount);

      for (const [creditorId, creditAmount] of creditors) {
        if (remainingDebt <= 0 || creditAmount <= 0) continue;

        const settleAmount = Math.min(remainingDebt, creditAmount);

        if (settleAmount > 0.01) {
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

        remainingDebt -= settleAmount;
        const creditorIndex = creditors.findIndex(([id]) => id === creditorId);
        if (creditorIndex !== -1) {
          creditors[creditorIndex][1] -= settleAmount;
        }
      }
    }

    return debts;
  };

  const handleSettleDebt = async (debt: Debt) => {
    try {
      await createSettlement({
        group_id: groupId,
        from_participant_id: debt.from,
        to_participant_id: debt.to,
        amount: debt.amount,
        description: `Settlement: ${debt.fromName} → ${debt.toName}`,
      });

      toast({
        title: 'Debt settled',
        description: `${debt.fromName} paid $${debt.amount.toFixed(2)} to ${
          debt.toName
        }`,
      });

      fetchSettlements();
    } catch (error) {
      console.error('Error settling debt:', error);
      toast({
        title: 'Error settling debt',
        description: 'Could not record the settlement. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const debts = calculateDebts();

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Outstanding Debts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {debts.map((debt, index) => (
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
  );
}
