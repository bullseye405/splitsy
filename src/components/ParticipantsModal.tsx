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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Edit, Plus, Trash2, Users } from 'lucide-react';
import { createParticipant, updateParticipant, deleteParticipant } from '@/api/participants';
import { useParams } from 'react-router-dom';
import { Participant } from '@/types/participants';

interface ParticipantsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participants: Participant[];
  onParticipantChange: () => void;
}

export function ParticipantsModal({
  open,
  onOpenChange,
  participants,
  onParticipantChange,
}: ParticipantsModalProps) {
  // ...existing code...
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { groupId } = useParams<{ groupId: string }>();
  const [newParticipantName, setNewParticipantName] = useState('');
  const [editingParticipant, setEditingParticipant] = useState<string | null>(
    null
  );
  const [editName, setEditName] = useState('');
  const { toast } = useToast();

  const handleAddParticipant = async () => {
    if (!newParticipantName.trim() || !groupId) return;

    try {
      await createParticipant(newParticipantName.trim(), groupId);
      setNewParticipantName('');
      onParticipantChange();
      toast({
        title: 'Participant added',
        description: `${newParticipantName} has been added to the group`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not add participant. Please try again.',
        variant: 'destructive',
      });
    }
  };


  const startEditing = (participant: Participant) => {
    setEditingParticipant(participant.id);
    setEditName(participant.name);
  };

  const cancelEditing = () => {
    setEditingParticipant(null);
    setEditName('');
  };

  const handleEditParticipant = async () => {
    if (!editName.trim() || !editingParticipant || !groupId) return;
    try {
      await updateParticipant(editingParticipant, editName.trim(), groupId);
      toast({
        title: 'Participant updated',
        description: 'Name has been updated.',
      });
      setEditingParticipant(null);
      setEditName('');
      onParticipantChange();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not update participant. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteParticipant = async (participantId: string) => {
    if (!groupId) return;
    try {
      await deleteParticipant(participantId, groupId);
      toast({
        title: 'Participant removed',
        description: 'Participant has been removed from the group.',
      });
      setConfirmDeleteId(null);
      onParticipantChange();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not remove participant. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Manage Participants
          </DialogTitle>
          <DialogDescription>
            Add, edit, or remove participants from this group
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new participant */}
          <div className="flex gap-2">
            <Input
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              placeholder="Enter participant name"
              onKeyDown={(e) => e.key === 'Enter' && handleAddParticipant()}
            />
            <Button
              onClick={handleAddParticipant}
              disabled={!newParticipantName.trim()}
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Participants list */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {participants.map((participant, index) => (
              <div
                key={participant.id}
                className="flex items-center justify-between border rounded-md bg-background p-3 shadow-sm hover:bg-muted transition-all"
              >
                {editingParticipant === participant.id ? (
                  <div className="flex gap-2 flex-1 items-center">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8"
                      onKeyDown={(e) => e.key === 'Enter' && handleEditParticipant()}
                    />
                    <Button size="sm" onClick={cancelEditing} variant="outline">
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleEditParticipant}>
                      Save
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <span className="font-medium text-base text-foreground">
                        {participant.name}
                        {index === 0 ? ' (me)' : ''}
                      </span>
                    </div>
                    <div className="flex gap-2 items-center">
                      {confirmDeleteId === participant.id ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirmDeleteId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteParticipant(participant.id)}
                          >
                            Confirm
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(participant)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={participants.length <= 1}
                            onClick={() => setConfirmDeleteId(participant.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
