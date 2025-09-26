import { supabase } from '@/integrations/supabase/client';

export async function createParticipant(name: string, group_id: string, email?: string) {
  return await supabase
    .from('participants')
    .insert([{ name, group_id, email }])
    .select()
    .single();
}

export async function updateParticipant(
  participantId: string,
  name: string,
  group_id: string
) {
  return await supabase
    .from('participants')
    .update({ name })
    .eq('id', participantId)
    .eq('group_id', group_id)
    .select()
    .single();
}

export async function deleteParticipant(
  participantId: string,
  group_id: string
) {
  return await supabase
    .from('participants')
    .delete()
    .eq('id', participantId)
    .eq('group_id', group_id);
}
