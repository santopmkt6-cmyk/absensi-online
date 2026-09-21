import React, { useState } from 'react';
import { X, PlusCircle, User, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { Employee, AttendanceRecord, AttendanceType, Shift } from '../types';
import { soundEffects } from '../utils/audio';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  currentShift: Shift;
  onAddRecord: (record: AttendanceRecord) => void;
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({
  isOpen,
  onClose,
  employees,
  currentShift,
  onAddRecord,
}) => {
  if (!isOpen) return null;

  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [tanggal, setTanggal] = useState<string>(todayStr);
  const [waktu, setWaktu] = useState<string>(timeStr);
  const [tipe, setTipe] = useState<AttendanceType>('masuk');
  const [catatan, setCatatan] = useState<string>('Disetujui HRD (Lupa Absen / Tugas Luar)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === selectedEmpId);
    if (!emp) return;

    // Calculate late status
    const [h, m] = waktu.split(':').map(Number);
    const [shiftH, shiftM] = currentShift.jamMasuk.split(':').map(Number);
    const enteredMins = (h || 0) * 60 + (m || 0);
    const shiftMins = shiftH * 60 + shiftM;

    let status: AttendanceRecord['status'] = 'tepat_waktu';
    let keterlambatanMenit = 0;

    if (tipe === 'masuk') {
      if (enteredMins > shiftMins + currentShift.toleransiKeterlambatan) {
        status = 'terlambat';
        keterlambatanMenit = enteredMins - shiftMins;
      }
    } else if (tipe === 'pulang') {
      status = 'sesuai_jadwal';
    } else if (tipe === 'lembur') {
      status = 'lembur';
    }

    const newRecord: AttendanceRecord = {
      id: `att-man-${Date.now()}`,
      employeeId: emp.id,
      nip: emp.nip,
      nama: emp.nama,
      departemen: emp.departemen,
      timestamp: `${tanggal}T${waktu}.000Z`,
      tanggal,
      waktu,
      tipe,
      status,
      keterlambatanMenit,
      metodeVerifikasi: 'Manual Override',
      scoreAkurasi: 100,
      catatan: catatan.trim() || 'Koreksi Kehadiran Manual',
      lokasi: 'Kantor Administrasi / HRD',
    };

    onAddRecord(newRecord);
    soundEffects.playSuccessChime();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Input Presensi Manual</h3>
              <p className="text-[11px] text-slate-500">Koreksi catatan absensi untuk karyawan</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Pilih Karyawan</label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nip} - {e.nama} ({e.departemen})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tanggal</label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Waktu (HH:mm:ss)</label>
              <input
                type="text"
                required
                value={waktu}
                onChange={(e) => setWaktu(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tipe Presensi</label>
            <select
              value={tipe}
              onChange={(e) => setTipe(e.target.value as AttendanceType)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="masuk">Masuk Kerja</option>
              <option value="pulang">Pulang Kerja</option>
              <option value="lembur">Lembur</option>
              <option value="istirahat_keluar">Istirahat Keluar</option>
              <option value="istirahat_kembali">Istirahat Kembali</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Alasan / Catatan Admin</label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Berikan alasan koreksi..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            ></textarea>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
            >
              Simpan Presensi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
