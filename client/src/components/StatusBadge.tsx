import { Activity, Circle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  count?: number;
}

export function StatusBadge({ status, count }: StatusBadgeProps) {
  const isOnline = status === "online" || status === "active";

  return (
    <div className="inline-flex items-center gap-6 p-4 rounded-full bg-card/50 border border-white/5 backdrop-blur-sm">
      <div className="flex items-center gap-2 px-3">
        <div className="relative flex items-center justify-center">
          {isOnline && (
            <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <Circle className={`w-3 h-3 fill-current ${isOnline ? 'text-emerald-500' : 'text-amber-500'}`} />
        </div>
        <span className="font-medium text-sm text-foreground/80 uppercase tracking-wider">
          System {isOnline ? 'Operational' : 'Maintenance'}
        </span>
      </div>
      
      {count !== undefined && (
        <>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 px-3">
            <Activity className="w-4 h-4 text-primary" />
            <span className="font-bold text-white tabular-nums">{count}</span>
            <span className="text-sm text-muted-foreground">Active Channels</span>
          </div>
        </>
      )}
    </div>
  );
}
