import { Employee, AttendanceRecord, Shift, EmailNotificationSettings, EmailNotificationLog, Kiosk, UserRole, OwnerAccount, BranchInvitation } from '../types';

export const DEFAULT_OWNER_ACCOUNT: OwnerAccount = {
  id: 'owner-master',
  email: 'owner@bisnis.co.id',
  namaOwner: 'Santo (Pemilik Usaha)',
  namaPerusahaan: 'PT Sejahtera Mandiri Kios',
  pin: '1234',
  createdAt: '2026-01-10T08:00:00.000Z',
};

export const DEFAULT_INVITATIONS: BranchInvitation[] = [
  {
    id: 'inv-gi-2026',
    code: 'INV-GI-2026',
    kioskId: 'kios-01',
    kioskNama: 'Kios Grand Indonesia',
    createdAt: '2026-01-15T08:00:00.000Z',
    usedCount: 2,
    status: 'Aktif',
  },
  {
    id: 'inv-pvj-2026',
    code: 'INV-PVJ-2026',
    kioskId: 'kios-02',
    kioskNama: 'Kios Paris Van Java',
    createdAt: '2026-01-15T08:00:00.000Z',
    usedCount: 1,
    status: 'Aktif',
  },
  {
    id: 'inv-tp-2026',
    code: 'INV-TP-2026',
    kioskId: 'kios-03',
    kioskNama: 'Kios Tunjungan Plaza',
    createdAt: '2026-01-15T08:00:00.000Z',
    usedCount: 1,
    status: 'Aktif',
  },
];

export const DEFAULT_EMAIL_SETTINGS: EmailNotificationSettings = {
  enableVerificationEmail: true,
  enableLateArrivalEmail: true,
  adminEmail: 'hrd@perusahaan.co.id',
  sendCopyToEmployee: true,
};

export const DEFAULT_KIOSKS: Kiosk[] = [
  {
    id: 'kios-01',
    kode: 'KIO-JKT01',
    nama: 'Kios Grand Indonesia',
    kota: 'Jakarta Pusat',
    alamat: 'Grand Indonesia West Mall Lantai LG No. 18',
    telepon: '0811-9876-5432',
    jamOperasional: '09:00 - 22:00',
    status: 'Aktif',
  },
  {
    id: 'kios-02',
    kode: 'KIO-BDG02',
    nama: 'Kios Paris Van Java',
    kota: 'Bandung',
    alamat: 'PVJ Mall Resort Level Blok C-05',
    telepon: '0812-8877-6655',
    jamOperasional: '10:00 - 22:00',
    status: 'Aktif',
  },
  {
    id: 'kios-03',
    kode: 'KIO-SBY03',
    nama: 'Kios Tunjungan Plaza',
    kota: 'Surabaya',
    alamat: 'TP 4 Lantai 3 Food Promenade No. 22',
    telepon: '0813-1122-3344',
    jamOperasional: '10:00 - 22:00',
    status: 'Aktif',
  },
];

