import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from('bot_config').select('*').eq('id', 1).single();
    if (error) {
      return NextResponse.json({
        status: 'STOPPED', mode: 'paper', trade_size_pct: 10,
        max_positions: 5, min_confidence: 80, tp_pct: 75, sl_pct: -40
      });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { error } = await supabaseAdmin.from('bot_config').upsert({ id: 1, ...body });
    if (error) {
      console.error("Supabase upsert error:", error);
      return NextResponse.json({ error: error.message || JSON.stringify(error) }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Config POST error:", error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
