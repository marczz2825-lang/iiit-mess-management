import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, Download } from 'lucide-react';

export default function ReceiptModal({ bill, isOpen, onClose }) {
  if (!isOpen || !bill) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Top actions bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-100 border-b border-slate-200">
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Official Mess E-Receipt
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-600 text-xs font-semibold flex items-center gap-1 border border-slate-300 transition"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-8 bg-white" id="printable-receipt">
          {/* Header */}
          <div className="text-center border-b pb-5 border-slate-200">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-900 text-amber-400 font-extrabold text-xl mb-2 shadow-sm">
              IIIT
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-wide uppercase">
              International Institute of Information Technology
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Gothapatna, PO: Malipada, Bhubaneswar, Odisha – 751003
            </p>
            <p className="text-xs font-semibold text-indigo-700 mt-1 uppercase tracking-wider">
              Central Hostel & Mess Management Committee
            </p>
          </div>

          {/* Receipt Meta */}
          <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-100 text-xs">
            <div>
              <p className="text-slate-400">Receipt No:</p>
              <p className="font-mono font-bold text-slate-800 text-sm">{bill.id}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400">Billing Month:</p>
              <p className="font-bold text-slate-800 text-sm">{bill.month} {bill.year}</p>
            </div>
            <div>
              <p className="text-slate-400">Student Name:</p>
              <p className="font-bold text-slate-900">{bill.studentName}</p>
              <p className="font-mono text-slate-600">Roll: {bill.rollNo}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400">Hostel & Room:</p>
              <p className="font-semibold text-slate-800">{bill.hostel}</p>
              <p className="text-slate-600">Room #{bill.roomNo}</p>
            </div>
          </div>

          {/* Line items Table */}
          <div className="py-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Billing Breakdown</h4>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-left">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2.5">
                    <span className="font-semibold text-slate-900">Base Mess Subscription Fee</span>
                    <span className="block text-[11px] text-slate-400 capitalize">{bill.planType} Plan</span>
                  </td>
                  <td className="py-2.5 text-right font-medium">₹{bill.baseAmount.toLocaleString('en-IN')}</td>
                </tr>
                {bill.guestTokens > 0 && (
                  <tr>
                    <td className="py-2.5">
                      <span className="font-semibold text-slate-900">Guest / Extra Meal Tokens</span>
                    </td>
                    <td className="py-2.5 text-right font-medium">₹{bill.guestTokens.toLocaleString('en-IN')}</td>
                  </tr>
                )}
                {bill.fine > 0 && (
                  <tr>
                    <td className="py-2.5">
                      <span className="font-semibold text-rose-600">Late Payment Surcharge</span>
                    </td>
                    <td className="py-2.5 text-right font-medium text-rose-600">+₹{bill.fine.toLocaleString('en-IN')}</td>
                  </tr>
                )}
                {bill.rebateDeduction > 0 && (
                  <tr className="text-emerald-700 bg-emerald-50/50">
                    <td className="py-2.5 pl-2">
                      <span className="font-semibold">Approved Mess Rebate / Refund Credit</span>
                      <span className="block text-[11px] text-emerald-600">Deduction for approved leave days</span>
                    </td>
                    <td className="py-2.5 pr-2 text-right font-bold">-₹{bill.rebateDeduction.toLocaleString('en-IN')}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900 text-sm font-bold text-slate-900">
                  <td className="pt-3">Net Total Paid</td>
                  <td className="pt-3 text-right text-indigo-700 text-base">₹{bill.netPayable.toLocaleString('en-IN')}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment & Stamp Details */}
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                PAYMENT CONFIRMED
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Mode: <span className="font-semibold">{bill.paymentMethod || 'Online Gateway'}</span>
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                Txn: {bill.transactionId || 'TXN-IIITB-99210'}
              </p>
              <p className="text-[11px] text-slate-500">
                Date: {bill.paymentDate || new Date().toISOString().split('T')[0]}
              </p>
            </div>
            <div className="text-center pl-4 border-l border-emerald-200">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-600 flex flex-col items-center justify-center text-emerald-800 p-1 rotate-[-8deg] bg-white shadow-sm">
                <span className="text-[9px] font-extrabold uppercase leading-tight">IIIT BBSR</span>
                <span className="text-[8px] font-bold text-emerald-600">SEALED</span>
                <span className="text-[7px]">VERIFIED</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-center text-slate-400 mt-5">
            This is a computer-generated tax invoice. No signature required.
          </p>
        </div>
      </div>
    </div>
  );
}
