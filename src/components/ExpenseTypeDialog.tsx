import { ExpenseWithSplits } from '@/api/expenses';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Participant } from '@/types/participants';
import { Calendar, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Payer {
  participantId: string;
  amount: number;
}

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
    date: string;
    payers?: Payer[];
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
  const [splitMode, setSplitMode] = useState<'equal' | 'amount' | 'weight'>(
    'equal'
  );
  const [customAmounts, setCustomAmounts] = useState<{ [key: string]: number }>(
    {}
  );
  const [weights, setWeights] = useState<{ [key: string]: number }>({});
  const [manuallyAdjustedAmounts, setManuallyAdjustedAmounts] = useState<
    Set<string>
  >(new Set());
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [payers, setPayers] = useState<Payer[]>([]);
  const [multiPayer, setMultiPayer] = useState(false);
  const { toast } = useToast();

  const { groupId } = useParams<{ groupId: string }>();

  const currentParticipant =
    localStorage.getItem(`participant_${groupId}`) || null;

  // Initialize defaults when dialog opens
  useEffect(() => {
    if (open && !isEditing) {
      // Set default payer to current participant if available
      if (currentParticipant) {
        setPaidBy(currentParticipant);
      }

      // For non-transfer types, default to all participants selected
      if (type !== 'transfer') {
        const allIds = participants.map((p) => p.id);
        setSplitBetween(allIds);

        // Initialize weights to 1 for all participants
        const defaultWeights: { [key: string]: number } = {};
        allIds.forEach((id) => (defaultWeights[id] = 1));
        setWeights(defaultWeights);
      }
    }
  }, [open, isEditing, type, participants, currentParticipant]);

  useEffect(() => {
    if (expense && isEditing) {
      setDescription(expense.description || '');
      setAmount(expense.amount.toString());
      setPaidBy(expense.paid_by);

      if (expense.expense_type === 'transfer') {
        setTransferTo(expense.expense_splits[0].participant_id || '');
      }
      setDate(
        expense.created_at
          ? new Date(expense.created_at).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setSplitMode(
        (expense.split_type as 'equal' | 'amount' | 'weight') || 'equal'
      );

      const participantIds = expense.expense_splits
        .map((split) => split.participant_id)
        .filter(Boolean) as string[];
      setSplitBetween(participantIds);

      const amounts: { [key: string]: number } = {};
      const weightValues: { [key: string]: number } = {};
      expense.expense_splits.forEach((split) => {
        if (split.participant_id) {
          amounts[split.participant_id] = split.amount;
          weightValues[split.participant_id] = split.weight || 1;
        }
      });
      setCustomAmounts(amounts);
      setWeights(weightValues);
    } else if (!isEditing) {
      // Reset form for new entries
      setDescription('');
      setAmount('');
      setPaidBy(currentParticipant || '');
      setTransferTo('');
      setSplitMode('equal');
      setCustomAmounts({});
      setWeights({});
      setManuallyAdjustedAmounts(new Set());
      setDate(new Date().toISOString().split('T')[0]);

      if (type !== 'transfer') {
        const allIds = participants.map((p) => p.id);
        setSplitBetween(allIds);
        const defaultWeights: { [key: string]: number } = {};
        allIds.forEach((id) => (defaultWeights[id] = 1));
        setWeights(defaultWeights);
      } else {
        setSplitBetween([]);
      }
    }
  }, [expense, isEditing, participants, type, currentParticipant, open]);

  const getTitle = () => {
    if (isEditing)
      return `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    return `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  };

  const getDescription = () => {
    switch (type) {
      case 'expense':
        return 'Record a new expense for the group';
      case 'transfer':
        return 'Record a direct transfer between participants';
      case 'income':
        return 'Record income for the group';
      default:
        return '';
    }
  };

  const getParticipantDisplayName = (participantId: string) => {
    if (participantId === currentParticipant) {
      return 'Me';
    }
    return participants.find((p) => p.id === participantId)?.name || 'Unknown';
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

    if (!multiPayer && !paidBy) {
      toast({
        title: type === 'transfer' ? 'Who transferred?' : 'Who paid?',
        description: `Please select who ${
          type === 'transfer' ? 'sent the money' : 'paid'
        }`,
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

    const splits =
      type === 'transfer'
        ? [{ participant_id: transferTo, amount: amountNumber }]
        : splitBetween.map((participantId) => {
            let splitAmount = amountNumber / splitBetween.length;

            if (splitMode === 'amount') {
              splitAmount = customAmounts[participantId] || 0;
            } else if (splitMode === 'weight') {
              const totalWeight = splitBetween.reduce(
                (sum, id) => sum + (weights[id] || 1),
                0
              );
              const participantWeight = weights[participantId] || 1;
              splitAmount = (amountNumber * participantWeight) / totalWeight;
            }

            return {
              participant_id: participantId,
              amount: splitAmount,
              custom_amount:
                splitMode === 'amount'
                  ? customAmounts[participantId]
                  : undefined,
              weight:
                splitMode === 'weight' ? weights[participantId] : undefined,
            };
          });

    // Convert the date to a full timestamp with current time
    const selectedDate = new Date(date);
    const now = new Date();
    // Set the time components from now to preserve chronological order within the same day
    selectedDate.setHours(
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds()
    );
    const timestamp = selectedDate.toISOString();

    onSave({
      description: description.trim(),
      amount: amountNumber,
      paidBy: multiPayer ? payers[0].participantId : paidBy,
      splitMode,
      splits,
      expenseType: type,
      transferTo: type === 'transfer' ? transferTo : undefined,
      date: timestamp,
      payers: multiPayer ? payers : undefined,
    });
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

  const handleSplitToggle = (participantId: string, checked: boolean) => {
    if (checked) {
      setSplitBetween([...splitBetween, participantId]);
      // Initialize default values
      if (splitMode === 'amount') {
        const totalAmount = parseFloat(amount) || 0;
        const equalAmount = totalAmount / (splitBetween.length + 1);
        // Update all participants to equal amounts
        const newAmounts = { ...customAmounts };
        newAmounts[participantId] = equalAmount;
        // Redistribute to existing participants that haven't been manually adjusted
        const nonManualParticipants = splitBetween.filter(
          (id) => !manuallyAdjustedAmounts.has(id)
        );
        nonManualParticipants.forEach((id) => {
          newAmounts[id] = equalAmount;
        });
        setCustomAmounts(newAmounts);
      }
      if (splitMode === 'weight') {
        setWeights((prev) => ({ ...prev, [participantId]: 1 }));
      }
    } else {
      setSplitBetween(splitBetween.filter((id) => id !== participantId));
      // Clean up values and redistribute
      const newAmounts = { ...customAmounts };
      delete newAmounts[participantId];

      if (splitMode === 'amount' && splitBetween.length > 1) {
        const totalAmount = parseFloat(amount) || 0;
        const remainingParticipants = splitBetween.filter(
          (id) => id !== participantId
        );
        const nonManualParticipants = remainingParticipants.filter(
          (id) => !manuallyAdjustedAmounts.has(id)
        );
        const manualParticipants = remainingParticipants.filter((id) =>
          manuallyAdjustedAmounts.has(id)
        );

        // Keep manually adjusted amounts
        const usedAmount = manualParticipants.reduce(
          (sum, id) => sum + (customAmounts[id] || 0),
          0
        );
        const remainingAmount = Math.max(0, totalAmount - usedAmount);

        if (nonManualParticipants.length > 0) {
          const equalAmount = remainingAmount / nonManualParticipants.length;
          nonManualParticipants.forEach((id) => {
            newAmounts[id] = equalAmount;
          });
        }
      }

      // Remove from manually adjusted set
      setManuallyAdjustedAmounts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(participantId);
        return newSet;
      });

      setCustomAmounts(newAmounts);
      setWeights((prev) => {
        const newWeights = { ...prev };
        delete newWeights[participantId];
        return newWeights;
      });
    }
  };

  const handleCustomAmountChange = (participantId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const totalAmount = parseFloat(amount) || 0;
    const newAmounts = { ...customAmounts };
    newAmounts[participantId] = numValue;

    // Mark this participant as manually adjusted
    setManuallyAdjustedAmounts((prev) => new Set(prev).add(participantId));

    // Calculate remaining amount to distribute among non-manually adjusted participants
    const otherParticipants = splitBetween.filter((id) => id !== participantId);
    const nonManualParticipants = otherParticipants.filter(
      (id) => !manuallyAdjustedAmounts.has(id)
    );
    const manualParticipants = otherParticipants.filter((id) =>
      manuallyAdjustedAmounts.has(id)
    );

    // Calculate used amount including this change and other manual amounts
    const usedAmount =
      numValue +
      manualParticipants.reduce((sum, id) => sum + (customAmounts[id] || 0), 0);
    const remainingAmount = Math.max(0, totalAmount - usedAmount);

    if (nonManualParticipants.length > 0) {
      const equalShare = remainingAmount / nonManualParticipants.length;
      nonManualParticipants.forEach((id) => {
        newAmounts[id] = equalShare;
      });
    }

    setCustomAmounts(newAmounts);
  };

  const handleWeightChange = (participantId: string, value: string) => {
    // Allow empty string for clearing the input
    if (value === '') {
      setWeights((prev) => ({
        ...prev,
        [participantId]: '' as unknown as number,
      }));
      return;
    }
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setWeights((prev) => ({ ...prev, [participantId]: numValue }));
    }
  };

  const calculateWeightedAmount = (participantId: string) => {
    const totalAmount = parseFloat(amount) || 0;
    const participantWeight =
      typeof weights[participantId] === 'number' ? weights[participantId] : 1;
    const totalWeight = splitBetween.reduce((sum, id) => {
      const w = typeof weights[id] === 'number' ? weights[id] : 1;
      return sum + w;
    }, 0);
    return totalWeight > 0
      ? (totalAmount * participantWeight) / totalWeight
      : 0;
  };

  const handleLabelClick = (participantId: string) => {
    if (splitBetween.length === 1 && splitBetween[0] === participantId) {
      setSplitBetween(participants.map((p) => p.id));
    } else {
      setSplitBetween([participantId]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              What for?
            </label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                type === 'transfer'
                  ? 'Cash repayment, loan...'
                  : type === 'income'
                  ? 'Refund, returned deposit...'
                  : 'Dinner, taxi, groceries...'
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                {type === 'transfer'
                  ? 'From'
                  : type === 'income'
                  ? 'Received by'
                  : 'Paid by'}
              </label>
              {type === 'expense' && (
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
              )}
            </div>
            
            {!multiPayer ? (
              <div className="flex flex-wrap gap-2 mt-1">
                {participants.map((participant) => (
                  <Button
                    key={participant.id}
                    size="sm"
                    variant={paidBy === participant.id ? 'default' : 'outline'}
                    className="rounded-xl"
                    onClick={() => {
                      setPaidBy(participant.id);
                      setTransferTo(''); // Clear transferTo if payer changes
                    }}
                  >
                    {getParticipantDisplayName(participant.id)}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {payers.map((payer, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1 flex gap-2">
                      {participants.map((participant) => (
                        <Button
                          key={participant.id}
                          size="sm"
                          variant={payer.participantId === participant.id ? 'default' : 'outline'}
                          className="rounded-xl flex-1"
                          onClick={() => updatePayer(index, 'participantId', participant.id)}
                        >
                          {getParticipantDisplayName(participant.id)}
                        </Button>
                      ))}
                    </div>
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
          <div className="flex gap-2 ">
            <div className="flex-1">
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">
                  Amount ($)
                </label>

                <div className="flex gap-2 flex-col">
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />

                  <div className="relative flex items-center">
                    <div className="hidden gap-2 mb-1 flex-wrap sm:flex">
                      {[50, 100, 500, 1000, 5000].map((amt) => (
                        <Button
                          size="sm"
                          key={amt}
                          variant="ghost"
                          className={
                            parseFloat(amount) === amt
                              ? 'border-primary text-primary'
                              : ''
                          }
                          onClick={() => setAmount(amt.toString())}
                        >
                          ${amt}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="">
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium">
                  Date
                </label>
                <div className="relative">
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-10"
                  />

                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {type === 'transfer' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">To</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {participants.map((participant) => (
                  <Button
                    disabled={paidBy === participant.id}
                    key={participant.id}
                    size="sm"
                    variant={
                      transferTo === participant.id ? 'default' : 'outline'
                    }
                    className="rounded-xl"
                    onClick={() => setTransferTo(participant.id)}
                  >
                    {getParticipantDisplayName(participant.id)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {type !== 'transfer' && (
            <div className="space-y-4">
              <Tabs
                value={splitMode}
                onValueChange={(value) => {
                  setSplitMode(value as 'equal' | 'amount' | 'weight');

                  // Initialize default values when switching modes
                  if (value === 'amount' && splitBetween.length > 0) {
                    const totalAmount = parseFloat(amount) || 0;
                    const equalAmount = totalAmount / splitBetween.length;
                    const newAmounts: { [key: string]: number } = {};
                    splitBetween.forEach((id) => {
                      newAmounts[id] = equalAmount;
                    });
                    setCustomAmounts(newAmounts);
                  } else if (value === 'weight' && splitBetween.length > 0) {
                    const newWeights: { [key: string]: number } = {};
                    splitBetween.forEach((id) => {
                      newWeights[id] = weights[id] || 1;
                    });
                    setWeights(newWeights);
                  }
                }}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="equal">Equal Split</TabsTrigger>
                  <TabsTrigger value="amount">Custom Amount</TabsTrigger>
                  <TabsTrigger value="weight">By Weight</TabsTrigger>
                </TabsList>

                <TabsContent
                  value="equal"
                  className="space-y-2 max-h-48 overflow-y-auto"
                >
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between my-1 h-8"
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`equal-${participant.id}`}
                          checked={splitBetween.includes(participant.id)}
                          onCheckedChange={(checked) =>
                            handleSplitToggle(participant.id, !!checked)
                          }
                        />
                        <label
                          className="text-sm font-medium cursor-pointer select-none"
                          onClick={() => handleLabelClick(participant.id)}
                        >
                          {getParticipantDisplayName(participant.id)}
                        </label>
                      </div>
                      {splitBetween.includes(participant.id) && (
                        <span className="text-sm font-medium text-primary mr-6">
                          $
                          {(
                            (parseFloat(amount) || 0) / splitBetween.length
                          ).toFixed(2)}
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
                      className="flex items-center justify-between gap-2 my-1 mr-5 h-8"
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`amount-${participant.id}`}
                          checked={splitBetween.includes(participant.id)}
                          onCheckedChange={(checked) =>
                            handleSplitToggle(participant.id, !!checked)
                          }
                        />
                        <label
                          className="text-sm font-medium cursor-pointer select-none"
                          onClick={() => handleLabelClick(participant.id)}
                        >
                          {getParticipantDisplayName(participant.id)}
                        </label>
                      </div>
                      {splitBetween.includes(participant.id) && (
                        <div className="flex items-center gap-1">
                          {manuallyAdjustedAmounts.has(participant.id) && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                setManuallyAdjustedAmounts((prev) => {
                                  const newSet = new Set(prev);
                                  newSet.delete(participant.id);
                                  return newSet;
                                });
                              }}
                            >
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          )}
                          <span className="text-sm">$</span>
                          <Input
                            type="number"
                            min="0"
                            value={customAmounts[participant.id] || ''}
                            onChange={(e) =>
                              handleCustomAmountChange(
                                participant.id,
                                e.target.value
                              )
                            }
                            onKeyDown={(e) => {
                              if (
                                e.key === 'ArrowUp' ||
                                e.key === 'ArrowDown'
                              ) {
                                e.preventDefault();
                              }
                            }}
                            className="w-20 h-8 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            style={
                              {
                                MozAppearance: 'textfield',
                              } as React.CSSProperties
                            }
                            placeholder="0.00"
                          />
                        </div>
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
                      className="flex items-center justify-between gap-2 my-1 mr-5 h-8"
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`weight-${participant.id}`}
                          checked={splitBetween.includes(participant.id)}
                          onCheckedChange={(checked) =>
                            handleSplitToggle(participant.id, !!checked)
                          }
                        />
                        <label
                          className="text-sm font-medium cursor-pointer select-none"
                          onClick={() => handleLabelClick(participant.id)}
                        >
                          {getParticipantDisplayName(participant.id)}
                        </label>
                      </div>
                      {splitBetween.includes(participant.id) && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            value={weights[participant.id] ?? 1}
                            onChange={(e) =>
                              handleWeightChange(participant.id, e.target.value)
                            }
                            className="w-16 h-8 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            style={
                              {
                                MozAppearance: 'textfield',
                              } as React.CSSProperties
                            }
                            placeholder="1"
                          />
                          <span className="text-sm font-medium text-primary w-16 text-right">
                            $
                            {calculateWeightedAmount(participant.id).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 items-center">
          {splitMode === 'amount' && (
            <div className="text-xs text-muted-foreground text-center">
              Total: $
              {Object.values(customAmounts)
                .reduce((sum, amt) => sum + (amt || 0), 0)
                .toFixed(2)}{' '}
              / ${amount || '0.00'}
            </div>
          )}
          {splitMode === 'weight' && (
            <div className="text-xs text-muted-foreground text-center">
              Total weight:{' '}
              {splitBetween.reduce((sum, id) => sum + (weights[id] || 1), 0)} •
              Total: $
              {splitBetween
                .reduce((sum, id) => sum + calculateWeightedAmount(id), 0)
                .toFixed(2)}
            </div>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {isEditing ? 'Update' : 'Add'}{' '}
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
