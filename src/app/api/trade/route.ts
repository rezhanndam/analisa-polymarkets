import { NextResponse } from "next/server";
import { placeLimitOrder } from "@/lib/trading";
import { supabaseAdmin } from "@/lib/supabase";
import { logTrade } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { marketId, question, side, price, sizeUsdc, mode } = body;

    if (!marketId || !side || !price || !sizeUsdc) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    let execStatus = 'OPEN';
    let errorMessage = '';

    // If live mode, execute the real transaction
    if (mode === 'live') {
      const shares = sizeUsdc / price;
      const res = await placeLimitOrder(marketId, side, price, shares);
      
      if (!res.success) {
        execStatus = 'FAILED';
        errorMessage = res.error || "Unknown Polymarket API Error";
      }
    }

    if (execStatus === 'OPEN') {
      await logTrade({
        market_id: marketId,
        question: question || "Manual Trade",
        action: `MANUAL ${side} ${side === 'BUY' ? 'YES' : 'NO'}`,
        side: side,
        entry_price: price,
        current_price: price,
        size_usdc: sizeUsdc,
        pnl: 0,
        status: 'OPEN',
        mode: mode
      });

      return NextResponse.json({ success: true, message: `Successfully opened manual position.` });
    } else {
      return NextResponse.json({ error: `Trade failed: ${errorMessage}` }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Manual trade POST error:", error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
