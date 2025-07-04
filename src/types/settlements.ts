import { Database } from '@/integrations/supabase/types';

export type Settlement = Database['public']['Tables']['settlements']['Row'];
