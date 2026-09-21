import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Settings, 
  Save, 
  CheckCircle2, 
  Mail, 
  Bell, 
  AlertTriangle, 
  Send, 
  Check, 
  Info,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { Shift, EmailNotificationSettings, EmailNotificationLog } from '../types';

interface ShiftSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shifts: Shift[];
  currentShiftId: string;
  onSelectShift: (id: string) => void;
  onUpdateShifts: (shifts: Shift[]) => void;
  emailSettings: EmailNotificationSettings;
  onUpdateEmailSettings: (settings: EmailNotificationSettings) => void;
  emailLogs?: EmailNotificationLog[];
  onClearEmailLogs?: () => void;
  onTestEmail?: (type: 'verification' | 'late_arrival') => void;
  initialTab?: 'notifications' | 'shifts';
}

export const ShiftSettingsModal: React.FC<ShiftSettingsModalProps> = ({
  isOpen,
  onClose,
  shifts,
  currentShiftId,
  onSelectShift,
  onUpdateShifts,
  emailSettings,
  onUpdateEmailSettings,
  emailLogs = [],
  onClearEmailLogs,
  onTestEmail,
  initialTab = 'notifications',
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'notifications' | 'shifts'>(initialTab);
  const [shiftList, setShiftList] = useState<Shift[]>(shifts);
  const [selectedShiftId, setSelectedShiftId] = useState<string>(currentShiftId);
  const [localEmailSettings, setLocalEmailSettings] = useState<EmailNotificationSettings>(emailSettings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testSentNotice, setTestSentNotice] = useState<string | null>(null);
  const [selectedPreviewLog, setSelectedPreviewLog] = useState<EmailNotificationLog | null>(null);

  // Keep in sync with parent when opened
  useEffect(() => {
    setShiftList(shifts);
    setSelectedShiftId(currentShiftId);
    setLocalEmailSettings(emailSettings);
  }, [shifts, currentShiftId, emailSettings, isOpen]);

  const handleShiftFieldChange = (id: string, field: keyof Shift, value: unknown) => {
    setShiftList(prev =>
      prev.map(s => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleSave = () => {
    onUpdateShifts(shiftList);
    onSelectShift(selectedShiftId);
    onUpdateEmailSettings(localEmailSettings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleTriggerTest = (type: 'verification' | 'late_arrival') => {
    if (onTestEmail) {
      onTestEmail(type);
      setTestSentNotice(
        type === 'verification'
          ? 'Email simulasi verifikasi presensi berhasil dikirim!'
          : 'Email simulasi peringatan keterlambatan berhasil dikirim!'
      );
      setTimeout(() => setTestSentNotice(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm shadow-emerald-600/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Pengaturan Sistem & Notifikasi</h3>
              <p className="text-[11px] text-slate-500">Konfigurasi notifikasi email otomatis & jadwal shift</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 p-1.5 gap-1.5 shrink-0 px-5">
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'notifications'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Mail className="w-4 h-4" />
            Notifikasi Email Otomatis
            {(localEmailSettings.enableVerificationEmail || localEmailSettings.enableLateArrivalEmail) && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shifts')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'shifts'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            Jadwal Shift & Jam Kerja
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">Pengaturan berhasil disimpan!</span>
            </div>
          )}

          {testSentNotice && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs flex items-center gap-2 animate-fadeIn">
              <Send className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{testSentNotice}</span>
            </div>
          )}

          {/* TAB 1: NOTIFIKASI EMAIL */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>
                    Kelola saklar otomatis untuk pengiriman email pemberitahuan saat karyawan melakukan absensi sidik jari atau saat terjadi keterlambatan.
                  </p>
                </div>
              </div>

              {/* TOGGLE 1: Verifikasi Presensi */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  localEmailSettings.enableVerificationEmail
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        localEmailSettings.enableVerificationEmail
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">
                          Notifikasi Verifikasi Presensi
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            localEmailSettings.enableVerificationEmail
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {localEmailSettings.enableVerificationEmail ? 'AKTIF' : 'NONAKTIF'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Kirim email konfirmasi resmi secara instan setiap kali karyawan berhasil memindai sidik jari untuk Masuk, Pulang, atau Lembur.
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      id="toggle-verification-email"
                      checked={localEmailSettings.enableVerificationEmail}
                      onChange={(e) =>
                        setLocalEmailSettings((prev) => ({
                          ...prev,
                          enableVerificationEmail: e.target.checked,
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              {/* TOGGLE 2: Peringatan Keterlambatan */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  localEmailSettings.enableLateArrivalEmail
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        localEmailSettings.enableLateArrivalEmail
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">
                          Peringatan Email Keterlambatan (Late Arrival Alert)
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            localEmailSettings.enableLateArrivalEmail
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {localEmailSettings.enableLateArrivalEmail ? 'AKTIF' : 'NONAKTIF'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Kirim notifikasi peringatan darurat ke HRD & Karyawan saat presensi masuk melewati batas toleransi keterlambatan shift.
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      id="toggle-late-arrival-email"
                      checked={localEmailSettings.enableLateArrivalEmail}
                      onChange={(e) =>
                        setLocalEmailSettings((prev) => ({
                          ...prev,
                          enableLateArrivalEmail: e.target.checked,
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>
              </div>

              {/* Penerima Email & Salinan */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <h5 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                  Konfigurasi Alamat Penerima
                </h5>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Email HRD / Administrator (Penerima Utama)
                  </label>
                  <input
                    type="email"
                    id="admin-email-input"
                    value={localEmailSettings.adminEmail}
                    onChange={(e) =>
                      setLocalEmailSettings((prev) => ({
                        ...prev,
                        adminEmail: e.target.value,
                      }))
                    }
                    placeholder="hrd@perusahaan.co.id"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium text-slate-800"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="send-copy-to-employee"
                    checked={localEmailSettings.sendCopyToEmployee}
                    onChange={(e) =>
                      setLocalEmailSettings((prev) => ({
                        ...prev,
                        sendCopyToEmployee: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                  />
                  <label htmlFor="send-copy-to-employee" className="text-xs text-slate-700 cursor-pointer">
                    Kirim tembusan / salinan otomatis ke email karyawan yang bersangkutan
                  </label>
                </div>
              </div>

              {/* Quick Simulation & Test Buttons */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Uji Coba Pengiriman Notifikasi</span>
                  <span className="text-[10px] text-slate-400">Verifikasi format email</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    id="test-verification-email-btn"
                    onClick={() => handleTriggerTest('verification')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-600" />
                    Tes Email Verifikasi
                  </button>
                  <button
                    type="button"
                    id="test-late-email-btn"
                    onClick={() => handleTriggerTest('late_arrival')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 transition-colors shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-600" />
                    Tes Email Keterlambatan
                  </button>
                </div>
              </div>

              {/* Recent Email Notification Logs */}
              {emailLogs.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Log Pengiriman Email Terkini ({emailLogs.length})
                    </span>
                    {onClearEmailLogs && (
                      <button
                        type="button"
                        onClick={onClearEmailLogs}
                        className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Hapus Log
                      </button>
                    )}
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {emailLogs.slice(0, 5).map((log) => (
                      <div
                        key={log.id}
                        onClick={() => setSelectedPreviewLog(log)}
                        className="p-2 bg-white rounded-lg border border-slate-200 hover:border-emerald-400 cursor-pointer text-[11px] flex items-center justify-between gap-2 transition-all shadow-2xs"
                      >
                        <div className="truncate flex-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                log.type === 'verification' ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            ></span>
                            <span className="font-semibold text-slate-900 truncate">
                              {log.subject}
                            </span>
                          </div>
                          <p className="text-slate-500 truncate text-[10px] mt-0.5">
                            Kepada: {log.recipient} • {log.timeStr} WIB
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                          {log.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Email Content Preview Modal */}
              {selectedPreviewLog && (
                <div className="p-3 bg-slate-900 text-white rounded-xl text-xs space-y-2 animate-fadeIn border border-slate-700">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-mono text-emerald-400 text-[11px]">PREVIEW EMAIL TERKIRIM</span>
                    <button
                      type="button"
                      onClick={() => setSelectedPreviewLog(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p><strong className="text-slate-400">Penerima:</strong> {selectedPreviewLog.recipient}</p>
                  <p><strong className="text-slate-400">Subjek:</strong> {selectedPreviewLog.subject}</p>
                  <p className="text-slate-300 bg-slate-800/80 p-2 rounded-lg font-mono text-[11px]">
                    {selectedPreviewLog.detail}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: JADWAL SHIFT */}
          {activeTab === 'shifts' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Pilih shift aktif dan sesuaikan toleransi keterlambatan untuk validasi presensi otomatis.
              </p>
              {shiftList.map((shift) => (
                <div
                  key={shift.id}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedShiftId === shift.id
                      ? 'border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`radio-${shift.id}`}
                        name="activeShift"
                        checked={selectedShiftId === shift.id}
                        onChange={() => setSelectedShiftId(shift.id)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <label htmlFor={`radio-${shift.id}`} className="font-bold text-slate-900 text-sm cursor-pointer">
                        {shift.nama}
                      </label>
                    </div>
                    {selectedShiftId === shift.id && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Shift Aktif Terminal
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">Jam Masuk</label>
                      <input
                        type="time"
                        value={shift.jamMasuk}
                        onChange={(e) => handleShiftFieldChange(shift.id, 'jamMasuk', e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">Jam Pulang</label>
                      <input
                        type="time"
                        value={shift.jamPulang}
                        onChange={(e) => handleShiftFieldChange(shift.id, 'jamPulang', e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">Toleransi (Mnt)</label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={shift.toleransiKeterlambatan}
                        onChange={(e) => handleShiftFieldChange(shift.id, 'toleransiKeterlambatan', Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2 shrink-0">
          <div className="text-xs text-slate-500">
            {localEmailSettings.enableVerificationEmail || localEmailSettings.enableLateArrivalEmail ? (
              <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Notifikasi email otomatis aktif
              </span>
            ) : (
              <span className="text-slate-400">Semua notifikasi email dinonaktifkan</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-semibold transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              id="save-settings-btn"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Simpan Pengaturan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
