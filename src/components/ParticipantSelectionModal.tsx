import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Participant } from '@/types/participants';
import { Users } from 'lucide-react';

interface ParticipantSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participants: Participant[];
}

export function ParticipantSelectionModal({
  open,
  onOpenChange,
  participants,
}: ParticipantSelectionModalProps) {
  const handleParticipantSelect = (participant: Participant) => {
    localStorage.setItem(`participant_${participant.group_id}`, participant.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background p-0 backdrop-blur-xl bg-opacity-80">
        <DialogHeader className="border-b px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Users className="w-5 h-5 text-primary" />
            Welcome to the Group
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1">
            Please select which participant you are from the list below
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 pt-2">
          <div className="flex justify-around gap-2 overflow-x-auto py-1 px-1 flex-wrap">
            {participants.map((participant) => (
              <button
                key={participant.id}
                type="button"
                className={`focus:outline-none transition-all px-4 py-2 rounded-full text-sm font-medium border shadow-sm whitespace-nowrap hover:bg-primary/10 hover:text-primary bg-muted text-foreground border-muted`}
                onMouseEnter={(e) =>
                  e.currentTarget.classList.add('ring-2', 'ring-primary/30')
                }
                onMouseLeave={(e) =>
                  e.currentTarget.classList.remove('ring-2', 'ring-primary/30')
                }
                onClick={() => handleParticipantSelect(participant)}
              >
                {participant.name}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
