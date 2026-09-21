import * as XLSX from 'xlsx';
import { AttendanceRecord, Employee } from '../types';

/**
 * Format timestamp to readable date/time
 */
export const formatDateIndo = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

/**
 * Export Attendance Records to Excel (.xlsx)
 */
export const exportAttendanceToExcel = (
  records: AttendanceRecord[],
  fileName = 'Laporan_Presensi_Sidik_Jari.xlsx'
) => {
  const dataToExport = records.map((rec, index) => ({
    'No': index + 1,
    'Tanggal': rec.tanggal,
    'Waktu': rec.waktu,
    'NIP': rec.nip,
    'Nama Lengkap': rec.nama,
    'Departemen': rec.departemen,
    'Tipe Presensi': rec.tipe === 'masuk' ? 'Masuk Kerja' :
                     rec.tipe === 'pulang' ? 'Pulang Kerja' :
                     rec.tipe === 'istirahat_keluar' ? 'Keluar Istirahat' :
                     rec.tipe === 'istirahat_kembali' ? 'Kembali Istirahat' : 'Lembur',
    'Status Kehadiran': rec.status === 'tepat_waktu' ? 'Tepat Waktu' :
                        rec.status === 'terlambat' ? `Terlambat (${rec.keterlambatanMenit} mnt)` :
                        rec.status === 'pulang_cepat' ? 'Pulang Cepat' :
                        rec.status === 'lembur' ? 'Lembur' : 'Sesuai Jadwal',
    'Keterlambatan (Menit)': rec.keterlambatanMenit,
    'Metode Verifikasi': rec.metodeVerifikasi,
    'Skor Akurasi Biometrik (%)': `${rec.scoreAkurasi}%`,
    'Lokasi Sensor': rec.lokasi || 'Mesin Utama',
    'Catatan / Keterangan': rec.catatan || '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);

  // Auto column widths
  const colWidths = [
    { wch: 6 },  // No
    { wch: 14 }, // Tanggal
    { wch: 12 }, // Waktu
    { wch: 16 }, // NIP
    { wch: 26 }, // Nama
    { wch: 24 }, // Departemen
    { wch: 18 }, // Tipe
    { wch: 20 }, // Status
    { wch: 22 }, // Keterlambatan
    { wch: 24 }, // Metode
    { wch: 26 }, // Akurasi
    { wch: 20 }, // Lokasi
    { wch: 30 }, // Catatan
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Presensi');

  // Summary sheet
  const totalRecords = records.length;
  const tepatWaktuCount = records.filter(r => r.status === 'tepat_waktu').length;
  const terlambatCount = records.filter(r => r.status === 'terlambat').length;
  const masukCount = records.filter(r => r.tipe === 'masuk').length;
  const pulangCount = records.filter(r => r.tipe === 'pulang').length;

  const summaryData = [
    { 'Metrik': 'Total Baris Data Absensi', 'Nilai': totalRecords },
    { 'Metrik': 'Total Presensi Masuk', 'Nilai': masukCount },
    { 'Metrik': 'Total Presensi Pulang', 'Nilai': pulangCount },
    { 'Metrik': 'Presensi Tepat Waktu', 'Nilai': tepatWaktuCount },
    { 'Metrik': 'Presensi Terlambat', 'Nilai': terlambatCount },
    { 'Metrik': 'Rasio Ketepatan Waktu', 'Nilai': totalRecords ? `${((tepatWaktuCount / totalRecords) * 100).toFixed(1)}%` : '0%' },
    { 'Metrik': 'Waktu Ekspor', 'Nilai': new Date().toLocaleString('id-ID') },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 28 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan Statistik');

  XLSX.writeFile(workbook, fileName);
};

/**
 * Export Employees to Excel (.xlsx)
 */
export const exportEmployeesToExcel = (
  employees: Employee[],
  fileName = 'Master_Data_Karyawan.xlsx'
) => {
  const data = employees.map((emp, index) => ({
    'No': index + 1,
    'NIP': emp.nip,
    'Nama Lengkap': emp.nama,
    'Departemen': emp.departemen,
    'Jabatan': emp.jabatan,
    'Email Perusahaan': emp.email,
    'Sidik Jari Terdaftar': emp.fingerprintRegistered ? 'SUDAH TERDAFTAR' : 'BELUM',
    'Status Kerja': emp.status,
    'Tanggal Bergabung': emp.tanggalBergabung,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 28 },
    { wch: 24 },
    { wch: 24 },
    { wch: 30 },
    { wch: 22 },
    { wch: 14 },
    { wch: 18 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Karyawan');
  XLSX.writeFile(workbook, fileName);
};

/**
 * Download Employee Import Template
 */
export const downloadEmployeeTemplate = () => {
  const templateData = [
    {
      'NIP': 'NIP-202407',
      'Nama Lengkap': 'Dimas Anggara, S.Kom',
      'Departemen': 'Teknologi Informasi',
      'Jabatan': 'DevOps Engineer',
      'Email': 'dimas.anggara@perusahaan.co.id',
      'Status': 'Aktif',
      'Tanggal Bergabung': '2024-03-01',
    },
    {
      'NIP': 'NIP-202408',
      'Nama Lengkap': 'Citra Kirana, S.E',
      'Departemen': 'Keuangan & Akuntansi',
      'Jabatan': 'Tax Specialist',
      'Email': 'citra.kirana@perusahaan.co.id',
      'Status': 'Aktif',
      'Tanggal Bergabung': '2024-03-15',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  ws['!cols'] = [
    { wch: 16 },
    { wch: 28 },
    { wch: 24 },
    { wch: 22 },
    { wch: 32 },
    { wch: 14 },
    { wch: 18 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template Karyawan');
  XLSX.writeFile(wb, 'Template_Import_Karyawan.xlsx');
};

/**
 * Download Attendance Import Template
 */
export const downloadAttendanceTemplate = () => {
  const templateData = [
    {
      'Tanggal (YYYY-MM-DD)': '2026-09-20',
      'Waktu (HH:mm:ss)': '07:58:30',
      'NIP': 'NIP-202401',
      'Tipe (masuk/pulang)': 'masuk',
      'Catatan': 'Presensi import Excel',
    },
    {
      'Tanggal (YYYY-MM-DD)': '2026-09-20',
      'Waktu (HH:mm:ss)': '17:05:10',
      'NIP': 'NIP-202401',
      'Tipe (masuk/pulang)': 'pulang',
      'Catatan': 'Presensi pulang normal',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  ws['!cols'] = [
    { wch: 22 },
    { wch: 20 },
    { wch: 16 },
    { wch: 22 },
    { wch: 28 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template Absensi');
  XLSX.writeFile(wb, 'Template_Import_Absensi.xlsx');
};

/**
 * Parse Excel file from ArrayBuffer / File
 */
export const parseExcelFile = async (file: File): Promise<Record<string, unknown>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error('Berkas Excel tidak memiliki lembar kerja (sheet).');
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });
        resolve(jsonData);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};
