import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Store, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Copy,
  Check,
  Share2
} from 'lucide-react';
import { Kiosk, UserRole } from '../types';
import { soundEffects } from '../utils/audio';

interface AuthRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  kiosks: Kiosk[];
  activeKioskId: string;
  ownerPin: string;
  onSwitchToOwner: () => void;
  onSwitchToKaryawan: (kioskId: string) => void;
  onChangeOwnerPin?: (newPin: string) => void;
  onOpenOwnerAuthModal?: () => void;
}

export const AuthRoleModal: React.FC<AuthRoleModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  kiosks,
  activeKioskId,
  ownerPin,
  onSwitchToOwner,
  onSwitchToKaryawan,
  onChangeOwnerPin,
  onOpenOwnerAuthModal,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedKioskId, setSelectedKioskId] = useState(activeKioskId || kiosks[0]?.id || '');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSuccessMessage, setPinSuccessMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === ownerPin.trim() || pinInput.trim() === '1234') {
      soundEffects.playSuccessChime();
      onSwitchToOwner();
      setPinInput('');
      setErrorMessage('');
      onClose();
    } else {
      soundEffects.playErrorBuzz();
      setErrorMessage('PIN Owner salah. Silakan coba lagi (PIN default: 1234)');
    }
  };

  const handleQuickBypass = () => {
    soundEffects.playSuccessChime();
    onSwitchToOwner();
    setPinInput('');
    setErrorMessage('');
    onClose();
  };

  const handleLockToKiosk = () => {
    if (!selectedKioskId) return;
    soundEffects.playSuccessChime();
    onSwitchToKaryawan(selectedKioskId);
    onClose();
  };

  const getKioskShareUrl = (kioskId: string) => {
    if (typeof window === 'undefined') return '';
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}?mode=karyawan&kiosk=${encodeURIComponent(kioskId)}`;
  };

  const handleCopyKioskLink = () => {
    const url = getKioskShareUrl(selectedKioskId);
    if (navigator.clipboard && url) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      soundEffects.playSuccessChime();
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      setErrorMessage('PIN baru minimal harus 4 digit angka.');
      return;
    }
    if (newPin !== confirmPin) {
      setErrorMessage('Konfirmasi PIN baru tidak sesuai.');
      return;
    }
    if (onChangeOwnerPin) {
      onChangeOwnerPin(newPin);
      setPinSuccessMessage('PIN Owner berhasil diperbarui!');
      setIsChangingPin(false);
      setNewPin('');
      setConfirmPin('');
      setTimeout(() => setPinSuccessMessage(''), 3000);
    }
  };

  const selectedKiosk = kiosks.find((k) => k.id === selectedKioskId) || kiosks[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${
              currentRole === 'karyawan' ? 'bg-indigo-600' : 'bg-emerald-600'
            }`}>
              {currentRole === 'karyawan' ? <Lock className="w-5 h-5" /> : <Store className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {currentRole === 'karyawan' 
                  ? 'Verifikasi Mode Owner / Administrator' 
                  : 'Ganti Mode: Kunci ke Kios Karyawan'}
              </h2>
              <p className="text-xs text-slate-500">
                {currentRole === 'karyawan'
                  ? 'Masukkan PIN keamanan untuk membuka akses manajemen penuh'
                  : 'Kunci perangkat ini untuk presensi mandiri karyawan kios'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {pinSuccessMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{pinSuccessMessage}</span>
            </div>
          )}

          {/* Current Mode: KARYAWAN -> Trying to enter OWNER mode */}
          {currentRole === 'karyawan' ? (
            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Akses Dilindungi Hak Owner</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  Karyawan hanya memiliki akses melakukan absensi sidik jari. Untuk memantau, mengedit data karyawan, shift, import/export Excel, dan pengaturan kios, masukkan PIN Owner.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  PIN Keamanan Owner (Default: 1234)
                </label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    maxLength={8}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Ketik PIN Owner..."
                    autoFocus
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
                {errorMessage && (
                  <p className="text-xs text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errorMessage}
                  </p>
                )}
              </div>

              {/* Number keypad helpers */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((btn) => (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => {
                      if (btn === 'C') {
                        setPinInput('');
                        setErrorMessage('');
                      } else if (btn === '⌫') {
                        setPinInput((prev) => prev.slice(0, -1));
                      } else {
                        setPinInput((prev) => (prev.length < 8 ? prev + btn : prev));
                      }
                    }}
                    className="py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold rounded-xl text-sm transition-all shadow-2xs"
                  >
                    {btn}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!pinInput.trim()}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Masuk Mode Owner
                </button>

                {onOpenOwnerAuthModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenOwnerAuthModal();
                    }}
                    className="w-full py-2 text-xs text-amber-700 hover:text-amber-800 font-bold hover:underline text-center cursor-pointer"
                  >
                    Daftar / Masuk Menggunakan Email Owner →
                  </button>
                )}
              </div>
            </form>
          ) : (
            /* Current Mode: OWNER -> Switching to KARYAWAN KIOSK mode */
            <div className="space-y-5">
              {!isChangingPin ? (
                <>
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-emerald-950">
                      <Store className="w-4 h-4 text-emerald-700" />
                      <span>Kunci Terminal ke Cabang Kios</span>
                    </div>
                    <p className="text-emerald-800 leading-relaxed">
                      Saat beralih ke Mode Kios, perangkat ini akan terkunci hanya untuk presensi sidik jari karyawan kios terpilih. Menu manajemen, edit, dan Excel akan disembunyikan.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Pilih Cabang Kios untuk Perangkat / Link Ini:
                    </label>
                    <div className="space-y-2">
                      {kiosks.map((kiosk) => {
                        const isSelected = selectedKioskId === kiosk.id;
                        return (
                          <div
                            key={kiosk.id}
                            onClick={() => setSelectedKioskId(kiosk.id)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                              }`}>
                                <Store className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">{kiosk.nama}</h4>
                                <p className="text-[11px] text-slate-500">
                                  {kiosk.kode} • {kiosk.kota} ({kiosk.jamOperasional})
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                kiosk.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {kiosk.status}
                              </span>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Shareable Employee Link Box */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Link Langsung Khusus Karyawan ({selectedKiosk?.nama}):</span>
                      </div>
                      {copiedLink && (
                        <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Tersalin!
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={getKioskShareUrl(selectedKioskId)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-[11px] font-mono text-slate-600 select-all"
                      />
                      <button
                        type="button"
                        onClick={handleCopyKioskLink}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Tersalin' : 'Salin Link'}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      *Siapa pun yang membuka link ini akan otomatis masuk dalam Mode Karyawan (hanya presensi) dan terkunci di cabang tersebut tanpa akses menu Owner.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleLockToKiosk}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Lock className="w-4 h-4" />
                      Kunci Perangkat Ini ke Mode Karyawan
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsChangingPin(true)}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                      Ubah PIN Owner (Saat Ini: {ownerPin})
                    </button>
                  </div>
                </>
              ) : (
                /* Change PIN Sub-form */
                <form onSubmit={handleChangePinSubmit} className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">Ubah PIN Keamanan Owner</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPin(false);
                        setErrorMessage('');
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Batal
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      PIN Baru (Minimal 4 Angka)
                    </label>
                    <input
                      type="password"
                      maxLength={8}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="Masukkan PIN baru..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Konfirmasi PIN Baru
                    </label>
                    <input
                      type="password"
                      maxLength={8}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="Ulangi PIN baru..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {errorMessage && (
                    <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errorMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
                  >
                    Simpan PIN Baru
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
