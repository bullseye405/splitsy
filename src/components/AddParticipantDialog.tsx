import { createParticipant } from '@/api/participants';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

interface Participant {
  id: string;
  name: string;
}

interface AddParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddParticipant: (name: string) => void;
}

export function AddParticipantDialog({
  open,
  onOpenChange,
  onAddParticipant,
}: AddParticipantDialogProps) {
  const { groupId } = useParams<{ groupId: string }>();

  const [name, setName] = useState('');
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a participant name',
        variant: 'destructive',
      });
      return;
    }

    const participant = await createParticipant(name.trim(), groupId);

    onAddParticipant(participant.data.name);
    setName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Participant</DialogTitle>
          <DialogDescription>
            Add a new person to this expense group
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="participantName" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="participantName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter participant name"
              className="h-10"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="gradient"
            disabled={!name.trim()}
          >
            Add Participant
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
