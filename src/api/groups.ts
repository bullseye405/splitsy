import { supabase } from "@/integrations/supabase/client";

export async function createGroup(name: string, description?: string) {
  return await supabase
    .from('group')
    .insert([{ name, description }])
    .select()
    .single();

}
