import { supabase } from '@/integrations/supabase/client';

export async function updateGroupName(
  groupId: string,
  name: string,
  description?: string
) {
  const updateFields: { name: string; description?: string } = { name };
  if (description !== undefined) {
    updateFields.description = description;
  }
  return await supabase
    .from('group')
    .update(updateFields)
    .eq('id', groupId)
    .select()
    .single();
}

export async function createGroup(name: string, description?: string) {
  return await supabase
    .from('group')
    .insert([{ name, description }])
    .select()
    .single();
}

export async function getAllGroups() {
  return await supabase
    .from('group')
    .select('id, name, description, created_at')
    .order('created_at', { ascending: false });
}

export async function getGroupById(groupId: string) {
  return await supabase
    .from('group')
    .select(
      'id, name, participants(id, name, group_id, created_at, email), description, created_at'
    )
    .eq('id', groupId)
    .single();
}

export async function deleteGroup(groupId: string) {
  return await supabase.from('group').delete().eq('id', groupId);
}