export const DEFAULT_SHIFTS: Shift[] = [
  {
    id: 'shift-regular',
    nama: 'Shift Reguler (Pagi)',
    jamMasuk: '08:00',
    jamPulang: '17:00',
    toleransiKeterlambatan: 15,
    hariKerja: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
  },
  {
    id: 'shift-siang',
    nama: 'Shift Siang',
    jamMasuk: '13:00',
    jamPulang: '21:00',
    toleransiKeterlambatan: 10,
    hariKerja: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
  },
  {
    id: 'shift-malam',
    nama: 'Shift Malam',
    jamMasuk: '21:00',
    jamPulang: '06:00',
    toleransiKeterlambatan: 10,
    hariKerja: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
  },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-101',
    nip: 'NIP-202401',
    nama: 'Budi Pratama, S.Kom',
    departemen: 'Operasional Kios',
    jabatan: 'Kepala Kios',
    email: 'budi.pratama@perusahaan.co.id',
    shiftId: 'shift-regular',
    kioskId: 'kios-01',
    fingerprintRegistered: true,
    tanggalBergabung: '2023-01-15',
    status: 'Aktif',
    avatarColor: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'emp-102',
    nip: 'NIP-202402',
    nama: 'Siti Rahmawati, S.E',
    departemen: 'Kasir & Pelayanan',
    jabatan: 'Senior Cashier',
    email: 'siti.rahmawati@perusahaan.co.id',
    shiftId: 'shift-regular',
    kioskId: 'kios-01',
    fingerprintRegistered: true,
    tanggalBergabung: '2023-03-01',
    status: 'Aktif',
    avatarColor: 'from-emerald-600 to-teal-600',
  },
  {
    id: 'emp-103',
    nip: 'NIP-202403',
    nama: 'Rian Hidayat, S.T',
    departemen: 'Operasional Kios',
    jabatan: 'Kepala Kios',
    email: 'rian.hidayat@perusahaan.co.id',
    shiftId: 'shift-regular',
    kioskId: 'kios-02',
    fingerprintRegistered: true,
    tanggalBergabung: '2023-06-10',
    status: 'Aktif',
    avatarColor: 'from-amber-600 to-orange-600',
  },
  {
    id: 'emp-104',
    nip: 'NIP-202404',
    nama: 'Dewi Lestari, S.Psi',
    departemen: 'Kasir & Pelayanan',
    jabatan: 'Staf Kasir',
    email: 'dewi.lestari@perusahaan.co.id',
    shiftId: 'shift-regular',
    kioskId: 'kios-02',
    fingerprintRegistered: true,
    tanggalBergabung: '2023-08-20',
    status: 'Aktif',
    avatarColor: 'from-purple-600 to-pink-600',
  },
  {
    id: 'emp-105',
    nip: 'NIP-202405',
    nama: 'Ahmad Fauzi, S.Ds',
    departemen: 'Operasional Kios',
    jabatan: 'Kepala Kios',
    email: 'ahmad.fauzi@perusahaan.co.id',
    shiftId: 'shift-siang',
    kioskId: 'kios-03',
    fingerprintRegistered: true,
    tanggalBergabung: '2023-11-05',
    status: 'Aktif',
    avatarColor: 'from-rose-600 to-red-600',
  },
  {
    id: 'emp-106',
    nip: 'NIP-202406',
    nama: 'Anisa Kusuma, S.M',
    departemen: 'Kasir & Pelayanan',
    jabatan: 'Staf Kasir',
    email: 'anisa.kusuma@perusahaan.co.id',
    shiftId: 'shift-siang',
    kioskId: 'kios-03',
    fingerprintRegistered: false,
    tanggalBergabung: '2024-02-01',
    status: 'Aktif',
    avatarColor: 'from-cyan-600 to-blue-600',
  },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-001',
    employeeId: 'emp-101',
    nip: 'NIP-202401',
    nama: 'Budi Pratama, S.Kom',
    departemen: 'Operasional Kios',
    kioskId: 'kios-01',
    kioskNama: 'Kios Grand Indonesia',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    tanggal: new Date().toISOString().split('T')[0],
    waktu: '07:55:12',
    tipe: 'masuk',
    status: 'tepat_waktu',
    keterlambatanMenit: 0,
    metodeVerifikasi: 'Sidik Jari Biometrik',
    scoreAkurasi: 99.4,
    catatan: 'Presensi biometric diverifikasi mesin kios',
    lokasi: 'Kios Grand Indonesia',
  },
  {
    id: 'att-002',
    employeeId: 'emp-102',
    nip: 'NIP-202402',
    nama: 'Siti Rahmawati, S.E',
    departemen: 'Kasir & Pelayanan',
    kioskId: 'kios-01',
    kioskNama: 'Kios Grand Indonesia',
    timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    tanggal: new Date().toISOString().split('T')[0],
    waktu: '08:04:30',
    tipe: 'masuk',
    status: 'tepat_waktu',
    keterlambatanMenit: 4,
    metodeVerifikasi: 'Sidik Jari Biometrik',
    scoreAkurasi: 98.8,
    catatan: 'Dalam batas toleransi 15 menit',
    lokasi: 'Kios Grand Indonesia',
  },
  {
    id: 'att-003',
    employeeId: 'emp-103',
    nip: 'NIP-202403',
    nama: 'Rian Hidayat, S.T',
    departemen: 'Operasional Kios',
    kioskId: 'kios-02',
    kioskNama: 'Kios Paris Van Java',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    tanggal: new Date().toISOString().split('T')[0],
    waktu: '08:24:18',
    tipe: 'masuk',
    status: 'terlambat',
    keterlambatanMenit: 24,
    metodeVerifikasi: 'Sidik Jari Biometrik',
    scoreAkurasi: 99.1,
    catatan: 'Kendala kemacetan area PVJ',
    lokasi: 'Kios Paris Van Java',
  },
  {
    id: 'att-004',
    employeeId: 'emp-104',
    nip: 'NIP-202404',
    nama: 'Dewi Lestari, S.Psi',
    departemen: 'Kasir & Pelayanan',
    kioskId: 'kios-02',
    kioskNama: 'Kios Paris Van Java',
    timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString(),
    tanggal: new Date().toISOString().split('T')[0],
    waktu: '07:48:05',
    tipe: 'masuk',
    status: 'tepat_waktu',
    keterlambatanMenit: 0,
    metodeVerifikasi: 'Sidik Jari Biometrik',
    scoreAkurasi: 99.7,
    catatan: 'Presensi pagi',
    lokasi: 'Kios Paris Van Java',
  },
];

