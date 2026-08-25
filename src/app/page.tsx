import { CloudSun, TrendingUp, AlertTriangle, Activity } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Overview</h1>
          <p className="text-slate-400 text-sm">Real-time trading performance and active positions.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition-colors">
            Start Bot
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#131e36] border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400">
              <CloudSun size={20} />
            </div>
            <span className="text-xs font-mono text-slate-500">24H</span>
          </div>
          <p className="text-slate-400 text-sm mb-1">Active Scans</p>
          <h3 className="text-2xl font-bold text-white">124</h3>
        </div>

        <div className="bg-[#131e36] border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <TrendingUp size={20} />
            </div>
            <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">+12.5%</span>
          </div>
          <p className="text-slate-400 text-sm mb-1">Total PnL</p>
          <h3 className="text-2xl font-bold text-white">+$142.50</h3>
        </div>

        <div className="bg-[#131e36] border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Activity size={20} />
            </div>
            <span className="text-xs font-mono text-slate-500">LIVE</span>
          </div>
          <p className="text-slate-400 text-sm mb-1">Active Positions</p>
          <h3 className="text-2xl font-bold text-white">3</h3>
        </div>

        <div className="bg-[#131e36] border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-1">Win Rate</p>
          <h3 className="text-2xl font-bold text-white">68.4%</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Positions */}
        <div className="bg-[#131e36] border border-slate-800 rounded-xl flex flex-col h-[400px]">
          <div className="p-5 border-b border-slate-800">
            <h2 className="font-semibold text-white">Active Positions</h2>
          </div>
          <div className="p-5 flex-1 overflow-y-auto">
            <div className="text-center text-slate-500 text-sm mt-10">No active positions</div>
          </div>
        </div>

        {/* Live Logs */}
        <div className="bg-[#131e36] border border-slate-800 rounded-xl flex flex-col h-[400px]">
          <div className="p-5 border-b border-slate-800">
            <h2 className="font-semibold text-white">Bot Logs</h2>
          </div>
          <div className="p-5 flex-1 overflow-y-auto font-mono text-xs space-y-2">
            <div className="text-slate-500">[10:00:01] System started</div>
            <div className="text-sky-400">[10:00:05] Scanning weather markets...</div>
            <div className="text-slate-400">[10:00:10] Found 12 active markets</div>
          </div>
        </div>
      </div>
    </div>
  );
}
