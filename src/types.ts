export type AttendanceType = 'masuk' | 'pulang' | 'istirahat_keluar' | 'istirahat_kembali' | 'lembur';

export type AttendanceStatus = 'tepat_waktu' | 'terlambat' | 'pulang_cepat' | 'lembur' | 'sesuai_jadwal';

export interface Shift {
  id: string;
  nama: string;
  jamMasuk: string; // "08:00"
  jamPulang: string; // "17:00"
  toleransiKeterlambatan: number; // in minutes, e.g. 15
  hariKerja: string[]; // ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]
}

export type UserRole = 'owner' | 'karyawan';

export interface Kiosk {
  id: string;
  kode: string;
  nama: string;
  kota: string;
  alamat: string;
  telepon: string;
  jamOperasional: string;
  status: 'Aktif' | 'Tutup Sementara';
}

export interface OwnerAccount {
  id: string;
  email: string;
  namaOwner: string;
  namaPerusahaan: string;
  pin: string;
  createdAt: string;
}

export interface BranchInvitation {
  id: string;
  code: string;
  kioskId: string;
  kioskNama: string;
  createdAt: string;
  maxUses?: number;
  usedCount: number;
  status: 'Aktif' | 'Nonaktif';
}

export interface Employee {
  id: string;
  nip: string; // Nomor Induk Pegawai
  nama: string;
  departemen: string;
  jabatan: string;
  email: string;
  shiftId: string;
  kioskId?: string; // Cabang Kios tempat karyawan ditugaskan
  fingerprintRegistered: boolean;
  fingerprintCredentialId?: string;
  tanggalBergabung: string;
  status: 'Aktif' | 'Cuti' | 'Nonaktif';
  avatarColor?: string;
  invitedByCode?: string;
  registeredSelf?: boolean;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  nip: string;
  nama: string;
  departemen: string;
  kioskId?: string;
  kioskNama?: string;
  timestamp: string; // ISO string
  tanggal: string; // YYYY-MM-DD
  waktu: string; // HH:mm:ss
  tipe: AttendanceType;
  status: AttendanceStatus;
  keterlambatanMenit: number;
  metodeVerifikasi: 'Sidik Jari Biometrik' | 'WebAuthn Hardware' | 'Manual Override';
  scoreAkurasi: number; // e.g. 99.2%
  catatan?: string;
  lokasi?: string;
}

export type TimezoneOption = 'WIB' | 'WITA' | 'WIT' | 'LOCAL';

export interface EmailNotificationSettings {
  enableVerificationEmail: boolean;
  enableLateArrivalEmail: boolean;
  adminEmail: string;
  sendCopyToEmployee: boolean;
}

export interface EmailNotificationLog {
  id: string;
  timestamp: string;
  timeStr: string;
  recipient: string;
  subject: string;
  type: 'verification' | 'late_arrival';
  employeeName: string;
  status: 'Terkirim' | 'Nonaktif';
  detail: string;
}
