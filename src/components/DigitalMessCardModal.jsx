import React from 'react';
import { X, QrCode, ShieldCheck, Printer, CheckCircle, Clock } from 'lucide-react';

export default function DigitalMessCardModal({ student, isOpen, onClose }) {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 font-extrabold flex items-center justify-center text-xl shadow-md">
              IIIT
            </div>
            <div>
              <h3 className="font-bold text-base tracking-wide leading-tight">IIIT BHUBANESWAR</h3>
              <p className="text-xs text-indigo-200 uppercase tracking-widest font-semibold">Central Dining Hall Pass</p>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 bg-slate-50/70">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            {/* Top row: Avatar & Basic info */}
            <div className="flex items-start gap-4">
              <img
                src={student.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                alt={student.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500 shadow-sm shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-lg leading-tight truncate">{student.name}</h4>
                </div>
                <p className="text-xs font-mono font-bold text-indigo-600 mt-0.5 tracking-wider">
                  ROLL: {student.rollNo}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                    student.planType === 'non-veg' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {student.planType === 'non-veg' ? '🍗 Non-Veg Plan' : '🥬 Pure Veg Plan'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                    student.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : student.status === 'rebate' 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {student.status === 'active' ? '● Active' : student.status === 'rebate' ? '🏖️ On Rebate' : 'Deactivated'}
                  </span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Hostel & Room</span>
                <span className="font-semibold text-slate-800">{student.hostel} - #{student.roomNo}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Academic Dept</span>
                <span className="font-semibold text-slate-800 truncate block">{student.branch || 'B.Tech'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Batch</span>
                <span className="font-semibold text-slate-800">{student.batch || '2024-2028'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Dining Slot</span>
                <span className="font-semibold text-slate-800">Mess Hall A & B</span>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="mt-5 pt-4 border-t border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50/50 rounded-xl p-4 text-center">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
                {/* SVG simulated QR Code */}
                <svg className="w-28 h-28 text-slate-800" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M0,0 h30 v30 h-30 z M5,5 v20 h20 v-20 z M10,10 h10 v10 h-10 z" />
                  <path d="M70,0 h30 v30 h-30 z M75,5 v20 h20 v-20 z M80,10 h10 v10 h-10 z" />
                  <path d="M0,70 h30 v30 h-30 z M5,75 v20 h20 v-20 z M10,80 h10 v10 h-10 z" />
                  <rect x="40" y="10" width="10" height="20" />
                  <rect x="55" y="5" width="10" height="10" />
                  <rect x="40" y="40" width="20" height="20" />
                  <rect x="10" y="40" width="10" height="15" />
                  <rect x="70" y="45" width="25" height="10" />
                  <rect x="45" y="70" width="10" height="25" />
                  <rect x="70" y="70" width="15" height="10" />
                  <rect x="70" y="85" width="25" height="10" />
                </svg>
              </div>
              <p className="text-xs font-mono font-medium text-slate-500 mt-2">
                UID: IIIT-BBSR-{student.rollNo}-2026
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Scan this at the mess turnstile or present roll number
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              Print Card
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
