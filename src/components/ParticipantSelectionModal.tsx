import { Users } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import useGroup from '@/hooks/useGroup';

interface ParticipantSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onParticipantSelect: (participantId: string) => void;
}

export function ParticipantSelectionModal({
  open,
  onOpenChange,
  onParticipantSelect,
}: ParticipantSelectionModalProps) {
  const [selectedParticipant, setSelectedParticipant] = useState<string>('');

  const participants = useGroup((state) => state.participants);

  const handleSelect = () => {
    if (selectedParticipant) {
      onParticipantSelect(selectedParticipant);

      onOpenChange(false);
    }
  };

  const sortedParticipants = [...participants].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Welcome to the Group
          </DialogTitle>
          <DialogDescription>
            Please select which participant you are from the list below
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {sortedParticipants.map((participant) => (
              <Badge
                key={participant.id}
                variant={
                  selectedParticipant === participant.id
                    ? 'default'
                    : 'secondary'
                }
                className="px-3 py-2 cursor-pointer transition-all hover:scale-105"
                onClick={() => setSelectedParticipant(participant.id)}
              >
                {participant.name}
              </Badge>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              onClick={handleSelect}
              disabled={!selectedParticipant}
              className="w-full"
            >
              Continue
              {participants.find((p) => p.id === selectedParticipant)?.name
                ? ` as ${
                    participants.find((p) => p.id === selectedParticipant)?.name
                  }`
                : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
