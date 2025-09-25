import {
    ExpenseWithSplits
} from '@/api/expenses';
import { deleteSettlement } from '@/api/settlements';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { GroupWithParticipants } from '@/types/group';
import { Settlement } from '@/types/settlements';
import {
    ArrowRightLeft,
    DollarSign,
    Edit,
    Filter,
    Trash2,
    TrendingUp,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Input } from './ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';

interface RecentTransactionProps {
  group?: GroupWithParticipants;
  settlements: Settlement[];
  expenses: ExpenseWithSplits[];
  refreshTransactions: () => Promise<void>;
  handleEditExpense: (expense: ExpenseWithSplits) => void;
  handleDeleteExpense: (expenseId: string) => void;
}

const RecentTransactions = ({
  group,
  expenses,
  settlements,
  refreshTransactions,
  handleEditExpense,
  handleDeleteExpense,
}: RecentTransactionProps) => {
  const { groupId } = useParams<{ groupId: string }>();
  const { toast } = useToast();

  const [filterParticipant, setFilterParticipant] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterMinAmount, setFilterMinAmount] = useState<string>('');
  const [filterMaxAmount, setFilterMaxAmount] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const [currentParticipant, setCurrentParticipant] = useState<string | null>(
    sessionStorage.getItem(`participant_${groupId}`) || null
  );

  useEffect(() => {
    if (groupId) {
      const storedParticipant = sessionStorage.getItem(
        `participant_${groupId}`
      );
      if (storedParticipant) {
        setCurrentParticipant(storedParticipant);
      }
    }
  }, [groupId]);

  const hasActiveFilters =
    filterParticipant !== 'all' ||
    filterType !== 'all' ||
    filterMinAmount !== '' ||
    filterMaxAmount !== '' ||
    filterDateFrom !== '' ||
    filterDateTo !== '';

  const getParticipantDisplayName = (participantId: string) => {
    if (participantId === currentParticipant) {
      return 'me';
    }
    return (
      group?.participants?.find((p) => p.id === participantId)?.name ||
      'Unknown'
    );
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

  const getExpenseTypeColor = (expenseType: string) => {
    switch (expenseType) {
      case 'transfer':
        return 'text-blue-600';
      case 'income':
        return 'text-green-600';
      default:
        return 'text-red-600';
    }
  };

  const getExpenseTypeIcon = (expenseType: string) => {
    switch (expenseType) {
      case 'transfer':
        return <ArrowRightLeft className="w-4 h-4" />;
      case 'income':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-800 bg-clip-text text-transparent flex items-center">
            <DollarSign className="w-6 h-6 mr-2 text-slate-600" />
            Recent Transactions
          </CardTitle>
          <Button
            variant={hasActiveFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 ${
              hasActiveFilters ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Filter Controls */}
        {showFilters && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Participant Filter */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Participant
                </label>
                <Select
                  value={filterParticipant}
                  onValueChange={setFilterParticipant}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All participants" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All participants</SelectItem>
                    {group?.participants?.map((participant) => (
                      <SelectItem key={participant.id} value={participant.id}>
                        {participant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Transaction Type Filter */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Type
                </label>
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
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Min Amount
                </label>
                <Input
                  type="number"
                  placeholder="$0"
                  value={filterMinAmount}
                  onChange={(e) => setFilterMinAmount(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Max Amount
                </label>
                <Input
                  type="number"
                  placeholder="No limit"
                  value={filterMaxAmount}
                  onChange={(e) => setFilterMaxAmount(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Date Range */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  From Date
                </label>
                <Input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  To Date
                </label>
                <Input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="w-full"
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
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Combine and sort all transactions by created date */}
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
                    className="flex justify-between items-center p-5 rounded-xl bg-gradient-to-r from-white to-slate-50 border border-slate-200 hover:shadow-md transition-all duration-200 hover:border-slate-300"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-100">
                          <span className="text-blue-600">
                            <ArrowRightLeft className="w-4 h-4" />
                          </span>
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-slate-800 text-lg">
                            Settlement: {fromName} → {toName}
                          </span>
                          <div className="text-sm text-slate-600 mt-1">
                            Payment settlement •{' '}
                            {new Date(
                              settlement.created_at
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">
                          ${settlement.amount.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSettlement(settlement.id)}
                          className="hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Undo
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              } else {
                const expense = transaction;
                const paidByName = getParticipantDisplayName(expense.paid_by);
                const expenseType = expense.expense_type || 'expense';

                // Calculate current participant's share
                const myShare = currentParticipant
                  ? expense.expense_splits.find(
                      (split) => split.participant_id === currentParticipant
                    )?.amount || 0
                  : 0;

                return (
                  <div
                    key={expense.id}
                    className="flex justify-between items-center p-5 rounded-xl bg-gradient-to-r from-white to-slate-50 border border-slate-200 hover:shadow-md transition-all duration-200 hover:border-slate-300"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            expenseType === 'transfer'
                              ? 'bg-blue-100'
                              : expenseType === 'income'
                              ? 'bg-green-100'
                              : 'bg-red-100'
                          }`}
                        >
                          <span className={getExpenseTypeColor(expenseType)}>
                            {getExpenseTypeIcon(expenseType)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-slate-800 text-lg">
                            {expense.description}
                          </span>
                          <div className="text-sm text-slate-600 mt-1">
                            {expenseType === 'transfer'
                              ? 'Transferred'
                              : expenseType === 'income'
                              ? 'Received'
                              : 'Paid'}{' '}
                            by <span className="font-medium">{paidByName}</span>
                            {expenseType !== 'transfer' &&
                              ` • Split ${expense.expense_splits.length} ways`}
                            {myShare > 0 &&
                              expenseType !== 'transfer' &&
                              ` • $${myShare.toFixed(2)}`}
                            {' • ' +
                              new Date(expense.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div
                          className={`text-xl font-bold ${getExpenseTypeColor(
                            expenseType
                          )}`}
                        >
                          ${expense.amount.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditExpense(expense)}
                          className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              }
            });
        })()}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
