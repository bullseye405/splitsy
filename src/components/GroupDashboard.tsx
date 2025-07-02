import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Share, Users, Plus, Copy } from "lucide-react";
import { AddParticipantDialog } from "./AddParticipantDialog";
import { AddExpenseDialog } from "./AddExpenseDialog";

interface Participant {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  date: Date;
}

interface GroupDashboardProps {
  groupId: string;
  groupName: string;
  firstParticipantName?: string;
}

export function GroupDashboard({ groupId, groupName, firstParticipantName }: GroupDashboardProps) {
  const [participants, setParticipants] = useState<Participant[]>(
    firstParticipantName ? [{ id: "1", name: firstParticipantName }] : []
  );
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const { toast } = useToast();

  const shareUrl = `${window.location.origin}?group=${groupId}`;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share this link with your friends to add them to the group",
      });
    } catch (error) {
      toast({
        title: "Could not copy link",
        description: "Please copy the URL manually",
        variant: "destructive",
      });
    }
  };

  const addParticipant = (name: string) => {
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: name.trim(),
    };
    setParticipants([...participants, newParticipant]);
    setShowAddParticipant(false);
    toast({
      title: "Participant added",
      description: `${name} has been added to the group`,
    });
  };

  const addExpense = (expense: Omit<Expense, "id" | "date">) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      date: new Date(),
    };
    setExpenses([...expenses, newExpense]);
    setShowAddExpense(false);
    toast({
      title: "Expense added",
      description: `$${expense.amount.toFixed(2)} expense has been recorded`,
    });
  };

  const calculateBalances = () => {
    const balances: { [key: string]: number } = {};
    
    // Initialize balances
    participants.forEach(p => {
      balances[p.id] = 0;
    });

    // Calculate balances from expenses
    expenses.forEach(expense => {
      const splitAmount = expense.amount / expense.splitBetween.length;
      
      // Person who paid gets credited
      balances[expense.paidBy] += expense.amount;
      
      // People in the split get debited
      expense.splitBetween.forEach(participantId => {
        balances[participantId] -= splitAmount;
      });
    });

    return balances;
  };

  const balances = calculateBalances();
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">{groupName}</h1>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={handleShare} variant="outline" className="gap-2">
              <Share className="w-4 h-4" />
              Share Group Link
            </Button>
            <Button 
              onClick={() => setShowAddParticipant(true)} 
              variant="outline" 
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              Add Participant
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                ${totalExpenses.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Total Expenses</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {participants.length}
              </div>
              <div className="text-sm text-muted-foreground">Participants</div>
            </CardContent>
          </Card>
        </div>

        {/* Participants */}
        {participants.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {participants.map((participant, index) => (
                  <Badge key={participant.id} variant="secondary" className="px-3 py-1">
                    {participant.name}{index === 0 ? " (me)" : ""}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Expense Button */}
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="p-6">
            <Button 
              onClick={() => setShowAddExpense(true)}
              className="w-full h-12"
              variant="gradient"
              disabled={participants.length < 1}
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </Button>
            {participants.length < 1 && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                Add participants to start tracking expenses
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        {expenses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {expenses.slice(-5).reverse().map(expense => {
                const paidByName = participants.find(p => p.id === expense.paidBy)?.name || "Unknown";
                return (
                  <div key={expense.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <div>
                      <div className="font-medium">{expense.description}</div>
                      <div className="text-sm text-muted-foreground">
                        Paid by {paidByName} • Split {expense.splitBetween.length} ways
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-primary">
                      ${expense.amount.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Balances */}
        {expenses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Balances</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {participants.map(participant => {
                const balance = balances[participant.id];
                const isPositive = balance > 0;
                const isNeutral = Math.abs(balance) < 0.01;
                
                return (
                  <div key={participant.id} className="flex justify-between items-center">
                    <span className="font-medium">{participant.name}</span>
                    <span className={`font-semibold ${
                      isNeutral ? "text-muted-foreground" :
                      isPositive ? "text-success" : "text-destructive"
                    }`}>
                      {isNeutral ? "Settled" : 
                       isPositive ? `Gets $${balance.toFixed(2)}` : 
                       `Owes $${Math.abs(balance).toFixed(2)}`}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>

      <AddParticipantDialog
        open={showAddParticipant}
        onOpenChange={setShowAddParticipant}
        onAddParticipant={addParticipant}
        existingParticipants={participants}
      />

      <AddExpenseDialog
        open={showAddExpense}
        onOpenChange={setShowAddExpense}
        onAddExpense={addExpense}
        participants={participants}
      />
    </div>
  );
}