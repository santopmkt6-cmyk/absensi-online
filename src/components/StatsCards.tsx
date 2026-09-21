import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Fingerprint, 
  TrendingUp 
} from 'lucide-react';
import { Employee, AttendanceRecord } from '../types';

interface StatsCardsProps {
  employees: Employee[];
  records: AttendanceRecord[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ employees, records }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = records.filter((r) => r.tanggal === todayStr);

  const uniqueTodayEmployeeIds = new Set(todayRecords.map((r) => r.employeeId));
  const totalEmployees = employees.length;
  const hadirHariIni = uniqueTodayEmployeeIds.size;
  const attendanceRate = totalEmployees > 0 ? Math.round((hadirHariIni / totalEmployees) * 100) : 0;

  const tepatWaktuCount = todayRecords.filter((r) => r.tipe === 'masuk' && r.status === 'tepat_waktu').length;
  const terlambatCount = todayRecords.filter((r) => r.tipe === 'masuk' && r.status === 'terlambat').length;
  const enrolledFingerprints = employees.filter((e) => e.fingerprintRegistered).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Total Karyawan */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold">Total Karyawan</span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-slate-900">{totalEmployees}</span>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
            100% Aktif
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Master data pegawai</p>
      </div>

      {/* Hadir Hari Ini */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold">Hadir Hari Ini</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-slate-900">{hadirHariIni}</span>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            {attendanceRate}% Hadir
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">{totalEmployees - hadirHariIni} belum presensi</p>
      </div>

      {/* Tepat Waktu vs Terlambat */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold">Ketepatan Waktu</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-slate-900">{tepatWaktuCount}</span>
          {terlambatCount > 0 && (
            <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <AlertCircle className="w-3 h-3 text-rose-500" />
              {terlambatCount} Terlambat
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Presensi jam masuk hari ini</p>
      </div>

      {/* Sidik Jari Terdaftar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold">Biometrik Sidik Jari</span>
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <Fingerprint className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-slate-900">{enrolledFingerprints}</span>
          <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
            {totalEmployees > 0 ? Math.round((enrolledFingerprints / totalEmployees) * 100) : 0}% Enrolled
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Siap verifikasi biometrik</p>
      </div>
    </div>
  );
};
