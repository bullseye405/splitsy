import {
  ArrowRightLeft,
  DollarSign,
  Edit,
  Filter,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { deleteSettlement } from '@/api/settlements';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import useExpenseStore from '@/hooks/useExpense';
import useGroup from '@/hooks/useGroup';
import useSettlementStore from '@/hooks/useSettlement';
import { ExpenseWithSplits } from '@/types/expense';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface RecentTransactionProps {
  refreshTransactions: () => Promise<void>;
  handleEditExpense: (expense: ExpenseWithSplits) => void;
  handleDeleteExpense: (expenseId: string) => void;
}

const RecentTransactions = ({
  refreshTransactions,
  handleEditExpense,
  handleDeleteExpense,
}: RecentTransactionProps) => {
  const { toast } = useToast();

  const [filterParticipant, setFilterParticipant] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterMinAmount, setFilterMinAmount] = useState<string>('');
  const [filterMaxAmount, setFilterMaxAmount] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const { currentParticipant, participants } = useGroup(
    useShallow((state) => ({
      participants: state.participants,
      currentParticipant: state.currentParticipant,
    }))
  );

  const expenses = useExpenseStore((state) => state.expenses);
  const settlements = useSettlementStore((state) => state.settlements);

  const hasActiveFilters =
    filterParticipant !== 'all' ||
    filterType !== 'all' ||
    filterMinAmount !== '' ||
    filterMaxAmount !== '' ||
    filterDateFrom !== '' ||
    filterDateTo !== '';

  const getParticipantDisplayName = (participantId: string) => {
    if (participantId === currentParticipant) {
      return 'Me';
    }
    return participants?.find((p) => p.id === participantId)?.name || 'Unknown';
  };

  const handleDeleteSettlement = async (settlementId: string) => {
    try {
      await deleteSettlement(settlementId);
      toast({
        title: 'Settlement deleted',
        description: 'The settlement has been removed',
      });
      await refreshTransactions();
    } catch (error) {
      console.error('Error deleting settlement:', error);
      toast({
        title: 'Error deleting',
        description: 'Could not delete settlement. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getExpenseTypeConfig = (expenseType: string) => {
    switch (expenseType) {
      case 'transfer':
        return {
          icon: <ArrowRightLeft className="w-4 h-4" />,
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-600',
          iconBg: 'bg-blue-100',
        };
      case 'income':
        return {
          icon: <TrendingUp className="w-4 h-4" />,
          bgColor: 'bg-success/10',
          textColor: 'text-success',
          iconBg: 'bg-success/20',
        };
      default:
        return {
          icon: <DollarSign className="w-4 h-4" />,
          bgColor: 'bg-destructive/10',
          textColor: 'text-destructive',
          iconBg: 'bg-destructive/20',
        };
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Transactions
          </CardTitle>
          <Button
            variant={hasActiveFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Filter Controls */}
        {showFilters && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Participant Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Participant</label>
                <Select
                  value={filterParticipant}
                  onValueChange={setFilterParticipant}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All participants" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All participants</SelectItem>
                    {participants?.map((participant) => (
                      <SelectItem key={participant.id} value={participant.id}>
                        {participant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Transaction Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="expense">Expenses</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="transfer">Transfers</SelectItem>
                    <SelectItem value="settlement">Settlements</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Amount</label>
                <Input
                  type="number"
                  placeholder="$0"
                  value={filterMinAmount}
                  onChange={(e) => setFilterMinAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Max Amount</label>
                <Input
                  type="number"
                  placeholder="No limit"
                  value={filterMaxAmount}
                  onChange={(e) => setFilterMaxAmount(e.target.value)}
                />
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">From Date</label>
                <Input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">To Date</label>
                <Input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                />
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterParticipant('all');
                  setFilterType('all');
                  setFilterMinAmount('');
                  setFilterMaxAmount('');
                  setFilterDateFrom('');
                  setFilterDateTo('');
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {(() => {
            let transactions = [
              ...settlements.map((settlement) => ({
                ...settlement,
                type: 'settlement' as const,
                created_at: settlement.created_at,
              })),
              ...expenses.map((expense) => ({
                ...expense,
                type: 'expense' as const,
                created_at: expense.created_at,
              })),
            ];

            // Apply filters
            transactions = transactions.filter((transaction) => {
              // Participant filter
              if (filterParticipant !== 'all') {
                if (transaction.type === 'settlement') {
                  const settlement = transaction;
                  if (
                    settlement.from_participant_id !== filterParticipant &&
                    settlement.to_participant_id !== filterParticipant
                  ) {
                    return false;
                  }
                } else {
                  const expense = transaction;
                  if (
                    expense.paid_by !== filterParticipant &&
                    !expense.expense_splits.some(
                      (split) => split.participant_id === filterParticipant
                    )
                  ) {
                    return false;
                  }
                }
              }

              // Type filter
              if (filterType !== 'all') {
                if (
                  transaction.type === 'settlement' &&
                  filterType !== 'settlement'
                ) {
                  return false;
                }
                if (
                  transaction.type === 'expense' &&
                  transaction.expense_type !== filterType &&
                  filterType !== 'expense'
                ) {
                  return false;
                }
              }

              // Amount filter
              const amount = transaction.amount;
              if (filterMinAmount && amount < parseFloat(filterMinAmount)) {
                return false;
              }
              if (filterMaxAmount && amount > parseFloat(filterMaxAmount)) {
                return false;
              }

              // Date filter
              const transactionDate = new Date(transaction.created_at)
                .toISOString()
                .split('T')[0];
              if (filterDateFrom && transactionDate < filterDateFrom) {
                return false;
              }
              if (filterDateTo && transactionDate > filterDateTo) {
                return false;
              }

              return true;
            });

            if (transactions.length === 0) {
              return (
                <div className="p-8 text-center text-muted-foreground">
                  <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No transactions yet</p>
                </div>
              );
            }

            return transactions
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )
              .map((transaction) => {
                if (transaction.type === 'settlement') {
                  const settlement = transaction;
                  const fromName = getParticipantDisplayName(
                    settlement.from_participant_id
                  );
                  const toName = getParticipantDisplayName(
                    settlement.to_participant_id
                  );

                  return (
                    <div
                      key={`settlement-${settlement.id}`}
                      className="p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-blue-100 mt-0.5">
                          <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">
                                {fromName} → {toName}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {new Date(
                                  settlement.created_at
                                ).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-blue-600">
                                ${settlement.amount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteSettlement(settlement.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                } else {
                  const expense = transaction;
                  const paidByName = getParticipantDisplayName(expense.paid_by);
                  const expenseType = expense.expense_type || 'expense';
                  const typeConfig = getExpenseTypeConfig(expenseType);

                  // Calculate current participant's share
                  const myShare = currentParticipant
                    ? expense.expense_splits.find(
                        (split) => split.participant_id === currentParticipant
                      )?.amount || 0
                    : 0;

                  return (
                    <div
                      key={expense.id}
                      className="p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${typeConfig.iconBg} mt-0.5`}
                        >
                          <span className={typeConfig.textColor}>
                            {typeConfig.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 items-center">
                          <p className="font-medium">{expense.description}</p>
                          <div className="flex flex-col  gap-1 items-start mt-1 md:flex-row md:gap-4">
                            <p className="text-xs text-muted-foreground">
                              Paid by {paidByName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(expense.created_at).toLocaleDateString(
                                undefined,
                                {
                                  month: 'short',
                                  day: 'numeric',
                                }
                              )}
                            </p>
                            {expenseType !== 'transfer' && (
                              <p className="text-xs text-muted-foreground ">
                                {`Split ${expense.expense_splits.length} ways`}
                              </p>
                            )}
                            {myShare > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Your share: ${myShare.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2 md:flex-row">
                          <span
                            className={`font-semibold ${typeConfig.textColor} text-lg mr-2`}
                          >
                            ${expense.amount.toFixed(2)}
                          </span>
                          <div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditExpense(expense)}
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              });
          })()}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
