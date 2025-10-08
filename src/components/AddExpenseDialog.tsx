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
import { useState } from 'react';
import { useParams } from 'react-router-dom';

interface Participant {
  id: string;
  name: string;
}

interface Payer {
  participantId: string;
  amount: number;
}

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExpense: (expense: {
    description: string;
    amount: number;
    paidBy: string;
    splitBetween: string[];
    payers?: Payer[];
  }) => void;
  participants: Participant[];
}

export function AddExpenseDialog({
  open,
  onOpenChange,
  onAddExpense,
  participants,
}: AddExpenseDialogProps) {
  const { groupId } = useParams<{ groupId: string }>();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitBetween, setSplitBetween] = useState<string[]>([]);
  const [splitMode, setSplitMode] = useState<'equal' | 'amount' | 'weight'>(
    'equal'
  );
  const [customAmounts, setCustomAmounts] = useState<{ [key: string]: number }>(
    {}
  );
  const [weights, setWeights] = useState<{ [key: string]: number }>({});
  const [payers, setPayers] = useState<Payer[]>([]);
  const [multiPayer, setMultiPayer] = useState(false);
  const { toast } = useToast();

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

    if (!multiPayer && !paidBy) {
      toast({
        title: 'Who paid?',
        description: 'Please select who paid for this expense',
        variant: 'destructive',
      });
      return;
    }

    if (multiPayer && payers.length === 0) {
      toast({
        title: 'Who paid?',
        description: 'Please add at least one payer',
        variant: 'destructive',
      });
      return;
    }

    if (multiPayer) {
      const totalPaid = payers.reduce((sum, p) => sum + p.amount, 0);
      if (Math.abs(totalPaid - amountNumber) > 0.01) {
        toast({
          title: 'Amount mismatch',
          description: `Total paid (${totalPaid.toFixed(2)}) must equal expense amount (${amountNumber.toFixed(2)})`,
          variant: 'destructive',
        });
        return;
      }
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

    onAddExpense({
      description: description.trim(),
      amount: amountNumber,
      paidBy: multiPayer ? payers[0].participantId : paidBy,
      splitBetween,
      payers: multiPayer ? payers : undefined,
    });

    // Reset form
    setDescription('');
    setAmount('');
    setPaidBy('');
    setSplitBetween([]);
    setSplitMode('equal');
    setCustomAmounts({});
    setWeights({});
    setPayers([]);
    setMultiPayer(false);
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

  const addPayer = () => {
    const remainingAmount = parseFloat(amount) - payers.reduce((sum, p) => sum + p.amount, 0);
    if (payers.length < participants.length && remainingAmount > 0) {
      setPayers([...payers, { participantId: '', amount: remainingAmount }]);
    }
  };

  const updatePayer = (index: number, field: 'participantId' | 'amount', value: string | number) => {
    const newPayers = [...payers];
    if (field === 'participantId') {
      newPayers[index].participantId = value as string;
    } else {
      newPayers[index].amount = typeof value === 'number' ? value : parseFloat(value) || 0;
    }
    setPayers(newPayers);
  };

  const removePayer = (index: number) => {
    setPayers(payers.filter((_, i) => i !== index));
  };

  const totalPaid = payers.reduce((sum, p) => sum + p.amount, 0);
  const remainingToPay = parseFloat(amount) - totalPaid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Record a new expense for the group
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
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Who paid?</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setMultiPayer(!multiPayer);
                  if (!multiPayer) {
                    setPayers([{ participantId: paidBy || '', amount: parseFloat(amount) || 0 }]);
                  } else {
                    setPayers([]);
                  }
                }}
              >
                {multiPayer ? 'Single Payer' : 'Multiple Payers'}
              </Button>
            </div>
            
            {!multiPayer ? (
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
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {payers.map((payer, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                      value={payer.participantId}
                      onValueChange={(value) => updatePayer(index, 'participantId', value)}
                    >
                      <SelectTrigger className="h-9 flex-1">
                        <SelectValue placeholder="Select payer" />
                      </SelectTrigger>
                      <SelectContent>
                        {participants.map((participant) => (
                          <SelectItem key={participant.id} value={participant.id}>
                            {participant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={payer.amount}
                      onChange={(e) => updatePayer(index, 'amount', e.target.value)}
                      className="h-9 w-24"
                      placeholder="Amount"
                    />
                    {payers.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePayer(index)}
                        className="h-9 w-9 p-0"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPayer}
                    disabled={payers.length >= participants.length || remainingToPay <= 0}
                  >
                    + Add Payer
                  </Button>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Total: </span>
                    <span className={remainingToPay !== 0 ? 'text-destructive font-medium' : 'text-primary font-medium'}>
                      ${totalPaid.toFixed(2)} / ${parseFloat(amount) || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Split between</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAllParticipants}
                >
                  All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearAllParticipants}
                >
                  None
                </Button>
              </div>
            </div>

            <Tabs
              value={splitMode}
              onValueChange={(value) =>
                setSplitMode(value as 'equal' | 'amount' | 'weight')
              }
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
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
            Add Expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
