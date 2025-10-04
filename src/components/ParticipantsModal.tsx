import {
  createParticipant,
  deleteParticipant,
  updateParticipant,
} from '@/api/participants';
import { getGroupViews, GroupView } from '@/api/groupViews';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Participant } from '@/types/participants';
import { Edit, Eye, EyeOff, Plus, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

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
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { groupId } = useParams<{ groupId: string }>();
  const [newParticipantName, setNewParticipantName] = useState('');
  const [editingParticipant, setEditingParticipant] = useState<string | null>(
    null
  );
  const [editName, setEditName] = useState('');
  const [groupViews, setGroupViews] = useState<GroupView[]>([]);
  const { toast } = useToast();

  // Fetch group views when modal opens
  useEffect(() => {
    if (open && groupId) {
      getGroupViews(groupId)
        .then(setGroupViews)
        .catch((error) => console.error('Error fetching group views:', error));
    }
  }, [open, groupId]);

  // Reset all modal states when opened
  useEffect(() => {
    if (open) {
      setNewParticipantName('');
      setEditingParticipant(null);
      setEditName('');
      setConfirmDeleteId(null);
    }
  }, [open]);

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

  const currentParticipant = sessionStorage.getItem(`participant_${groupId}`);

  const hasViewed = (participantId: string) => {
    return groupViews.some((view) => view.participant_id === participantId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background p-0">
        <DialogHeader className="border-b px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Users className="w-5 h-5 text-primary" />
            Manage Participants
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1">
            Add, edit, or remove participants from this group
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          {/* Add new participant */}
          <div className="flex gap-2 mb-4">
            <Input
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              placeholder="Enter participant name"
              onKeyDown={(e) => e.key === 'Enter' && handleAddParticipant()}
              className="h-9 text-sm"
            />
            <Button
              onClick={handleAddParticipant}
              disabled={!newParticipantName.trim()}
              size="sm"
              className="h-9"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Participants list */}
          <div className="divide-y divide-muted max-h-80 overflow-y-auto bg-background rounded-md">
            {participants.map((participant, index) => (
              <div
                key={participant.id}
                className="flex items-center justify-between py-2 px-1 hover:bg-muted transition-all"
              >
                {editingParticipant === participant.id ? (
                  <div className="flex gap-2 flex-1 items-center">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 text-sm"
                      onKeyDown={(e) =>
                        e.key === 'Enter' && handleEditParticipant()
                      }
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
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">
                        {participant.name}
                        {participant.id === currentParticipant ? ' (me)' : ''}
                      </span>
                      {hasViewed(participant.id) ? (
                        <Eye className="w-4 h-4 text-primary" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
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
                            onClick={() =>
                              handleDeleteParticipant(participant.id)
                            }
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
