import {
  createExpense,
  deleteExpense,
  ExpenseWithSplits,
  getExpensesByGroupId,
  updateExpense,
} from '@/api/expenses';
import { getGroupById, updateGroupName } from '@/api/groups';
import { recordGroupView } from '@/api/groupViews';
import { getSettlementsByGroupId } from '@/api/settlements';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { GroupWithParticipants } from '@/types/group';
import { Settlement } from '@/types/settlements';
import {
  ArrowRightLeft,
  Edit,
  Home,
  Plus,
  Share,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DebtSettlement } from './DebtSettlement';
import { ExpenseTypeDialog } from './ExpenseTypeDialog';
import { ParticipantSelectionModal } from './ParticipantSelectionModal';
import { ParticipantsModal } from './ParticipantsModal';
import RecentTransactions from './RecentTransactions';

export function GroupDashboard() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const [group, setGroup] = useState<GroupWithParticipants>();
  const [editingName, setEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const [expenses, setExpenses] = useState<ExpenseWithSplits[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [showParticipantSelection, setShowParticipantSelection] =
    useState(false);
  const [currentParticipant, setCurrentParticipant] = useState<string | null>(
    sessionStorage.getItem(`participant_${groupId}`) || null
  );

  const [dialogType, setDialogType] = useState<
    'expense' | 'transfer' | 'income'
  >('expense');
  const [editingExpense, setEditingExpense] =
    useState<ExpenseWithSplits | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const shareUrl = `${window.location.origin}/${groupId}`;

  // Check for existing participant selection in session storage
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

  const fetchGroupData = useCallback(async () => {
    if (!groupId) return;
    try {
      const { data, error } = await getGroupById(groupId);
      if (error || !data) {
        navigate('/404', { replace: true });
        return;
      }
      setGroup(data);

      // Show participant selection modal if no participant is selected and participants exist
      if (
        !currentParticipant &&
        data.participants &&
        data.participants.length > 0
      ) {
        setShowParticipantSelection(true);
      }
    } catch (error) {
      console.error('Error fetching group:', error);
      navigate('/404', { replace: true });
    }
  }, [groupId, navigate, currentParticipant]);

  const fetchExpenses = useCallback(async () => {
    if (!groupId || !group) return;
    try {
      const data = await getExpensesByGroupId(groupId);
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: 'Error loading expenses',
        description: 'Could not load expenses for this group.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [group, groupId, toast]);

  const fetchSettlements = useCallback(async () => {
    if (!groupId || !group) return;
    try {
      const data = await getSettlementsByGroupId(groupId);
      setSettlements(data);
    } catch (error) {
      console.error('Error fetching settlements:', error);
    }
  }, [group, groupId]);

  const refreshTransactions = useCallback(async () => {
    await Promise.all([fetchExpenses(), fetchSettlements()]);
  }, [fetchExpenses, fetchSettlements]);

  useEffect(() => {
    fetchGroupData();
    fetchExpenses();
    fetchSettlements();
  }, [fetchGroupData, fetchExpenses, fetchSettlements]);

  // Update page title when group name changes
  useEffect(() => {
    if (group?.name) {
      document.title = `${group.name} - Splitsy`;
    }
    
    // Cleanup: reset to default title when component unmounts
    return () => {
      document.title = 'Splitsy - Split Bills Made Easy';
    };
  }, [group?.name]);

  const handleParticipantSelect = async (participantId: string) => {
    if (!groupId) return;

    setCurrentParticipant(participantId);
    sessionStorage.setItem(`participant_${groupId}`, participantId);

    // Record group view
    try {
      await recordGroupView(groupId, participantId);
    } catch (error) {
      console.error('Error recording group view:', error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link copied!',
        description:
          'Share this link with your friends to add them to the group',
      });
    } catch (error) {
      toast({
        title: 'Could not copy link',
        description: 'Please copy the URL manually',
        variant: 'destructive',
      });
    }
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleOpenDialog = (type: 'expense' | 'transfer' | 'income') => {
    setDialogType(type);
    setEditingExpense(null);
    setShowExpenseDialog(true);
  };

  const handleSaveExpense = async (expenseData: {
    description: string;
    amount: number;
    paidBy: string;
    splitMode: 'equal' | 'amount' | 'weight';
    splits: Array<{
      participant_id: string;
      amount: number;
      custom_amount?: number;
      weight?: number;
    }>;
    expenseType: 'expense' | 'transfer' | 'income';
    transferTo?: string;
    date: string;
  }) => {
    if (!groupId || !group) return;

    try {
      const expense = {
        description: expenseData.description,
        amount: expenseData.amount,
        paid_by: expenseData.paidBy,
        group_id: groupId,
        split_type: expenseData.splitMode,
        expense_type: expenseData.expenseType,
        created_at: new Date(expenseData.date).toISOString(),
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id, expense, expenseData.splits);
        toast({
          title: `${
            expenseData.expenseType.charAt(0).toUpperCase() +
            expenseData.expenseType.slice(1)
          } updated`,
          description: `$${expenseData.amount.toFixed(2)} ${
            expenseData.expenseType
          } has been updated`,
        });
      } else {
        await createExpense(expense, expenseData.splits);
        toast({
          title: `${
            expenseData.expenseType.charAt(0).toUpperCase() +
            expenseData.expenseType.slice(1)
          } added`,
          description: `$${expenseData.amount.toFixed(2)} ${
            expenseData.expenseType
          } has been recorded`,
        });
      }

      setShowExpenseDialog(false);
      setEditingExpense(null);
      fetchExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast({
        title: 'Error saving',
        description: 'Could not save. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditExpense = (expense: ExpenseWithSplits) => {
    setEditingExpense(expense);
    setDialogType(
      (expense.expense_type as 'expense' | 'transfer' | 'income') || 'expense'
    );
    setShowExpenseDialog(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteExpense(expenseId);
      toast({
        title: 'Deleted',
        description: 'The item has been removed',
      });
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting:', error);
      toast({
        title: 'Error deleting',
        description: 'Could not delete. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const totalExpenses = expenses
    .filter((e) => e.expense_type === 'expense' || !e.expense_type)
    .reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncome = expenses
    .filter((e) => e.expense_type === 'income')
    .reduce((sum, expense) => sum + expense.amount, 0);

  const handleSaveName = async () => {
    if (!groupId || !newGroupName.trim()) return;
    setNameLoading(true);
    try {
      const { data, error } = await updateGroupName(
        groupId,
        newGroupName,
        group?.description
      );
      if (error || !data) {
        toast({
          title: 'Error updating group name',
          description: error?.message || 'Could not update group name.',
          variant: 'destructive',
        });
        setNameLoading(false);
        return;
      }
      setGroup((prevGroup) =>
        prevGroup ? { ...prevGroup, name: newGroupName } : prevGroup
      );
      setEditingName(false);
    } catch (err) {
      toast({
        title: 'Error updating group name',
        description: String(err),
        variant: 'destructive',
      });
    } finally {
      setNameLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your group...</p>
        </div>
      </div>
    );
  }

  // No need to render a 'Group not found' message, as we redirect to NotFound page
  if (!group) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}

        <div className="w-full flex flex-col items-center justify-center py-4 px-2 gap-2 md:gap-4">
          {editingName ? (
            <div className="w-full max-w-xl flex flex-col items-center gap-2">
              <input
                className="w-full text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent border-b border-blue-300 outline-none px-2 pb-1 text-center"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                disabled={nameLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') setEditingName(false);
                }}
                autoFocus
              />
              <textarea
                className="w-full text-slate-600 text-sm border-b border-blue-300 outline-none px-2 pb-1 resize-none text-center"
                value={group.description || ''}
                placeholder="Add a description..."
                onChange={(e) =>
                  setGroup((prev) =>
                    prev ? { ...prev, description: e.target.value } : prev
                  )
                }
                disabled={nameLoading}
                rows={2}
              />
              <div className="flex gap-2 mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveName}
                  disabled={nameLoading || !newGroupName.trim()}
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingName(false)}
                  disabled={nameLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-xl flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-2 w-full">
                <h1 className="w-full text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-none pb-1 text-center">
                  {group.name}
                </h1>
              </div>
              <p className="w-full text-slate-600 mt-1 text-center">
                {group.description ||
                  'Track expenses and settle debts with your group'}
              </p>
              <div className="flex gap-2 mt-1 justify-center">
                <Button
                  onClick={handleHomeClick}
                  variant="outline"
                  size="sm"
                  className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-600"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="sm"
                  className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-600"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  onClick={() => {
                    setEditingName(true);
                    setNewGroupName(group.name);
                  }}
                  variant="outline"
                  size="sm"
                  className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-600"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stats */}
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
            <div className="text-3xl font-bold text-red-600 mb-1">
              ${totalExpenses.toFixed(2)}
            </div>
            <div className="text-sm font-medium text-red-700">
              Total Expenses
            </div>
          </div>

          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-1">
              ${totalIncome.toFixed(2)}
            </div>
            <div className="text-sm font-medium text-green-700">
              Total Income
            </div>
          </div>
        </div>

        {/* Personal Summary */}
        {currentParticipant && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border-0 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Your Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-orange-50 border border-orange-200">
                <div className="text-xl font-bold text-orange-600 mb-1">
                  $
                  {(() => {
                    return expenses
                      .filter(
                        (e) => e.expense_type === 'expense' || !e.expense_type
                      )
                      .reduce((sum, expense) => {
                        const myShare =
                          expense.expense_splits.find(
                            (split) =>
                              split.participant_id === currentParticipant
                          )?.amount || 0;
                        return sum + myShare;
                      }, 0)
                      .toFixed(2);
                  })()}
                </div>
                <div className="text-xs font-medium text-orange-700">
                  My Cost
                </div>
              </div>

              <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="text-xl font-bold text-blue-600 mb-1">
                  $
                  {(() => {
                    return expenses
                      .filter((e) => e.paid_by === currentParticipant)
                      .reduce((sum, expense) => sum + expense.amount, 0)
                      .toFixed(2);
                  })()}
                </div>
                <div className="text-xs font-medium text-blue-700">I Paid</div>
              </div>

              <div className="text-center p-3 rounded-lg bg-purple-50 border border-purple-200">
                <div className="text-xl font-bold text-purple-600 mb-1">
                  $
                  {(() => {
                    // Sum of all income where I received the money
                    return expenses
                      .filter(
                        (e) =>
                          e.expense_type === 'income' &&
                          e.paid_by === currentParticipant
                      )
                      .reduce((sum, expense) => sum + expense.amount, 0)
                      .toFixed(2);
                  })()}
                </div>
                <div className="text-xs font-medium text-purple-700">
                  I Received
                </div>
              </div>

              <div className="text-center p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="text-xl font-bold text-emerald-600 mb-1">
                  $
                  {(() => {
                    let balance = 0;

                    // Calculate from expenses, transfers, and income
                    expenses.forEach((expense) => {
                      if (expense.expense_type === 'income') {
                        // For income: I received money and owe others their share
                        if (expense.paid_by === currentParticipant) {
                          // I received income, subtract what I owe to others
                          const totalOwedToOthers =
                            expense.expense_splits.reduce(
                              (sum, split) => sum + (split.amount || 0),
                              0
                            );
                          balance -= totalOwedToOthers;
                        } else {
                          // Someone else received income, add what they owe me
                          const myShare =
                            expense.expense_splits.find(
                              (split) =>
                                split.participant_id === currentParticipant
                            )?.amount || 0;
                          balance += myShare;
                        }
                      } else {
                        // For expenses and transfers: I paid - my share
                        if (expense.paid_by === currentParticipant) {
                          balance += expense.amount;
                        }
                        const myShare =
                          expense.expense_splits.find(
                            (split) =>
                              split.participant_id === currentParticipant
                          )?.amount || 0;
                        balance -= myShare;
                      }
                    });

                    // Account for settlements
                    settlements.forEach((settlement) => {
                      if (
                        settlement.from_participant_id === currentParticipant
                      ) {
                        // I paid someone, reduce what I'm owed
                        balance -= settlement.amount;
                      }
                      if (settlement.to_participant_id === currentParticipant) {
                        // Someone paid me, reduce what I'm owed
                        balance += settlement.amount;
                      }
                    });

                    return balance >= 0 ? balance.toFixed(2) : '0.00';
                  })()}
                </div>
                <div className="text-xs font-medium text-emerald-700">
                  I'm Owed
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-end mt-4 md:flex-nowrap md:gap-3 md:justify-end w-full">
          <div className="flex flex-col w-full gap-2 md:flex-row md:w-auto md:gap-3">
            <Button
              onClick={() => setShowParticipantsModal(true)}
              variant="outline"
              size="sm"
              className="border-purple-200 hover:bg-purple-50 hover:border-purple-300 text-purple-600 w-full md:w-auto"
            >
              <Users className="w-4 h-4 mr-2" />
              Manage Participants
            </Button>
            <Button
              onClick={() => handleOpenDialog('expense')}
              size="sm"
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white w-full md:w-auto"
              disabled={!group.participants || group.participants.length < 2}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
            <Button
              onClick={() => handleOpenDialog('income')}
              size="sm"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white w-full md:w-auto"
              disabled={!group.participants || group.participants.length < 2}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Add Income
            </Button>
            <Button
              onClick={() => handleOpenDialog('transfer')}
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white w-full md:w-auto"
              disabled={!group.participants || group.participants.length < 2}
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Add Transfer
            </Button>
          </div>
        </div>

        {/* Debt Settlement */}
        {expenses.length > 0 && group.participants && groupId && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border-0 p-6">
            <DebtSettlement
              expenses={expenses}
              participants={group.participants}
              groupId={groupId}
              currentParticipant={currentParticipant}
              onTransactionChange={refreshTransactions}
            />
          </div>
        )}

        {(expenses.length > 0 || settlements.length > 0) && (
          <RecentTransactions
            expenses={expenses}
            settlements={settlements}
            handleEditExpense={handleEditExpense}
            handleDeleteExpense={handleDeleteExpense}
            refreshTransactions={refreshTransactions}
            group={group}
          />
        )}
      </div>

      <ParticipantsModal
        open={showParticipantsModal}
        onOpenChange={setShowParticipantsModal}
        participants={group.participants || []}
        onParticipantChange={fetchGroupData}
      />

      <ParticipantSelectionModal
        open={showParticipantSelection}
        onOpenChange={setShowParticipantSelection}
        participants={group.participants || []}
        onParticipantSelect={handleParticipantSelect}
      />

      <ExpenseTypeDialog
        open={showExpenseDialog}
        onOpenChange={(open) => {
          setShowExpenseDialog(open);
          if (!open) setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        participants={group.participants || []}
        expense={editingExpense}
        isEditing={!!editingExpense}
        type={dialogType}
      />
    </div>
  );
}
