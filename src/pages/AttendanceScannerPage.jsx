import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  ScanLine, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  QrCode, 
  ShieldCheck,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AttendanceScannerPage() {
  const { showToast, allStudents } = useAuth();
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check-in input
  const [rollNo, setRollNo] = useState('');
  const [mealType, setMealType] = useState('lunch');
  const [lastCheckIn, setLastCheckIn] = useState(null);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const data = await api.getAttendance();
      setAttendanceLogs(data);
    } catch (err) {
      showToast('Error loading attendance logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!rollNo.trim()) {
      showToast('Please enter a student Roll Number', 'error');
      return;
    }

    try {
      const res = await api.checkInMeal(rollNo.trim(), mealType);
      confetti({ particleCount: 50, spread: 60 });
      showToast(`✓ Check-in verified for ${res.member.name} (${res.member.rollNo}) - ${mealType.toUpperCase()}!`, 'success');
      setLastCheckIn(res);
      setRollNo('');
      loadAttendance();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const mealCounts = {
    breakfast: attendanceLogs.filter(a => a.mealType === 'breakfast').length,
    lunch: attendanceLogs.filter(a => a.mealType === 'lunch').length,
    snacks: attendanceLogs.filter(a => a.mealType === 'snacks').length,
    dinner: attendanceLogs.filter(a => a.mealType === 'dinner').length,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Meal Turnstile & Attendance Scanner
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Live Gate Entry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Prevent double-swipes and automatically block students on approved rebate leave.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200">
            Total Today: {attendanceLogs.length} Meals Served
          </span>
        </div>
      </div>

      {/* Meal Counter Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Breakfast</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{mealCounts.breakfast}</p>
          <p className="text-[11px] text-slate-400">07:30 - 09:30 AM</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Lunch</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{mealCounts.lunch}</p>
          <p className="text-[11px] text-slate-400">12:30 - 02:30 PM</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Snacks</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{mealCounts.snacks}</p>
          <p className="text-[11px] text-slate-400">05:00 - 06:15 PM</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Dinner</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{mealCounts.dinner}</p>
          <p className="text-[11px] text-slate-400">07:45 - 09:45 PM</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Scanner Terminal */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base">Check-In Terminal</h3>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <form onSubmit={handleCheckIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Current Meal Slot</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-indigo-500"
              >
                <option value="breakfast">Breakfast (07:30 - 09:30 AM)</option>
                <option value="lunch">Lunch (12:30 - 02:30 PM)</option>
                <option value="snacks">Snacks (05:00 - 06:15 PM)</option>
                <option value="dinner">Dinner (07:45 - 09:45 PM)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Student Roll Number (Barcode / QR scan input)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                  placeholder="e.g. B122001 or B122045"
                  className="w-full text-sm font-mono font-bold p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase tracking-wider"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Press Enter or tap "Verify & Punch" to record entry.
              </p>
            </div>

            {/* Quick-test student chips */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Quick-Select Enrolled Students
              </label>
              <div className="flex flex-wrap gap-1.5">
                {allStudents.slice(0, 6).map((stu) => (
                  <button
                    type="button"
                    key={stu.id}
                    onClick={() => setRollNo(stu.rollNo)}
                    className="px-2 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition"
                  >
                    {stu.rollNo}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
            >
              <ScanLine className="w-4 h-4" />
              <span>Verify & Punch Meal</span>
            </button>
          </form>

          {/* Last Check-In Banner */}
          {lastCheckIn && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1 animate-fade-in">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>ENTRY GRANTED</span>
              </div>
              <p className="text-slate-800 font-bold text-sm">
                {lastCheckIn.member.name} ({lastCheckIn.member.rollNo})
              </p>
              <p className="text-slate-600">{lastCheckIn.member.hostel} • Room #{lastCheckIn.member.roomNo}</p>
              <p className="text-emerald-700 font-semibold capitalize">
                Plan: {lastCheckIn.member.planType} • Meal: {lastCheckIn.record.mealType} at {lastCheckIn.record.time}
              </p>
            </div>
          )}
        </div>

        {/* Right 2 Columns: Live Check-in Attendance Logs */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h3 className="font-extrabold text-slate-900 text-base">Today's Dining Hall Entries</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">{attendanceLogs.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-2.5">Roll No</th>
                  <th className="py-2.5">Student Name</th>
                  <th className="py-2.5">Meal Slot</th>
                  <th className="py-2.5">Time</th>
                  <th className="py-2.5 text-right">Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {attendanceLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-slate-50/70">
                    <td className="py-3 font-mono font-bold text-indigo-600">{log.rollNo}</td>
                    <td className="py-3 font-semibold text-slate-900">{log.name}</td>
                    <td className="py-3 capitalize">
                      <span className="px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700">
                        {log.mealType}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 font-medium">{log.time}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        log.planType === 'non-veg' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {log.planType || 'Veg'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
