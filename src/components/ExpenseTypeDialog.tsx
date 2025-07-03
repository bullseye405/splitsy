import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Participant } from '@/types/participants';
import { ExpenseWithSplits } from '@/api/expenses';

interface ExpenseTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
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
}

export function ExpenseTypeDialog({
  open,
  onOpenChange,
  onSave,
  participants,
  expense,
  isEditing = false,
  type,
}: ExpenseTypeDialogProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [splitBetween, setSplitBetween] = useState<string[]>([]);
  const [splitMode, setSplitMode] = useState<'equal' | 'amount' | 'weight'>('equal');
  const [customAmounts, setCustomAmounts] = useState<{ [key: string]: number }>({});
  const [weights, setWeights] = useState<{ [key: string]: number }>({});
  const { toast } = useToast();

  useEffect(() => {
    if (expense && isEditing) {
      setDescription(expense.description || '');
      setAmount(expense.amount.toString());
      setPaidBy(expense.paid_by);
      setSplitMode((expense.split_type as 'equal' | 'amount' | 'weight') || 'equal');
      
      const participantIds = expense.expense_splits.map(split => split.participant_id).filter(Boolean) as string[];
      setSplitBetween(participantIds);
      
      const amounts: { [key: string]: number } = {};
      const weightValues: { [key: string]: number } = {};
      expense.expense_splits.forEach(split => {
        if (split.participant_id) {
          amounts[split.participant_id] = split.amount;
          weightValues[split.participant_id] = split.weight || 1;
        }
      });
      setCustomAmounts(amounts);
      setWeights(weightValues);
    } else {
      // Reset form
      setDescription('');
      setAmount('');
      setPaidBy('');
      setTransferTo('');
      setSplitBetween(type === 'transfer' ? [] : participants.map(p => p.id));
      setSplitMode('equal');
      setCustomAmounts({});
      setWeights({});
    }
  }, [expense, isEditing, participants, type, open]);

  const getTitle = () => {
    if (isEditing) return `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    return `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  };

  const getDescription = () => {
    switch (type) {
      case 'expense': return 'Record a new expense for the group';
      case 'transfer': return 'Record a direct transfer between participants';
      case 'income': return 'Record income for the group';
      default: return '';
    }
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      toast({
        title: 'Description required',
        description: 'Please enter a description',
        variant: 'destructive',
      });
      return;
    }

    const amountNumber = parseFloat(amount);
    if (!amount || isNaN(amountNumber) || amountNumber <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount greater than 0',
        variant: 'destructive',
      });
      return;
    }

    if (!paidBy) {
      toast({
        title: type === 'transfer' ? 'Who transferred?' : 'Who paid?',
        description: `Please select who ${type === 'transfer' ? 'sent the money' : 'paid'}`,
        variant: 'destructive',
      });
      return;
    }

    if (type === 'transfer') {
      if (!transferTo) {
        toast({
          title: 'Transfer to whom?',
          description: 'Please select who received the transfer',
          variant: 'destructive',
        });
        return;
      }
      if (paidBy === transferTo) {
        toast({
          title: 'Invalid transfer',
          description: 'Cannot transfer to the same person',
          variant: 'destructive',
        });
        return;
      }
    } else if (splitBetween.length === 0) {
      toast({
        title: 'Split between who?',
        description: 'Please select at least one person to split with',
        variant: 'destructive',
      });
      return;
    }

    const splits = type === 'transfer' ? [
      { participant_id: transferTo, amount: amountNumber }
    ] : splitBetween.map(participantId => {
      let splitAmount = amountNumber / splitBetween.length;
      
      if (splitMode === 'amount') {
        splitAmount = customAmounts[participantId] || 0;
      } else if (splitMode === 'weight') {
        const totalWeight = splitBetween.reduce((sum, id) => sum + (weights[id] || 1), 0);
        const participantWeight = weights[participantId] || 1;
        splitAmount = (amountNumber * participantWeight) / totalWeight;
      }

      return {
        participant_id: participantId,
        amount: splitAmount,
        custom_amount: splitMode === 'amount' ? customAmounts[participantId] : undefined,
        weight: splitMode === 'weight' ? weights[participantId] : undefined,
      };
    });

    onSave({
      description: description.trim(),
      amount: amountNumber,
      paidBy,
      splitMode,
      splits,
      expenseType: type,
      transferTo: type === 'transfer' ? transferTo : undefined,
    });

    // Reset form
    setDescription('');
    setAmount('');
    setPaidBy('');
    setTransferTo('');
    setSplitBetween(type === 'transfer' ? [] : participants.map(p => p.id));
    setSplitMode('equal');
    setCustomAmounts({});
    setWeights({});
  };

  const handleSplitToggle = (participantId: string, checked: boolean) => {
    if (checked) {
      setSplitBetween([...splitBetween, participantId]);
      // Initialize default values
      if (splitMode === 'amount') {
        const equalAmount = parseFloat(amount) / (splitBetween.length + 1) || 0;
        setCustomAmounts((prev) => ({ ...prev, [participantId]: equalAmount }));
      }
      if (splitMode === 'weight') {
        setWeights((prev) => ({ ...prev, [participantId]: 1 }));
      }
    } else {
      setSplitBetween(splitBetween.filter((id) => id !== participantId));
      // Clean up values
      setCustomAmounts((prev) => {
        const newAmounts = { ...prev };
        delete newAmounts[participantId];
        return newAmounts;
      });
      setWeights((prev) => {
        const newWeights = { ...prev };
        delete newWeights[participantId];
        return newWeights;
      });
    }
  };

  const selectAllParticipants = () => {
    const allIds = participants.map((p) => p.id);
    setSplitBetween(allIds);

    if (splitMode === 'amount') {
      const equalAmount = parseFloat(amount) / allIds.length || 0;
      const newAmounts: { [key: string]: number } = {};
      allIds.forEach((id) => (newAmounts[id] = equalAmount));
      setCustomAmounts(newAmounts);
    }
    if (splitMode === 'weight') {
      const newWeights: { [key: string]: number } = {};
      allIds.forEach((id) => (newWeights[id] = 1));
      setWeights(newWeights);
    }
  };

  const clearAllParticipants = () => {
    setSplitBetween([]);
    setCustomAmounts({});
    setWeights({});
  };

  const handleCustomAmountChange = (participantId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setCustomAmounts((prev) => ({ ...prev, [participantId]: numValue }));

    // Update other amounts to balance
    const totalAmount = parseFloat(amount) || 0;
    const otherParticipants = splitBetween.filter((id) => id !== participantId);
    if (otherParticipants.length > 0) {
      const remainingAmount = totalAmount - numValue;
      const equalSplit = remainingAmount / otherParticipants.length;
      const newAmounts = { ...customAmounts, [participantId]: numValue };
      otherParticipants.forEach((id) => {
        newAmounts[id] = equalSplit;
      });
      setCustomAmounts(newAmounts);
    }
  };

  const handleWeightChange = (participantId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setWeights((prev) => ({ ...prev, [participantId]: numValue }));
  };

  const calculateWeightedAmount = (participantId: string) => {
    const totalAmount = parseFloat(amount) || 0;
    const participantWeight = weights[participantId] || 1;
    const totalWeight = splitBetween.reduce(
      (sum, id) => sum + (weights[id] || 1),
      0
    );
    return totalWeight > 0
      ? (totalAmount * participantWeight) / totalWeight
      : 0;
  };

  const getDisplayAmount = (participantId: string) => {
    if (splitMode === 'equal') {
      return (parseFloat(amount) || 0) / splitBetween.length;
    } else if (splitMode === 'amount') {
      return customAmounts[participantId] || 0;
    } else {
      return calculateWeightedAmount(participantId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === 'transfer' ? 'Cash repayment, loan...' : type === 'income' ? 'Refund, returned deposit...' : 'Dinner, taxi, groceries...'}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Amount ($)
            </label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {type === 'transfer' ? 'From' : type === 'income' ? 'Received by' : 'Paid by'}
            </label>
            <Select value={paidBy} onValueChange={setPaidBy}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder={`Select who ${type === 'transfer' ? 'sent' : type === 'income' ? 'received' : 'paid'}`} />
              </SelectTrigger>
              <SelectContent>
                {participants.map((participant) => (
                  <SelectItem key={participant.id} value={participant.id}>
                    {participant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === 'transfer' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">To</label>
              <Select value={transferTo} onValueChange={setTransferTo}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select who received" />
                </SelectTrigger>
                <SelectContent>
                  {participants.filter(p => p.id !== paidBy).map((participant) => (
                    <SelectItem key={participant.id} value={participant.id}>
                      {participant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {type !== 'transfer' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {type === 'income' ? 'Benefited' : 'Split between'}
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSplitBetween(participants.map(p => p.id))}
                  >
                    All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSplitBetween([])}
                  >
                    None
                  </Button>
                </div>
              </div>

              <Tabs value={splitMode} onValueChange={(value) => setSplitMode(value as 'equal' | 'amount' | 'weight')}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="equal">Split Equally</TabsTrigger>
                  <TabsTrigger value="amount">Split Amount</TabsTrigger>
                  <TabsTrigger value="weight">Split by Weight</TabsTrigger>
                </TabsList>

                <TabsContent value="equal" className="space-y-2 max-h-48 overflow-y-auto">
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`split-${participant.id}`}
                          checked={splitBetween.includes(participant.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSplitBetween([...splitBetween, participant.id]);
                            } else {
                              setSplitBetween(splitBetween.filter(id => id !== participant.id));
                            }
                          }}
                        />
                        <label htmlFor={`split-${participant.id}`} className="text-sm font-medium">
                          {participant.name}
                        </label>
                      </div>
                      {splitBetween.includes(participant.id) && (
                        <span className="text-sm font-medium text-primary">
                          ${((parseFloat(amount) || 0) / splitBetween.length).toFixed(2)}
                        </span>
                      )}
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="gradient">
            {isEditing ? 'Update' : 'Add'} {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
