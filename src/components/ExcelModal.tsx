import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Employee, AttendanceRecord } from '../types';
import { 
  parseExcelFile, 
  downloadEmployeeTemplate, 
  downloadAttendanceTemplate 
} from '../utils/excel';

interface ExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportAttendance: (records: AttendanceRecord[]) => void;
  onImportEmployees: (employees: Employee[]) => void;
  existingEmployees: Employee[];
}

export const ExcelModal: React.FC<ExcelModalProps> = ({
  isOpen,
  onClose,
  onImportAttendance,
  onImportEmployees,
  existingEmployees,
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'employee'>('attendance');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewRows, setPreviewRows] = useState<Record<string, unknown>[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsProcessing(true);

    try {
      const rows = await parseExcelFile(file);
      if (rows.length === 0) {
        setErrorMsg('Berkas Excel kosong atau tidak memiliki baris data.');
      } else {
        setPreviewRows(rows);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membaca berkas Excel.';
      setErrorMsg(msg);
      setPreviewRows([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (previewRows.length === 0) return;

    if (activeTab === 'attendance') {
      // Parse into AttendanceRecord[]
      const newRecords: AttendanceRecord[] = [];

      for (let i = 0; i < previewRows.length; i++) {
        const row = previewRows[i];
        // Support various column names in Indonesian
        const nip = String(row['NIP'] || row['nip'] || '').trim();
        const emp = existingEmployees.find(e => e.nip.toLowerCase() === nip.toLowerCase()) || {
          id: `emp-imp-${i}`,
          nip: nip || `NIP-IMP${i}`,
          nama: String(row['Nama Lengkap'] || row['Nama'] || row['nama'] || `Karyawan (${nip})`),
          departemen: String(row['Departemen'] || row['departemen'] || 'Umum'),
        };

        const tanggal = String(row['Tanggal (YYYY-MM-DD)'] || row['Tanggal'] || new Date().toISOString().split('T')[0]).trim();
        const waktu = String(row['Waktu (HH:mm:ss)'] || row['Waktu'] || '08:00:00').trim();
        const rawTipe = String(row['Tipe (masuk/pulang)'] || row['Tipe'] || 'masuk').toLowerCase();
        const tipe = rawTipe.includes('pulang') ? 'pulang' : 'masuk';

        newRecords.push({
          id: `att-excel-${Date.now()}-${i}`,
          employeeId: emp.id,
          nip: emp.nip,
          nama: emp.nama,
          departemen: emp.departemen,
          timestamp: `${tanggal}T${waktu}.000Z`,
          tanggal,
          waktu,
          tipe,
          status: 'tepat_waktu',
          keterlambatanMenit: 0,
          metodeVerifikasi: 'Sidik Jari Biometrik',
          scoreAkurasi: 99.0,
          catatan: String(row['Catatan'] || 'Diimpor dari file Excel'),
          lokasi: 'Data Import Excel',
        });
      }

      onImportAttendance(newRecords);
      setSuccessMsg(`Berhasil mengimpor ${newRecords.length} catatan absensi!`);
      setTimeout(() => {
        onClose();
        resetState();
      }, 1200);

    } else {
      // Parse into Employee[]
      const newEmployees: Employee[] = [];

      for (let i = 0; i < previewRows.length; i++) {
        const row = previewRows[i];
        const nip = String(row['NIP'] || `NIP-${Date.now() + i}`).trim();
        const nama = String(row['Nama Lengkap'] || row['Nama'] || `Karyawan Baru ${i + 1}`).trim();
        const departemen = String(row['Departemen'] || 'Operasional').trim();
        const jabatan = String(row['Jabatan'] || 'Staf').trim();
        const email = String(row['Email'] || row['Email Perusahaan'] || `${nip.toLowerCase()}@perusahaan.co.id`).trim();

        newEmployees.push({
          id: `emp-excel-${Date.now()}-${i}`,
          nip,
          nama,
          departemen,
          jabatan,
          email,
          shiftId: 'shift-regular',
          fingerprintRegistered: false,
          tanggalBergabung: String(row['Tanggal Bergabung'] || new Date().toISOString().split('T')[0]),
          status: 'Aktif',
          avatarColor: 'from-emerald-600 to-teal-700',
        });
      }

      onImportEmployees(newEmployees);
      setSuccessMsg(`Berhasil mengimpor ${newEmployees.length} data karyawan!`);
      setTimeout(() => {
        onClose();
        resetState();
      }, 1200);
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setPreviewRows([]);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Import Data dari Excel (.xlsx / .csv)</h3>
              <p className="text-xs text-slate-500">Unggah berkas spreadsheet untuk sinkronisasi data</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              resetState();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('attendance');
                resetState();
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'attendance'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Import Data Presensi
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('employee');
                resetState();
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'employee'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Import Master Karyawan
            </button>
          </div>

          {/* Template Download Button */}
          <button
            type="button"
            onClick={activeTab === 'attendance' ? downloadAttendanceTemplate : downloadEmployeeTemplate}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
          >
            <Download className="w-3.5 h-3.5" />
            Download Template Excel
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Drag & Drop Upload Zone */}
          <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50 hover:bg-emerald-50/20">
            <input
              type="file"
              id="excel-file-input"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <label htmlFor="excel-file-input" className="cursor-pointer block">
              <Upload className="w-10 h-10 mx-auto text-emerald-600 mb-2" />
              <p className="text-sm font-bold text-slate-800">
                {selectedFile ? selectedFile.name : 'Klik atau seret file Excel ke sini'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Mendukung format .XLSX, .XLS, atau .CSV
              </p>
              <span className="mt-3 inline-block px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
                Pilih Berkas Komputer
              </span>
            </label>
          </div>

          {/* Status Notifications */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold">{successMsg}</span>
            </div>
          )}

          {/* Table Preview of Imported Rows */}
          {previewRows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  Pratinjau Data ({previewRows.length} baris terbaca)
                </span>
                <span className="text-[11px] text-slate-500">Menampilkan 5 baris pertama</span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-48">
                <table className="w-full text-left text-[11px] text-slate-700">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      {Object.keys(previewRows[0] || {}).map((col) => (
                        <th key={col} className="py-2 px-3 whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        {Object.values(row).map((val, cellIdx) => (
                          <td key={cellIdx} className="py-2 px-3 whitespace-nowrap text-slate-600">
                            {String(val ?? '-')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tips Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Petunjuk Format Berkas:</p>
              <p className="text-[11px] text-blue-800 mt-0.5">
                Pastikan nama kolom sesuai dengan template standar. Anda dapat menekan tombol <strong>Download Template Excel</strong> di kanan atas untuk panduan kolom yang valid.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              resetState();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-200"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={previewRows.length === 0 || isProcessing}
            onClick={handleConfirmImport}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-sm transition-colors"
          >
            <span>Simpan & Gabungkan Data</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
