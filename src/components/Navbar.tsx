import React from 'react';
import { 
  Fingerprint, 
  Clock, 
  FileSpreadsheet, 
  Users, 
  Settings, 
  Wifi, 
  ShieldCheck,
  Mail,
  Store,
  Crown,
  Lock,
  ChevronDown
} from 'lucide-react';
import { EmailNotificationSettings, UserRole, Kiosk, OwnerAccount } from '../types';
import { Share2, UserPlus, Cloud, Loader2 } from 'lucide-react';

interface NavbarProps {
  activeTab: 'terminal' | 'history' | 'employees' | 'kiosks';
  setActiveTab: (tab: 'terminal' | 'history' | 'employees' | 'kiosks') => void;
  onOpenSettings: () => void;
  emailSettings?: EmailNotificationSettings;
  onOpenEmailSettings?: () => void;
  userRole: UserRole;
  activeKiosk?: Kiosk;
  onOpenRoleModal: () => void;
  ownerAccount?: OwnerAccount;
  onOpenOwnerAuthModal?: () => void;
  onOpenBranchInvitationModal?: () => void;
  onOpenEmployeeRegisterModal?: () => void;
  isCloudSynced?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  emailSettings,
  onOpenEmailSettings,
  userRole,
  activeKiosk,
  onOpenRoleModal,
  ownerAccount,
  onOpenOwnerAuthModal,
  onOpenBranchInvitationModal,
  onOpenEmployeeRegisterModal,
  isCloudSynced = true,
}) => {
  const isOwner = userRole === 'owner';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                  BioAbsensi <span className="text-emerald-600">Online</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  LIVE
                </span>
                {isCloudSynced ? (
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200" title="Terhubung ke Database Cloud Firestore secara Real-time">
                    <Cloud className="w-3 h-3 text-emerald-600" />
                    <span>Cloud Sync</span>
                  </span>
                ) : (
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                    <span>Sinkronisasi...</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                {activeKiosk ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    <Store className="w-3 h-3 text-emerald-600" />
                    {activeKiosk.nama}
                  </span>
                ) : (
                  <span>Semua Kios Cabang</span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
            <button
              id="tab-terminal"
              type="button"
              onClick={() => setActiveTab('terminal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'terminal'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Presensi</span>
            </button>

            <button
              id="tab-history"
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Log &</span> Laporan
            </button>

            {/* Owner-Only Tabs */}
            {isOwner && (
              <>
                <button
                  id="tab-employees"
                  type="button"
                  onClick={() => setActiveTab('employees')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'employees'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Karyawan
                </button>

                <button
                  id="tab-kiosks"
                  type="button"
                  onClick={() => setActiveTab('kiosks')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'kiosks'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cabang Kios</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Action: Role Switcher & Settings */}
          <div className="flex items-center gap-2">
            {/* Owner: Quick Branch Invitation Button */}
            {isOwner && onOpenBranchInvitationModal && (
              <button
                type="button"
                id="navbar-invite-karyawan-btn"
                onClick={onOpenBranchInvitationModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                title="Kelola & Bagikan Kode Undangan Pendaftaran Karyawan"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Undang</span> Karyawan
              </button>
            )}

            {/* Karyawan: Quick Self-Registration Button */}
            {!isOwner && onOpenEmployeeRegisterModal && (
              <button
                type="button"
                id="navbar-self-register-btn"
                onClick={onOpenEmployeeRegisterModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-300 shadow-2xs cursor-pointer"
                title="Daftar Mandiri dengan Kode Undangan dari Owner"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Daftar Karyawan</span>
              </button>
            )}

            {/* Role / Owner Auth Button */}
            <button
              type="button"
              id="navbar-role-switcher-btn"
              onClick={isOwner ? onOpenOwnerAuthModal || onOpenRoleModal : onOpenOwnerAuthModal || onOpenRoleModal}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-2xs cursor-pointer ${
                isOwner
                  ? 'bg-amber-500/10 text-amber-900 border-amber-300 hover:bg-amber-500/20'
                  : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
              }`}
              title={isOwner ? `Akun Owner: ${ownerAccount?.email || 'Aktif'}. Klik untuk profil atau kunci kios.` : "Mode Karyawan: Khusus absensi. Klik untuk login Owner dengan Email & PIN."}
            >
              {isOwner ? (
                <>
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline font-extrabold">{ownerAccount?.namaOwner?.split(' ')[0] || 'Owner'}</span>
                  <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded font-mono">Owner</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-extrabold">Karyawan</span>
                  <span className="hidden sm:inline text-[10px] text-slate-500 font-normal">(Login Owner)</span>
                </>
              )}
            </button>

            {/* Email Notifications (Owner Only) */}
            {isOwner && emailSettings && (
              <button
                type="button"
                id="navbar-email-settings-btn"
                onClick={onOpenEmailSettings || onOpenSettings}
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer"
                title="Buka Pengaturan Notifikasi Email Otomatis"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                <span>Email:</span>
                {emailSettings.enableVerificationEmail || emailSettings.enableLateArrivalEmail ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    ON
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    OFF
                  </span>
                )}
              </button>
            )}

            {/* Shift Settings (Owner Only) */}
            {isOwner && (
              <button
                id="open-settings-btn"
                type="button"
                onClick={onOpenSettings}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer"
                title="Pengaturan Shift & Toleransi Keterlambatan"
              >
                <Settings className="w-4 h-4 text-slate-600" />
                <span className="hidden lg:inline">Shift</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
