import { GroupWithParticipants } from '@/types/group';
import { produce } from 'immer';
import { create } from 'zustand';

export interface GroupStore extends GroupWithParticipants {
  setState: (recipe: (state: GroupWithParticipants) => void) => void;
  currentParticipant: string | null;
  setCurrentParticipant: (participantId: string | null) => void;
  showParticipantsModal: boolean;
  setShowParticipantsModal: (x: boolean) => void;
}

const useGroup = create<GroupStore>((set) => ({
  id: '',
  name: '',
  participants: [],
  created_at: '',
  description: '',
  setState: (recipe) => set(produce(recipe)),
  setCurrentParticipant: (participantId) =>
    set(
      produce((state) => {
        state.currentParticipant = participantId;
      })
    ),
  currentParticipant: null,

  setShowParticipantsModal: (show) =>
    set(
      produce((state) => {
        state.showParticipantsModal = show;
      })
    ),
  showParticipantsModal: false,
}));

export default useGroup;
