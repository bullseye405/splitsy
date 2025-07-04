import {
  Calculator,
  CheckCircle,
  CreditCard,
  History,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { ExpenseWithSplits } from '@/api/expenses';
import { Participant } from '@/types/participants';
import { createSettlement, getSettlementsByGroupId } from '@/api/settlements';
import { useToast } from '@/hooks/use-toast';
import { Settlement } from '@/types/settlements';
import { Button } from './ui/button';

interface DebtSettlementProps {
  expenses: ExpenseWithSplits[];
  participants: Participant[];
  groupId: string;
  currentParticipant?: string | null;
}

interface Balance {
  participantId: string;
  amount: number;
}

export function DebtSettlement({ 
  expenses, 
  participants, 
  groupId,
  currentParticipant 
}: DebtSettlementProps) {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const { toast } = useToast();

  const calculateBalances = () => {
    if (!participants || participants.length === 0) {
      setBalances([]);
      return;
    }

    // Initialize balances for each participant
    const initialBalances: { [participantId: string]: number } = {};
    participants.forEach((p) => (initialBalances[p.id] = 0));

    // Calculate how much each participant paid
    expenses.forEach((expense) => {
      initialBalances[expense.paid_by] += expense.amount;

      // Subtract the split amount for each participant
      expense.expense_splits.forEach((split) => {
        initialBalances[split.participant_id] -= split.amount;
      });
    });

    // Convert balances object to array
    const balancesArray: Balance[] = Object.entries(initialBalances).map(
      ([participantId, amount]) => ({ participantId, amount })
    );

    setBalances(balancesArray);
  };

  const getParticipantDisplayName = (participantId: string) => {
    if (participantId === currentParticipant) {
      return 'you';
    }
    return participants.find((p) => p.id === participantId)?.name || 'Unknown';
  };

  const fetchSettlements = async () => {
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
  };

  const handleSettle = async (fromId: string, toId: string, amount: number) => {
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

      // Refresh settlements
      fetchSettlements();
    } catch (error) {
      console.error('Error creating settlement:', error);
      toast({
        title: 'Error',
        description: 'Could not record settlement. Please try again.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    calculateBalances();
    fetchSettlements();
  }, [expenses, participants, groupId]);

  if (balances.length === 0) {
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
      {settlements.length > 0 && (
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
                  ${settlement.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outstanding Balances */}
      <div className="grid gap-4">
        {balances
          .filter((balance) => Math.abs(balance.amount) > 0.01)
          .map((balance) => {
            const isOwed = balance.amount > 0;
            const participantName = getParticipantDisplayName(balance.participantId);
            
            return (
              <div
                key={balance.participantId}
                className={`p-4 rounded-xl border-2 ${
                  isOwed
                    ? 'border-green-200 bg-gradient-to-r from-green-50 to-green-100'
                    : 'border-red-200 bg-gradient-to-r from-red-50 to-red-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {participantName === 'you' ? 'You' : participantName}
                    </p>
                    <p className={`text-sm ${isOwed ? 'text-green-700' : 'text-red-700'}`}>
                      {isOwed 
                        ? `${participantName === 'you' ? 'You are' : 'Is'} owed` 
                        : `${participantName === 'you' ? 'You' : ''} owe${participantName === 'you' ? '' : 's'}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${isOwed ? 'text-green-600' : 'text-red-600'}`}>
                      ${Math.abs(balance.amount).toFixed(2)}
                    </p>
                    {!isOwed && (
                      <Button
                        size="sm"
                        onClick={() => {
                          const creditor = balances.find(b => b.amount > 0 && Math.abs(b.amount) >= Math.abs(balance.amount));
                          if (creditor) {
                            handleSettle(balance.participantId, creditor.participantId, Math.abs(balance.amount));
                          }
                        }}
                        className="mt-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                      >
                        <CreditCard className="w-3 h-3 mr-1" />
                        Mark as Paid
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
