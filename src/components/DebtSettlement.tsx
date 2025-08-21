import {
  Calculator,
  CheckCircle,
  CreditCard,
  History,
  Trash2,
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { ExpenseWithSplits } from '@/api/expenses';
import { Participant } from '@/types/participants';
import { createSettlement, getSettlementsByGroupId, deleteSettlement } from '@/api/settlements';
import { useToast } from '@/hooks/use-toast';
import { Settlement as SettlementType } from '@/types/settlements';
import { Button } from './ui/button';

interface DebtItem {
  fromId: string;
  toId: string;
  amount: number;
  settled: boolean;
}

interface DebtSettlementProps {
  expenses: ExpenseWithSplits[];
  participants: Participant[];
  groupId: string;
  currentParticipant?: string | null;
  onTransactionChange?: () => void;
}

interface Balance {
  participantId: string;
  amount: number;
}

export function DebtSettlement({ 
  expenses, 
  participants, 
  groupId,
  currentParticipant,
  onTransactionChange
}: DebtSettlementProps) {
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [settlements, setSettlements] = useState<SettlementType[]>([]);
  const { toast } = useToast();

  const getParticipantDisplayName = (participantId: string) => {
    if (participantId === currentParticipant) {
      return 'you';
    }
    return participants.find((p) => p.id === participantId)?.name || 'Unknown';
  };

  const calculateDebts = useCallback(() => {
    if (!participants || participants.length === 0) {
      setDebts([]);
      return;
    }

    // Initialize balances for each participant
    const balances: { [participantId: string]: number } = {};
    participants.forEach((p) => (balances[p.id] = 0));

    // Calculate how much each participant paid vs owes from expenses
    expenses.forEach((expense) => {
      // Add amount paid by this participant
      balances[expense.paid_by] += expense.amount;

      // Subtract what each participant owes for this expense
      expense.expense_splits.forEach((split) => {
        balances[split.participant_id] -= split.amount;
      });
    });

    // Apply settlements to balances
    settlements.forEach((settlement) => {
      // The person who paid reduces their debt (increases their balance)
      balances[settlement.from_participant_id] += settlement.amount;
      // The person who received reduces what they're owed (decreases their balance)
      balances[settlement.to_participant_id] -= settlement.amount;
    });

    // Create debt relationships from remaining balances
    const debtList: DebtItem[] = [];
    const creditors = Object.entries(balances).filter(([_, amount]) => amount > 0.01);
    const debtors = Object.entries(balances).filter(([_, amount]) => amount < -0.01);

    // Simple debt settlement algorithm
    debtors.forEach(([debtorId, debtAmount]) => {
      let remainingDebt = Math.abs(debtAmount);
      
      creditors.forEach(([creditorId, creditAmount]) => {
        if (remainingDebt > 0.01 && creditAmount > 0.01) {
          const settlementAmount = Math.min(remainingDebt, creditAmount);
          
          debtList.push({
            fromId: debtorId,
            toId: creditorId,
            amount: settlementAmount,
            settled: false // All debts shown are unsettled since settlements are already accounted for in balances
          });
          
          remainingDebt -= settlementAmount;
          // Update creditor's remaining credit
          const creditorIndex = creditors.findIndex(([id]) => id === creditorId);
          if (creditorIndex !== -1) {
            creditors[creditorIndex][1] -= settlementAmount;
          }
        }
      });
    });

    setDebts(debtList);
  }, [expenses, participants, settlements]);

  const fetchSettlements = useCallback(async () => {
    try {
      const settlementsData = await getSettlementsByGroupId(groupId);
      setSettlements(settlementsData);
    } catch (error) {
      console.error('Error fetching settlements:', error);
      toast({
        title: 'Error',
        description: 'Could not load settlements. Please try again.',
        variant: 'destructive',
      });
    }
  }, [groupId, toast]);

  const handleSettle = async (fromId: string, toId: string, amount: number, index: number) => {
    try {
      const fromName = getParticipantDisplayName(fromId);
      const toName = getParticipantDisplayName(toId);
      
      await createSettlement({
        group_id: groupId,
        from_participant_id: fromId,
        to_participant_id: toId,
        amount,
        description: `Settlement: ${fromName} → ${toName}`,
      });

      toast({
        title: 'Settlement recorded',
        description: `$${amount.toFixed(2)} settlement from ${fromName} to ${toName} has been recorded`,
      });

      // Refresh settlements and transactions
      await fetchSettlements();
      onTransactionChange?.();
    } catch (error) {
      console.error('Error creating settlement:', error);
      toast({
        title: 'Error',
        description: 'Could not record settlement. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSettlement = async (settlementId: string) => {
    try {
      await deleteSettlement(settlementId);

      toast({
        title: 'Settlement deleted',
        description: 'The settlement has been removed and the debt is now outstanding again',
      });

      // Refresh settlements and transactions
      await fetchSettlements();
      onTransactionChange?.();
    } catch (error) {
      console.error('Error deleting settlement:', error);
      toast({
        title: 'Error',
        description: 'Could not delete settlement. Please try again.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, [fetchSettlements]);

  useEffect(() => {
    calculateDebts();
  }, [calculateDebts]);

  if (debts.length === 0 && settlements.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">All settled up!</h3>
        <p className="text-slate-600">No outstanding balances in this group.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
        <Calculator className="w-5 h-5 mr-2" />
        Debt Settlement
      </h3>

      {/* Settlement History */}
      {/* {settlements.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-slate-700 mb-3 flex items-center">
            <History className="w-4 h-4 mr-2" />
            Recent Settlements
          </h4>
          <div className="space-y-2">
            {settlements.slice(0, 3).map((settlement) => (
              <div
                key={settlement.id}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-slate-700">
                    {getParticipantDisplayName(settlement.from_participant_id)} paid{' '}
                    {getParticipantDisplayName(settlement.to_participant_id)}
                  </span>
                </div>
                <div className="text-sm font-semibold text-green-600">
                  ${settlement.amount.toFixed(2)}s
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}

      {/* Outstanding Debts */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-slate-700 mb-3">Outstanding Debts</h4>
        {debts.length === 0 ? (
          <p className="text-slate-600 text-center py-4">No outstanding debts</p>
        ) : (
          debts.map((debt, index) => {
            const fromName = getParticipantDisplayName(debt.fromId);
            const toName = getParticipantDisplayName(debt.toId);
            
            return (
              <div key={`${debt.fromId}-${debt.toId}-${index}`} className="flex items-center justify-between py-3 px-2 border-b border-slate-200">
                <div className="flex-1">
                  <span className="text-slate-800">
                    <span className="font-medium">{fromName === 'you' ? 'You' : fromName}</span>
                    {' owe'}
                    {fromName !== 'you' ? 's' : ''}
                    {' '}
                    <span className="font-medium">{toName === 'you' ? 'you' : toName}</span>
                    {' '}
                    <span className="font-bold text-red-600">${debt.amount.toFixed(2)}</span>
                  </span>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => handleSettle(debt.fromId, debt.toId, debt.amount, index)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  <CreditCard className="w-3 h-3 mr-1" />
                  Settle
                </Button>
              </div>
            );
          })
        )}
      </div>

      {/* Recently Settled Debts */}
      {settlements.length > 0 && (
        <div className="space-y-3 mt-6">
          <h4 className="text-lg font-semibold text-slate-700 mb-3">Recently Settled</h4>
          {settlements.slice(0, 5).map((settlement, index) => {
            const fromName = getParticipantDisplayName(settlement.from_participant_id);
            const toName = getParticipantDisplayName(settlement.to_participant_id);
            
            return (
              <div key={`settled-${index}`} className="flex items-center justify-between py-3 px-2 border-b border-green-200 bg-green-50">
                <div className="flex-1">
                  <span className="text-slate-800">
                    <span className="font-medium">{fromName === 'you' ? 'You' : fromName}</span>
                    {' paid '}
                    <span className="font-medium">{toName === 'you' ? 'you' : toName}</span>
                    {' '}
                    <span className="font-bold text-green-600">${settlement.amount.toFixed(2)}</span>
                  </span>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteSettlement(settlement.id)}
                  className="hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Undo
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
