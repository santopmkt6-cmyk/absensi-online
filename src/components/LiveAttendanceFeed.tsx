import React from 'react';
import { Clock, CheckCircle2, AlertCircle, Fingerprint, Activity } from 'lucide-react';
import { AttendanceRecord } from '../types';

interface LiveAttendanceFeedProps {
  records: AttendanceRecord[];
}

export const LiveAttendanceFeed: React.FC<LiveAttendanceFeedProps> = ({ records }) => {
  const latestRecords = records.slice(0, 6);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
          <h3 className="text-sm font-bold text-slate-900">Aktivitas Presensi Terkini (Real-Time)</h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">LIVE FEED</span>
      </div>

      <div className="space-y-3">
        {latestRecords.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">Belum ada aktivitas presensi hari ini.</p>
        ) : (
          latestRecords.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-100 transition-colors text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="font-bold text-slate-900 truncate">{item.nama}</p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {item.tipe === 'masuk' ? 'Presensi Masuk' :
                     item.tipe === 'pulang' ? 'Presensi Pulang' : 'Presensi Lembur'} • {item.departemen}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 ml-2">
                <div className="font-mono font-bold text-slate-900">{item.waktu}</div>
                <div className="text-[10px]">
                  {item.status === 'tepat_waktu' ? (
                    <span className="text-emerald-700 font-semibold">Tepat Waktu</span>
                  ) : item.status === 'terlambat' ? (
                    <span className="text-rose-600 font-semibold">Terlambat +{item.keterlambatanMenit}m</span>
                  ) : (
                    <span className="text-indigo-600 font-semibold">Sesuai</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
