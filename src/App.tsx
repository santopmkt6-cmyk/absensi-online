import React, { useState, useEffect } from 'react';
import { 
  getStoredEmployees, 
  saveEmployees, 
  getStoredAttendance, 
  saveAttendance, 
  getStoredShifts, 
  saveShifts,
  getStoredEmailSettings,
  saveEmailSettings,
  getStoredEmailLogs,
  saveEmailLogs,
  getStoredKiosks,
  saveKiosks,
  getStoredRole,
  saveRole,
  getStoredActiveKioskId,
  saveActiveKioskId,
  getStoredOwnerPin,
  saveOwnerPin,
  getStoredOwnerAccount,
  saveOwnerAccount,
  getStoredInvitations,
  saveInvitations
} from './utils/storage';
import { 
  Employee, 
  AttendanceRecord, 
  Shift, 
  TimezoneOption, 
  EmailNotificationSettings, 
  EmailNotificationLog,
  Kiosk,
  UserRole,
  OwnerAccount,
  BranchInvitation
} from './types';
import { dispatchAttendanceEmails } from './utils/notification';
import { Navbar } from './components/Navbar';
import { RealTimeClock } from './components/RealTimeClock';
import { StatsCards } from './components/StatsCards';
import { FingerprintScanner } from './components/FingerprintScanner';
import { LiveAttendanceFeed } from './components/LiveAttendanceFeed';
import { AttendanceTable } from './components/AttendanceTable';
import { EmployeeManager } from './components/EmployeeManager';
import { KioskManager } from './components/KioskManager';
import { AuthRoleModal } from './components/AuthRoleModal';
import { ExcelModal } from './components/ExcelModal';
import { ManualEntryModal } from './components/ManualEntryModal';
import { ShiftSettingsModal } from './components/ShiftSettingsModal';
import { OwnerAuthModal } from './components/OwnerAuthModal';
import { BranchInvitationModal } from './components/BranchInvitationModal';
import { EmployeeSelfRegisterModal } from './components/EmployeeSelfRegisterModal';
import { soundEffects } from './utils/audio';
import { Mail, CheckCircle2, AlertCircle, Store, Lock, Crown } from 'lucide-react';
import {
  testConnection,
  subscribeKiosks,
  subscribeInvitations,
  subscribeEmployees,
  subscribeAttendanceRecords,
  subscribeShifts,
  subscribeOwnerAccount,
  syncKioskToFirestore,
  deleteKioskFromFirestore,
  syncInvitationToFirestore,
  deleteInvitationFromFirestore,
  syncEmployeeToFirestore,
  deleteEmployeeFromFirestore,
  syncAttendanceRecordToFirestore,
  deleteAttendanceRecordFromFirestore,
  syncBatchEmployeesToFirestore,
  syncShiftToFirestore,
  syncOwnerAccountToFirestore,
  seedInitialDataIfEmpty
} from './services/firebase';

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>(() => getStoredEmployees());
  const [records, setRecords] = useState<AttendanceRecord[]>(() => getStoredAttendance());
  const [shifts, setShifts] = useState<Shift[]>(() => getStoredShifts());
  const [currentShiftId, setCurrentShiftId] = useState<string>('shift-regular');
  const [timezone, setTimezone] = useState<TimezoneOption>('WIB');
  const [activeTab, setActiveTab] = useState<'terminal' | 'history' | 'employees' | 'kiosks'>('terminal');

  // Multi-Kiosk & Role Management (Owner vs Karyawan)
  const [kiosks, setKiosks] = useState<Kiosk[]>(() => getStoredKiosks());
  const [userRole, setUserRole] = useState<UserRole>(() => getStoredRole());
  const [activeKioskId, setActiveKioskId] = useState<string>(() => getStoredActiveKioskId());
  const [ownerPin, setOwnerPin] = useState<string>(() => getStoredOwnerPin());
  const [isAuthRoleModalOpen, setIsAuthRoleModalOpen] = useState(false);

  // Email Notification Settings & Logs
  const [emailSettings, setEmailSettings] = useState<EmailNotificationSettings>(() => getStoredEmailSettings());
  const [emailLogs, setEmailLogs] = useState<EmailNotificationLog[]>(() => getStoredEmailLogs());
  const [settingsModalTab, setSettingsModalTab] = useState<'notifications' | 'shifts'>('notifications');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // Modals state
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  // Owner Account & Branch Invitations (Self-Registration)
  const [ownerAccount, setOwnerAccount] = useState<OwnerAccount>(() => getStoredOwnerAccount());
  const [invitations, setInvitations] = useState<BranchInvitation[]>(() => getStoredInvitations());
  const [isOwnerAuthModalOpen, setIsOwnerAuthModalOpen] = useState(false);
  const [isBranchInvitationModalOpen, setIsBranchInvitationModalOpen] = useState(false);
  const [isEmployeeRegisterModalOpen, setIsEmployeeRegisterModalOpen] = useState(false);
  const [urlInviteCode, setUrlInviteCode] = useState<string>('');

  // Check URL query on mount for invite codes: ?invite=INV-CODE
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const codeParam = params.get('invite');
      if (codeParam) {
        setUrlInviteCode(codeParam.trim().toUpperCase());
        setIsEmployeeRegisterModalOpen(true);
      }
    }
  }, []);

  // Initialize Firebase Firestore real-time cloud subscriptions & data seeding
  useEffect(() => {
    let unsubscribeKiosks: (() => void) | undefined;
    let unsubscribeInvitations: (() => void) | undefined;
    let unsubscribeEmployees: (() => void) | undefined;
    let unsubscribeAttendance: (() => void) | undefined;
    let unsubscribeShifts: (() => void) | undefined;
    let unsubscribeOwner: (() => void) | undefined;

    async function initFirestoreRealtime() {
      try {
        await testConnection();

        // Seed initial data if Firestore collections are newly initialized
        await seedInitialDataIfEmpty(
          kiosks,
          employees,
          invitations,
          shifts,
          ownerAccount
        );

        // Real-time subscriptions across all connected devices
        unsubscribeKiosks = subscribeKiosks((remoteKiosks) => {
          if (remoteKiosks.length > 0) {
            setKiosks(remoteKiosks);
          }
        });

        unsubscribeInvitations = subscribeInvitations((remoteInvs) => {
          setInvitations(remoteInvs);
        });

        unsubscribeEmployees = subscribeEmployees((remoteEmps) => {
          if (remoteEmps.length > 0) {
            setEmployees(remoteEmps);
          }
        });

        unsubscribeAttendance = subscribeAttendanceRecords((remoteRecords) => {
          setRecords(remoteRecords);
        });

        unsubscribeShifts = subscribeShifts((remoteShifts) => {
          if (remoteShifts.length > 0) {
            setShifts(remoteShifts);
          }
        });

        unsubscribeOwner = subscribeOwnerAccount((remoteOwner) => {
          if (remoteOwner) {
            setOwnerAccount(remoteOwner);
            if (remoteOwner.pin) {
              setOwnerPin(remoteOwner.pin);
            }
          }
        });

        setIsCloudSynced(true);
      } catch (err) {
        console.error('Error establishing Firestore connection:', err);
      }
    }

    initFirestoreRealtime();

    return () => {
      unsubscribeKiosks?.();
      unsubscribeInvitations?.();
      unsubscribeEmployees?.();
      unsubscribeAttendance?.();
      unsubscribeShifts?.();
      unsubscribeOwner?.();
    };
  }, []);

  // Synchronize to localStorage (Offline Cache)
  useEffect(() => {
    saveEmployees(employees);
  }, [employees]);

  useEffect(() => {
    saveAttendance(records);
  }, [records]);

  useEffect(() => {
    saveShifts(shifts);
  }, [shifts]);

  useEffect(() => {
    saveEmailSettings(emailSettings);
  }, [emailSettings]);

  useEffect(() => {
    saveEmailLogs(emailLogs);
  }, [emailLogs]);

  useEffect(() => {
    saveKiosks(kiosks);
  }, [kiosks]);

  useEffect(() => {
    saveRole(userRole);
  }, [userRole]);

  useEffect(() => {
    saveActiveKioskId(activeKioskId);
  }, [activeKioskId]);

  useEffect(() => {
    saveOwnerPin(ownerPin);
  }, [ownerPin]);

  useEffect(() => {
    saveOwnerAccount(ownerAccount);
  }, [ownerAccount]);

  useEffect(() => {
    saveInvitations(invitations);
  }, [invitations]);

  // Restrict tabs if user is in 'karyawan' mode (employees can only do attendance)
  useEffect(() => {
    if (userRole === 'karyawan' && (activeTab === 'employees' || activeTab === 'kiosks')) {
      setActiveTab('terminal');
    }
  }, [userRole, activeTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const currentShift = shifts.find((s) => s.id === currentShiftId) || shifts[0];
  const activeKiosk = kiosks.find((k) => k.id === activeKioskId) || kiosks[0];

  // Scoped employees for terminal: in karyawan mode, show staff registered to this kiosk
  const terminalEmployees = userRole === 'karyawan' && activeKiosk
    ? employees.filter((e) => !e.kioskId || e.kioskId === activeKiosk.id)
    : employees;

  // Quick toggle helper for email notification settings
  const handleToggleEmailSetting = (key: 'enableVerificationEmail' | 'enableLateArrivalEmail') => {
    setEmailSettings((prev) => {
      const nextValue = !prev[key];
      const updated = { ...prev, [key]: nextValue };
      const label = key === 'enableVerificationEmail' ? 'Notifikasi Verifikasi' : 'Notifikasi Keterlambatan';
      showToast(`✉️ ${label} ${nextValue ? 'diaktifkan' : 'dinonaktifkan'}`);
      return updated;
    });
  };

  // Open settings directly on specified tab
  const handleOpenSettingsModal = (tab: 'notifications' | 'shifts' = 'notifications') => {
    setSettingsModalTab(tab);
    setIsShiftModalOpen(true);
  };

  // Handler: new attendance recorded via biometric scanner or manual entry
  const handleRecordAttendance = (newRecord: AttendanceRecord) => {
    // If not set, attach active kiosk
    const stampedRecord: AttendanceRecord = {
      ...newRecord,
      kioskId: newRecord.kioskId || activeKiosk?.id,
      lokasi: newRecord.lokasi || (activeKiosk ? `${activeKiosk.nama} (${activeKiosk.kode})` : 'Sensor Sidik Jari'),
    };

    setRecords((prev) => [stampedRecord, ...prev]);
    // Sync to Firestore cloud
    syncAttendanceRecordToFirestore(stampedRecord);

    // Check and trigger automated email notifications
    const emp = employees.find((e) => e.id === stampedRecord.employeeId) ||
                employees.find((e) => e.nip === stampedRecord.nip);
    
    const emailResult = dispatchAttendanceEmails(stampedRecord, emp, emailSettings);
    if (emailResult.logs.length > 0) {
      setEmailLogs((prev) => [...emailResult.logs, ...prev]);
      showToast(emailResult.messages.join(' • '));
    }
  };

  // Handler: trigger test email simulation
  const handleTestEmail = (type: 'verification' | 'late_arrival') => {
    const sampleEmp = employees[0] || {
      id: 'emp-sample',
      nip: 'NIP-202401',
      nama: 'Budi Pratama, S.Kom',
      email: 'budi.pratama@perusahaan.co.id',
      departemen: 'Teknologi Informasi',
    };

    const mockRecord: AttendanceRecord = {
      id: `att-test-${Date.now()}`,
      employeeId: sampleEmp.id,
      nip: sampleEmp.nip,
      nama: sampleEmp.nama,
      departemen: sampleEmp.departemen,
      timestamp: new Date().toISOString(),
      tanggal: new Date().toISOString().split('T')[0],
      waktu: new Date().toTimeString().split(' ')[0],
      tipe: 'masuk',
      status: type === 'late_arrival' ? 'terlambat' : 'tepat_waktu',
      keterlambatanMenit: type === 'late_arrival' ? 24 : 0,
      metodeVerifikasi: 'Sidik Jari Biometrik',
      scoreAkurasi: 99.4,
      kioskId: activeKiosk?.id,
      lokasi: activeKiosk ? `${activeKiosk.nama} (Uji Coba)` : 'Uji Coba Sistem Notifikasi',
    };

    const res = dispatchAttendanceEmails(mockRecord, sampleEmp, emailSettings);
    if (res.logs.length > 0) {
      setEmailLogs((prev) => [...res.logs, ...prev]);
      showToast(res.messages.join(' • '));
    }
  };

  // Handler: delete single record
  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    deleteAttendanceRecordFromFirestore(id);
    showToast('🗑️ Catatan presensi telah dihapus');
  };

  // Handler: employee CRUD
  const handleAddEmployee = (newEmp: Employee) => {
    setEmployees((prev) => [newEmp, ...prev]);
    syncEmployeeToFirestore(newEmp);
    showToast(`👤 Karyawan "${newEmp.nama}" berhasil didaftarkan`);
  };

  const handleUpdateEmployee = (updated: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    syncEmployeeToFirestore(updated);
    showToast(`👤 Data "${updated.nama}" diperbarui`);
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    deleteEmployeeFromFirestore(id);
    showToast(`👤 Data karyawan berhasil dihapus`);
  };

  // Handler: Kiosk CRUD
  const handleAddKiosk = (kiosk: Kiosk) => {
    setKiosks((prev) => [...prev, kiosk]);
    syncKioskToFirestore(kiosk);
    showToast(`🏬 Cabang Kios "${kiosk.nama}" berhasil didaftarkan`);
  };

  const handleUpdateKiosk = (updated: Kiosk) => {
    setKiosks((prev) => prev.map((k) => (k.id === updated.id ? updated : k)));
    syncKioskToFirestore(updated);
    showToast(`🏬 Cabang Kios "${updated.nama}" diperbarui`);
  };

  const handleDeleteKiosk = (id: string) => {
    setKiosks((prev) => prev.filter((k) => k.id !== id));
    deleteKioskFromFirestore(id);
    showToast(`🏬 Cabang Kios berhasil dihapus`);
  };

  const handleSelectActiveKiosk = (id: string) => {
    setActiveKioskId(id);
    const found = kiosks.find((k) => k.id === id);
    if (found) {
      showToast(`🏬 Terminal Kios dialihkan ke: ${found.nama}`);
    }
  };

  const handleSwitchToKioskMode = (id: string) => {
    setActiveKioskId(id);
    setUserRole('karyawan');
    setActiveTab('terminal');
    const found = kiosks.find((k) => k.id === id);
    showToast(`🔒 Terminal dikunci ke Mode Karyawan (${found ? found.nama : 'Kios Cabang'})`);
  };

  // Handlers for Excel imports
  const handleImportAttendance = (importedRecords: AttendanceRecord[]) => {
    setRecords((prev) => [...importedRecords, ...prev]);
    importedRecords.forEach((rec) => syncAttendanceRecordToFirestore(rec));
    soundEffects.playSuccessChime();
    showToast(`📥 Berhasil mengimpor ${importedRecords.length} catatan presensi`);
  };

  const handleImportEmployees = (importedEmployees: Employee[]) => {
    // Merge without duplicates by NIP
    const existingNips = new Set(employees.map((e) => e.nip.toLowerCase()));
    const filtered = importedEmployees.filter(
      (e) => !existingNips.has(e.nip.toLowerCase())
    );
    setEmployees((prev) => [...filtered, ...prev]);
    syncBatchEmployeesToFirestore(filtered);
    soundEffects.playSuccessChime();
    showToast(`📥 Berhasil mengimpor ${importedEmployees.length} data karyawan`);
  };

  // Handler: Branch Invitations
  const handleAddInvitation = (inv: BranchInvitation) => {
    setInvitations((prev) => [inv, ...prev]);
    syncInvitationToFirestore(inv);
    showToast(`🎟️ Kode undangan "${inv.code}" untuk cabang ${inv.kioskNama} berhasil dibuat`);
  };

  const handleToggleInvitationStatus = (id: string) => {
    setInvitations((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          const updated = { ...inv, status: inv.status === 'Aktif' ? 'Nonaktif' as const : 'Aktif' as const };
          syncInvitationToFirestore(updated);
          return updated;
        }
        return inv;
      })
    );
    showToast('🎟️ Status undangan cabang diperbarui');
  };

  const handleDeleteInvitation = (id: string) => {
    setInvitations((prev) => prev.filter((inv) => inv.id !== id));
    deleteInvitationFromFirestore(id);
    showToast('🗑️ Kode undangan dihapus');
  };

  // Handler: Employee self-registration with invitation code
  const handleEmployeeSelfRegistered = (newEmp: Employee, targetKiosk: Kiosk) => {
    // Add employee to master list & Firestore
    setEmployees((prev) => [newEmp, ...prev]);
    syncEmployeeToFirestore(newEmp);

    // Update invitation usedCount
    if (newEmp.invitedByCode) {
      setInvitations((prev) =>
        prev.map((inv) => {
          if (inv.code.toUpperCase() === newEmp.invitedByCode?.toUpperCase()) {
            const updated = { ...inv, usedCount: (inv.usedCount || 0) + 1 };
            syncInvitationToFirestore(updated);
            return updated;
          }
          return inv;
        })
      );
    }

    // Set active kiosk if in karyawan mode
    if (targetKiosk) {
      setActiveKioskId(targetKiosk.id);
    }

    soundEffects.playSuccessChime();
    showToast(`🎉 Selamat datang ${newEmp.nama}! Berhasil terdaftar di ${targetKiosk.nama}`);
  };

  // Handler: Owner Account Auth
  const handleLoginOwner = (account: OwnerAccount) => {
    setOwnerAccount(account);
    if (account.pin) {
      setOwnerPin(account.pin);
    }
    setUserRole('owner');
    syncOwnerAccountToFirestore(account);
    soundEffects.playSuccessChime();
    showToast(`👑 Selamat datang kembali, ${account.namaOwner}! Akses Owner aktif.`);
  };

  const handleRegisterOwner = (newAccount: OwnerAccount) => {
    setOwnerAccount(newAccount);
    if (newAccount.pin) {
      setOwnerPin(newAccount.pin);
    }
    setUserRole('owner');
    syncOwnerAccountToFirestore(newAccount);
    soundEffects.playSuccessChime();
    showToast(`👑 Akun Owner (${newAccount.email}) berhasil dibuat!`);
  };

  const handleLogoutOwner = () => {
    setUserRole('karyawan');
    setActiveTab('terminal');
    soundEffects.playSuccessChime();
    showToast('🔒 Keluar dari Mode Owner. Beralih ke Mode Karyawan (Khusus Absensi).');
  };

  const handleUpdateOwnerAccount = (updated: OwnerAccount) => {
    setOwnerAccount(updated);
    if (updated.pin) {
      setOwnerPin(updated.pin);
    }
    syncOwnerAccountToFirestore(updated);
    showToast('👤 Data akun Owner berhasil diperbarui');
  };

  const isOwner = userRole === 'owner';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] relative">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 animate-fadeIn pointer-events-none">
          <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700">
            <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => handleOpenSettingsModal('shifts')}
        emailSettings={emailSettings}
        onOpenEmailSettings={() => handleOpenSettingsModal('notifications')}
        userRole={userRole}
        activeKiosk={activeKiosk}
        onOpenRoleModal={() => setIsAuthRoleModalOpen(true)}
        ownerAccount={ownerAccount}
        onOpenOwnerAuthModal={() => setIsOwnerAuthModalOpen(true)}
        onOpenBranchInvitationModal={() => setIsBranchInvitationModalOpen(true)}
        onOpenEmployeeRegisterModal={() => setIsEmployeeRegisterModalOpen(true)}
        isCloudSynced={isCloudSynced}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Real-Time Precision Time Tracker (Prominent at Top) */}
        <RealTimeClock
          currentShift={currentShift}
          timezone={timezone}
          onTimezoneChange={setTimezone}
        />

        {/* High-Level Attendance KPIs */}
        <StatsCards employees={employees} records={records} />

        {/* Tab 1: Terminal Presensi (Fingerprint Biometric Scanner & Live Feed) */}
        {activeTab === 'terminal' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Fingerprint Scanner Terminal (8 Cols) */}
              <div className="lg:col-span-8">
                <FingerprintScanner
                  employees={terminalEmployees}
                  currentShift={currentShift}
                  onRecordAttendance={handleRecordAttendance}
                  emailSettings={emailSettings}
                  onToggleEmailSetting={handleToggleEmailSetting}
                  onOpenEmailSettings={() => handleOpenSettingsModal('notifications')}
                  activeKiosk={activeKiosk}
                  userRole={userRole}
                  onOpenRoleModal={() => setIsAuthRoleModalOpen(true)}
                  onOpenEmployeeRegisterModal={() => setIsEmployeeRegisterModalOpen(true)}
                  onOpenBranchInvitationModal={() => setIsBranchInvitationModalOpen(true)}
                />
              </div>

              {/* Real-Time Live Attendance Stream (4 Cols) */}
              <div className="lg:col-span-4">
                <LiveAttendanceFeed records={records} />
              </div>
            </div>

            {/* Quick Preview Table of Today's Attendance */}
            <AttendanceTable
              records={records}
              employees={employees}
              kiosks={kiosks}
              isOwner={isOwner}
              onOpenImportModal={() => setIsExcelModalOpen(true)}
              onOpenManualModal={() => setIsManualModalOpen(true)}
              onDeleteRecord={handleDeleteRecord}
            />
          </div>
        )}

        {/* Tab 2: Full Attendance Records & Excel Import/Export */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <AttendanceTable
              records={records}
              employees={employees}
              kiosks={kiosks}
              isOwner={isOwner}
              onOpenImportModal={() => setIsExcelModalOpen(true)}
              onOpenManualModal={() => setIsManualModalOpen(true)}
              onDeleteRecord={handleDeleteRecord}
            />
          </div>
        )}

        {/* Tab 3: Employee Master & Fingerprint Biometric Enrollment (Owner Only) */}
        {activeTab === 'employees' && isOwner && (
          <div className="space-y-6">
            <EmployeeManager
              employees={employees}
              shifts={shifts}
              kiosks={kiosks}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onOpenImportExcel={() => setIsExcelModalOpen(true)}
              onOpenBranchInvitationModal={() => setIsBranchInvitationModalOpen(true)}
            />
          </div>
        )}

        {/* Tab 4: Multi-Kiosk Branch Management (Owner Only) */}
        {activeTab === 'kiosks' && isOwner && (
          <div className="space-y-6">
            <KioskManager
              kiosks={kiosks}
              employees={employees}
              records={records}
              activeKioskId={activeKioskId}
              invitations={invitations}
              onOpenBranchInvitationModal={() => setIsBranchInvitationModalOpen(true)}
              onAddKiosk={handleAddKiosk}
              onUpdateKiosk={handleUpdateKiosk}
              onDeleteKiosk={handleDeleteKiosk}
              onSelectActiveKiosk={handleSelectActiveKiosk}
              onSwitchToKioskMode={handleSwitchToKioskMode}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <AuthRoleModal
        isOpen={isAuthRoleModalOpen}
        onClose={() => setIsAuthRoleModalOpen(false)}
        currentRole={userRole}
        kiosks={kiosks}
        activeKioskId={activeKioskId}
        ownerPin={ownerPin}
        onSwitchToOwner={() => {
          setUserRole('owner');
          showToast('👑 Login berhasil. Beralih ke Mode Owner (Akses Penuh)');
        }}
        onSwitchToKaryawan={(kId) => {
          setActiveKioskId(kId);
          setUserRole('karyawan');
          setActiveTab('terminal');
          const found = kiosks.find((k) => k.id === kId);
          showToast(`🔒 Mode Karyawan aktif untuk cabang: ${found ? found.nama : kId}`);
        }}
        onChangeOwnerPin={(newPin) => {
          setOwnerPin(newPin);
          showToast('🔑 PIN Owner berhasil diperbarui!');
        }}
        onOpenOwnerAuthModal={() => setIsOwnerAuthModalOpen(true)}
      />

      <ExcelModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onImportAttendance={handleImportAttendance}
        onImportEmployees={handleImportEmployees}
        existingEmployees={employees}
      />

      <ManualEntryModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        employees={employees}
        currentShift={currentShift}
        onAddRecord={handleRecordAttendance}
      />

      <ShiftSettingsModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        shifts={shifts}
        currentShiftId={currentShiftId}
        onSelectShift={setCurrentShiftId}
        onUpdateShifts={setShifts}
        emailSettings={emailSettings}
        onUpdateEmailSettings={setEmailSettings}
        emailLogs={emailLogs}
        onClearEmailLogs={() => setEmailLogs([])}
        onTestEmail={handleTestEmail}
        initialTab={settingsModalTab}
      />

      {/* Owner Auth & Registration Modal */}
      <OwnerAuthModal
        isOpen={isOwnerAuthModalOpen}
        onClose={() => setIsOwnerAuthModalOpen(false)}
        isOwnerLoggedIn={isOwner}
        ownerAccount={ownerAccount}
        onLoginOwner={handleLoginOwner}
        onRegisterOwner={handleRegisterOwner}
        onLogoutOwner={handleLogoutOwner}
        onUpdateAccount={handleUpdateOwnerAccount}
      />

      {/* Branch Invitations Management Modal */}
      <BranchInvitationModal
        isOpen={isBranchInvitationModalOpen}
        onClose={() => setIsBranchInvitationModalOpen(false)}
        invitations={invitations}
        kiosks={kiosks}
        employees={employees}
        onAddInvitation={handleAddInvitation}
        onToggleInvitationStatus={handleToggleInvitationStatus}
        onDeleteInvitation={handleDeleteInvitation}
      />

      {/* Employee Self-Registration with Branch Invitation Modal */}
      <EmployeeSelfRegisterModal
        isOpen={isEmployeeRegisterModalOpen}
        onClose={() => {
          setIsEmployeeRegisterModalOpen(false);
          setUrlInviteCode('');
        }}
        invitations={invitations}
        kiosks={kiosks}
        shifts={shifts}
        initialInviteCode={urlInviteCode}
        onRegisterSuccess={handleEmployeeSelfRegistered}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">BioAbsensi Online v2.5</span>
            <span>•</span>
            <span>Sensor Sidik Jari Presisi & Multi-Cabang Kios Real-Time</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              {isOwner ? (
                <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-600" /> Mode Owner Aktif
                </span>
              ) : (
                <span className="text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-600" /> Mode Karyawan (Khusus Absensi)
                </span>
              )}
            </span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold">Status: Aktif & Terhubung</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
