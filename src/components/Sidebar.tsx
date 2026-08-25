import Link from "next/link";
import { CloudSun, Signal, History, Settings, Wallet } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Dashboard", icon: CloudSun },
    { href: "/signals", label: "AI Signals", icon: Signal },
    { href: "/history", label: "Trade History", icon: History },
    { href: "/portfolio", label: "Portfolio", icon: Wallet },
    { href: "/settings", label: "Bot Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0b1326] border-r border-slate-800 h-screen flex flex-col hidden md:flex fixed left-0 top-0">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center">
            <CloudSun className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-white leading-none">WeatherBot</h1>
            <span className="text-[10px] text-sky-400 font-mono tracking-widest uppercase">Auto Trader</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-slate-400 font-mono">CLOB Connected</span>
        </div>
      </div>
    </aside>
  );
}
