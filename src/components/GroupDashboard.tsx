
import { getGroupById } from '@/api/groups';
import { createExpense, deleteExpense, getExpensesByGroupId, updateExpense, ExpenseWithSplits } from '@/api/expenses';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Edit, Plus, Share, Trash2, Users, ArrowRightLeft, TrendingUp, DollarSign } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ExpenseTypeDialog } from './ExpenseTypeDialog';
import { ParticipantsModal } from './ParticipantsModal';
import { DebtSettlement } from './DebtSettlement';
import { Group } from '@/types/group';

export function GroupDashboard() {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<Group>();
  const [expenses, setExpenses] = useState<ExpenseWithSplits[]>([]);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [dialogType, setDialogType] = useState<'expense' | 'transfer' | 'income'>('expense');
  const [editingExpense, setEditingExpense] = useState<ExpenseWithSplits | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const shareUrl = `${window.location.origin}?group=${groupId}`;

  const fetchGroupData = useCallback(async () => {
    if (!groupId) return;
    try {
      const { data, error } = await getGroupById(groupId);
      if (error || !data) {
        toast({
          title: 'Error loading group',
          description: error?.message || 'Group not found.',
          variant: 'destructive',
        });
        return;
      }
      setGroup(data);
    } catch (error) {
      console.error('Error fetching group:', error);
    }
  }, [groupId, toast]);

  const fetchExpenses = useCallback(async () => {
    if (!groupId) return;
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
  }, [groupId, toast]);

  useEffect(() => {
    fetchGroupData();
    fetchExpenses();
  }, [fetchGroupData, fetchExpenses]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link copied!',
        description: 'Share this link with your friends to add them to the group',
      });
    } catch (error) {
      toast({
        title: 'Could not copy link',
        description: 'Please copy the URL manually',
        variant: 'destructive',
      });
    }
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
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id, expense, expenseData.splits);
        toast({
          title: `${expenseData.expenseType.charAt(0).toUpperCase() + expenseData.expenseType.slice(1)} updated`,
          description: `$${expenseData.amount.toFixed(2)} ${expenseData.expenseType} has been updated`,
        });
      } else {
        await createExpense(expense, expenseData.splits);
        toast({
          title: `${expenseData.expenseType.charAt(0).toUpperCase() + expenseData.expenseType.slice(1)} added`,
          description: `$${expenseData.amount.toFixed(2)} ${expenseData.expenseType} has been recorded`,
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
    setDialogType((expense.expense_type as 'expense' | 'transfer' | 'income') || 'expense');
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

  const totalExpenses = expenses.filter(e => e.expense_type === 'expense' || !e.expense_type).reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncome = expenses.filter(e => e.expense_type === 'income').reduce((sum, expense) => sum + expense.amount, 0);

  const getExpenseTypeIcon = (expenseType: string) => {
    switch (expenseType) {
      case 'transfer': return <ArrowRightLeft className="w-4 h-4" />;
      case 'income': return <TrendingUp className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getExpenseTypeColor = (expenseType: string) => {
    switch (expenseType) {
      case 'transfer': return 'text-blue-600';
      case 'income': return 'text-green-600';
      default: return 'text-primary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">Group not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <div className="flex items-center gap-2">
            <Button onClick={handleShare} variant="ghost" size="sm">
              <Share className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setShowParticipantsModal(true)}
              variant="ghost"
              size="sm"
            >
              <Users className="w-4 h-4 mr-1" />
              Manage Participants
            </Button>
          </div>
        </div>

        {/* Top Dashboard Card */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
              {/* Stats */}
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  ${totalExpenses.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Expenses</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${totalIncome.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Income</div>
              </div>

              {/* Action Buttons */}
              <Button
                onClick={() => handleOpenDialog('expense')}
                size="sm"
                variant="outline"
                disabled={!group.participants || group.participants.length < 2}
              >
                <Plus className="w-4 h-4 mr-1" />
                Expense
              </Button>
              
              <div className="flex gap-1">
                <Button
                  onClick={() => handleOpenDialog('income')}
                  size="sm"
                  variant="outline"
                  disabled={!group.participants || group.participants.length < 2}
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Income
                </Button>
                <Button
                  onClick={() => handleOpenDialog('transfer')}
                  size="sm"
                  variant="outline"
                  disabled={!group.participants || group.participants.length < 2}
                >
                  <ArrowRightLeft className="w-4 h-4 mr-1" />
                  Transfer
                </Button>
              </div>
            </div>
            
            {(!group.participants || group.participants.length < 2) && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                Add at least 2 participants to start tracking
              </p>
            )}
          </CardContent>
        </Card>

        {/* Debt Settlement */}
        {expenses.length > 0 && group.participants && groupId && (
          <DebtSettlement expenses={expenses} participants={group.participants} groupId={groupId} />
        )}

        {/* Recent Transactions */}
        {expenses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {expenses.map((expense) => {
                const paidByName =
                  group.participants?.find((p) => p.id === expense.paid_by)?.name || 'Unknown';
                const expenseType = expense.expense_type || 'expense';
                
                return (
                  <div
                    key={expense.id}
                    className="flex justify-between items-center p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={getExpenseTypeColor(expenseType)}>
                          {getExpenseTypeIcon(expenseType)}
                        </span>
                        <span className="font-medium">{expense.description}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {expenseType === 'transfer' ? 'Transferred' : expenseType === 'income' ? 'Received' : 'Paid'} by {paidByName}
                        {expenseType !== 'transfer' && ` • Split ${expense.expense_splits.length} ways`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`text-lg font-semibold ${getExpenseTypeColor(expenseType)}`}>
                        ${expense.amount.toFixed(2)}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditExpense(expense)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>

      <ParticipantsModal
        open={showParticipantsModal}
        onOpenChange={setShowParticipantsModal}
        participants={group.participants || []}
        onParticipantChange={fetchGroupData}
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
