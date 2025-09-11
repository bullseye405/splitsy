import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Settlement = Database['public']['Tables']['settlements']['Row'];
type SettlementInsert = Database['public']['Tables']['settlements']['Insert'];

export async function createSettlement(settlement: SettlementInsert) {
  const { data, error } = await supabase
    .from('settlements')
    .insert(settlement)
    .select()
    .single();

  if (error) {
    console.error('Error creating settlement:', error);
    throw error;
  }

  return data;
}

export async function getSettlementsByGroupId(groupId: string) {
  const { data, error } = await supabase
    .from('settlements')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching settlements:', error);
    throw error;
  }

  return data as Settlement[];
}

export async function deleteSettlement(settlementId: string) {
  const { error } = await supabase
    .from('settlements')
    .delete()
    .eq('id', settlementId);

  if (error) {
    console.error('Error deleting settlement:', error);
    throw error;
  }
}
