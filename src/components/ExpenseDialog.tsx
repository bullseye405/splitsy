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
import { useEffect, useState } from 'react';
import { Participant } from '@/types/participants';
import { ExpenseWithSplits } from '@/types/expense';

type SplitMode = 'equal' | 'amount' | 'weight';

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (expense: {
    description: string;
    amount: number;
    paidBy: string;
    splitMode: SplitMode;
    splits: Array<{
      participant_id: string;
      amount: number;
      custom_amount?: number;
      weight?: number;
    }>;
  }) => void;
  participants: Participant[];
  expense?: ExpenseWithSplits | null;
  isEditing?: boolean;
}

export function ExpenseDialog({
  open,
  onOpenChange,
  onSave,
  participants,
  expense,
  isEditing = false,
}: ExpenseDialogProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitBetween, setSplitBetween] = useState<string[]>([]);
  const [splitMode, setSplitMode] = useState<SplitMode>('equal');
  const [customAmounts, setCustomAmounts] = useState<{ [key: string]: number }>(
    {}
  );
  const [weights, setWeights] = useState<{ [key: string]: number }>({});
  const { toast } = useToast();

  // Initialize form with expense data if editing
  useEffect(() => {
    if (isEditing && expense) {
      setDescription(expense.description || '');
      setAmount(expense.amount.toString());
      setPaidBy(expense.paid_by);
      setSplitMode((expense.split_type as SplitMode) || 'equal');

      const participantIds = expense.expense_splits.map(
        (split) => split.participant_id!
      );
      setSplitBetween(participantIds);

      // Set custom amounts and weights from splits
      const amounts: { [key: string]: number } = {};
      const splitWeights: { [key: string]: number } = {};

      expense.expense_splits.forEach((split) => {
        if (split.participant_id) {
          amounts[split.participant_id] = split.custom_amount || split.amount;
          splitWeights[split.participant_id] = split.weight || 1;
        }
      });

      setCustomAmounts(amounts);
      setWeights(splitWeights);
    } else {
      // Default: select all participants for new expense
      const allParticipantIds = participants.map((p) => p.id);
      setSplitBetween(allParticipantIds);

      // Initialize weights to 1 for all participants
      const defaultWeights: { [key: string]: number } = {};
      allParticipantIds.forEach((id) => {
        defaultWeights[id] = 1;
      });
      setWeights(defaultWeights);
    }
  }, [isEditing, expense, participants, open]);

  // Update custom amounts when amount or participants change
  useEffect(() => {
    if (splitMode === 'amount' && splitBetween.length > 0) {
      const totalAmount = parseFloat(amount) || 0;
      const equalAmount = totalAmount / splitBetween.length;
      const newAmounts: { [key: string]: number } = {};
      splitBetween.forEach((id) => {
        newAmounts[id] = customAmounts[id] || equalAmount;
      });
      setCustomAmounts(newAmounts);
    }
  }, [amount, splitBetween, splitMode]);

  const handleSubmit = () => {
    if (!description.trim()) {
      toast({
        title: 'Description required',
        description: 'Please enter a description for the expense',
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
        title: 'Who paid?',
        description: 'Please select who paid for this expense',
        variant: 'destructive',
      });
      return;
    }

    if (splitBetween.length === 0) {
      toast({
        title: 'Split between who?',
        description:
          'Please select at least one person to split the expense with',
        variant: 'destructive',
      });
      return;
    }

    // Calculate splits based on mode
    const splits = splitBetween.map((participantId) => {
      let splitAmount = 0;
      let customAmount = undefined;
      let weight = undefined;

      if (splitMode === 'equal') {
        splitAmount = amountNumber / splitBetween.length;
      } else if (splitMode === 'amount') {
        splitAmount = customAmounts[participantId] || 0;
        customAmount = splitAmount;
      } else if (splitMode === 'weight') {
        const participantWeight = weights[participantId] || 1;
        const totalWeight = splitBetween.reduce(
          (sum, id) => sum + (weights[id] || 1),
          0
        );
        splitAmount =
          totalWeight > 0
            ? (amountNumber * participantWeight) / totalWeight
            : 0;
        weight = participantWeight;
      }

      return {
        participant_id: participantId,
        amount: splitAmount,
        custom_amount: customAmount,
        weight: weight,
      };
    });

    onSave({
      description: description.trim(),
      amount: amountNumber,
      paidBy,
      splitMode,
      splits,
    });

    // Reset form
    if (!isEditing) {
      setDescription('');
      setAmount('');
      setPaidBy('');
      const allIds = participants.map((p) => p.id);
      setSplitBetween(allIds);
      setSplitMode('equal');
      setCustomAmounts({});
      const defaultWeights: { [key: string]: number } = {};
      allIds.forEach((id) => {
        defaultWeights[id] = 1;
      });
      setWeights(defaultWeights);
    }
  };

  const handleSplitToggle = (participantId: string, checked: boolean) => {
    if (checked) {
      setSplitBetween([...splitBetween, participantId]);
      if (splitMode === 'amount') {
        const totalAmount = parseFloat(amount) || 0;
        const equalAmount = totalAmount / (splitBetween.length + 1);
        setCustomAmounts((prev) => ({ ...prev, [participantId]: equalAmount }));
      }
      if (splitMode === 'weight') {
        setWeights((prev) => ({ ...prev, [participantId]: 1 }));
      }
    } else {
      setSplitBetween(splitBetween.filter((id) => id !== participantId));
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

  const handleCustomAmountChange = (participantId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setCustomAmounts((prev) => ({ ...prev, [participantId]: numValue }));
  };

  const handleWeightChange = (participantId: string, value: string) => {
    const numValue = parseFloat(value) || 1;
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Expense' : 'Add Expense'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the expense details'
              : 'Record a new expense for the group'}
          </DialogDescription>
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
              placeholder="Dinner, taxi, groceries..."
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
            <label className="text-sm font-medium">Who paid?</label>
            <Select value={paidBy} onValueChange={setPaidBy}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select who paid" />
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

          <div className="space-y-4">
            <label className="text-sm font-medium">Split between</label>

            <Tabs
              value={splitMode}
              onValueChange={(value) => setSplitMode(value as SplitMode)}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="equal">Split Equally</TabsTrigger>
                <TabsTrigger value="amount">Split Amount</TabsTrigger>
                <TabsTrigger value="weight">Split by Weight</TabsTrigger>
              </TabsList>

              <TabsContent
                value="equal"
                className="space-y-2 max-h-48 overflow-y-auto"
              >
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`split-${participant.id}`}
                        checked={splitBetween.includes(participant.id)}
                        onCheckedChange={(checked) =>
                          handleSplitToggle(participant.id, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`split-${participant.id}`}
                        className="text-sm font-medium"
                      >
                        {participant.name}
                      </label>
                    </div>
                    {splitBetween.includes(participant.id) && (
                      <span className="text-sm font-medium text-primary">
                        ${getDisplayAmount(participant.id).toFixed(2)}
                      </span>
                    )}
                  </div>
                ))}
              </TabsContent>

              <TabsContent
                value="amount"
                className="space-y-2 max-h-48 overflow-y-auto"
              >
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`split-amount-${participant.id}`}
                        checked={splitBetween.includes(participant.id)}
                        onCheckedChange={(checked) =>
                          handleSplitToggle(participant.id, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`split-amount-${participant.id}`}
                        className="text-sm font-medium"
                      >
                        {participant.name}
                      </label>
                    </div>
                    {splitBetween.includes(participant.id) && (
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={customAmounts[participant.id] || 0}
                        onChange={(e) =>
                          handleCustomAmountChange(
                            participant.id,
                            e.target.value
                          )
                        }
                        className="w-20 h-8 text-sm"
                      />
                    )}
                  </div>
                ))}
              </TabsContent>

              <TabsContent
                value="weight"
                className="space-y-2 max-h-48 overflow-y-auto"
              >
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`split-weight-${participant.id}`}
                        checked={splitBetween.includes(participant.id)}
                        onCheckedChange={(checked) =>
                          handleSplitToggle(participant.id, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`split-weight-${participant.id}`}
                        className="text-sm font-medium"
                      >
                        {participant.name}
                      </label>
                    </div>
                    {splitBetween.includes(participant.id) && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={weights[participant.id] || 1}
                          onChange={(e) =>
                            handleWeightChange(participant.id, e.target.value)
                          }
                          className="w-16 h-8 text-sm"
                        />
                        <span className="text-sm font-medium text-primary w-16 text-right">
                          ${getDisplayAmount(participant.id).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="gradient">
            {isEditing ? 'Update Expense' : 'Add Expense'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
