import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-full border-2 border-indigo-500/20 border-t-rose-500 border-r-indigo-500 animate-spin" />
        <div className="absolute w-6 h-6 rounded-lg bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center shadow-md text-[10px] font-bold text-white">
          M
        </div>
      </div>
      <div className="text-center space-y-1">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Loading Page Module
        </h4>
        <p className="text-[11px] text-slate-400">
          Syncing MongoDB Atlas data and platform settings...
        </p>
      </div>
    </div>
  );
}
