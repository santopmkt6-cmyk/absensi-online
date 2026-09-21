import React, { useState } from 'react';
import { 
  Store, 
  Plus, 
  MapPin, 
  Phone, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  Search, 
  Building2, 
  Lock, 
  ExternalLink,
  Sparkles,
  X,
  Copy,
  Check,
  Share2
} from 'lucide-react';
import { Kiosk, Employee, AttendanceRecord, BranchInvitation } from '../types';
import { soundEffects } from '../utils/audio';

interface KioskManagerProps {
  kiosks: Kiosk[];
  employees: Employee[];
  records: AttendanceRecord[];
  activeKioskId: string;
  invitations?: BranchInvitation[];
  onOpenBranchInvitationModal?: () => void;
  onAddKiosk: (kiosk: Kiosk) => void;
  onUpdateKiosk: (kiosk: Kiosk) => void;
  onDeleteKiosk: (id: string) => void;
  onSelectActiveKiosk: (id: string) => void;
  onSwitchToKioskMode: (id: string) => void;
}

export const KioskManager: React.FC<KioskManagerProps> = ({
  kiosks,
  employees,
  records,
  activeKioskId,
  invitations = [],
  onOpenBranchInvitationModal,
  onAddKiosk,
  onUpdateKiosk,
  onDeleteKiosk,
  onSelectActiveKiosk,
  onSwitchToKioskMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingKiosk, setEditingKiosk] = useState<Kiosk | null>(null);
  const [copiedKioskId, setCopiedKioskId] = useState<string | null>(null);
  const [copiedInviteCode, setCopiedInviteCode] = useState<string | null>(null);

  const handleCopyInviteLink = (code: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      const url = `${window.location.origin}${window.location.pathname}?invite=${encodeURIComponent(code)}`;
      navigator.clipboard.writeText(url);
      setCopiedInviteCode(code);
      soundEffects.playSuccessChime();
      setTimeout(() => setCopiedInviteCode(null), 3000);
    }
  };

  // Form states
  const [kode, setKode] = useState('');
  const [nama, setNama] = useState('');
  const [kota, setKota] = useState('Jakarta Pusat');
  const [alamat, setAlamat] = useState('');
  const [telepon, setTelepon] = useState('');
  const [jamOperasional, setJamOperasional] = useState('09:00 - 22:00');
  const [status, setStatus] = useState<'Aktif' | 'Tutup Sementara'>('Aktif');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleCopyKioskLink = (kioskId: string) => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}${window.location.pathname}?mode=karyawan&kiosk=${encodeURIComponent(kioskId)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedKioskId(kioskId);
      soundEffects.playSuccessChime();
      setTimeout(() => setCopiedKioskId(null), 3000);
    }
  };

  const filteredKiosks = kiosks.filter(
    (k) =>
      k.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.kota.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.kode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingKiosk(null);
    const nextNum = kiosks.length + 1;
    setKode(`KIO-0${nextNum}`);
    setNama('');
    setKota('Jakarta Pusat');
    setAlamat('');
    setTelepon('0812-3456-7890');
    setJamOperasional('09:00 - 22:00');
    setStatus('Aktif');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (kiosk: Kiosk) => {
    setEditingKiosk(kiosk);
    setKode(kiosk.kode);
    setNama(kiosk.nama);
    setKota(kiosk.kota);
    setAlamat(kiosk.alamat);
    setTelepon(kiosk.telepon);
    setJamOperasional(kiosk.jamOperasional);
    setStatus(kiosk.status);
    setIsFormModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !kode.trim()) return;

    if (editingKiosk) {
      const updated: Kiosk = {
        ...editingKiosk,
        kode: kode.trim(),
        nama: nama.trim(),
        kota: kota.trim(),
        alamat: alamat.trim(),
        telepon: telepon.trim(),
        jamOperasional: jamOperasional.trim(),
        status,
      };
      onUpdateKiosk(updated);
      soundEffects.playSuccessChime();
    } else {
      const newKiosk: Kiosk = {
        id: `kios-${Date.now()}`,
        kode: kode.trim(),
        nama: nama.trim(),
        kota: kota.trim(),
        alamat: alamat.trim(),
        telepon: telepon.trim(),
        jamOperasional: jamOperasional.trim(),
        status,
      };
      onAddKiosk(newKiosk);
      soundEffects.playSuccessChime();
    }

    setIsFormModalOpen(false);
  };

  const handleDelete = (id: string, namaKiosk: string) => {
    const assignedCount = employees.filter((e) => e.kioskId === id).length;
    if (assignedCount > 0) {
      if (!confirm(`Kios "${namaKiosk}" memiliki ${assignedCount} karyawan terdaftar. Hapus kios ini dan pindahkan staf ke kios lain?`)) {
        return;
      }
    } else {
      if (!confirm(`Apakah Anda yakin ingin menghapus "${namaKiosk}"?`)) {
        return;
      }
    }
    onDeleteKiosk(id);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Fitur Eksklusif Owner
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">{kiosks.length} Cabang Kios Terdaftar</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Manajemen Cabang Kios & Penempatan Karyawan
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Kelola seluruh cabang kios usaha Anda. Setiap kios memiliki terminal absensi sidik jari tersendiri dengan daftar staf yang terdaftar.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kios atau kota..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            {onOpenBranchInvitationModal && (
              <button
                type="button"
                id="kiosk-manage-invitations-btn"
                onClick={onOpenBranchInvitationModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors border border-slate-200 shrink-0 cursor-pointer"
                title="Kelola Kode & Link Undangan Karyawan"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Undangan Cabang</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Kios
            </button>
          </div>
        </div>
      </div>

      {/* Guidance Banner for Publishing & Employee Access */}
      <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200/80 flex items-start gap-3.5 text-xs text-indigo-950 shadow-2xs">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold">
          <Share2 className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-slate-900 text-sm">
            Cara Agar Pengunjung Link Otomatis Masuk Mode Karyawan:
          </h4>
          <p className="text-slate-600 leading-relaxed">
            Aplikasi ini sudah diprogram agar <strong>setiap pengunjung baru atau orang yang membuka link hasil publish langsung masuk ke Mode Karyawan (Terkunci khusus absensi)</strong>. Mereka tidak akan dapat melihat menu karyawan, cabang, atau ekspor data tanpa memasukkan PIN Owner Anda.
          </p>
          <p className="text-slate-600 leading-relaxed pt-0.5">
            💡 Untuk membagikan link absensi khusus cabang tertentu, klik tombol <strong>&ldquo;Salin Link Kios&rdquo;</strong> pada kartu cabang di bawah.
          </p>
        </div>
      </div>

      {/* Grid of Kiosks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredKiosks.map((kiosk) => {
          const assignedEmps = employees.filter((e) => e.kioskId === kiosk.id);
          const kioskRecordsToday = records.filter(
            (r) => r.tanggal === todayStr && (r.kioskId === kiosk.id || assignedEmps.some((e) => e.id === r.employeeId))
          );
          const isActiveOnDevice = activeKioskId === kiosk.id;

          return (
            <div
              key={kiosk.id}
              className={`bg-white rounded-2xl border p-5 transition-all flex flex-col justify-between relative shadow-xs hover:shadow-md ${
                isActiveOnDevice
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-slate-200'
              }`}
            >
              {isActiveOnDevice && (
                <div className="absolute -top-3 right-4 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Kios Aktif Perangkat Ini
                </div>
              )}

              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                          {kiosk.kode}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          kiosk.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {kiosk.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{kiosk.nama}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(kiosk)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Edit Data Kios"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {kiosks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDelete(kiosk.id, kiosk.nama)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Hapus Kios"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">{kiosk.alamat}, {kiosk.kota}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Jam Operasional: <strong>{kiosk.jamOperasional}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{kiosk.telepon}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>Karyawan Terdaftar</span>
                    </div>
                    <p className="text-base font-bold text-slate-900 mt-0.5">
                      {assignedEmps.length} <span className="text-xs font-normal text-slate-500">staf</span>
                    </p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Presensi Hari Ini</span>
                    </div>
                    <p className="text-base font-bold text-emerald-700 mt-0.5">
                      {kioskRecordsToday.length} <span className="text-xs font-normal text-slate-500">absen</span>
                    </p>
                  </div>
                </div>

                {/* Assigned employees preview */}
                <div className="mt-3">
                  <span className="text-[11px] font-semibold text-slate-500">Karyawan Kios Ini:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {assignedEmps.length > 0 ? (
                      assignedEmps.map((emp) => (
                        <span
                          key={emp.id}
                          className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {emp.nama.split(',')[0]}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] italic text-slate-400">Belum ada karyawan terdaftar di kios ini</span>
                    )}
                  </div>
                </div>
                {/* Invitation Code for Self-Registration */}
                {(() => {
                  const activeInv = invitations.find(
                    (inv) => inv.kioskId === kiosk.id && inv.status === 'Aktif'
                  );
                  return (
                    <div className="mt-3 p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Share2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="text-[10px] text-slate-500 font-medium">Kode Undangan:</span>
                          <span className="font-mono font-bold text-emerald-800 text-[11px] truncate">
                            {activeInv ? activeInv.code : '(Belum Dibuat)'}
                          </span>
                        </div>
                        {activeInv ? (
                          <button
                            type="button"
                            onClick={() => handleCopyInviteLink(activeInv.code)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
                            title="Salin link pendaftaran mandiri khusus cabang ini"
                          >
                            {copiedInviteCode === activeInv.code ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedInviteCode === activeInv.code ? 'Tersalin' : 'Salin Undangan'}</span>
                          </button>
                        ) : onOpenBranchInvitationModal ? (
                          <button
                            type="button"
                            onClick={onOpenBranchInvitationModal}
                            className="text-[10px] text-emerald-700 font-bold hover:underline cursor-pointer"
                          >
                            + Buat Kode
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Action: Lock Device or Share Kiosk Link */}
              <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyKioskLink(kiosk.id)}
                  className="py-2 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-indigo-200 cursor-pointer shadow-2xs"
                  title="Salin Link Kios Khusus Karyawan"
                >
                  {copiedKioskId === kiosk.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKioskId === kiosk.id ? 'Tersalin!' : 'Salin Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSwitchToKioskMode(kiosk.id)}
                  className="py-2 px-2.5 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 group border border-slate-200 hover:border-emerald-600 cursor-pointer shadow-2xs"
                  title="Kunci perangkat ini ke kios ini"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                  <span>Kunci Kios</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add or Edit Kiosk */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingKiosk ? 'Edit Data Cabang Kios' : 'Tambah Cabang Kios Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Kelola informasi lokasi cabang usaha</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kode Kios</label>
                  <input
                    type="text"
                    required
                    value={kode}
                    onChange={(e) => setKode(e.target.value)}
                    placeholder="Contoh: KIO-04"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kota</label>
                  <input
                    type="text"
                    required
                    value={kota}
                    onChange={(e) => setKota(e.target.value)}
                    placeholder="Contoh: Semarang"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Cabang Kios</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Kios Paragon Mall"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap</label>
                <input
                  type="text"
                  required
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Contoh: Lantai Food Court No. 12"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. Telepon Kios</label>
                  <input
                    type="text"
                    value={telepon}
                    onChange={(e) => setTelepon(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jam Operasional</label>
                  <input
                    type="text"
                    value={jamOperasional}
                    onChange={(e) => setJamOperasional(e.target.value)}
                    placeholder="09:00 - 22:00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Kios</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Aktif' | 'Tutup Sementara')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Aktif">Aktif (Buka Operasional)</option>
                  <option value="Tutup Sementara">Tutup Sementara (Renovasi / Libur)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {editingKiosk ? 'Simpan Perubahan' : 'Tambah Kios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
