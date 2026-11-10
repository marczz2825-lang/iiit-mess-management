import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  UtensilsCrossed, 
  ShieldCheck, 
  UserCheck, 
  IdCard, 
  Bell, 
  Menu as MenuIcon, 
  X,
  ChevronDown
} from 'lucide-react';
import DigitalMessCardModal from './DigitalMessCardModal';

export default function Navbar({ onToggleSidebar, activePage }) {
  const { role, currentStudent, allStudents, switchRole } = useAuth();
  const [showIdCard, setShowIdCard] = useState(false);
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Mobile Toggle + Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              >
                <MenuIcon className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-900 via-blue-800 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-900/20">
                  <UtensilsCrossed className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                      IIIT-BBSR <span className="text-indigo-600">MessMate</span>
                    </span>
                    <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
                      Campus Dining
                    </span>
                  </div>
                  <p className="hidden md:block text-[11px] text-slate-400 font-medium">
                    International Institute of Information Technology, Bhubaneswar
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Role Switcher & Student Selector */}
            <div className="flex items-center gap-2 sm:gap-4">
              
              {/* Role Toggle Pill */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                <button
                  onClick={() => switchRole('student')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    role === 'student'
                      ? 'bg-white text-indigo-700 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Student</span>
                </button>
                <button
                  onClick={() => switchRole('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    role === 'admin'
                      ? 'bg-indigo-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mess Manager</span>
                </button>
              </div>

              {/* Student View Options (Active Student Switcher & ID Card) */}
              {role === 'student' && currentStudent && (
                <div className="flex items-center gap-2">
                  {/* Digital ID Card Button */}
                  <button
                    onClick={() => setShowIdCard(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200/80 transition shadow-sm"
                  >
                    <IdCard className="w-4 h-4 text-indigo-600" />
                    <span className="hidden md:inline">Digital Pass</span>
                  </button>

                  {/* Student Switcher Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setStudentDropdownOpen(!studentDropdownOpen)}
                      className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-sm transition"
                    >
                      <img
                        src={currentStudent.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                        alt={currentStudent.name}
                        className="w-6 h-6 rounded-lg object-cover border border-slate-300 shrink-0"
                      />
                      <span className="hidden lg:inline font-bold truncate max-w-[120px]">
                        {currentStudent.name.split(' ')[0]} ({currentStudent.rollNo})
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {studentDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
                        <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Switch Student Demo Profile
                        </div>
                        <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                          {allStudents.map(stu => (
                            <button
                              key={stu.id}
                              onClick={() => {
                                switchRole('student', stu.id);
                                setStudentDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-indigo-50 transition ${
                                stu.id === currentStudent.id ? 'bg-indigo-50/70 font-bold text-indigo-700' : 'text-slate-700'
                              }`}
                            >
                              <img
                                src={stu.avatar}
                                alt={stu.name}
                                className="w-7 h-7 rounded-lg object-cover"
                              />
                              <div className="truncate">
                                <p className="font-semibold truncate">{stu.name}</p>
                                <p className="text-[10px] text-slate-400">{stu.rollNo} • {stu.hostel}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Profile Badge */}
              {role === 'admin' && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Mess Supervisor</span>
                </div>
              )}

            </div>
          </div>
        </div>
      </header>

      {/* Digital Mess Card Modal */}
      <DigitalMessCardModal
        student={currentStudent}
        isOpen={showIdCard}
        onClose={() => setShowIdCard(false)}
      />
    </>
  );
}
