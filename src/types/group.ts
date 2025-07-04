import { Database } from '@/integrations/supabase/types';

export type Group = Database['public']['Tables']['group']['Row'];
