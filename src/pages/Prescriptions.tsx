import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTitle } from '../hooks';
import { prescriptionService } from '../services';
import { Pill, FileText, Search, X } from 'lucide-react';

type PrescriptionItem = {
  _id: string;
  doctorName: string;
  specialty: string;
  hospital: string;
  issueDate: string;
  diagnosis: string;
  notes?: string;
  medicines: Array<{ name: string; dosage?: string; frequency?: string; duration?: string; instructions?: string }> | string;
};

export default function Prescriptions() {
  useTitle('My Prescriptions');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [active, setActive] = useState<PrescriptionItem | null>(null);
  const [shareEmail, setShareEmail] = useState('');

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await prescriptionService.getMyPrescriptions();
      if (response.success) {
        setPrescriptions((response.data as unknown as PrescriptionItem[]) || []);
      } else {
        toast.error(response.message || 'Failed to load prescriptions');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return prescriptions;
    const q = searchTerm.toLowerCase();
    return prescriptions.filter((p) =>
      [p.doctorName, p.specialty, p.hospital, p.diagnosis].join(' ').toLowerCase().includes(q)
    );
  }, [prescriptions, searchTerm]);

  const handleOpen = async (id: string) => {
    try {
      const response = await prescriptionService.getPrescriptionById(id);
      if (!response.success) {
        toast.error('Failed to load details');
        return;
      }

      setActive(response.data as unknown as PrescriptionItem);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load details');
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const blob = await prescriptionService.downloadPrescription(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prescription-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Prescription downloaded');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Download failed');
    }
  };

  const handlePrint = (item: PrescriptionItem) => {
    const popup = window.open('', '_blank', 'width=900,height=700');
    if (!popup) {
      toast.error('Please allow popups to print prescription');
      return;
    }

    const medicineHtml = (item.medicines || [])
      .map((m, idx) => `
        <li>
          <strong>${idx + 1}. ${m.name || 'Medicine'}</strong><br/>
          <span>${[m.dosage, m.frequency, m.duration].filter(Boolean).join(' | ') || 'As advised'}</span>
          ${m.instructions ? `<div>Instructions: ${m.instructions}</div>` : ''}
        </li>
      `)
      .join('');

    popup.document.write(`
      <html>
        <head>
          <title>Prescription ${item._id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
            h1 { margin: 0 0 8px; font-size: 28px; }
            .muted { color: #555; font-size: 13px; }
            .card { border: 1px solid #ddd; border-radius: 10px; padding: 14px 16px; margin-top: 16px; }
            ul { margin: 8px 0 0 18px; padding: 0; }
            li { margin-bottom: 8px; }
            .footer { margin-top: 28px; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <h1>MediGuide Prescription</h1>
          <div class="muted">Prescription ID: ${item._id}</div>
          <div class="muted">Issued: ${new Date(item.issueDate).toLocaleString('en-IN')}</div>

          <div class="card">
            <div><strong>Doctor:</strong> ${item.doctorName}</div>
            <div><strong>Specialty:</strong> ${item.specialty || '-'}</div>
            <div><strong>Hospital:</strong> ${item.hospital || '-'}</div>
          </div>

          <div class="card">
            <strong>Diagnosis</strong>
            <div>${item.diagnosis || '-'}</div>
          </div>

          <div class="card">
            <strong>Medicines</strong>
            ${medicineHtml ? `<ul>${medicineHtml}</ul>` : '<div>No medicines listed.</div>'}
          </div>

          <div class="card">
            <strong>Doctor Notes</strong>
            <div>${item.notes || '-'}</div>
          </div>

          <div class="footer">Generated from MediGuide patient portal</div>

          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    popup.document.close();
  };

  const handleShare = async (id: string) => {
    if (!shareEmail.trim()) {
      toast.error('Enter email to share');
      return;
    }

    try {
      const response = await prescriptionService.sharePrescription(id, shareEmail.trim());
      if (response.success) {
        toast.success(response.message || 'Shared successfully');
      } else {
        toast.error(response.message || 'Share failed');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Share failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-gradient-to-r from-primary-700 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-2 inline-flex items-center gap-3">
            <Pill className="w-9 h-9" /> My Prescriptions
          </h1>
          <p className="text-white text-opacity-90">View treatment notes, medicines, and follow-up instructions</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Search Prescriptions</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by doctor, specialty, diagnosis..."
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center text-gray-600">Loading prescriptions...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
            <FileText className="w-14 h-14 text-gray-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Prescriptions Yet</h3>
            <p className="text-gray-600">Prescriptions will appear here after doctor consultation and issuance.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((p) => (
              <div key={p._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <div>
                    <p className="font-bold text-gray-900">{p.doctorName}</p>
                    <p className="text-sm text-gray-600">{p.specialty}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Hospital</p>
                    <p className="text-sm text-gray-800">{p.hospital || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Issued</p>
                    <p className="text-sm text-gray-800">{new Date(p.issueDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Diagnosis</p>
                    <p className="text-sm text-gray-800 line-clamp-2">{p.diagnosis || '-'}</p>
                  </div>
                  <div className="flex gap-2 md:justify-end">
                    <button onClick={() => handleOpen(p._id)} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold">View</button>
                    <button onClick={() => handleDownload(p._id)} className="px-3 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold">Download</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {active ? (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Prescription Details</h3>
                <p className="text-sm text-gray-600">Dr. {active.doctorName} • {active.specialty}</p>
              </div>
              <button onClick={() => setActive(null)} className="text-gray-500 hover:text-gray-700" aria-label="Close details">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase text-gray-500">Diagnosis</p>
                <p className="text-gray-900">{active.diagnosis || '-'}</p>
              </div>

              <div className="mb-4">
                <p className="text-xs uppercase text-gray-500 mb-1">Medicines</p>
                {Array.isArray(active.medicines) && active.medicines.length > 0 ? (
                  <ul className="space-y-2">
                    {active.medicines.map((m, idx) => (
                      <li key={`${m.name}-${idx}`} className="border border-indigo-100 bg-indigo-50/50 rounded-xl p-3">
                        <p className="font-semibold text-indigo-900">{m.name}</p>
                        <p className="text-sm text-indigo-700">{[m.dosage, m.frequency, m.duration].filter(Boolean).join(' • ') || 'As advised'}</p>
                        {m.instructions ? <p className="text-sm text-indigo-600 mt-1">{m.instructions}</p> : null}
                      </li>
                    ))}
                  </ul>
                ) : typeof active.medicines === 'string' && active.medicines.trim() ? (
                  <div className="border border-indigo-100 bg-indigo-50/50 rounded-xl p-4">
                    <p className="text-sm text-indigo-900 whitespace-pre-line leading-relaxed">{active.medicines}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No medicines listed.</p>
                )}
              </div>

              <div className="mb-4">
                <p className="text-xs uppercase text-gray-500 mb-1">Doctor Notes</p>
                <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4">
                  <p className="text-sm text-orange-900 whitespace-pre-line">{active.notes || 'No additional notes.'}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-5">
                <div className="flex flex-wrap gap-3 mb-4">
                  <button onClick={() => handleDownload(active._id)} className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold flex items-center justify-center gap-2 shadow-sm">
                    <FileText className="w-4 h-4" /> Download PDF
                  </button>
                  <button onClick={() => handlePrint(active)} className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 transition-colors text-white font-semibold shadow-sm">Print</button>
                </div>
                <p className="text-sm font-semibold text-gray-800 mb-2">Share Prescription</p>
                <div className="flex gap-2">
                  <input
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="Enter email"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <button onClick={() => handleShare(active._id)} className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold">Share</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
