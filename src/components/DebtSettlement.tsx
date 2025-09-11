import { ExpenseWithSplits } from '@/api/expenses';
import {
  createSettlement,
  deleteSettlement,
  getSettlementsByGroupId,
} from '@/api/settlements';
import { useToast } from '@/hooks/use-toast';
import { calculateDebts } from '@/lib/utils';
import { Participant } from '@/types/participants';
import { Settlement as SettlementType } from '@/types/settlements';
import { Calculator, CreditCard, Trash2, TreePalm } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { DebtGraph } from './DebtGraph';
import { Button } from './ui/button';
import { Switch } from './ui/switch';

const ShowGraphFeatureToggle = import.meta.env.VITE_SHOW_DEBT_GRAPH === 'true';

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

export function DebtSettlement({
  expenses,
  participants,
  groupId,
  currentParticipant,
  onTransactionChange,
}: DebtSettlementProps) {
  const [viewGraph, setViewGraph] = useState(false);
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [settlements, setSettlements] = useState<SettlementType[]>([]);
  const { toast } = useToast();

  const getParticipantDisplayName = (participantId: string) => {
    if (participantId === currentParticipant) {
      return 'you';
    }
    return participants.find((p) => p.id === participantId)?.name || 'Unknown';
  };

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

  const handleSettle = async (
    fromId: string,
    toId: string,
    amount: number,
    index: number
  ) => {
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
        description: `$${amount.toFixed(
          2
        )} settlement from ${fromName} to ${toName} has been recorded`,
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
        description:
          'The settlement has been removed and the debt is now outstanding again',
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
    const debts = calculateDebts(expenses, participants, settlements);
    setDebts(debts);
  }, [expenses, participants, settlements]);

  if (debts.length === 0 && settlements.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          All settled up!
        </h3>
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

      {/* Outstanding Debts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-slate-700 mb-3">
            Outstanding Debts
          </h4>
          {ShowGraphFeatureToggle && (
            <div className="flex items-center gap-2">
              <TreePalm />
              <Switch
                checked={viewGraph}
                onCheckedChange={() => setViewGraph(!viewGraph)}
              />
            </div>
          )}
        </div>
        {debts.length === 0 ? (
          <p className="text-slate-600 text-center py-4">
            No outstanding debts
          </p>
        ) : ShowGraphFeatureToggle && viewGraph ? (
          <DebtGraph
            nodes={participants.map((p) => ({
              id: p.id,
              label: p.name,
              isCurrent: p.id === currentParticipant,
            }))}
            edges={debts.map((debt, idx) => ({
              id: `e${debt.fromId}-${debt.toId}-${idx}`,
              source: debt.fromId,
              target: debt.toId,
              label: `$${debt.amount.toFixed(2)}`,
            }))}
          />
        ) : (
          debts.map((debt, index) => {
            const fromName = getParticipantDisplayName(debt.fromId);
            const toName = getParticipantDisplayName(debt.toId);
            return (
              <div
                key={`${debt.fromId}-${debt.toId}-${index}`}
                className="flex items-center justify-between py-3 px-2 border-b border-slate-200"
              >
                <div className="flex-1">
                  <span className="text-slate-800">
                    <span className="font-medium">
                      {fromName === 'you' ? 'You' : fromName}
                    </span>
                    {' owe'}
                    {fromName !== 'you' ? 's' : ''}{' '}
                    <span className="font-medium">
                      {toName === 'you' ? 'you' : toName}
                    </span>{' '}
                    <span className="font-bold text-red-600">
                      ${debt.amount.toFixed(2)}
                    </span>
                  </span>
                </div>

                <Button
                  size="sm"
                  onClick={() =>
                    handleSettle(debt.fromId, debt.toId, debt.amount, index)
                  }
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
          <h4 className="text-lg font-semibold text-slate-700 mb-3">
            Recently Settled
          </h4>
          {settlements.slice(0, 5).map((settlement, index) => {
            const fromName = getParticipantDisplayName(
              settlement.from_participant_id
            );
            const toName = getParticipantDisplayName(
              settlement.to_participant_id
            );

            return (
              <div
                key={`settled-${index}`}
                className="flex items-center justify-between py-3 px-2 border-b border-green-200 bg-green-50"
              >
                <div className="flex-1">
                  <span className="text-slate-800">
                    <span className="font-medium">
                      {fromName === 'you' ? 'You' : fromName}
                    </span>
                    {' paid '}
                    <span className="font-medium">
                      {toName === 'you' ? 'you' : toName}
                    </span>{' '}
                    <span className="font-bold text-green-600">
                      ${settlement.amount.toFixed(2)}
                    </span>
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