const STORAGE_KEYS = {
  EMPLOYEES: 'absensi_employees_v1',
  ATTENDANCE: 'absensi_records_v1',
  SHIFTS: 'absensi_shifts_v1',
  TIMEZONE: 'absensi_timezone_v1',
  EMAIL_SETTINGS: 'absensi_email_settings_v1',
  EMAIL_LOGS: 'absensi_email_logs_v1',
  KIOSKS: 'absensi_kiosks_v1',
  USER_ROLE: 'absensi_user_role_v1',
  ACTIVE_KIOSK: 'absensi_active_kiosk_v1',
  OWNER_PIN: 'absensi_owner_pin_v1',
  OWNER_ACCOUNT: 'absensi_owner_account_v1',
  INVITATIONS: 'absensi_invitations_v1',
};

export const getStoredKiosks = (): Kiosk[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.KIOSKS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading kiosks from storage', e);
  }
  return DEFAULT_KIOSKS;
};

export const saveKiosks = (kiosks: Kiosk[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.KIOSKS, JSON.stringify(kiosks));
  } catch (e) {
    console.warn('Error saving kiosks to storage', e);
  }
};

export const getStoredUserRole = (): UserRole => {
  try {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get('mode');
      if (modeParam === 'karyawan') return 'karyawan';
      if (modeParam === 'owner') return 'owner';
    }

    const raw = localStorage.getItem(STORAGE_KEYS.USER_ROLE) as UserRole | null;
    if (raw === 'karyawan' || raw === 'owner') return raw;
  } catch (e) {
    console.warn('Error reading user role from storage', e);
  }
  // Default to 'karyawan' so any published link or new device visitors are automatically locked in Mode Karyawan
  return 'karyawan';
};

export const saveUserRole = (role: UserRole): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
  } catch (e) {
    console.warn('Error saving user role to storage', e);
  }
};

export const getStoredRole = getStoredUserRole;
export const saveRole = saveUserRole;

export const getStoredActiveKioskId = (): string => {
  try {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlKiosk = params.get('kiosk');
      if (urlKiosk) return urlKiosk;
    }

    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_KIOSK);
    if (raw) return raw;
  } catch (e) {
    console.warn('Error reading active kiosk from storage', e);
  }
  return 'kios-01'; // Default kiosk
};

export const saveActiveKioskId = (kioskId: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_KIOSK, kioskId);
  } catch (e) {
    console.warn('Error saving active kiosk to storage', e);
  }
};

export const getStoredOwnerPin = (): string => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OWNER_PIN);
    if (raw) return raw;
  } catch (e) {
    console.warn('Error reading owner pin from storage', e);
  }
  return '1234'; // Default PIN
};

export const saveOwnerPin = (pin: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.OWNER_PIN, pin);
  } catch (e) {
    console.warn('Error saving owner pin to storage', e);
  }
};

export const getStoredEmployees = (): Employee[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading employees from storage', e);
  }
  return INITIAL_EMPLOYEES;
};

export const saveEmployees = (employees: Employee[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  } catch (e) {
    console.warn('Error saving employees to storage', e);
  }
};

export const getStoredAttendance = (): AttendanceRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading attendance from storage', e);
  }
  return INITIAL_ATTENDANCE;
};

export const saveAttendance = (records: AttendanceRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  } catch (e) {
    console.warn('Error saving attendance to storage', e);
  }
};

export const getStoredShifts = (): Shift[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHIFTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading shifts from storage', e);
  }
  return DEFAULT_SHIFTS;
};

export const saveShifts = (shifts: Shift[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
  } catch (e) {
    console.warn('Error saving shifts to storage', e);
  }
};

export const getStoredEmailSettings = (): EmailNotificationSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMAIL_SETTINGS);
    if (raw) return { ...DEFAULT_EMAIL_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Error reading email settings from storage', e);
  }
  return DEFAULT_EMAIL_SETTINGS;
};

export const saveEmailSettings = (settings: EmailNotificationSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.EMAIL_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('Error saving email settings to storage', e);
  }
};

export const getStoredEmailLogs = (): EmailNotificationLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMAIL_LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading email logs from storage', e);
  }
  return [];
};

export const saveEmailLogs = (logs: EmailNotificationLog[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify(logs.slice(0, 50)));
  } catch (e) {
    console.warn('Error saving email logs to storage', e);
  }
};

export const getStoredOwnerAccount = (): OwnerAccount => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OWNER_ACCOUNT);
    if (raw) return { ...DEFAULT_OWNER_ACCOUNT, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Error reading owner account from storage', e);
  }
  return DEFAULT_OWNER_ACCOUNT;
};

export const saveOwnerAccount = (account: OwnerAccount): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.OWNER_ACCOUNT, JSON.stringify(account));
    // Also sync PIN with OWNER_PIN
    if (account.pin) {
      localStorage.setItem(STORAGE_KEYS.OWNER_PIN, account.pin);
    }
  } catch (e) {
    console.warn('Error saving owner account to storage', e);
  }
};

export const getStoredInvitations = (): BranchInvitation[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVITATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading invitations from storage', e);
  }
  return DEFAULT_INVITATIONS;
};

export const saveInvitations = (invitations: BranchInvitation[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(invitations));
  } catch (e) {
    console.warn('Error saving invitations to storage', e);
  }
};

