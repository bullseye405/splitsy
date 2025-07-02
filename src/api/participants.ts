import { supabase } from '@/integrations/supabase/client';

export async function createParticipant(name: string, group_id: string) {
  return await supabase
    .from('participants')
    .insert([{ name, group_id }])
    .select()
    .single();
}
