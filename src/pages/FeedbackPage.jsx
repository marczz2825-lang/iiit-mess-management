import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  MessageSquareHeart, 
  Star, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageCircle, 
  Filter, 
  Smile, 
  Frown, 
  Meh,
  Reply,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

const CATEGORIES = [
  'Food Quality',
  'Hygiene & Cleanliness',
  'Timings & Service',
  'Catering Staff Behavior',
  'Utensils & Water Cooler',
  'Special Diet Request',
];

export default function FeedbackPage() {
  const { role, currentStudent, showToast } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Feedback Form State
  const [formData, setFormData] = useState({
    mealType: 'lunch',
    mealDate: new Date().toISOString().split('T')[0],
    category: 'Food Quality',
    ratings: {
      overall: 5,
      taste: 4,
      hygiene: 4,
      quantity: 5,
    },
    comment: '',
  });

  // Admin Response Modal
  const [respondingTo, setRespondingTo] = useState(null);
  const [adminResponseText, setAdminResponseText] = useState('');
  const [newStatus, setNewStatus] = useState('resolved');

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const data = await api.getFeedback();
      setFeedbackList(data);
    } catch (err) {
      showToast('Error loading feedback', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.comment.trim()) {
      showToast('Please provide your feedback comments or observations.', 'error');
      return;
    }

    try {
      await api.submitFeedback({
        studentId: currentStudent?.id,
        studentName: currentStudent?.name,
        rollNo: currentStudent?.rollNo,
        mealType: formData.mealType,
        mealDate: formData.mealDate,
        category: formData.category,
        ratings: formData.ratings,
        comment: formData.comment,
      });

      confetti({ particleCount: 50, spread: 50 });
      showToast('Thank you! Your feedback has been shared with the Mess Secretary & Warden.', 'success');
      setFormData({
        mealType: 'lunch',
        mealDate: new Date().toISOString().split('T')[0],
        category: 'Food Quality',
        ratings: { overall: 5, taste: 4, hygiene: 4, quantity: 5 },
        comment: '',
      });
      loadFeedback();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAdminRespond = async (e) => {
    e.preventDefault();
    if (!respondingTo) return;

    try {
      await api.respondFeedback(respondingTo.id, adminResponseText, newStatus);
      showToast('Official response recorded and updated successfully!', 'success');
      setRespondingTo(null);
      setAdminResponseText('');
      loadFeedback();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const avgOverall = feedbackList.length > 0 
    ? (feedbackList.reduce((s, f) => s + f.ratings.overall, 0) / feedbackList.length).toFixed(1)
    : '4.5';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Mess Quality Feedback & Grievance Cell
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{avgOverall} / 5.0 Rating</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Student voice matters. Every feedback is audited by the Student Mess Committee and Chief Warden.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Feedback Submission Form (Primarily for Students) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base">Submit Dining Review</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Reviewing as: <strong>{currentStudent?.name}</strong> ({currentStudent?.rollNo})
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Meal Slot</label>
                <select
                  value={formData.mealType}
                  onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="snacks">Snacks</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.mealDate}
                  onChange={(e) => setFormData({ ...formData, mealDate: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Interactive Rating Sliders */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Overall Satisfaction:</span>
                <div className="flex gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormData({ ...formData, ratings: { ...formData.ratings, overall: star } })}
                      className="focus:outline-none"
                    >
                      <Star className={`w-4 h-4 ${star <= formData.ratings.overall ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Taste & Flavor:</span>
                <div className="flex gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormData({ ...formData, ratings: { ...formData.ratings, taste: star } })}
                      className="focus:outline-none"
                    >
                      <Star className={`w-4 h-4 ${star <= formData.ratings.taste ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Hygiene & Cleanliness:</span>
                <div className="flex gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormData({ ...formData, ratings: { ...formData.ratings, hygiene: star } })}
                      className="focus:outline-none"
                    >
                      <Star className={`w-4 h-4 ${star <= formData.ratings.hygiene ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Your Detailed Comments</label>
              <textarea
                rows={3}
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Mention specific dishes, counter number, or suggestions..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
            >
              <Send className="w-4 h-4" />
              <span>Submit Review</span>
            </button>
          </form>
        </div>

        {/* Right 2 Columns: Feed of Reviews & Grievance Thread */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base">Community Feed & Responses</h3>
            <span className="text-xs text-slate-400 font-medium">{feedbackList.length} reviews posted</span>
          </div>

          <div className="space-y-4">
            {feedbackList.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3 card-hover"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{item.studentName}</h4>
                      <span className="font-mono text-xs font-bold text-indigo-600">({item.rollNo})</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 capitalize">{item.mealType} ({item.mealDate})</span>
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                      {item.category}
                    </span>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-extrabold text-xs text-amber-900">{item.ratings.overall}.0</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                  "{item.comment}"
                </p>

                {/* Sub ratings row */}
                <div className="flex flex-wrap gap-3 text-[11px] text-slate-400 pt-1">
                  <span>Taste: <strong className="text-slate-700">{item.ratings.taste}/5</strong></span>
                  <span>•</span>
                  <span>Hygiene: <strong className="text-slate-700">{item.ratings.hygiene}/5</strong></span>
                  <span>•</span>
                  <span>Quantity: <strong className="text-slate-700">{item.ratings.quantity}/5</strong></span>
                  <span>•</span>
                  <span>Status: <strong className="text-indigo-600 uppercase">{item.status}</strong></span>
                </div>

                {/* Admin Official Response */}
                {item.adminResponse ? (
                  <div className="mt-2 p-3 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-900 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Mess Committee / Warden Action:</span>
                    </div>
                    <p className="text-indigo-950 text-xs pl-5 leading-relaxed">{item.adminResponse}</p>
                  </div>
                ) : (
                  role === 'admin' && (
                    <button
                      onClick={() => {
                        setRespondingTo(item);
                        setAdminResponseText('');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 font-bold text-xs transition border border-slate-200"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>Add Official Response</span>
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Admin Response Modal */}
      {respondingTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Respond to Student Grievance</h3>
                <p className="text-xs text-slate-400">Feedback #{respondingTo.id} by {respondingTo.studentName}</p>
              </div>
              <button
                onClick={() => setRespondingTo(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminRespond} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 italic">
                "{respondingTo.comment}"
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Response / Action Taken</label>
                <textarea
                  rows={3}
                  value={adminResponseText}
                  onChange={(e) => setAdminResponseText(e.target.value)}
                  placeholder="e.g. Supervisor has checked the kitchen temperature log and issued warning to caterer..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Resolution Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                >
                  <option value="resolved">Resolved</option>
                  <option value="investigating">Investigating / Inspection Scheduled</option>
                  <option value="acknowledged">Acknowledged by Committee</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRespondingTo(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition"
                >
                  Post Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
