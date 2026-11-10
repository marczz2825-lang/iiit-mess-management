import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Users,
  Utensils,
  IndianRupee,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Clock,
  Star,
  Bell,
  ScanLine,
  PlusCircle,
  CreditCard
} from 'lucide-react';

export default function OverviewPage({ setActivePage }) {
  const { role, currentStudent, showToast } = useAuth();
  const [stats, setStats] = useState(null);
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, menuData] = await Promise.all([
        api.getOverview(),
        api.getMenu(),
      ]);
      setStats(statsData);
      setMenu(menuData);
    } catch (err) {
      showToast('Error loading overview data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-500">Loading Central Mess Dashboard...</p>
        </div>
      </div>
    );
  }

  // Get current day name and current meal menu
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[new Date().getDay()];
  const currentMealType = stats.currentMeal ? stats.currentMeal.toLowerCase() : 'lunch';
  const todayMealInfo = menu && menu[todayName] ? menu[todayName][currentMealType] : null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Dining Services • IIIT Bhubaneswar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {role === 'admin' 
              ? `Mess Administration & Control Dashboard` 
              : `Welcome back, ${currentStudent?.name || 'Scholar'}!`}
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            {role === 'admin'
              ? 'Real-time monitoring of hostel dining halls, meal attendance, pricing revisions, and student rebate claims.'
              : `You are enrolled in the ${currentStudent?.planType === 'non-veg' ? '🍗 Non-Veg Delight' : '🥬 Pure Veg'} plan at ${currentStudent?.hostel}. Current status: ${currentStudent?.status?.toUpperCase()}.`}
          </p>

          {/* Quick buttons */}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => setActivePage('menu')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs transition shadow-md"
            >
              <Utensils className="w-4 h-4" />
              <span>Today's Menu ({todayName})</span>
            </button>
            {role === 'student' ? (
              <button
                onClick={() => setActivePage('rebate')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/20 transition backdrop-blur-sm"
              >
                <CalendarDays className="w-4 h-4 text-amber-300" />
                <span>Apply for Mess Rebate</span>
              </button>
            ) : (
              <button
                onClick={() => setActivePage('attendance')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/20 transition backdrop-blur-sm"
              >
                <ScanLine className="w-4 h-4 text-emerald-300" />
                <span>Meal Scanner & Attendance</span>
              </button>
            )}
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-[-50px] bottom-[-50px] w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Members</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">{stats.totalMembers} Students</div>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {stats.activeMembers} currently active
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Meal Session</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">{stats.currentMeal}</div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {stats.todayAttendanceCount} verified check-ins today
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rebate Claims</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">{stats.pendingRebates} Pending</div>
            <button
              onClick={() => setActivePage('rebate')}
              className="text-xs text-indigo-600 font-bold mt-1 flex items-center gap-1 hover:underline"
            >
              <span>{role === 'admin' ? 'Review & Approve' : 'Check rebate policy'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {role === 'admin' ? 'Monthly Revenue' : 'Avg Food Rating'}
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              {role === 'admin' ? <IndianRupee className="w-5 h-5" /> : <Star className="w-5 h-5" />}
            </div>
          </div>
          <div className="mt-3">
            {role === 'admin' ? (
              <>
                <div className="text-2xl font-extrabold text-slate-900">
                  ₹{stats.totalCollected.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  ₹{stats.pendingCollections.toLocaleString('en-IN')} pending
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span>{stats.avgRating}</span>
                  <span className="text-sm text-slate-400 font-normal">/ 5.0</span>
                </div>
                <button
                  onClick={() => setActivePage('feedback')}
                  className="text-xs text-indigo-600 font-bold mt-1 flex items-center gap-1 hover:underline"
                >
                  <span>Submit feedback</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Live Meal + Urgent Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Meal Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <h3 className="font-bold text-slate-900 text-lg">
                  Serving Now: {todayMealInfo ? todayMealInfo.name : stats.currentMeal} ({todayName})
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {todayMealInfo?.time || 'Dining Session Active'} • Central Mess Hall
              </p>
            </div>

            <button
              onClick={() => setActivePage('menu')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Full Week Menu
            </button>
          </div>

          {todayMealInfo ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  todayMealInfo.type === 'veg' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : todayMealInfo.type === 'both' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {todayMealInfo.type === 'veg' ? '🥦 Pure Veg' : todayMealInfo.type === 'both' ? '🍳 Veg & Non-Veg Available' : '🍗 Non-Veg'}
                </span>
                {todayMealInfo.isSpecial && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    ⭐ Special Chef Item
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                  ⚡ ~{todayMealInfo.calories || 650} kcal
                </span>
              </div>

              {/* Meal item list */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Dishes on the counter</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {todayMealInfo.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              No specific meal data found for current slot.
            </div>
          )}

          {/* Quick Action row */}
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setActivePage('feedback')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              Rate this meal / report hygiene
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => setActivePage('pricing')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Buy guest token for friend
            </button>
          </div>
        </div>

        {/* Right 1 Col: Urgent Notices & Quick Contacts */}
        <div className="space-y-6">
          {/* Urgent Notices */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <h4 className="font-bold text-slate-900 text-sm">Mess Notices & Alerts</h4>
              </div>
              <button
                onClick={() => setActivePage('notices')}
                className="text-[11px] font-bold text-indigo-600 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {stats.urgentNotices?.slice(0, 2).map((notice) => (
                <div
                  key={notice.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 line-clamp-1">{notice.title}</span>
                    {notice.priority === 'urgent' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700">
                        URGENT
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {notice.content}
                  </p>
                  <span className="text-[10px] text-slate-400 block pt-1">{notice.date} • {notice.author}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mess Helpdesk / Timings box */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-3xl border border-indigo-100 p-5 text-xs text-indigo-950 space-y-2">
            <h4 className="font-bold text-indigo-900 text-sm">Mess Timings & Helpdesk</h4>
            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span>Breakfast:</span>
                <span className="font-semibold text-slate-800">07:30 AM - 09:30 AM</span>
              </div>
              <div className="flex justify-between">
                <span>Lunch:</span>
                <span className="font-semibold text-slate-800">12:30 PM - 02:30 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Snacks:</span>
                <span className="font-semibold text-slate-800">05:00 PM - 06:15 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Dinner:</span>
                <span className="font-semibold text-slate-800">07:45 PM - 09:45 PM</span>
              </div>
            </div>
            <div className="pt-2 border-t border-indigo-200/60 text-[10px] text-indigo-700 font-semibold">
              Emergency Mess Warden: +91 94370 12345
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
