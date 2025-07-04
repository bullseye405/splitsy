
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { Participant } from '@/types/participants';

interface ParticipantSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participants: Participant[];
  onParticipantSelect: (participantId: string) => void;
}

export function ParticipantSelectionModal({
  open,
  onOpenChange,
  participants,
  onParticipantSelect,
}: ParticipantSelectionModalProps) {
  const [selectedParticipant, setSelectedParticipant] = useState<string>('');

  const handleSelect = () => {
    if (selectedParticipant) {
      onParticipantSelect(selectedParticipant);
      onOpenChange(false);
    }
  };

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
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedParticipant === participant.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
                onClick={() => setSelectedParticipant(participant.id)}
              >
                <Badge 
                  variant={selectedParticipant === participant.id ? 'default' : 'secondary'} 
                  className="px-3 py-1"
                >
                  {participant.name}
                </Badge>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              onClick={handleSelect}
              disabled={!selectedParticipant}
              className="w-full"
            >
              Continue as {participants.find(p => p.id === selectedParticipant)?.name || 'Selected Participant'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
