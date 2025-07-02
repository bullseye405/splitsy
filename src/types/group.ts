import { Participant } from './participants';

export interface Group {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  participants?: Participant[];
}
