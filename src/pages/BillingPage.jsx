import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Receipt, 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  CreditCard, 
  FileText, 
  Printer, 
  Search, 
  Sparkles, 
  Check, 
  X,
  QrCode,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ReceiptModal from '../components/ReceiptModal';

export default function BillingPage() {
  const { role, currentStudent, showToast, refreshSession } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pay Modal
  const [payingBill, setPayingBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI (Google Pay / PhonePe)');

  // Receipt Modal
  const [viewReceiptBill, setViewReceiptBill] = useState(null);

  // Generate Month Bill (Admin)
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genMonth, setGenMonth] = useState('December');
  const [genYear, setGenYear] = useState(2026);

  useEffect(() => {
    loadBilling();
  }, [role, currentStudent]);

  const loadBilling = async () => {
    try {
      setLoading(true);
      const studentFilter = role === 'student' ? currentStudent?.id : null;
      const data = await api.getBilling(studentFilter);
      setBills(data);
    } catch (err) {
      showToast('Error loading billing records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!payingBill) return;

    try {
      const res = await api.payBill(payingBill.id, paymentMethod);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      showToast(`Payment of ₹${payingBill.netPayable} for ${payingBill.month} received!`, 'success');
      
      const updatedBill = res.bill;
      setPayingBill(null);
      loadBilling();
      refreshSession();
      // Auto open receipt for the paid bill!
      setViewReceiptBill(updatedBill);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleGenerateBills = async (e) => {
    e.preventDefault();
    try {
      const res = await api.generateBills(genMonth, genYear);
      showToast(`Generated ${res.generatedCount} monthly bills for ${genMonth} ${genYear}!`, 'success');
      setShowGenerateModal(false);
      loadBilling();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredBills = bills.filter((b) => {
    const matchesSearch = b.studentName.toLowerCase().includes(search.toLowerCase()) ||
                          b.rollNo.toLowerCase().includes(search.toLowerCase()) ||
                          b.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCollected = bills.filter(b => b.status === 'paid').reduce((s, b) => s + b.netPayable, 0);
  const totalPending = bills.filter(b => b.status === 'pending' || b.status === 'overdue').reduce((s, b) => s + b.netPayable, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Hostel Mess Billing & Fee Invoices
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              Autumn Term 2026
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official dining fee ledger. Transparent accounting with automated rebate refund deductions.
          </p>
        </div>

        {role === 'admin' && (
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generate Next Month Bills</span>
          </button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {role === 'admin' ? 'Total Fees Collected' : 'Total Paid Dues'}
            </p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              ₹{totalCollected.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {role === 'admin' ? 'Outstanding Dues' : 'Current Outstanding'}
            </p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              ₹{totalPending.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Invoices</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {bills.length} Invoices
            </p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, roll number, or invoice ID..."
            className="w-full text-xs pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'pending', 'paid', 'overdue'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                statusFilter === status
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No billing invoices found</h3>
          <p className="text-xs text-slate-400">All current accounts are up to date.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3 px-4">Invoice ID</th>
                  <th className="py-3 px-4">Student Info</th>
                  <th className="py-3 px-4">Billing Month</th>
                  <th className="py-3 px-4">Base Fee</th>
                  <th className="py-3 px-4">Rebate Deduction</th>
                  <th className="py-3 px-4">Net Payable</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      {bill.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{bill.studentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{bill.rollNo} • {bill.hostel}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {bill.month} {bill.year}
                      <span className="block text-[10px] text-slate-400 uppercase font-medium">{bill.planType}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      ₹{bill.baseAmount.toLocaleString('en-IN')}
                      {bill.guestTokens > 0 && (
                        <span className="block text-[10px] text-slate-400">+₹{bill.guestTokens} guest</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {bill.rebateDeduction > 0 ? (
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                          -₹{bill.rebateDeduction.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-slate-400">₹0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">
                      ₹{bill.netPayable.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        bill.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : bill.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {bill.status === 'paid' && '✓ Paid'}
                        {bill.status === 'pending' && '● Pending'}
                        {bill.status === 'overdue' && '⚠️ Overdue'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {bill.status === 'paid' ? (
                        <button
                          onClick={() => setViewReceiptBill(bill)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition border border-slate-200"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setPayingBill(bill)}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Now</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pay Bill Modal */}
      {payingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Pay Mess Fee</h3>
              </div>
              <button
                onClick={() => setPayingBill(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePay} className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Name:</span>
                  <span className="font-bold text-slate-900">{payingBill.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Roll Number:</span>
                  <span className="font-mono font-bold text-indigo-600">{payingBill.rollNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice Month:</span>
                  <span className="font-semibold text-slate-800">{payingBill.month} {payingBill.year}</span>
                </div>
                {payingBill.rebateDeduction > 0 && (
                  <div className="flex justify-between text-emerald-700 bg-emerald-50/80 p-1.5 rounded-lg font-bold">
                    <span>Approved Rebate Credit:</span>
                    <span>-₹{payingBill.rebateDeduction}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-sm">Total Payable:</span>
                  <span className="text-2xl font-extrabold text-indigo-600">
                    ₹{payingBill.netPayable.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Payment Gateway</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  <option value="UPI (Google Pay / PhonePe)">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="IIIT-BBSR Campus Card">IIIT-BBSR RFID Smart Card Wallet</option>
                  <option value="Debit / Credit Card (RuPay / Visa / Master)">Debit / Credit Card (RuPay / Visa / Master)</option>
                  <option value="Net Banking (SBI / HDFC / ICICI)">Net Banking (SBI / HDFC / Canara)</option>
                  <option value="Cash Paid to Mess Manager">Cash Recorded at Dining Office</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Simulated Secure Payment Gateway. Instant verified e-receipt will be generated.</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingBill(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition"
                >
                  Confirm & Pay ₹{payingBill.netPayable}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Generate Monthly Bills (Admin) */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Generate Monthly Mess Invoices</h3>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateBills} className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                This will automatically compute mess subscriptions, attach approved rebate deductions, and issue pending bills for all registered students.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Billing Month</label>
                <select
                  value={genMonth}
                  onChange={(e) => setGenMonth(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Billing Year</label>
                <input
                  type="number"
                  value={genYear}
                  onChange={(e) => setGenYear(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition"
                >
                  Generate All Bills
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      <ReceiptModal
        bill={viewReceiptBill}
        isOpen={Boolean(viewReceiptBill)}
        onClose={() => setViewReceiptBill(null)}
      />
    </div>
  );
}
