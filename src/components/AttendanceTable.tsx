import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  PlusCircle, 
  Trash2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2,
  ChevronLeft,
  ChevronRight,
  Store
} from 'lucide-react';
import { AttendanceRecord, Employee, Kiosk } from '../types';
import { exportAttendanceToExcel } from '../utils/excel';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  employees: Employee[];
  kiosks?: Kiosk[];
  isOwner?: boolean;
  onOpenImportModal: () => void;
  onOpenManualModal: () => void;
  onDeleteRecord: (id: string) => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  employees,
  kiosks = [],
  isOwner = true,
  onOpenImportModal,
  onOpenManualModal,
  onDeleteRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'tepat_waktu' | 'terlambat' | 'lembur'>('all');
  const [departemenFilter, setDepartemenFilter] = useState<string>('all');
  const [kioskFilter, setKioskFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Distinct departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => set.add(e.departemen));
    return Array.from(set);
  }, [employees]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    return records.filter(r => {
      // Search
      const matchSearch = 
        r.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.departemen.toLowerCase().includes(searchQuery.toLowerCase());

      // Date
      let matchDate = true;
      if (dateFilter === 'today') matchDate = r.tanggal === todayStr;
      if (dateFilter === 'yesterday') matchDate = r.tanggal === yesterdayStr;

      // Status
      let matchStatus = true;
      if (statusFilter !== 'all') matchStatus = r.status === statusFilter;

      // Department
      let matchDept = true;
      if (departemenFilter !== 'all') matchDept = r.departemen === departemenFilter;

      // Kiosk Branch
      let matchKiosk = true;
      if (kioskFilter !== 'all') matchKiosk = r.kioskId === kioskFilter;

      return matchSearch && matchDate && matchStatus && matchDept && matchKiosk;
    });
  }, [records, searchQuery, dateFilter, statusFilter, departemenFilter, kioskFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage]);

  const handleExportExcel = () => {
    exportAttendanceToExcel(filteredRecords, `Laporan_Absensi_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div id="attendance-table-container" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header & Quick Action Buttons */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Riwayat & Log Presensi Karyawan</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {filteredRecords.length} catatan absensi terekam
          </p>
        </div>

        {/* Action Buttons: Import & Export Excel, Tambah Manual */}
        <div className="flex flex-wrap items-center gap-2">
          {isOwner && (
            <>
              <button
                type="button"
                id="open-manual-entry-btn"
                onClick={onOpenManualModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                Input Absen Manual
              </button>

              <button
                type="button"
                id="open-import-excel-btn"
                onClick={onOpenImportModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-900 text-white transition-colors shadow-sm"
              >
                <Upload className="w-4 h-4 text-slate-300" />
                Import Excel
              </button>
            </>
          )}

          <button
            type="button"
            id="export-excel-btn"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm shadow-emerald-500/20"
          >
            <Download className="w-4 h-4" />
            Export Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 border-b border-slate-100 bg-white grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="attendance-search-input"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama, NIP, divisi..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
          />
        </div>

        {/* Date Filter */}
        <div className="relative">
          <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            id="date-filter-select"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value as 'all' | 'today' | 'yesterday');
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-700"
          >
            <option value="all">Semua Tanggal</option>
            <option value="today">Hari Ini</option>
            <option value="yesterday">Kemarin</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            id="status-filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'all' | 'tepat_waktu' | 'terlambat' | 'lembur');
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-700"
          >
            <option value="all">Semua Status</option>
            <option value="tepat_waktu">Tepat Waktu</option>
            <option value="terlambat">Terlambat</option>
            <option value="lembur">Lembur</option>
          </select>
        </div>

        {/* Department Filter */}
        <div className="relative">
          <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            id="dept-filter-select"
            value={departemenFilter}
            onChange={(e) => {
              setDepartemenFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-700"
          >
            <option value="all">Semua Departemen</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Kiosk Filter */}
        <div className="relative">
          <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            id="kiosk-filter-select"
            value={kioskFilter}
            onChange={(e) => {
              setKioskFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-700 font-semibold"
          >
            <option value="all">Semua Cabang Kios</option>
            {kiosks.map((k) => (
              <option key={k.id} value={k.id}>{k.nama}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Karyawan & NIP</th>
              <th className="py-3 px-4">Cabang Kios</th>
              <th className="py-3 px-4">Waktu Presensi</th>
              <th className="py-3 px-4">Tipe Absen</th>
              <th className="py-3 px-4">Status & Toleransi</th>
              <th className="py-3 px-4">Verifikasi Biometrik</th>
              <th className="py-3 px-4">Catatan / Lokasi</th>
              {isOwner && <th className="py-3 px-4 text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={isOwner ? 8 : 7} className="py-12 text-center text-slate-400">
                  <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-600">Tidak ada catatan presensi yang sesuai</p>
                  <p className="text-xs text-slate-400 mt-0.5">Ubah kata kunci pencarian atau filter</p>
                </td>
              </tr>
            ) : (
              paginatedRecords.map((item) => {
                const kioskObj = kiosks.find((k) => k.id === item.kioskId);
                const kioskName = kioskObj ? kioskObj.nama : (item.lokasi || 'Kios Pusat');

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Karyawan */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.nama}</div>
                      <div className="text-[11px] text-slate-500">{item.nip} • {item.departemen}</div>
                    </td>

                    {/* Cabang Kios */}
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        <Store className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate max-w-[120px]">{kioskName}</span>
                      </div>
                    </td>

                    {/* Waktu */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {item.waktu}
                      </div>
                      <div className="text-[11px] text-slate-500">{item.tanggal}</div>
                    </td>

                    {/* Tipe */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        item.tipe === 'masuk' ? 'bg-emerald-100 text-emerald-800' :
                        item.tipe === 'pulang' ? 'bg-indigo-100 text-indigo-800' :
                        item.tipe === 'lembur' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {item.tipe === 'masuk' ? 'Masuk' :
                         item.tipe === 'pulang' ? 'Pulang' :
                         item.tipe === 'lembur' ? 'Lembur' : 'Istirahat'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {item.status === 'tepat_waktu' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Tepat Waktu
                        </span>
                      ) : item.status === 'terlambat' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          Terlambat ({item.keterlambatanMenit} mnt)
                        </span>
                      ) : item.status === 'pulang_cepat' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Pulang Cepat
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          Lembur
                        </span>
                      )}
                    </td>

                    {/* Biometric info */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{item.metodeVerifikasi}</div>
                      <div className="text-[11px] text-emerald-600 font-mono font-medium">Akurasi: {item.scoreAkurasi}%</div>
                    </td>

                    {/* Catatan / Lokasi */}
                    <td className="py-3 px-4 max-w-xs truncate text-slate-500">
                      <div>{item.catatan || '-'}</div>
                      <div className="text-[10px] text-slate-400">{item.lokasi || 'Sensor Utama'}</div>
                    </td>

                    {/* Aksi (Owner Only) */}
                    {isOwner && (
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onDeleteRecord(item.id)}
                          title="Hapus Catatan (Owner)"
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
        <div>
          Menampilkan baris {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredRecords.length)} dari total {filteredRecords.length}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-slate-800">
            Halaman {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
