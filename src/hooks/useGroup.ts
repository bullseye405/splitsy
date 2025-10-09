import { GroupWithParticipants } from '@/types/group';
import { create } from 'zustand';
import { produce } from 'immer';

export interface GroupStore extends GroupWithParticipants {
  setState: (recipe: (state: GroupWithParticipants) => void) => void;
}

const useGroup = create<GroupStore>((set) => ({
  id: '',
  name: '',
  participants: [],
  created_at: '',
  description: '',
  setState: (recipe) => set(produce(recipe)),
}));

export default useGroup;
