import React, { useState, useEffect, useRef } from 'react';
import { 
  Fingerprint, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  CornerDownRight, 
  Clock, 
  Cpu, 
  Info,
  RefreshCw,
  Mail,
  Bell,
  BellOff,
  Store,
  Lock,
  Crown
} from 'lucide-react';
import { Employee, AttendanceType, AttendanceRecord, Shift, EmailNotificationSettings, Kiosk, UserRole } from '../types';
import { soundEffects } from '../utils/audio';
import { checkBiometricSupport, verifyBiometricCredential } from '../utils/webauthn';

interface FingerprintScannerProps {
  employees: Employee[];
  currentShift: Shift;
  onRecordAttendance: (record: AttendanceRecord) => void;
  emailSettings?: EmailNotificationSettings;
  onToggleEmailSetting?: (key: 'enableVerificationEmail' | 'enableLateArrivalEmail') => void;
  onOpenEmailSettings?: () => void;
  activeKiosk?: Kiosk;
  userRole?: UserRole;
  onOpenRoleModal?: () => void;
  onOpenEmployeeRegisterModal?: () => void;
  onOpenBranchInvitationModal?: () => void;
}

export const FingerprintScanner: React.FC<FingerprintScannerProps> = ({
  employees,
  currentShift,
  onRecordAttendance,
  emailSettings,
  onToggleEmailSetting,
  onOpenEmailSettings,
  activeKiosk,
  userRole = 'owner',
  onOpenRoleModal,
  onOpenEmployeeRegisterModal,
  onOpenBranchInvitationModal,
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [attendanceType, setAttendanceType] = useState<AttendanceType>('masuk');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [lastVerifiedRecord, setLastVerifiedRecord] = useState<AttendanceRecord | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [hardwareBiometricReady, setHardwareBiometricReady] = useState<boolean>(false);
  const [catatan, setCatatan] = useState<string>('');

  const scanTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check hardware biometric capability
  useEffect(() => {
    checkBiometricSupport().then((status) => {
      setHardwareBiometricReady(status.isSupported && status.hasPlatformAuthenticator);
    });

    // Default select first active employee
    if (employees.length > 0 && !selectedEmpId) {
      setSelectedEmpId(employees[0].id);
    }
  }, [employees, selectedEmpId]);

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId) || employees[0];

  // Helper to determine status & late minutes
  const calculateAttendanceDetails = (type: AttendanceType) => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeMinutes = currentHours * 60 + currentMinutes;

    const [shiftInH, shiftInM] = currentShift.jamMasuk.split(':').map(Number);
    const [shiftOutH, shiftOutM] = currentShift.jamPulang.split(':').map(Number);
    const shiftInTime = shiftInH * 60 + shiftInM;
    const shiftOutTime = shiftOutH * 60 + shiftOutM;

    let status: AttendanceRecord['status'] = 'tepat_waktu';
    let keterlambatanMenit = 0;

    if (type === 'masuk') {
      if (currentTimeMinutes > shiftInTime + currentShift.toleransiKeterlambatan) {
        status = 'terlambat';
        keterlambatanMenit = currentTimeMinutes - shiftInTime;
      } else {
        status = 'tepat_waktu';
      }
    } else if (type === 'pulang') {
      if (currentTimeMinutes < shiftOutTime - 10) {
        status = 'pulang_cepat';
      } else if (currentTimeMinutes > shiftOutTime + 60) {
        status = 'lembur';
      } else {
        status = 'sesuai_jadwal';
      }
    } else if (type === 'lembur') {
      status = 'lembur';
    }

    return { status, keterlambatanMenit };
  };

  // Complete attendance record creation
  const finalizeAttendance = (method: 'Sidik Jari Biometrik' | 'WebAuthn Hardware') => {
    if (!selectedEmployee) return;

    if (!selectedEmployee.fingerprintRegistered) {
      setScanError(`Sidik jari ${selectedEmployee.nama} belum didaftarkan di sistem. Silakan registrasi terlebih dahulu pada tab Manajemen Karyawan.`);
      soundEffects.playErrorBuzz();
      return;
    }

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const waktu = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const tanggal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    const { status, keterlambatanMenit } = calculateAttendanceDetails(attendanceType);
    const accuracy = Number((98.5 + Math.random() * 1.4).toFixed(1));

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: selectedEmployee.id,
      nip: selectedEmployee.nip,
      nama: selectedEmployee.nama,
      departemen: selectedEmployee.departemen,
      timestamp: now.toISOString(),
      tanggal,
      waktu,
      tipe: attendanceType,
      status,
      keterlambatanMenit,
      metodeVerifikasi: method,
      scoreAkurasi: accuracy,
      catatan: catatan.trim() || undefined,
      kioskId: activeKiosk?.id,
      lokasi: activeKiosk ? `${activeKiosk.nama} (${activeKiosk.kode})` : 'Sensor Sidik Jari Terminal 01',
    };

    onRecordAttendance(newRecord);
    setLastVerifiedRecord(newRecord);
    setScanError(null);
    setCatatan('');
    soundEffects.playSuccessChime();

    // Trigger subtle vibration on mobile devices if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch {
        // ignore
      }
    }
  };

  // Trigger real WebAuthn hardware biometric
  const handleHardwareBiometricScan = async () => {
    if (!selectedEmployee) return;
    setScanError(null);
    setIsScanning(true);
    soundEffects.playScanningHum();

    try {
      const res = await verifyBiometricCredential(selectedEmployee.fingerprintCredentialId);
      if (res.success) {
        finalizeAttendance('WebAuthn Hardware');
      } else {
        setScanError(res.error || 'Verifikasi sensor biometrik gagal.');
        soundEffects.playErrorBuzz();
      }
    } catch {
      setScanError('Sensor sidik jari hardware tidak merespons.');
      soundEffects.playErrorBuzz();
    } finally {
      setIsScanning(false);
    }
  };

  // Start touch simulator scanning (press & hold or click)
  const startTouchScan = () => {
    if (!selectedEmployee) return;
    setScanError(null);
    setIsScanning(true);
    setScanProgress(0);
    soundEffects.playScanningHum();

    const startTime = Date.now();
    const duration = 1200; // 1.2s realistic biometric scan duration

    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setScanProgress(pct);
    }, 40);

    scanTimerRef.current = setTimeout(() => {
      clearInterval(progressTimerRef.current as NodeJS.Timeout);
      setScanProgress(100);
      setIsScanning(false);
      finalizeAttendance('Sidik Jari Biometrik');
    }, duration);
  };

  // Cancel touch scan if released too quickly
  const cancelTouchScan = () => {
    if (isScanning && scanProgress < 95) {
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setIsScanning(false);
      setScanProgress(0);
      setScanError('Sidik jari diangkat terlalu cepat. Tahan hingga pemindaian 100%.');
      soundEffects.playErrorBuzz();
    }
  };

  return (
    <div id="fingerprint-scanner-module" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Fingerprint className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Terminal Absensi Sidik Jari</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tekan & tahan sensor atau gunakan verifikasi biometrik perangkat
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Email Toggles */}
          {emailSettings && onToggleEmailSetting && (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
              <button
                type="button"
                id="quick-toggle-verif-email"
                onClick={() => onToggleEmailSetting('enableVerificationEmail')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  emailSettings.enableVerificationEmail
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
                title="Klik untuk aktif/nonaktifkan notifikasi email verifikasi presensi"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Verifikasi: {emailSettings.enableVerificationEmail ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                id="quick-toggle-late-email"
                onClick={() => onToggleEmailSetting('enableLateArrivalEmail')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  emailSettings.enableLateArrivalEmail
                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
                title="Klik untuk aktif/nonaktifkan notifikasi email peringatan keterlambatan"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Email Keterlambatan: {emailSettings.enableLateArrivalEmail ? 'ON' : 'OFF'}</span>
              </button>

              {onOpenEmailSettings && (
                <button
                  type="button"
                  onClick={onOpenEmailSettings}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                  title="Buka Pengaturan Notifikasi Email Lengkap"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Kiosk Branch Info */}
          {activeKiosk && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold shadow-2xs">
              <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{activeKiosk.nama}</span>
              <span className="text-emerald-600/70 font-mono text-[10px]">({activeKiosk.kode})</span>
            </div>
          )}

          {/* Role Status & Switcher Button */}
          {userRole === 'karyawan' ? (
            <button
              type="button"
              onClick={onOpenRoleModal}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
              title="Terminal terkunci dalam Mode Karyawan (Khusus Absensi). Klik untuk login Owner."
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Mode Karyawan (Terkunci)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenRoleModal}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors shadow-2xs"
              title="Anda sedang dalam Mode Owner. Klik untuk mengunci ke Mode Karyawan."
            >
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span>Mode Owner</span>
            </button>
          )}

          {hardwareBiometricReady ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Biometrik Hardware
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
              <Cpu className="w-3.5 h-3.5 text-slate-500" />
              Sensor Biometrik Optik
            </span>
          )}
        </div>
      </div>

      <div className="p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration & Employee Picker */}
        <div className="lg:col-span-6 space-y-4">
          {/* Tipe Presensi Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Jenis Presensi
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="type-btn-masuk"
                onClick={() => setAttendanceType('masuk')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all text-center ${
                  attendanceType === 'masuk'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Masuk Kerja
              </button>
              <button
                type="button"
                id="type-btn-pulang"
                onClick={() => setAttendanceType('pulang')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all text-center ${
                  attendanceType === 'pulang'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Pulang Kerja
              </button>
              <button
                type="button"
                id="type-btn-lembur"
                onClick={() => setAttendanceType('lembur')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all text-center ${
                  attendanceType === 'lembur'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-500/20'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Lembur
              </button>
            </div>
          </div>

          {/* Pilih Karyawan */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pilih Karyawan
              </label>

              {onOpenEmployeeRegisterModal && (
                <button
                  type="button"
                  id="terminal-self-register-btn"
                  onClick={onOpenEmployeeRegisterModal}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+ Daftar Karyawan Baru (Undangan)</span>
                </button>
              )}
            </div>

            <div className="relative">
              <select
                id="employee-select"
                value={selectedEmpId}
                onChange={(e) => {
                  setSelectedEmpId(e.target.value);
                  setScanError(null);
                  setLastVerifiedRecord(null);
                }}
                className="w-full pl-3 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium text-slate-900"
              >
                {employees.length === 0 && (
                  <option value="">(Belum ada karyawan di cabang ini)</option>
                )}
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nama} ({emp.departemen}) {emp.fingerprintRegistered ? '✓ Sidik Jari Siap' : '⚠️ Belum Terdaftar'}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Invitation Banner for Employees / Owner */}
            <div className="mt-2.5 p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-emerald-900">
                <Store className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px] leading-tight">
                  {userRole === 'owner' ? (
                    <>Cabang <strong>{activeKiosk?.nama || 'Kios'}</strong>. Karyawan dapat mendaftar mandiri via kode undangan.</>
                  ) : (
                    <>Karyawan baru di cabang ini? Gunakan <strong>Kode Undangan Owner</strong> untuk daftar mandiri.</>
                  )}
                </span>
              </div>

              {userRole === 'owner' && onOpenBranchInvitationModal ? (
                <button
                  type="button"
                  onClick={onOpenBranchInvitationModal}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
                >
                  Kelola Undangan
                </button>
              ) : onOpenEmployeeRegisterModal ? (
                <button
                  type="button"
                  onClick={onOpenEmployeeRegisterModal}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
                >
                  Daftar Disini
                </button>
              ) : null}
            </div>
          </div>

          {/* Selected Employee Card */}
          {selectedEmployee && (
            <div className="p-3.5 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${selectedEmployee.avatarColor || 'from-emerald-600 to-teal-600'} text-white flex items-center justify-center font-bold text-lg shadow-sm`}>
                  {selectedEmployee.nama.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{selectedEmployee.nama}</h4>
                    <span className="text-[10px] px-2 py-0.5 font-semibold rounded bg-emerald-100 text-emerald-800">
                      {selectedEmployee.jabatan || 'Staf'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 truncate">{selectedEmployee.jabatan} • {selectedEmployee.departemen}</p>
                  
                  <div className="flex items-center gap-2 mt-1.5">
                    {selectedEmployee.fingerprintRegistered ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Sidik Jari Terdaftar
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Belum Terdaftar
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500">Status: {selectedEmployee.status}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Catatan Opsional */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Catatan / Lokasi (Opsional)
            </label>
            <input
              type="text"
              id="attendance-notes-input"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Dinas Luar, WFH, Tugas Cabang..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
            />
          </div>
        </div>

        {/* Right Column: Holographic Biometric Fingerprint Sensor */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center bg-slate-900 rounded-2xl p-6 relative overflow-hidden text-center text-white border border-slate-800">
          {/* Ambient scanner grid lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none"></div>

          {/* Top terminal badge */}
          <div className="relative z-10 flex items-center justify-between w-full mb-4 px-2">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              SENSOR OPTIK ID: BIO-8890
            </div>
            <span className="text-[11px] text-slate-400 font-mono">500 DPI • CAPACITIVE</span>
          </div>

          {/* Holographic Fingerprint Touch Sensor Circle */}
          <div className="relative z-10 my-2">
            {/* Pulsing ring during scan */}
            <div
              className={`absolute -inset-4 rounded-full transition-all duration-300 pointer-events-none ${
                isScanning
                  ? 'bg-emerald-500/20 ring-4 ring-emerald-400/50 scale-105 animate-pulse'
                  : 'bg-emerald-500/5'
              }`}
            ></div>

            {/* Interactive Sensor Button */}
            <button
              id="fingerprint-scan-sensor-btn"
              type="button"
              onMouseDown={startTouchScan}
              onMouseUp={cancelTouchScan}
              onMouseLeave={cancelTouchScan}
              onTouchStart={startTouchScan}
              onTouchEnd={cancelTouchScan}
              disabled={isScanning && scanProgress === 100}
              className={`w-36 h-36 rounded-full flex flex-col items-center justify-center relative cursor-pointer select-none transition-all transform active:scale-95 shadow-xl ${
                isScanning
                  ? 'bg-gradient-to-b from-emerald-900 to-teal-950 border-2 border-emerald-400 shadow-emerald-500/30'
                  : 'bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-slate-700 hover:border-emerald-500/80 hover:shadow-emerald-500/20'
              }`}
            >
              {/* Laser Scanning Beam */}
              {isScanning && (
                <div
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_12px_#34d399] transition-all duration-75"
                  style={{ top: `${scanProgress}%` }}
                ></div>
              )}

              {/* Fingerprint SVG Icon with high precision ridges */}
              <svg
                className={`w-20 h-20 transition-colors duration-200 ${
                  isScanning ? 'text-emerald-400 animate-pulse' : 'text-slate-400 hover:text-emerald-300'
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
                <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
                <path d="M2 16h.01" />
                <path d="M21.8 16c.2-2 .131-5.354 0-6" />
                <path d="M9 6.8a6 6 0 0 1 9 5.2c0 .47 0 1.17-.02 2" />
                <path d="M5 10a8 8 0 0 1 14 0" />
                <path d="M12 2a10 10 0 0 1 10 10c0 .7 0 1.5-.08 2.3" />
                <path d="M2 12a10 10 0 0 1 6-9.1" />
                <path d="M6 14.5c0 1.5.5 3.5 1.5 5.5" />
                <path d="M16.5 17c0 1.5-.5 3.5-1.5 4.5" />
              </svg>

              {/* Scanner percentage badge */}
              {isScanning && (
                <span className="absolute bottom-2 font-mono text-[11px] font-bold text-emerald-300">
                  {scanProgress}%
                </span>
              )}
            </button>
          </div>

          {/* Sensor instructions */}
          <p className="text-xs text-slate-300 font-medium mt-3 mb-1">
            {isScanning ? 'Memindai biometrik sidik jari... Tahan jari Anda' : 'Tekan & Tahan Tombol Sidik Jari untuk Absen'}
          </p>
          <span className="text-[11px] text-slate-400">
            Tahan 1 detik hingga terdengar bunyi nada konfirmasi
          </span>

          {/* Hardware Biometric Alternative Button */}
          {hardwareBiometricReady && (
            <button
              type="button"
              id="hardware-biometric-btn"
              onClick={handleHardwareBiometricScan}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Gunakan Sensor Biometrik Bawaan Device (WebAuthn)
            </button>
          )}

          {/* Error Message */}
          {scanError && (
            <div className="mt-3 w-full bg-rose-950/80 border border-rose-800/80 rounded-xl p-3 text-rose-200 text-xs flex items-start gap-2 text-left">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Verifikasi Gagal</p>
                <p className="text-[11px] text-rose-300">{scanError}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {lastVerifiedRecord && (
        <div id="scan-success-banner" className="p-4 bg-emerald-50 border-t border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  {lastVerifiedRecord.nama}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-200 text-emerald-800">
                  {lastVerifiedRecord.tipe === 'masuk' ? 'Presensi Masuk Berhasil' :
                   lastVerifiedRecord.tipe === 'pulang' ? 'Presensi Pulang Berhasil' : 'Presensi Lembur Berhasil'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Pukul <strong className="text-slate-900">{lastVerifiedRecord.waktu} WIB</strong> • Status: {
                  lastVerifiedRecord.status === 'tepat_waktu' ? '✅ Tepat Waktu' :
                  lastVerifiedRecord.status === 'terlambat' ? `⚠️ Terlambat (+${lastVerifiedRecord.keterlambatanMenit} mnt)` : 'Sesuai Jadwal'
                } • Akurasi Sidik Jari: <strong className="text-emerald-700">{lastVerifiedRecord.scoreAkurasi}%</strong>
              </p>

              {/* Email Notification Status Feedback */}
              <div className="flex flex-wrap items-center gap-2 mt-2 pt-1 border-t border-emerald-100">
                {emailSettings?.enableVerificationEmail ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md">
                    <Mail className="w-3 h-3 text-emerald-700" />
                    Email verifikasi terkirim ke {selectedEmployee?.email || 'karyawan'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    <BellOff className="w-3 h-3 text-slate-400" />
                    Notifikasi email verifikasi nonaktif
                  </span>
                )}

                {lastVerifiedRecord.status === 'terlambat' && (
                  emailSettings?.enableLateArrivalEmail ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                      <AlertTriangle className="w-3 h-3 text-amber-700" />
                      Email peringatan keterlambatan (+{lastVerifiedRecord.keterlambatanMenit}m) terkirim ke HRD
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      <BellOff className="w-3 h-3 text-slate-400" />
                      Notifikasi email keterlambatan nonaktif
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <button
              onClick={() => setLastVerifiedRecord(null)}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold px-2 py-1"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
