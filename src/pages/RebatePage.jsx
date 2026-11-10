import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  CalendarDays, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Filter, 
  ShieldCheck, 
  Info,
  Calendar,
  X,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RebatePage() {
  const { role, currentStudent, showToast, refreshSession } = useAuth();
  const [rebates, setRebates] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState('all');

  // Apply Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reasonCategory: 'Academic Leave',
    description: '',
  });

  // Admin Review Modal
  const [reviewingRebate, setReviewingRebate] = useState(null);
  const [adminComment, setAdminComment] = useState('');

  useEffect(() => {
    loadData();
  }, [role, currentStudent]);

  const loadData = async () => {
    try {
      setLoading(true);
      const studentFilter = role === 'student' ? currentStudent?.id : null;
      const [rebatesData, pricingData] = await Promise.all([
        api.getRebates(studentFilter),
        api.getPricing(),
      ]);
      setRebates(rebatesData);
      setPricing(pricingData.pricing);
    } catch (err) {
      showToast('Error loading rebates', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper to calculate days between dates
  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    if (e < s) return 0;
    const diff = Math.abs(e - s);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const selectedDays = calculateDays(formData.startDate, formData.endDate);
  const dailyRate = pricing?.rebateDailyRate || 85;
  const estimatedRefund = selectedDays * dailyRate;

  const handleApply = async (e) => {
    e.preventDefault();
    if (selectedDays < (pricing?.minRebateDays || 3)) {
      showToast(`Minimum ${pricing?.minRebateDays || 3} consecutive days required for mess rebate approval.`, 'error');
      return;
    }

    try {
      await api.applyRebate({
        studentId: currentStudent?.id,
        studentName: currentStudent?.name,
        rollNo: currentStudent?.rollNo,
        hostel: currentStudent?.hostel,
        roomNo: currentStudent?.roomNo,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reasonCategory: formData.reasonCategory,
        description: formData.description,
      });

      confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } });
      showToast('Rebate application submitted to Mess Warden successfully!', 'success');
      setShowApplyModal(false);
      setFormData({ startDate: '', endDate: '', reasonCategory: 'Academic Leave', description: '' });
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.updateRebateStatus(id, status, adminComment);
      showToast(`Rebate application marked as ${status.toUpperCase()}!`, 'success');
      setReviewingRebate(null);
      setAdminComment('');
      loadData();
      refreshSession();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredRebates = rebates.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Mess Rebate & Refund Management
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
              ₹{dailyRate}/day Subsidized Credit
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Apply for dining fee deductions during official leave, hackathons, medical leaves, or vacations.
          </p>
        </div>

        {role === 'student' ? (
          <button
            onClick={() => setShowApplyModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Apply for Rebate</span>
          </button>
        ) : (
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200">
            Manager Review Panel ({rebates.filter(r => r.status === 'pending').length} pending)
          </span>
        )}
      </div>

      {/* Rebate Policy Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">Minimum 3 Days Required</h4>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Single-day absences are not eligible as per IIIT Bhubaneswar Mess Bylaw Sec 4.2.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">Auto-Deduction on Bill</h4>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Approved rebate credits are automatically subtracted from your next monthly mess invoice.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">Prior Notice Policy</h4>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Submit at least 24 hours prior to leave start date to facilitate raw-material planning.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'pending', 'approved', 'rejected'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
              statusFilter === st
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {st} ({st === 'all' ? rebates.length : rebates.filter(r => r.status === st).length})
          </button>
        ))}
      </div>

      {/* Rebates List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredRebates.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <CalendarDays className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No rebate applications found</h3>
          <p className="text-xs text-slate-400">
            {role === 'student' ? 'Click "Apply for Rebate" to submit a leave refund request.' : 'No pending rebate requests in this category.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRebates.map((rebate) => (
            <div
              key={rebate.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 card-hover"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {rebate.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    rebate.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : rebate.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {rebate.status === 'approved' && '✓ Approved'}
                    {rebate.status === 'pending' && '⏳ Pending Review'}
                    {rebate.status === 'rejected' && '✕ Rejected'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                    {rebate.reasonCategory}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {rebate.studentName} ({rebate.rollNo}) • {rebate.hostel} #{rebate.roomNo}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {rebate.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {rebate.startDate} to {rebate.endDate} ({rebate.durationDays} Days)
                  </span>
                  <span>•</span>
                  <span>Applied on: {rebate.appliedDate}</span>
                </div>

                {rebate.adminComment && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    <strong className="text-slate-800">Mess Warden Note:</strong> {rebate.adminComment}
                  </div>
                )}
              </div>

              {/* Amount & Admin Actions */}
              <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 gap-3">
                <div className="text-left md:text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Rebate Credit
                  </span>
                  <span className="text-xl font-extrabold text-emerald-600">
                    ₹{rebate.amount}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    ({rebate.durationDays} days × ₹{rebate.dailyRate})
                  </span>
                </div>

                {role === 'admin' && rebate.status === 'pending' && (
                  <button
                    onClick={() => setReviewingRebate(rebate)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-sm"
                  >
                    Review Claim
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Apply for Rebate */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Submit Mess Rebate Application</h3>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="p-6 space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p>
                  Applying as <strong>{currentStudent?.name}</strong> ({currentStudent?.rollNo}).
                  Rebate credit of <strong>₹{dailyRate}/day</strong> will be granted upon approval. Minimum {pricing?.minRebateDays || 3} days.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Leave Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Leave End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason Category *</label>
                <select
                  value={formData.reasonCategory}
                  onChange={(e) => setFormData({ ...formData, reasonCategory: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Academic Leave">Academic Leave (SIH / Hackathon / Conference)</option>
                  <option value="Internship">Internship / Industry Visit</option>
                  <option value="Medical">Medical / Hospitalization</option>
                  <option value="Home Visit">Home Visit / Family Occasion</option>
                  <option value="Vacation">Semester Vacation Break</option>
                  <option value="Sports/Cultural">Sports / Cultural Fest Representation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Proof Notes *</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="State your reason and mention Dean approval or leave slip reference..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  required
                />
              </div>

              {/* Live Calculator preview */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block">Total Leave Duration:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {selectedDays > 0 ? `${selectedDays} Continuous Days` : 'Select dates'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Estimated Rebate Refund:</span>
                  <span className="font-extrabold text-base text-emerald-600">
                    ₹{estimatedRefund > 0 ? estimatedRefund : 0}
                  </span>
                </div>
              </div>

              {selectedDays > 0 && selectedDays < (pricing?.minRebateDays || 3) && (
                <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Duration is less than the required minimum {pricing?.minRebateDays || 3} days.</span>
                </p>
              )}

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedDays < (pricing?.minRebateDays || 3)}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md transition"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Admin Review Rebate */}
      {reviewingRebate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Review Rebate Application</h3>
                <p className="text-xs text-slate-400">Application #{reviewingRebate.id}</p>
              </div>
              <button
                onClick={() => setReviewingRebate(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <p className="font-bold text-slate-900 text-sm">
                  {reviewingRebate.studentName} ({reviewingRebate.rollNo})
                </p>
                <p className="text-slate-600">{reviewingRebate.hostel} - #{reviewingRebate.roomNo}</p>
                <p className="text-slate-700 pt-1 font-medium">{reviewingRebate.description}</p>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold">
                  <span>{reviewingRebate.startDate} to {reviewingRebate.endDate}</span>
                  <span className="text-emerald-700">₹{reviewingRebate.amount} ({reviewingRebate.durationDays}d)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Warden / Manager Decision Comment
                </label>
                <input
                  type="text"
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="e.g. Approved as per academic leave slip #AC-992."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleStatusUpdate(reviewingRebate.id, 'rejected')}
                  className="flex-1 py-2.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition"
                >
                  ✕ Reject Claim
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusUpdate(reviewingRebate.id, 'approved')}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition"
                >
                  ✓ Approve & Credit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
