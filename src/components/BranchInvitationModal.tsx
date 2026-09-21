import React, { useState } from 'react';
import { 
  Share2, 
  Plus, 
  Copy, 
  Check, 
  X, 
  Store, 
  Users, 
  Sparkles, 
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Power
} from 'lucide-react';
import { BranchInvitation, Kiosk, Employee } from '../types';
import { soundEffects } from '../utils/audio';

interface BranchInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitations: BranchInvitation[];
  kiosks: Kiosk[];
  employees: Employee[];
  onAddInvitation: (invitation: BranchInvitation) => void;
  onToggleInvitationStatus: (id: string) => void;
  onDeleteInvitation: (id: string) => void;
}

export const BranchInvitationModal: React.FC<BranchInvitationModalProps> = ({
  isOpen,
  onClose,
  invitations,
  kiosks,
  employees,
  onAddInvitation,
  onToggleInvitationStatus,
  onDeleteInvitation,
}) => {
  const [selectedKioskId, setSelectedKioskId] = useState<string>(kiosks[0]?.id || '');
  const [customCode, setCustomCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const getInviteUrl = (code: string) => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}?invite=${encodeURIComponent(code)}`;
  };

  const handleCopyLink = (code: string) => {
    const url = getInviteUrl(code);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedCode(code);
      soundEffects.playSuccessChime();
      setTimeout(() => setCopiedCode(null), 3000);
    }
  };

  const handleCopyCodeOnly = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(`code-${code}`);
      soundEffects.playSuccessChime();
      setTimeout(() => setCopiedCode(null), 3000);
    }
  };

  const handleCreateInvitation = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const kiosk = kiosks.find((k) => k.id === selectedKioskId) || kiosks[0];
    if (!kiosk) {
      setErrorMsg('Silakan pilih cabang kios terlebih dahulu');
      return;
    }

    let finalCode = customCode.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (!finalCode) {
      const kioskPrefix = kiosk.kode.replace(/[^A-Z0-9]/g, '').slice(0, 5) || 'KIOS';
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      finalCode = `INV-${kioskPrefix}-${randomPart}`;
    }

    // Check duplicate
    if (invitations.some((inv) => inv.code.toUpperCase() === finalCode)) {
      setErrorMsg(`Kode undangan "${finalCode}" sudah pernah dibuat. Gunakan kode lain.`);
      return;
    }

    const newInv: BranchInvitation = {
      id: `inv-${Date.now()}`,
      code: finalCode,
      kioskId: kiosk.id,
      kioskNama: kiosk.nama,
      createdAt: new Date().toISOString(),
      usedCount: 0,
      status: 'Aktif',
    };

    onAddInvitation(newInv);
    soundEffects.playSuccessChime();
    setCustomCode('');
    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Kelola Kode & Link Undangan Cabang</h3>
              <p className="text-xs text-emerald-100">
                Karyawan mendaftar mandiri menggunakan kode undangan ini untuk masuk ke cabang kios
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

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Quick Guide Card */}
          <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Cara Kerja Sistem Undangan:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-1">
              <li>Pilih cabang kios dan buat kode undangan unik di bawah.</li>
              <li>Salin <strong>Link Registrasi Mandiri</strong> lalu kirimkan via WhatsApp/Email ke calon staf Anda.</li>
              <li>Karyawan membuka link, mengisi nama & email, lalu merekam sidik jarinya secara mandiri di kios cabang.</li>
              <li>Staf langsung terdaftar aktif di cabang tersebut dan siap melakukan absensi.</li>
            </ol>
          </div>

          {/* Form Create Invitation */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-600" />
                Buat Kode Undangan Baru
              </h4>
            </div>

            <form onSubmit={handleCreateInvitation} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pilih Cabang Kios Tujuan:
                  </label>
                  <select
                    value={selectedKioskId}
                    onChange={(e) => setSelectedKioskId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {kiosks.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama} ({k.kode} - {k.kota})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Custom Kode Undangan (Opsional):
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: INV-GI-STAFF atau kosongkan"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono uppercase text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold bg-rose-50 p-2 rounded-lg border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Generate Kode Undangan
              </button>
            </form>
          </div>

          {/* List of Active Invitations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Store className="w-4 h-4 text-slate-500" />
                Daftar Kode Undangan Cabang ({invitations.length})
              </h4>
            </div>

            {invitations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs">
                Belum ada kode undangan aktif. Silakan buat kode undangan pertama di atas.
              </div>
            ) : (
              <div className="space-y-3">
                {invitations.map((inv) => {
                  const registeredEmployees = employees.filter((e) => e.invitedByCode === inv.code);
                  const isCopied = copiedCode === inv.code;
                  const isCopiedCode = copiedCode === `code-${inv.code}`;

                  return (
                    <div
                      key={inv.id}
                      className={`p-4 rounded-xl border transition-all ${
                        inv.status === 'Aktif'
                          ? 'bg-white border-slate-200 shadow-2xs hover:border-emerald-300'
                          : 'bg-slate-50/80 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            {inv.code}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              inv.status === 'Aktif'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onToggleInvitationStatus(inv.id)}
                            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 border cursor-pointer ${
                              inv.status === 'Aktif'
                                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                            title={inv.status === 'Aktif' ? 'Nonaktifkan kode' : 'Aktifkan kembali kode'}
                          >
                            <Power className="w-3.5 h-3.5" />
                            <span className="text-[11px]">{inv.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteInvitation(inv.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                            title="Hapus undangan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Detail & Quick Actions */}
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Cabang: <strong className="text-slate-800">{inv.kioskNama}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Terdaftar: <strong className="text-slate-800">{inv.usedCount || registeredEmployees.length} Karyawan</strong></span>
                        </div>
                      </div>

                      {/* Shareable Link Input */}
                      <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-50">
                        <input
                          type="text"
                          readOnly
                          value={getInviteUrl(inv.code)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono text-slate-600 select-all"
                        />
                        <button
                          type="button"
                          onClick={() => handleCopyLink(inv.code)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? 'Tersalin!' : 'Salin Link'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyCodeOnly(inv.code)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 cursor-pointer border border-slate-200"
                          title="Salin Kode Saja"
                        >
                          {isCopiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">Kode</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Undangan aktif dapat langsung digunakan calon staf dari perangkat manapun.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
