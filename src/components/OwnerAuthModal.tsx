import React, { useState } from 'react';
import { 
  Crown, 
  Mail, 
  Lock, 
  KeyRound, 
  Building2, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  LogOut,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { OwnerAccount } from '../types';
import { soundEffects } from '../utils/audio';

interface OwnerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOwnerLoggedIn: boolean;
  ownerAccount: OwnerAccount;
  onLoginOwner: (account: OwnerAccount) => void;
  onRegisterOwner: (newAccount: OwnerAccount) => void;
  onLogoutOwner: () => void;
  onUpdateAccount: (updatedAccount: OwnerAccount) => void;
}

export const OwnerAuthModal: React.FC<OwnerAuthModalProps> = ({
  isOpen,
  onClose,
  isOwnerLoggedIn,
  ownerAccount,
  onLoginOwner,
  onRegisterOwner,
  onLogoutOwner,
  onUpdateAccount,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'profile'>(
    isOwnerLoggedIn ? 'profile' : 'login'
  );

  // Login form
  const [loginEmail, setLoginEmail] = useState(ownerAccount.email || '');
  const [loginPin, setLoginPin] = useState('');

  // Register form
  const [regEmail, setRegEmail] = useState('');
  const [regNamaOwner, setRegNamaOwner] = useState('');
  const [regPerusahaan, setRegPerusahaan] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regConfirmPin, setRegConfirmPin] = useState('');

  // Edit profile form
  const [editNama, setEditNama] = useState(ownerAccount.namaOwner || '');
  const [editPerusahaan, setEditPerusahaan] = useState(ownerAccount.namaPerusahaan || '');
  const [editPin, setEditPin] = useState(ownerAccount.pin || '');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = loginEmail.trim().toLowerCase();
    const cleanPin = loginPin.trim();

    if (
      cleanEmail === ownerAccount.email.toLowerCase() &&
      cleanPin === ownerAccount.pin
    ) {
      soundEffects.playSuccessChime();
      onLoginOwner(ownerAccount);
      setSuccessMsg('Login berhasil sebagai Owner!');
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 700);
    } else {
      soundEffects.playErrorBuzzer();
      setErrorMsg('Email atau PIN Keamanan Owner tidak cocok.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMsg('Masukkan alamat email yang valid.');
      return;
    }
    if (!regNamaOwner.trim()) {
      setErrorMsg('Nama pemilik usaha wajib diisi.');
      return;
    }
    if (!regPerusahaan.trim()) {
      setErrorMsg('Nama perusahaan/usaha wajib diisi.');
      return;
    }
    if (regPin.length < 4) {
      setErrorMsg('PIN Keamanan minimal 4 karakter / angka.');
      return;
    }
    if (regPin !== regConfirmPin) {
      setErrorMsg('Konfirmasi PIN tidak cocok.');
      return;
    }

    const newAcc: OwnerAccount = {
      id: `owner-${Date.now()}`,
      email: regEmail.trim().toLowerCase(),
      namaOwner: regNamaOwner.trim(),
      namaPerusahaan: regPerusahaan.trim(),
      pin: regPin.trim(),
      createdAt: new Date().toISOString(),
    };

    soundEffects.playSuccessChime();
    onRegisterOwner(newAcc);
    setSuccessMsg('Pendaftaran Owner berhasil! Anda otomatis masuk.');
    setTimeout(() => {
      onClose();
      setSuccessMsg(null);
    }, 800);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!editNama.trim() || !editPerusahaan.trim()) {
      setErrorMsg('Nama dan perusahaan tidak boleh kosong.');
      return;
    }
    if (editPin.length < 4) {
      setErrorMsg('PIN minimal 4 angka.');
      return;
    }

    const updated: OwnerAccount = {
      ...ownerAccount,
      namaOwner: editNama.trim(),
      namaPerusahaan: editPerusahaan.trim(),
      pin: editPin.trim(),
    };

    onUpdateAccount(updated);
    soundEffects.playSuccessChime();
    setSuccessMsg('Data akun Owner berhasil diperbarui!');
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center font-bold">
              <Crown className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Portal Khusus Owner</h3>
              <p className="text-xs text-amber-100">
                Pendaftaran Akun Email & Manajemen Usaha
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

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          {isOwnerLoggedIn ? (
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 text-center transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'border-b-2 border-amber-600 text-amber-800 bg-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Profil Owner</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-3 text-center transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'login'
                    ? 'border-b-2 border-amber-600 text-amber-800 bg-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Masuk Owner</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-3 text-center transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'register'
                    ? 'border-b-2 border-amber-600 text-amber-800 bg-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Daftar Baru</span>
              </button>
            </>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Akun Owner
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="nama@bisnis.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  PIN Keamanan Owner
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Masukkan PIN Owner (Default: 1234)"
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono tracking-widest focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  *PIN default awal: <strong className="text-slate-800">1234</strong>
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Crown className="w-4 h-4 text-amber-200" />
                <span>Masuk ke Mode Owner</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMsg(null);
                  }}
                  className="text-xs text-amber-700 hover:underline font-bold"
                >
                  Belum punya akun Owner? Daftar akun baru di sini →
                </button>
              </div>
            </form>
          )}

          {/* TAB: REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Owner / Usaha
                </label>
                <input
                  type="email"
                  required
                  placeholder="contoh: owner@toko.co.id"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Pemilik (Owner)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Santo"
                  value={regNamaOwner}
                  onChange={(e) => setRegNamaOwner(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Usaha / Perusahaan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: CV Maju Jaya Kios"
                  value={regPerusahaan}
                  onChange={(e) => setRegPerusahaan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Buat PIN (4-6 digit)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="1234"
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono tracking-widest focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Konfirmasi PIN
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="1234"
                    value={regConfirmPin}
                    onChange={(e) => setRegConfirmPin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono tracking-widest focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Daftar & Langsung Masuk Owner</span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMsg(null);
                  }}
                  className="text-xs text-slate-600 hover:underline font-semibold"
                >
                  Sudah punya akun? Masuk di sini
                </button>
              </div>
            </form>
          )}

          {/* TAB: PROFILE (WHEN LOGGED IN AS OWNER) */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
                  {ownerAccount.namaOwner?.charAt(0) || 'O'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{ownerAccount.namaOwner}</h4>
                  <p className="text-slate-600">{ownerAccount.email}</p>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full inline-block mt-0.5">
                    Owner Master Terverifikasi
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Pemilik
                  </label>
                  <input
                    type="text"
                    value={editNama}
                    onChange={(e) => setEditNama(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Usaha / Perusahaan
                  </label>
                  <input
                    type="text"
                    value={editPerusahaan}
                    onChange={(e) => setEditPerusahaan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    PIN Keamanan Owner
                  </label>
                  <input
                    type="text"
                    value={editPin}
                    onChange={(e) => setEditPin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono tracking-widest focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onLogoutOwner();
                    onClose();
                  }}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200"
                  title="Keluar ke Mode Karyawan"
                >
                  <LogOut className="w-4 h-4 text-slate-500" />
                  <span>Keluar</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
