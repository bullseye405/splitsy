import { Database } from '@/integrations/supabase/types';
import { Participant } from './participants';

export type Group = Database['public']['Tables']['group']['Row'];
export type GroupWithParticipants = Group & {
  participants: Participant[];
};
