"use client";

import { Save, ShieldAlert, Bot, Play, Square } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const { data } = await supabase.from('bot_config').select('*').eq('id', 1).single();
    if (data) {
      setConfig(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('bot_config').upsert({ id: 1, ...config });
    setSaving(false);
    alert('Settings saved successfully!');
  };

  const toggleStatus = async () => {
    const newStatus = config.status === 'RUNNING' ? 'STOPPED' : 'RUNNING';
    setConfig({ ...config, status: newStatus });
    await supabase.from('bot_config').update({ status: newStatus }).eq('id', 1);
  };

  if (loading || !config) return <div className="text-slate-500">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Bot Settings</h1>
          <p className="text-slate-400 text-sm">Configure trading parameters, risk management, and API keys.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleStatus}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              config.status === 'RUNNING' 
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20' 
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            {config.status === 'RUNNING' ? <><Square size={16} /> Stop Bot</> : <><Play size={16} /> Start Bot</>}
          </button>
          
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {/* Status Indicator */}
        <div className="bg-[#131e36] border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-800/50 rounded-full">
              <Bot size={24} className={config.status === 'RUNNING' ? "text-emerald-400" : "text-slate-500"} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">Engine Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${config.status === 'RUNNING' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
                <span className={`text-xs font-bold ${config.status === 'RUNNING' ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {config.status}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-300">Active Mode</p>
            <p className={`text-xs mt-1 uppercase font-bold ${config.mode === 'live' ? 'text-amber-400' : 'text-sky-400'}`}>
              {config.mode} TRADING
            </p>
          </div>
        </div>

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
                  value={config.trade_size_pct}
                  onChange={(e) => setConfig({...config, trade_size_pct: Number(e.target.value)})}
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
                value={config.max_positions}
                onChange={(e) => setConfig({...config, max_positions: Number(e.target.value)})}
                className="w-full bg-[#0b1326] border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-sky-500 transition-colors"
              />
              <p className="text-xs text-slate-500">Maximum concurrent open trades.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300 font-medium">Auto Take Profit (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={config.tp_pct}
                  onChange={(e) => setConfig({...config, tp_pct: Number(e.target.value)})}
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
                  value={config.sl_pct}
                  onChange={(e) => setConfig({...config, sl_pct: Number(e.target.value)})}
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
                  value={config.min_confidence}
                  onChange={(e) => setConfig({...config, min_confidence: Number(e.target.value)})}
                  className="w-full bg-[#0b1326] border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">%</span>
              </div>
              <p className="text-xs text-slate-500">Only execute trades if AI confidence is above this threshold.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300 font-medium">Trading Mode</label>
              <select 
                value={config.mode}
                onChange={(e) => setConfig({...config, mode: e.target.value})}
                className="w-full bg-[#0b1326] border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-sky-500 transition-colors appearance-none"
              >
                <option value="paper">Paper Trading (Simulasi)</option>
                <option value="live">Live Trading (Real USDC)</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">Live trading requires valid POLYMARKET_PK in environment.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
