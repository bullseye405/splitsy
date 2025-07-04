
import { supabase } from '@/integrations/supabase/client';

export interface GroupView {
  id: string;
  group_id: string;
  participant_id: string;
  viewed_at: string;
  created_at: string;
}

export async function recordGroupView(groupId: string, participantId: string): Promise<void> {
  const { error } = await supabase
    .from('group_views')
    .upsert(
      { 
        group_id: groupId, 
        participant_id: participantId,
        viewed_at: new Date().toISOString()
      },
      { 
        onConflict: 'group_id,participant_id' 
      }
    );

  if (error) {
    console.error('Error recording group view:', error);
    throw error;
  }
}

export async function getGroupViews(groupId: string): Promise<GroupView[]> {
  const { data, error } = await supabase
    .from('group_views')
    .select('*')
    .eq('group_id', groupId)
    .order('viewed_at', { ascending: false });

  if (error) {
    console.error('Error fetching group views:', error);
    throw error;
  }

  return data || [];
}
