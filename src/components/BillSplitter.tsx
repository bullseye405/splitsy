import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Plus, Lock, Unlock, X } from 'lucide-react';
import { Card } from '@/components/ui/card';

const PET_NAMES = [
  'Panda',
  'Tiger',
  'Lion',
  'Elephant',
  'Giraffe',
  'Zebra',
  'Koala',
  'Penguin',
  'Dolphin',
  'Owl',
  'Fox',
  'Bear',
  'Rabbit',
  'Squirrel',
  'Deer',
  'Wolf',
  'Eagle',
  'Hawk',
];

interface Participant {
  id: string;
  name: string;
  value: number;
  locked: boolean;
}

const initialParticipants: Participant[] = [
  { id: '1', name: 'Alice', value: 300, locked: false },
  { id: '2', name: 'Bob', value: 300, locked: false },
];

export function BillSplitter() {
  const [amount, setAmount] = useState<number>(600);
  const [participants, setParticipants] =
    useState<Participant[]>(initialParticipants);

  function getRandomPetName() {
    const usedNames = participants?.map((p) => p.name);
    const availableNames = PET_NAMES.filter(
      (name) => !usedNames.includes(name)
    );
    return availableNames.length > 0
      ? availableNames[Math.floor(Math.random() * availableNames.length)]
      : PET_NAMES[Math.floor(Math.random() * PET_NAMES.length)];
  }

  // Redistribute when amount changes
  useEffect(() => {
    redistributeAmount(amount, participants);
  }, [amount]);

  function redistributeAmount(
    total: number,
    currentParticipants: Participant[]
  ) {
    const locked = currentParticipants.filter((p) => p.locked);
    const unlocked = currentParticipants.filter((p) => !p.locked);

    if (unlocked.length === 0) return;

    const lockedTotal = locked.reduce((sum, p) => sum + p.value, 0);
    const remaining = total - lockedTotal;

    if (unlocked.length === 1) {
      // Single unlocked participant gets all remaining
      const newParticipants = currentParticipants.map((p) =>
        p.locked ? p : { ...p, value: Math.max(0, remaining) }
      );
      setParticipants(newParticipants);
    } else {
      // Distribute proportionally among unlocked
      const unlockedTotal = unlocked.reduce((sum, p) => sum + p.value, 0);
      const newParticipants = currentParticipants.map((p) => {
        if (p.locked) return p;
        const proportion =
          unlockedTotal > 0 ? p.value / unlockedTotal : 1 / unlocked.length;
        return { ...p, value: Math.max(0, remaining * proportion) };
      });
      setParticipants(newParticipants);
    }
  }

  function handleSliderChange(id: string, newValue: number) {
    const participant = participants.find((p) => p.id === id);
    if (!participant) return;

    // Lock this slider
    const updatedParticipants = participants.map((p) =>
      p.id === id ? { ...p, value: newValue, locked: true } : p
    );

    // Redistribute among unlocked
    const locked = updatedParticipants.filter((p) => p.locked);
    const unlocked = updatedParticipants.filter((p) => !p.locked);

    if (unlocked.length === 0) {
      setParticipants(updatedParticipants);
      return;
    }

    const lockedTotal = locked.reduce((sum, p) => sum + p.value, 0);
    const remaining = amount - lockedTotal;

    if (unlocked.length === 1) {
      const finalParticipants = updatedParticipants.map((p) =>
        p.locked ? p : { ...p, value: Math.max(0, remaining) }
      );
      setParticipants(finalParticipants);
    } else {
      const unlockedTotal = unlocked.reduce((sum, p) => sum + p.value, 0);
      const finalParticipants = updatedParticipants.map((p) => {
        if (p.locked) return p;
        const proportion =
          unlockedTotal > 0 ? p.value / unlockedTotal : 1 / unlocked.length;
        return { ...p, value: Math.max(0, remaining * proportion) };
      });
      setParticipants(finalParticipants);
    }
  }

  function toggleLock(id: string) {
    const updatedParticipants = participants.map((p) =>
      p.id === id ? { ...p, locked: !p.locked } : p
    );

    // If unlocking, reset the unlocked participant's value to equal split among unlocked
    const justUnlocked = participants.find((p) => p.id === id && p.locked);
    if (justUnlocked) {
      const unlocked = updatedParticipants.filter((p) => !p.locked);
      const locked = updatedParticipants.filter((p) => p.locked);
      const lockedTotal = locked.reduce((sum, p) => sum + p.value, 0);
      const remaining = amount - lockedTotal;
      const equalShare = unlocked.length > 0 ? remaining / unlocked.length : 0;
      const resetParticipants = updatedParticipants.map((p) =>
        p.locked ? p : { ...p, value: equalShare }
      );
      setParticipants(resetParticipants);
    } else {
      redistributeAmount(amount, updatedParticipants);
    }
  }

  function addParticipant() {
    const newId = Date.now().toString();
    const newParticipant: Participant = {
      id: newId,
      name: getRandomPetName(),
      value: 0,
      locked: false,
    };

    const newParticipants = [...participants, newParticipant];
    const equalShare = amount / newParticipants.length;

    const resetParticipants = newParticipants.map((p) => ({
      ...p,
      value: equalShare,
      locked: false,
    }));

    setParticipants(resetParticipants);
  }

  function removeParticipant(id: string) {
    // Prevent removing the default two participants
    if (id === '1' || id === '2') return;
    const filtered = participants.filter((p) => p.id !== id);
    const equalShare = amount / filtered.length;
    const resetParticipants = filtered.map((p) => ({
      ...p,
      value: equalShare,
      locked: false,
    }));
    setParticipants(resetParticipants);
  }

  const total = participants.reduce((sum, p) => sum + p.value, 0);

  return (
    <Card className="p-6 w-full max-w-2xl mx-auto">
      <div className="space-y-6">
        <div>
          <Label htmlFor="amount" className="text-lg font-semibold">
            Total Bill Amount
          </Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            className="mt-2 text-2xl font-bold"
            min={0}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold">Participants</Label>
            <Button onClick={addParticipant} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          {participants.map((participant) => (
            <div
              key={participant.id}
              className="space-y-2 p-4 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{participant.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-primary">
                    ${participant.value.toFixed(2)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleLock(participant.id)}
                    className="h-8 w-8 p-0"
                  >
                    {participant.locked ? (
                      <Lock className="w-4 h-4 text-primary" />
                    ) : (
                      <Unlock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                  {/* Always render a placeholder for remove button to keep layout consistent */}
                  <span
                    style={{
                      width: 32,
                      display: 'inline-block',
                      textAlign: 'center',
                    }}
                  >
                    {participant.id !== '1' && participant.id !== '2' ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeParticipant(participant.id)}
                        className="h-8 w-8 p-0 text-destructive"
                        aria-label={`Remove ${participant.name}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    ) : null}
                  </span>
                </div>
              </div>
              <Slider
                value={[participant.value]}
                onValueChange={(values) =>
                  handleSliderChange(participant.id, values[0])
                }
                max={amount}
                step={1}
                className="w-full"
              />
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total:</span>
            <span
              className={total === amount ? 'text-primary' : 'text-destructive'}
            >
              ${total.toFixed(2)} / ${amount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
