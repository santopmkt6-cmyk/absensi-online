import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Fingerprint, 
  CheckCircle2, 
  AlertCircle, 
  Store, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Mail, 
  ArrowRight,
  RefreshCw,
  Building2
} from 'lucide-react';
import { Employee, Kiosk, Shift, BranchInvitation } from '../types';
import { soundEffects } from '../utils/audio';

interface EmployeeSelfRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitations: BranchInvitation[];
  kiosks: Kiosk[];
  shifts: Shift[];
  initialInviteCode?: string;
  onRegisterSuccess: (employee: Employee, targetKiosk: Kiosk) => void;
}

export const EmployeeSelfRegisterModal: React.FC<EmployeeSelfRegisterModalProps> = ({
  isOpen,
  onClose,
  invitations,
  kiosks,
  shifts,
  initialInviteCode = '',
  onRegisterSuccess,
}) => {
  const [inviteCode, setInviteCode] = useState(initialInviteCode);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Employee details
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [departemen, setDepartemen] = useState('Operasional Kios');
  const [jabatan, setJabatan] = useState('Staf Kios');
  const [shiftId, setShiftId] = useState(shifts[0]?.id || 'shift-regular');

  // Biometric registration state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isFingerprintCaptured, setIsFingerprintCaptured] = useState(false);

  // Errors
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-sync initial invite code from prop
  useEffect(() => {
    if (initialInviteCode) {
      setInviteCode(initialInviteCode.toUpperCase().trim());
    }
  }, [initialInviteCode]);

  if (!isOpen) return null;

  // Find matching invitation
  const cleanCode = inviteCode.trim().toUpperCase();
  const matchedInvitation = invitations.find(
    (inv) => inv.code.toUpperCase() === cleanCode && inv.status === 'Aktif'
  );
  const matchedKiosk = matchedInvitation
    ? kiosks.find((k) => k.id === matchedInvitation.kioskId) || null
    : null;

  const handleValidateCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!cleanCode) {
      setErrorMsg('Masukkan kode undangan cabang dari Owner');
      return;
    }

    if (!matchedInvitation) {
      setErrorMsg('Kode undangan tidak ditemukan atau sudah dinonaktifkan. Hubungi Owner Anda.');
      return;
    }

    soundEffects.playSuccessChime();
    setStep(2);
  };

  const handleStartBiometricScan = () => {
    if (isScanning || isFingerprintCaptured) return;
    setIsScanning(true);
    setScanProgress(0);
    soundEffects.playBeep();

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setIsFingerprintCaptured(true);
          soundEffects.playSuccessChime();
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nama.trim()) {
      setErrorMsg('Nama lengkap wajib diisi');
      return;
    }

    if (!matchedInvitation || !matchedKiosk) {
      setErrorMsg('Data cabang tidak valid. Silakan ulangi.');
      setStep(1);
      return;
    }

    const randomEmpNumber = Math.floor(100000 + Math.random() * 900000);
    const generatedNip = `EMP-${randomEmpNumber}`;
    const cleanEmail = email.trim() || `${nama.trim().toLowerCase().replace(/[^a-z0-9]/g, '.')}@kios.co.id`;

    const colors = [
      'from-emerald-600 to-teal-700',
      'from-blue-600 to-indigo-700',
      'from-indigo-600 to-purple-700',
      'from-teal-600 to-emerald-700',
      'from-rose-600 to-pink-700',
    ];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const newEmployee: Employee = {
      id: `emp-invited-${Date.now()}`,
      nip: generatedNip,
      nama: nama.trim(),
      departemen,
      jabatan: jabatan.trim() || 'Staf Kios',
      email: cleanEmail,
      shiftId,
      kioskId: matchedKiosk.id,
      fingerprintRegistered: true,
      registeredSelf: true,
      invitedByCode: matchedInvitation.code,
      tanggalBergabung: new Date().toISOString().split('T')[0],
      status: 'Aktif',
      avatarColor,
    };

    onRegisterSuccess(newEmployee, matchedKiosk);
    soundEffects.playSuccessChime();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Pendaftaran Mandiri Karyawan</h3>
              <p className="text-xs text-emerald-100">
                Gabung ke cabang kios Owner menggunakan kode undangan resmi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className={`flex items-center gap-1.5 font-bold ${step === 1 ? 'text-emerald-700' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
            <span>Validasi Kode</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className={`flex items-center gap-1.5 font-bold ${step === 2 ? 'text-emerald-700' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
            <span>Data Diri</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className={`flex items-center gap-1.5 font-bold ${step === 3 ? 'text-emerald-700' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
            <span>Rekam Sidik Jari</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Masukkan Kode Undangan */}
          {step === 1 && (
            <form onSubmit={handleValidateCode} className="space-y-4">
              <div className="text-center py-2 space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                  <Building2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Masukkan Kode Undangan Cabang</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Dapatkan kode atau link undangan dari Owner/Manajer cabang Anda untuk bergabung ke kios bersangkutan.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kode Undangan (Contoh: INV-GI-2026)
                </label>
                <input
                  type="text"
                  required
                  placeholder="INV-XXXX-XXXX"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-bold tracking-wider uppercase text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {matchedKiosk && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs flex items-center gap-2.5 text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Cabang Kios Terdeteksi:</span>
                    <span>{matchedKiosk.nama} ({matchedKiosk.kode} - {matchedKiosk.kota})</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Validasi Kode & Lanjutkan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Isi Data Diri */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Verified Branch Banner */}
              {matchedKiosk && (
                <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs flex items-center justify-between text-emerald-900">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-emerald-600" />
                    <span>Cabang: <strong>{matchedKiosk.nama}</strong> ({matchedKiosk.kota})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[11px] text-emerald-700 underline font-semibold cursor-pointer"
                  >
                    Ganti Kode
                  </button>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rian Pratama"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                  />
                  <p className="text-[11px] text-slate-500 mt-0.5">*Hanya masukkan nama lengkap tanpa NIP atau gelar</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alamat Email Karyawan</label>
                  <input
                    type="email"
                    required
                    placeholder="contoh: rian.pratama@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                  />
                  <p className="text-[11px] text-slate-500 mt-0.5">Digunakan untuk menerima notifikasi verifikasi absensi & rekap jam kerja</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Departemen / Divisi</label>
                    <input
                      type="text"
                      value={departemen}
                      onChange={(e) => setDepartemen(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jabatan / Posisi</label>
                    <input
                      type="text"
                      value={jabatan}
                      onChange={(e) => setJabatan(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Shift Kerja</label>
                  <select
                    value={shiftId}
                    onChange={(e) => setShiftId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                  >
                    {shifts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama} ({s.jamMasuk} - {s.jamPulang})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!nama.trim()) {
                      setErrorMsg('Silakan isi nama lengkap terlebih dahulu');
                      return;
                    }
                    setErrorMsg(null);
                    setStep(3);
                  }}
                  className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Lanjut: Rekam Sidik Jari</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Rekam Biometrik Sidik Jari */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h4 className="font-bold text-sm text-slate-900">Perekaman Sidik Jari Mandiri</h4>
                <p className="text-xs text-slate-500">
                  Tempelkan jari Anda pada sensor atau klik tombol sensor di bawah untuk merekam biometrik
                </p>
              </div>

              {/* Interactive Biometric Sensor Pad */}
              <div className="flex flex-col items-center justify-center p-6 bg-slate-900 rounded-2xl border border-slate-800 relative overflow-hidden">
                <div className="relative flex items-center justify-center">
                  {/* Glowing background animation */}
                  <div
                    className={`absolute w-36 h-36 rounded-full blur-xl transition-all duration-500 ${
                      isFingerprintCaptured
                        ? 'bg-emerald-500/40'
                        : isScanning
                        ? 'bg-teal-500/40 animate-pulse'
                        : 'bg-emerald-500/10'
                    }`}
                  ></div>

                  <button
                    type="button"
                    onClick={handleStartBiometricScan}
                    disabled={isScanning || isFingerprintCaptured}
                    className={`relative w-28 h-28 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                      isFingerprintCaptured
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                        : isScanning
                        ? 'bg-teal-600/30 border-teal-400 text-teal-300 animate-pulse scale-95'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-emerald-500 hover:text-emerald-400 hover:scale-105'
                    }`}
                  >
                    <Fingerprint className={`w-14 h-14 ${isScanning ? 'animate-bounce' : ''}`} />
                    <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">
                      {isFingerprintCaptured ? 'Terekam ✓' : isScanning ? `${scanProgress}%` : 'Sentuh Disini'}
                    </span>
                  </button>
                </div>

                {/* Progress bar */}
                {isScanning && (
                  <div className="w-48 bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-200"
                      style={{ width: `${scanProgress}%` }}
                    ></div>
                  </div>
                )}

                <div className="mt-3 text-center">
                  {isFingerprintCaptured ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Sidik Jari Siap Digunakan
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">
                      Klik ikon sidik jari di atas untuk mulai memindai
                    </span>
                  )}
                </div>
              </div>

              {/* Summary Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama:</span>
                  <strong className="text-slate-800">{nama}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-mono text-slate-700">{email || '(Otomatis)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cabang:</span>
                  <strong className="text-emerald-700">{matchedKiosk?.nama}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Selesaikan & Masuk Cabang</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
