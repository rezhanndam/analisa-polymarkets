import { supabase } from "@/lib/supabase";

export async function fetchBotConfig() {
  const { data, error } = await supabase.from('bot_config').select('*').eq('id', 1).single();
  if (error || !data) {
    return {
      status: 'STOPPED',
      mode: 'paper',
      trade_size_pct: 10,
      max_positions: 5,
      min_confidence: 80,
      tp_pct: 75,
      sl_pct: -40
    };
  }
  return data;
}

export async function saveBotConfig(config: Record<string, unknown>) {
  const { error } = await supabase.from('bot_config').upsert({ id: 1, ...config });
  if (error) {
    console.error("Failed to save config:", error);
    return false;
  }
  return true;
}

export async function logTrade(trade: Record<string, unknown>) {
  const { error } = await supabase.from('trades').insert([{ ...trade, created_at: new Date().toISOString() }]);
  if (error) {
    console.error("Failed to log trade:", error);
    return false;
  }
  return true;
}

export async function fetchActivePositions() {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('status', 'OPEN')
    .order('created_at', { ascending: false });
  
  if (error) return [];
  return data;
}

export async function fetchTradeHistory() {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error) return [];
  return data;
}
