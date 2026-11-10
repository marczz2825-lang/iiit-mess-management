import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Utensils,
  IndianRupee,
  Users,
  CalendarDays,
  Receipt,
  ScanLine,
  MessageSquareHeart,
  BellRing,
  Sparkles,
  Info
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, isOpen, onClose }) {
  const { role } = useAuth();

  const navigation = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'menu', name: 'Menu & Meals', icon: Utensils, badge: 'Live' },
    { id: 'pricing', name: 'Pricing & Plans', icon: IndianRupee, badge: null },
    { id: 'members', name: 'Members & Students', icon: Users, badge: null },
    { id: 'rebate', name: 'Rebate & Refund', icon: CalendarDays, badge: 'Crucial' },
    { id: 'billing', name: 'Billing & Ledger', icon: Receipt, badge: null },
    { id: 'attendance', name: 'Meal Check-in / Scan', icon: ScanLine, badge: null },
    { id: 'feedback', name: 'Feedback & Reviews', icon: MessageSquareHeart, badge: null },
    { id: 'notices', name: 'Notices & Bulletins', icon: BellRing, badge: null },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Active Mode Banner */}
          <div className={`p-3.5 rounded-2xl border text-xs ${
            role === 'admin' 
              ? 'bg-amber-50/60 border-amber-200 text-amber-900' 
              : 'bg-indigo-50/60 border-indigo-200 text-indigo-900'
          }`}>
            <div className="flex items-center gap-2 font-bold mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{role === 'admin' ? 'Manager Control Center' : 'Student Self-Service'}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {role === 'admin'
                ? 'Full privileges: Edit menus, approve rebates, manage pricing & members.'
                : 'Check daily food, file rebate claims, pay monthly bills & submit meal reviews.'}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Management Modules
            </p>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : item.badge === 'Live' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px]">IIIT Bhubaneswar Mess Portal v2.0</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Full-Stack IWT System • Easy Deploy
          </p>
        </div>
      </aside>
    </>
  );
}
