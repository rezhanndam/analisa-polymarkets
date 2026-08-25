import { Save, ShieldAlert, Bot } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Bot Settings</h1>
          <p className="text-slate-400 text-sm">Configure trading parameters, risk management, and API keys.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors">
          <Save size={16} />
          Save Changes
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {/* Risk Management */}
        <section className="bg-[#131e36] border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
              <ShieldAlert size={20} />
            </div>
            <h2 className="text-lg font-semibold text-white">Risk Management</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-slate-300 font-medium">Trade Size (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  defaultValue={10}
                  className="w-full bg-[#0b1326] border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">%</span>
              </div>
              <p className="text-xs text-slate-500">Percentage of total balance per trade.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300 font-medium">Max Active Positions</label>
              <input 
                type="number" 
                defaultValue={5}
                className="w-full bg-[#0b1326] border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-sky-500 transition-colors"
              />
              <p className="text-xs text-slate-500">Maximum concurrent open trades.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300 font-medium">Auto Take Profit (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  defaultValue={75}
                  className="w-full bg-[#0b1326] border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">%</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300 font-medium">Auto Stop Loss (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  defaultValue={40}
                  className="w-full bg-[#0b1326] border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bot Engine config */}
        <section className="bg-[#131e36] border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Bot size={20} />
            </div>
            <h2 className="text-lg font-semibold text-white">Bot Engine</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-slate-300 font-medium">Minimum Confidence</label>
              <div className="relative">
                <input 
                  type="number" 
                  defaultValue={80}
                  className="w-full bg-[#0b1326] border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">%</span>
              </div>
              <p className="text-xs text-slate-500">Only execute trades if AI confidence is above this threshold.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300 font-medium">Trading Mode</label>
              <select className="w-full bg-[#0b1326] border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-sky-500 transition-colors appearance-none">
                <option value="paper">Paper Trading (Simulasi)</option>
                <option value="live">Live Trading (Real USDC)</option>
              </select>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
