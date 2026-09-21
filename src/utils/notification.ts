import { AttendanceRecord, Employee, EmailNotificationSettings, EmailNotificationLog } from '../types';

export interface EmailDispatchResult {
  logs: EmailNotificationLog[];
  messages: string[];
}

export const dispatchAttendanceEmails = (
  record: AttendanceRecord,
  employee: Employee | undefined,
  settings: EmailNotificationSettings
): EmailDispatchResult => {
  const logs: EmailNotificationLog[] = [];
  const messages: string[] = [];
  const now = new Date();
  const timeStr = record.waktu || now.toTimeString().split(' ')[0];
  const empName = employee ? employee.nama : record.nama;
  const empEmail = employee?.email || 'karyawan@perusahaan.co.id';
  const adminEmail = settings.adminEmail || 'hrd@perusahaan.co.id';

  // 1. Attendance verification notification
  if (settings.enableVerificationEmail) {
    const recipients = settings.sendCopyToEmployee
      ? `${empEmail}, ${adminEmail}`
      : adminEmail;

    const actionText =
      record.tipe === 'masuk'
        ? 'Presensi Masuk Kerja'
        : record.tipe === 'pulang'
        ? 'Presensi Pulang Kerja'
        : 'Presensi Lembur';

    const verificationLog: EmailNotificationLog = {
      id: `email-${Date.now()}-verif`,
      timestamp: now.toISOString(),
      timeStr,
      recipient: recipients,
      subject: `[PRESENSI] Verifikasi ${actionText} - ${empName} (${timeStr} WIB)`,
      type: 'verification',
      employeeName: empName,
      status: 'Terkirim',
      detail: `Presensi berhasil diverifikasi melalui ${record.metodeVerifikasi} (Skor: ${record.scoreAkurasi}%). Status: ${record.status === 'tepat_waktu' ? 'Tepat Waktu' : record.status === 'terlambat' ? 'Terlambat' : 'Sesuai'}.`,
    };

    logs.push(verificationLog);
    messages.push(`✉️ Email verifikasi terkirim ke ${empEmail}`);
  }

  // 2. Late arrival notification alert
  if (record.status === 'terlambat' && settings.enableLateArrivalEmail) {
    const lateMinutes = record.keterlambatanMenit || 0;
    const recipients = settings.sendCopyToEmployee
      ? `${adminEmail}, ${empEmail}`
      : adminEmail;

    const lateLog: EmailNotificationLog = {
      id: `email-${Date.now()}-late`,
      timestamp: now.toISOString(),
      timeStr,
      recipient: recipients,
      subject: `[PERINGATAN HRD] Keterlambatan Masuk (+${lateMinutes} Menit) - ${empName}`,
      type: 'late_arrival',
      employeeName: empName,
      status: 'Terkirim',
      detail: `Pemberitahuan keterlambatan: ${empName} (${record.nip}) presensi pukul ${timeStr} WIB, melebihi toleransi shift sebesar ${lateMinutes} menit.`,
    };

    logs.push(lateLog);
    messages.push(`🚨 Email peringatan keterlambatan (+${lateMinutes}m) terkirim ke HRD`);
  }

  return { logs, messages };
};
