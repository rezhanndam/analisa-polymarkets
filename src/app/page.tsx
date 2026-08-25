import { CloudSun, TrendingUp, AlertTriangle, Activity } from "lucide-react";
import { fetchTradeHistory, fetchActivePositions } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

// Make this a server component that fetches real data
export const revalidate = 0; // Disable cache, always fetch latest

export default async function Dashboard() {
  const trades = await fetchTradeHistory();
  const activePos = await fetchActivePositions();
  
  // Calculate PnL from closed/open trades
  const totalPnL = trades.reduce((sum: number, t: any) => sum + (Number(t.pnl) || 0), 0);
  
  // Calculate win rate from closed trades
  const closedTrades = trades.filter((t: any) => t.status !== 'OPEN');
  const winCount = closedTrades.filter((t: any) => Number(t.pnl) > 0).length;
  const winRate = closedTrades.length > 0 ? (winCount / closedTrades.length) * 100 : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Overview</h1>
          <p className="text-slate-400 text-sm">Real-time trading performance and active positions.</p>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#131e36] border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400">
              <CloudSun size={20} />
            </div>
            <span className="text-xs font-mono text-slate-500">Total</span>
          </div>
          <p className="text-slate-400 text-sm mb-1">Total Trades</p>
          <h3 className="text-2xl font-bold text-white">{trades.length}</h3>
        </div>

        <div className="bg-[#131e36] border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-lg ${totalPnL >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-1">Total PnL</p>
          <h3 className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
          </h3>
        </div>

        <div className="bg-[#131e36] border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Activity size={20} />
            </div>
            <span className="text-xs font-mono text-slate-500">LIVE</span>
          </div>
          <p className="text-slate-400 text-sm mb-1">Active Positions</p>
          <h3 className="text-2xl font-bold text-white">{activePos.length}</h3>
        </div>

        <div className="bg-[#131e36] border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-1">Win Rate</p>
          <h3 className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Positions */}
        <div className="bg-[#131e36] border border-slate-800 rounded-xl flex flex-col h-[500px]">
          <div className="p-5 border-b border-slate-800">
            <h2 className="font-semibold text-white">Active Positions</h2>
          </div>
          <div className="p-0 flex-1 overflow-y-auto">
            {activePos.length === 0 ? (
              <div className="text-center text-slate-500 text-sm mt-10">No active positions</div>
            ) : (
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs text-slate-500 bg-slate-800/50 uppercase border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Market</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Entry</th>
                    <th className="px-4 py-3">Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {activePos.map((pos: any) => (
                    <tr key={pos.id} className="hover:bg-slate-800/30">
                      <td className="px-4 py-3 truncate max-w-[200px]" title={pos.question}>{pos.question}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${pos.action.includes('BUY') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {pos.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">{formatPrice(pos.entry_price)}¢</td>
                      <td className="px-4 py-3 font-mono">${pos.size_usdc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Trade History */}
        <div className="bg-[#131e36] border border-slate-800 rounded-xl flex flex-col h-[500px]">
          <div className="p-5 border-b border-slate-800">
            <h2 className="font-semibold text-white">Recent Trades (Paper & Live)</h2>
          </div>
          <div className="p-0 flex-1 overflow-y-auto">
            {trades.length === 0 ? (
               <div className="text-center text-slate-500 text-sm mt-10">No trade history</div>
            ) : (
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs text-slate-500 bg-slate-800/50 uppercase border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Market</th>
                    <th className="px-4 py-3">Mode</th>
                    <th className="px-4 py-3 text-right">PnL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {trades.map((t: any) => (
                    <tr key={t.id} className="hover:bg-slate-800/30">
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-400">
                        {new Date(t.created_at).toLocaleDateString()} {new Date(t.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="px-4 py-3 truncate max-w-[150px]" title={t.question}>{t.question}</td>
                      <td className="px-4 py-3">
                         <span className={`text-xs ${t.mode === 'live' ? 'text-amber-400' : 'text-slate-400'}`}>{t.mode.toUpperCase()}</span>
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-medium ${Number(t.pnl) > 0 ? 'text-emerald-400' : Number(t.pnl) < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                        {Number(t.pnl) > 0 ? '+' : ''}${Number(t.pnl).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
