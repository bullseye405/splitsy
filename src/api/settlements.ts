
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Settlement = Database['public']['Tables']['settlements']['Row'];
type SettlementInsert = Database['public']['Tables']['settlements']['Insert'];

export async function createSettlement(settlement: SettlementInsert) {
  console.log('Creating settlement:', settlement);
  
  const { data, error } = await supabase
    .from('settlements')
    .insert(settlement)
    .select()
    .single();

  if (error) {
    console.error('Error creating settlement:', error);
    throw error;
  }

  console.log('Settlement created:', data);
  return data;
}

export async function getSettlementsByGroupId(groupId: string) {
  console.log('Fetching settlements for group:', groupId);
  
  const { data, error } = await supabase
    .from('settlements')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching settlements:', error);
    throw error;
  }

  console.log('Settlements fetched:', data);
  return data as Settlement[];
}
