import React, { useState, useEffect } from 'react';
import { Clock, Globe, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Shift, TimezoneOption } from '../types';

interface RealTimeClockProps {
  currentShift: Shift;
  timezone: TimezoneOption;
  onTimezoneChange: (tz: TimezoneOption) => void;
}

export const RealTimeClock: React.FC<RealTimeClockProps> = ({
  currentShift,
  timezone,
  onTimezoneChange,
}) => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute timezone offset
  const getTimeInZone = (date: Date, tz: TimezoneOption): Date => {
    if (tz === 'LOCAL') return date;
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const offsets: Record<Exclude<TimezoneOption, 'LOCAL'>, number> = {
      WIB: 7,
      WITA: 8,
      WIT: 9,
    };
    return new Date(utc + 3600000 * offsets[tz]);
  };

  const zoneTime = getTimeInZone(time, timezone);

  const hours = zoneTime.getHours().toString().padStart(2, '0');
  const minutes = zoneTime.getMinutes().toString().padStart(2, '0');
  const seconds = zoneTime.getSeconds().toString().padStart(2, '0');

  const dateString = zoneTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Calculate shift status
  const currentMinutes = zoneTime.getHours() * 60 + zoneTime.getMinutes();
  const [shiftInH, shiftInM] = currentShift.jamMasuk.split(':').map(Number);
  const [shiftOutH, shiftOutM] = currentShift.jamPulang.split(':').map(Number);
  const shiftInMinutes = shiftInH * 60 + shiftInM;
  const shiftOutMinutes = shiftOutH * 60 + shiftOutM;
  const toleranceMinutes = currentShift.toleransiKeterlambatan;

  // Status check
  let shiftStatusText = 'Di Luar Jam Kerja';
  let shiftStatusColor = 'bg-slate-100 text-slate-700 border-slate-200';
  let isLate = false;
  let minutesLate = 0;

  if (currentMinutes < shiftInMinutes - 60) {
    shiftStatusText = 'Menunggu Jam Masuk';
    shiftStatusColor = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (currentMinutes <= shiftInMinutes + toleranceMinutes) {
    shiftStatusText = 'Periode Masuk (Tepat Waktu)';
    shiftStatusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (currentMinutes < shiftOutMinutes) {
    isLate = true;
    minutesLate = currentMinutes - shiftInMinutes;
    shiftStatusText = `Jam Kerja Berlangsung (Terlambat +${minutesLate} mnt)`;
    shiftStatusColor = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (currentMinutes >= shiftOutMinutes && currentMinutes <= shiftOutMinutes + 120) {
    shiftStatusText = 'Periode Presensi Pulang';
    shiftStatusColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  } else {
    shiftStatusText = 'Jam Lembur / Selesai';
    shiftStatusColor = 'bg-purple-50 text-purple-700 border-purple-200';
  }

  // Work percentage calculation
  const totalWorkDuration = Math.max(1, shiftOutMinutes - shiftInMinutes);
  const elapsedWork = Math.min(Math.max(0, currentMinutes - shiftInMinutes), totalWorkDuration);
  const progressPercent = Math.round((elapsedWork / totalWorkDuration) * 100);

  return (
    <div id="realtime-clock-widget" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Time & Date Display */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
            <Clock className="w-7 h-7 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                PEMATAU WAKTU REAL-TIME
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">NTP Terverifikasi</span>
            </div>

            {/* Precision Digital Clock */}
            <div className="flex items-baseline gap-1 font-['JetBrains_Mono',monospace]">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
                {hours}:{minutes}
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-emerald-600">
                :{seconds}
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {timezone}
              </span>
            </div>

            <p className="text-sm text-slate-600 font-medium capitalize mt-0.5">
              {dateString}
            </p>
          </div>
        </div>

        {/* Center: Shift & Tolerance status */}
        <div className="flex-1 max-w-md bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1 font-semibold text-slate-700">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{currentShift.nama}</span>
            </div>
            <span className="text-slate-500 font-medium">
              {currentShift.jamMasuk} - {currentShift.jamPulang}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border font-medium ${shiftStatusColor}`}>
              {isLate ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              {shiftStatusText}
            </span>
            <span className="text-[11px] text-slate-500">
              Toleransi: <strong className="text-slate-700">{toleranceMinutes} mnt</strong>
            </span>
          </div>
        </div>

        {/* Right: Timezone Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-start lg:self-center">
          <Globe className="w-4 h-4 text-slate-500 ml-2 mr-1" />
          {(['WIB', 'WITA', 'WIT', 'LOCAL'] as TimezoneOption[]).map((tz) => (
            <button
              key={tz}
              id={`tz-btn-${tz}`}
              onClick={() => onTimezoneChange(tz)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timezone === tz
                  ? 'bg-white text-emerald-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {tz}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
