import { ArrowRightLeft, Plus, TrendingUp, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';

import {
  createExpense,
  deleteExpense,
  getExpensesByGroupId,
  updateExpense,
} from '@/api/expenses';
import { getGroupById } from '@/api/groups';
import { recordGroupView } from '@/api/groupViews';
import { getSettlementsByGroupId } from '@/api/settlements';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import useExpenseStore from '@/hooks/useExpense';
import useGroup from '@/hooks/useGroup';
import useSettlementStore from '@/hooks/useSettlement';
import { DebtSettlement } from './DebtSettlement';
import { ExpenseTypeDialog } from './ExpenseTypeDialog';
import Header from './Header';
import { ParticipantSelectionModal } from './ParticipantSelectionModal';
import { ParticipantsModal } from './ParticipantsModal';
import RecentTransactions from './RecentTransactions';
import Stats from './Stats';
import Summary from './Summary';
import { ExpenseWithSplits } from '@/types/expense';

export function GroupDashboard() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const {
    id,
    setState,
    participants,
    currentParticipant,
    setCurrentParticipant,
  } = useGroup(
    useShallow((state) => ({
      id: state.id,
      setState: state.setState,
      participants: state.participants,
      currentParticipant: state.currentParticipant,
      setCurrentParticipant: state.setCurrentParticipant,
    }))
  );

  const { expenses, setExpenses, loading, setLoading } = useExpenseStore();
  const { settlements, setSettlements } = useSettlementStore();
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [showParticipantSelection, setShowParticipantSelection] =
    useState(false);

  const [dialogType, setDialogType] = useState<
    'expense' | 'transfer' | 'income'
  >('expense');
  const [editingExpense, setEditingExpense] =
    useState<ExpenseWithSplits | null>(null);
  const { toast } = useToast();

  // Check for existing participant selection in session storage
  useEffect(() => {
    if (groupId) {
      const storedParticipant = localStorage.getItem(`participant_${groupId}`);
      if (storedParticipant) {
        setCurrentParticipant(storedParticipant);
      }
    }
  }, [groupId, setCurrentParticipant]);

  const fetchGroupData = useCallback(async () => {
    if (!groupId) return;
    try {
      const { data, error } = await getGroupById(groupId);
      if (error || !data) {
        navigate('/404', { replace: true });
        return;
      }
      setState((state) => {
        state.id = data.id;
        state.name = data.name;
        state.description = data.description;
        state.participants = data.participants || [];
      });
    } catch (error) {
      console.error('Error fetching group:', error);
      navigate('/404', { replace: true });
    }
  }, [groupId, setState, navigate]);

  useEffect(() => {
    if (!currentParticipant && participants.length > 0) {
      setShowParticipantSelection(true);
    }

    if (currentParticipant && participants.length === 1) {
      setShowParticipantsModal(true);
    }
  }, [currentParticipant, participants.length]);

  const fetchExpenses = useCallback(async () => {
    if (!groupId || !id) return;
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
  }, [groupId, id, setExpenses, setLoading, toast]);

  const fetchSettlements = useCallback(async () => {
    if (!groupId || !id) return;
    try {
      const data = await getSettlementsByGroupId(groupId);
      setSettlements(data);
    } catch (error) {
      console.error('Error fetching settlements:', error);
    }
  }, [groupId, id, setSettlements]);

  const refreshTransactions = useCallback(async () => {
    await Promise.all([fetchExpenses(), fetchSettlements()]);
  }, [fetchExpenses, fetchSettlements]);

  useEffect(() => {
    setLoading(true);
    fetchGroupData();
    fetchExpenses();
    fetchSettlements();
  }, [fetchGroupData, fetchExpenses, fetchSettlements, setLoading]);

  const handleParticipantSelect = async (participantId: string) => {
    if (!groupId) return;

    setCurrentParticipant(participantId);
    localStorage.setItem(`participant_${groupId}`, participantId);

    // Record group view
    try {
      await recordGroupView(groupId, participantId);
    } catch (error) {
      console.error('Error recording group view:', error);
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
    date: string;
  }) => {
    if (!groupId || !id) return;

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
  if (!id) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}

        <Header />

        <Stats />

        <Summary />

        <div className="flex flex-wrap gap-3 justify-end mt-4 md:flex-nowrap md:gap-3 md:justify-end w-full">
          <div className="flex  w-full flex-wrap justify-center gap-2 md:flex-row md:w-auto md:gap-3">
            <Button
              onClick={() => setShowParticipantsModal(true)}
              variant="outline"
              size="sm"
              className="border-purple-200 hover:bg-purple-50 hover:border-purple-300 text-purple-600 md:w-auto"
            >
              <Users className="w-4 h-4 mr-2" />
              Participants
            </Button>
            <Button
              onClick={() => handleOpenDialog('expense')}
              size="sm"
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white md:w-auto"
              disabled={!participants || participants.length < 2}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
            <Button
              onClick={() => handleOpenDialog('income')}
              size="sm"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white  md:w-auto"
              disabled={!participants || participants.length < 2}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Add Income
            </Button>
            <Button
              onClick={() => handleOpenDialog('transfer')}
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white  md:w-auto"
              disabled={!participants || participants.length < 2}
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Add Transfer
            </Button>
          </div>
        </div>

        {/* Debt Settlement */}
        {expenses.length > 0 && participants && groupId && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border-0 p-6">
            <DebtSettlement onTransactionChange={refreshTransactions} />
          </div>
        )}

        {(expenses.length > 0 || settlements.length > 0) && (
          <RecentTransactions
            handleEditExpense={handleEditExpense}
            handleDeleteExpense={handleDeleteExpense}
            refreshTransactions={refreshTransactions}
          />
        )}
      </div>

      <ParticipantsModal
        open={showParticipantsModal}
        onOpenChange={setShowParticipantsModal}
        onParticipantChange={fetchGroupData}
      />

      <ParticipantSelectionModal
        open={showParticipantSelection}
        onOpenChange={setShowParticipantSelection}
        onParticipantSelect={handleParticipantSelect}
      />

      <ExpenseTypeDialog
        open={showExpenseDialog}
        onOpenChange={(open) => {
          setShowExpenseDialog(open);
          if (!open) setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        expense={editingExpense}
        isEditing={!!editingExpense}
        type={dialogType}
      />
    </div>
  );
}
