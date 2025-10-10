import { getGroupViews, GroupView } from '@/api/groupViews';
import {
  createParticipant,
  deleteParticipant,
  updateParticipant,
} from '@/api/participants';
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
import useGroup from '@/hooks/useGroup';
import { Participant } from '@/types/participants';
import {
  Check,
  Edit,
  Eye,
  EyeOff,
  Plus,
  Save,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface ParticipantsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onParticipantChange: () => void;
}

export function ParticipantsModal({
  open,
  onOpenChange,
  onParticipantChange,
}: ParticipantsModalProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { groupId } = useParams<{ groupId: string }>();
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [editingParticipant, setEditingParticipant] = useState<string | null>(
    null
  );
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [groupViews, setGroupViews] = useState<GroupView[]>([]);
  const { toast } = useToast();

  const participants = useGroup((state) => state.participants);
  const sortedParticipants = [...participants].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

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
      setNewParticipantEmail('');
      setEditingParticipant(null);
      setEditName('');
      setEditEmail('');
      setConfirmDeleteId(null);
    }
  }, [open]);

  const handleAddParticipant = async () => {
    if (!newParticipantName.trim() || !groupId) return;

    // Basic email validation if provided
    if (
      newParticipantEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newParticipantEmail.trim())
    ) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createParticipant(
        newParticipantName.trim(),
        groupId,
        newParticipantEmail.trim() || undefined
      );
      setNewParticipantName('');
      setNewParticipantEmail('');
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
    setEditEmail(participant.email || '');
  };

  const cancelEditing = () => {
    setEditingParticipant(null);
    setEditName('');
    setEditEmail('');
  };

  const handleEditParticipant = async () => {
    if (!editName.trim() || !editingParticipant || !groupId) return;

    // Basic email validation if provided
    if (
      editEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail.trim())
    ) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateParticipant(
        editingParticipant,
        editName.trim(),
        groupId,
        editEmail.trim() || undefined
      );
      toast({
        title: 'Participant updated',
        description: 'Participant has been updated.',
      });
      setEditingParticipant(null);
      setEditName('');
      setEditEmail('');
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

  const currentParticipant = localStorage.getItem(`participant_${groupId}`);

  const hasViewed = (participantId: string) => {
    return groupViews.some((view) => view.participant_id === participantId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-md bg-background p-0">
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
          <div className="space-y-2 mb-4">
            <Input
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              placeholder="Name *"
              onKeyDown={(e) =>
                e.key === 'Enter' && !e.shiftKey && handleAddParticipant()
              }
              className="h-9 text-sm"
            />
            <Input
              type="email"
              value={newParticipantEmail}
              onChange={(e) => setNewParticipantEmail(e.target.value)}
              placeholder="Email (optional)"
              onKeyDown={(e) =>
                e.key === 'Enter' && !e.shiftKey && handleAddParticipant()
              }
              className="h-9 text-sm"
            />
            <Button
              onClick={handleAddParticipant}
              disabled={!newParticipantName.trim()}
              size="sm"
              className="w-full h-9"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Participant
            </Button>
          </div>

          {/* Participants list */}
          <div className="divide-y divide-muted max-h-90 overflow-y-auto bg-background rounded-md">
            {sortedParticipants.map((participant) => (
              <div
                key={participant.id}
                className="py-3 px-2 hover:bg-muted/50 transition-all"
              >
                {editingParticipant === participant.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Name *"
                      className="h-8 text-sm"
                      onKeyDown={(e) =>
                        e.key === 'Enter' &&
                        !e.shiftKey &&
                        handleEditParticipant()
                      }
                    />
                    <Input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="Email (optional)"
                      className="h-8 text-sm"
                      onKeyDown={(e) =>
                        e.key === 'Enter' &&
                        !e.shiftKey &&
                        handleEditParticipant()
                      }
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={handleEditParticipant}
                        className="flex-1"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        onClick={cancelEditing}
                        variant="outline"
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground truncate">
                          {participant.name}
                          {participant.id === currentParticipant ? ' (Me)' : ''}
                        </span>
                        {hasViewed(participant.id) ? (
                          <Eye className="w-4 h-4 text-primary flex-shrink-0" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                      {participant.email && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {participant.email}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 items-center flex-shrink-0">
                      {confirmDeleteId === participant.id ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleDeleteParticipant(participant.id)
                            }
                            className="h-8 w-8 p-0"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirmDeleteId(null)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(participant)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={participants.length <= 1}
                            onClick={() => setConfirmDeleteId(participant.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
