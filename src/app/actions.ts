"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function saveConfigAction(payload: any) {
  try {
    const { error } = await supabaseAdmin.from('bot_config').upsert({ id: 1, ...payload });
    if (error) throw new Error(error.message);
    revalidatePath('/settings');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || String(e) };
  }
}

export async function toggleStatusAction(currentStatus: string) {
  try {
    const newStatus = currentStatus === 'RUNNING' ? 'STOPPED' : 'RUNNING';
    const { error } = await supabaseAdmin.from('bot_config').update({ status: newStatus }).eq('id', 1);
    if (error) throw new Error(error.message);
    revalidatePath('/settings');
    return { success: true, newStatus };
  } catch (e: any) {
    return { success: false, error: e.message || String(e) };
  }
}
