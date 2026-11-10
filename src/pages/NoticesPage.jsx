import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  BellRing, 
  PlusCircle, 
  Trash2, 
  Calendar, 
  UserCheck, 
  AlertCircle, 
  Sparkles, 
  Info,
  X
} from 'lucide-react';

export default function NoticesPage() {
  const { role, showToast } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Notice Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    author: 'Hostel & Mess Warden Office',
  });

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      setLoading(true);
      const data = await api.getNotices();
      setNotices(data);
    } catch (err) {
      showToast('Error loading notices', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      await api.addNotice(formData);
      showToast('New announcement posted to student bulletin board!', 'success');
      setShowAddModal(false);
      setFormData({
        title: '',
        content: '',
        priority: 'normal',
        author: 'Hostel & Mess Warden Office',
      });
      loadNotices();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Delete this announcement from the notice board?')) return;
    try {
      await api.deleteNotice(id);
      showToast('Announcement removed', 'success');
      loadNotices();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Hostel Mess Notices & Announcements
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              Official Bulletins
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official communication from the Chief Warden, Mess Committee Convener, and Kitchen Supervisor.
          </p>
        </div>

        {role === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Announcement</span>
          </button>
        )}
      </div>

      {/* Notices Feed */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <BellRing className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No active announcements</h3>
          <p className="text-xs text-slate-400">All hostel notices will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className={`bg-white rounded-3xl border p-6 shadow-xs space-y-3 transition card-hover ${
                notice.priority === 'urgent'
                  ? 'border-rose-300 ring-2 ring-rose-100/70'
                  : 'border-slate-200/80'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      notice.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-800'
                        : notice.priority === 'normal'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {notice.priority}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {notice.date}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">{notice.title}</h3>
                </div>

                {role === 'admin' && (
                  <button
                    onClick={() => handleDeleteNotice(notice.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {notice.content}
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Issued by: {notice.author}</span>
                <span className="text-[11px] text-slate-400">IIIT Bhubaneswar Campus</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Post New Announcement */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Post Central Mess Notice</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notice Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Grand Festive Feast on Upcoming Friday"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  >
                    <option value="normal">Normal Announcement</option>
                    <option value="urgent">Urgent / Important Alert</option>
                    <option value="info">General Information</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Issuing Authority</label>
                  <select
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  >
                    <option value="Hostel & Mess Warden Office">Chief Warden Office</option>
                    <option value="Mess Committee Convener">Mess Committee Convener</option>
                    <option value="Kitchen Head Supervisor">Kitchen Supervisor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Announcement Body *</label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Type the full notice content, instructions, dates, or guidelines..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
