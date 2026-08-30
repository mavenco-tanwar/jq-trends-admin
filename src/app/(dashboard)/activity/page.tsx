'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Clock, ShieldCheck, User, Terminal } from 'lucide-react';
import { ActivityService } from '@/services/users';
import type { ActivityLog } from '@/types';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    ActivityService.getLogs().then((l) => setLogs(l));
  }, []);

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Security &amp; Compliance
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Audit Trail &amp; Activity Logs</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable chronicle of all staff changes, block publications, and order dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#10121A] border border-slate-800 rounded-lg text-xs text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span className="font-bold">Audit Logging Active</span>
        </div>
      </div>

      <div className="bg-[#161822] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-800/60 text-xs">
          {logs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-800/20 transition-colors flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <Activity className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{log.action}</span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(log.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>
                    Staff: <strong className="text-slate-200">{log.userName}</strong> ({log.userEmail})
                  </span>
                  <span>•</span>
                  <span>
                    Target: <strong className="text-slate-200 uppercase font-mono">{log.entityType}</strong> (
                    {log.entityId})
                  </span>
                  <span>•</span>
                  <span>IP: {log.ipAddress}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
