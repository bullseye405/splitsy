import { Database } from '@/integrations/supabase/types';

export type Participant = Database['public']['Tables']['participants']['Row'];
