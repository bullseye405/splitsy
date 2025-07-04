import {
  ArrowRightLeft,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ExpenseWithSplits } from '@/api/expenses';
import { Participant } from '@/types/participants';

interface ExpenseTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (expenseData: {
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
  }) => void;
  participants: Participant[];
  expense?: ExpenseWithSplits | null;
  isEditing?: boolean;
  type: 'expense' | 'transfer' | 'income';
  currentParticipant?: string | null;
}

export function ExpenseTypeDialog({
  open,
  onOpenChange,
  onSave,
  participants,
  expense,
  isEditing = false,
  type,
  currentParticipant,
}: ExpenseTypeDialogProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [splitMode, setSplitMode] = useState<'equal' | 'amount' | 'weight'>(
    'equal'
  );
  const [splits, setSplits] = useState<
    Array<{
      participant_id: string;
      amount: number;
      custom_amount?: string;
      weight?: string;
    }>
  >([]);

  useEffect(() => {
    if (expense) {
      setDescription(expense.description || '');
      setAmount(expense.amount.toString());
      setPaidBy(expense.paid_by);
      setSplitMode(expense.split_type || 'equal');
      setTransferTo('');

      const initialSplits = participants.map((participant) => {
        const expenseSplit = expense.expense_splits.find(
          (es) => es.participant_id === participant.id
        );

        return {
          participant_id: participant.id,
          amount: expense.amount,
          custom_amount: expenseSplit?.custom_amount?.toString() || '',
          weight: expenseSplit?.weight?.toString() || '',
        };
      });
      setSplits(initialSplits);
    } else {
      setDescription('');
      setAmount('');
      setPaidBy('');
      setSplitMode('equal');
      setTransferTo('');
      setSplits([]);
    }
  }, [expense, participants]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);

    const expenseData = {
      description,
      amount: parsedAmount,
      paidBy,
      splitMode,
      splits: splits
        .filter((split) =>
          participants.find((p) => p.id === split.participant_id)
        )
        .map((split) => {
          const baseSplit = {
            participant_id: split.participant_id,
            amount: parsedAmount,
          };

          if (splitMode === 'amount' && split.custom_amount) {
            return {
              ...baseSplit,
              custom_amount: parseFloat(split.custom_amount),
            };
          }

          if (splitMode === 'weight' && split.weight) {
            return {
              ...baseSplit,
              weight: parseFloat(split.weight),
            };
          }

          return baseSplit;
        }),
      expenseType: type,
      transferTo,
    };

    onSave(expenseData);
  };

  const handleSplitChange = (participantId: string, checked: boolean) => {
    setSplits((prevSplits) => {
      if (checked) {
        return [
          ...prevSplits,
          { participant_id: participantId, amount: parseFloat(amount) },
        ];
      } else {
        return prevSplits.filter((split) => split.participant_id !== participantId);
      }
    });
  };

  const handleCustomAmountChange = (participantId: string, customAmount: string) => {
    setSplits((prevSplits) =>
      prevSplits.map((split) =>
        split.participant_id === participantId
          ? { ...split, custom_amount: customAmount }
          : split
      )
    );
  };

  const handleWeightChange = (participantId: string, weight: string) => {
    setSplits((prevSplits) =>
      prevSplits.map((split) =>
        split.participant_id === participantId ? { ...split, weight } : split
      )
    );
  };

  const isFormValid = () => {
    if (!description || !amount || !paidBy) return false;

    if (type === 'transfer' && !transferTo) return false;

    if (type !== 'transfer') {
      if (splits.length === 0) return false;

      if (splitMode === 'amount') {
        const totalCustomAmount = splits.reduce((sum, split) => {
          const customAmountValue = split.custom_amount ? parseFloat(split.custom_amount) : 0;
          return sum + customAmountValue;
        }, 0);

        if (Math.abs(totalCustomAmount - parseFloat(amount)) > 0.01) {
          return false;
        }
      }
    }

    return true;
  };

  const getParticipantDisplayName = (participantId: string) => {
    if (participantId === currentParticipant) {
      return 'me';
    }
    return participants.find((p) => p.id === participantId)?.name || 'Unknown';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'transfer' && <ArrowRightLeft className="w-5 h-5" />}
            {type === 'income' && <TrendingUp className="w-5 h-5" />}
            {type === 'expense' && <DollarSign className="w-5 h-5" />}
            {isEditing ? 'Edit' : 'Add'}{' '}
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Enter ${type} description`}
              required
            />
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          {/* Paid By Selection */}
          <div className="space-y-2">
            <Label>
              {type === 'transfer' ? 'Transfer from' : 
               type === 'income' ? 'Received by' : 'Paid by'}
            </Label>
            <Select value={paidBy} onValueChange={setPaidBy}>
              <SelectTrigger>
                <SelectValue placeholder="Select participant" />
              </SelectTrigger>
              <SelectContent>
                {participants.map((participant) => (
                  <SelectItem key={participant.id} value={participant.id}>
                    {getParticipantDisplayName(participant.id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transfer To Selection (for transfers only) */}
          {type === 'transfer' && (
            <div className="space-y-2">
              <Label>Transfer to</Label>
              <Select value={transferTo} onValueChange={setTransferTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {participants
                    .filter((p) => p.id !== paidBy)
                    .map((participant) => (
                      <SelectItem key={participant.id} value={participant.id}>
                        {getParticipantDisplayName(participant.id)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Split Configuration (for expenses and income only) */}
          {type !== 'transfer' && (
            <>
              <div className="space-y-2">
                <Label>Split method</Label>
                <Select value={splitMode} onValueChange={(value: 'equal' | 'amount' | 'weight') => setSplitMode(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equal">Split equally</SelectItem>
                    <SelectItem value="amount">Custom amounts</SelectItem>
                    <SelectItem value="weight">By weight/percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Participants Split Configuration */}
              <div className="space-y-3">
                <Label>Split between participants</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {participants.map((participant) => {
                    const split = splits.find((s) => s.participant_id === participant.id);
                    const isIncluded = !!split;

                    return (
                      <div key={participant.id} className="flex items-center gap-3 p-2 border rounded-lg">
                        <Checkbox
                          checked={isIncluded}
                          onCheckedChange={(checked) => handleSplitChange(participant.id, checked as boolean)}
                        />
                        <span className="flex-1 font-medium">
                          {getParticipantDisplayName(participant.id)}
                        </span>
                        
                        {isIncluded && splitMode === 'amount' && (
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-24"
                            placeholder="0.00"
                            value={split?.custom_amount || ''}
                            onChange={(e) => handleCustomAmountChange(participant.id, e.target.value)}
                          />
                        )}
                        
                        {isIncluded && splitMode === 'weight' && (
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            className="w-20"
                            placeholder="1.0"
                            value={split?.weight || ''}
                            onChange={(e) => handleWeightChange(participant.id, e.target.value)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid()}>
              {isEditing ? 'Update' : 'Save'} {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
