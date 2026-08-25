"use client";

import { CloudSun, ArrowUpRight, Wind, DollarSign } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";

export function SignalCard({ market, config }: { market: any; config: any }) {
  const [showModal, setShowModal] = useState(false);
  const [sizeUsdc, setSizeUsdc] = useState(10); // default fallback
  const [executing, setExecuting] = useState(false);

  const m = market;
  const sig = m.signal;
  
  // Calculate recommended default size based on config
  const balance = 100; // Mock balance
  const defaultSize = config ? (balance * (config.trade_size_pct / 100)) : 10;

  const handleOpenModal = () => {
    setSizeUsdc(defaultSize);
    setShowModal(true);
  };

  const executeTrade = async () => {
    setExecuting(true);
    
    // Determine side based on AI action
    const side = sig.action.includes("NO") || sig.action === "SELL" ? "SELL" : "BUY";
    const mode = config?.mode || 'paper';

    try {
      const res = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketId: m.id,
          question: m.question,
          side: side,
          price: m.curPrice,
          sizeUsdc: sizeUsdc,
          mode: mode
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(`Trade successful! (${mode.toUpperCase()})`);
      setShowModal(false);
    } catch (err: any) {
      alert(`Error executing trade: ${err.message}`);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <>
      <div className="bg-[#131e36] border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <h3 className="font-medium text-slate-200">{m.question}</h3>
          
          {m.weatherReport && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="flex items-center gap-1 bg-slate-800 text-slate-300 px-2 py-1 rounded">
                <CloudSun size={14} className="text-amber-400" />
                {m.weatherReport.city.name}: {m.weatherReport.currentTempF}°F
              </span>
              <span className="flex items-center gap-1 bg-slate-800 text-slate-300 px-2 py-1 rounded">
                <ArrowUpRight size={14} className="text-emerald-400" />
                High: {m.weatherReport.highTempF}°F
              </span>
              <span className="flex items-center gap-1 bg-slate-800 text-slate-300 px-2 py-1 rounded">
                <Wind size={14} className="text-sky-400" />
                Precip: {m.weatherReport.precipitationChance}%
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 text-xs">
            {sig.reasons.map((r: string, i: number) => (
              <span key={i} className="bg-slate-800/50 text-slate-400 px-2 py-1 rounded border border-slate-700/50">
                {r}
              </span>
            ))}
          </div>
        </div>

        <div className="md:w-64 shrink-0 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Market Price</p>
              <p className="font-mono text-lg text-white">{formatPrice(m.curPrice)}¢</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-1">Confidence</p>
              <p className={`font-mono text-lg font-bold ${
                sig.confidence >= 80 ? 'text-emerald-400' :
                sig.confidence >= 60 ? 'text-amber-400' : 'text-slate-400'
              }`}>
                {sig.confidence}%
              </p>
            </div>
          </div>

          <button 
            onClick={handleOpenModal}
            className={`w-full py-2 rounded-lg text-sm font-bold tracking-wide border transition-all ${
            sig.action.includes('STRONG BUY') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/20' :
            sig.action.includes('BUY') ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10' :
            sig.action.includes('SELL') ? 'bg-rose-500/10 text-rose-400 border-rose-500/50 hover:bg-rose-500/20' :
            'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
          }`}>
            {sig.action}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#131e36] border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">Execute Trade</h2>
            <p className="text-sm text-slate-400 mb-6">{m.question}</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-sm text-slate-400">Action</span>
                <span className={`font-bold ${sig.action.includes('NO') || sig.action.includes('SELL') ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {sig.action.includes('NO') || sig.action.includes('SELL') ? 'SELL / NO' : 'BUY / YES'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-sm text-slate-400">Entry Price</span>
                <span className="font-mono text-white">{formatPrice(m.curPrice)}¢</span>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Investment Size (USDC)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="number" 
                    value={sizeUsdc}
                    onChange={(e) => setSizeUsdc(Number(e.target.value))}
                    className="w-full bg-[#0b1326] border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Estimated Shares:</span>
                <span className="font-mono">{Math.floor(sizeUsdc / m.curPrice)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeTrade}
                disabled={executing}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-sky-500 hover:bg-sky-600 transition-colors disabled:opacity-50"
              >
                {executing ? 'Executing...' : 'Confirm Trade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
