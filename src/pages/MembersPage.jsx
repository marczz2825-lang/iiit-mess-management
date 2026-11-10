import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Trash2, 
  IdCard, 
  Mail, 
  Phone, 
  Building2, 
  X,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import DigitalMessCardModal from '../components/DigitalMessCardModal';

const HOSTELS = [
  'All Hostels',
  'Brahmaputra (BH-1)',
  'Mahanadi (BH-2)',
  'Subarnarekha (BH-3)',
  'Vaitarni (BH-4)',
  'Dhauli (GH-1)',
  'Rushikulya (GH-2)',
];

export default function MembersPage() {
  const { role, showToast, refreshSession } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedHostel, setSelectedHostel] = useState('All Hostels');
  const [selectedPlan, setSelectedPlan] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewCardStudent, setViewCardStudent] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    email: '',
    phone: '',
    hostel: 'Brahmaputra (BH-1)',
    roomNo: '',
    branch: 'Computer Science & Engineering',
    batch: '2024-2028',
    planType: 'non-veg',
  });

  useEffect(() => {
    loadMembers();
  }, [search, selectedHostel, selectedPlan, selectedStatus]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (search) filters.search = search;
      if (selectedHostel !== 'All Hostels') filters.hostel = selectedHostel;
      if (selectedPlan !== 'all') filters.plan = selectedPlan;
      if (selectedStatus !== 'all') filters.status = selectedStatus;

      const data = await api.getMembers(filters);
      setMembers(data);
    } catch (err) {
      showToast('Error loading members', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const added = await api.addMember(formData);
      showToast(`Student ${added.name} (${added.rollNo}) enrolled successfully!`, 'success');
      setShowAddModal(false);
      setFormData({
        name: '',
        rollNo: '',
        email: '',
        phone: '',
        hostel: 'Brahmaputra (BH-1)',
        roomNo: '',
        branch: 'Computer Science & Engineering',
        batch: '2024-2028',
        planType: 'non-veg',
      });
      loadMembers();
      refreshSession();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleStatus = async (member) => {
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    try {
      await api.updateMember(member.id, { status: newStatus });
      showToast(`Updated ${member.name} status to ${newStatus.toUpperCase()}`, 'success');
      loadMembers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteMember = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove student "${name}" from the mess database?`)) return;
    try {
      await api.deleteMember(id);
      showToast(`Member removed successfully`, 'success');
      loadMembers();
      refreshSession();
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
              Hostel Mess Members & Students
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              {members.length} Enrolled
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registered students dining across Brahmaputra, Mahanadi, Subarnarekha, Vaitarni & Girls Hostels.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Member</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student by name, roll no (e.g. B122001), or room..."
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        {/* Hostel Filter */}
        <select
          value={selectedHostel}
          onChange={(e) => setSelectedHostel(e.target.value)}
          className="text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {HOSTELS.map(h => <option key={h} value={h}>{h}</option>)}
        </select>

        {/* Diet Plan Filter */}
        <select
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
          className="text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Dietary Plans</option>
          <option value="veg">Pure Veg Delight</option>
          <option value="non-veg">Non-Veg Special</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Members</option>
          <option value="rebate">On Rebate Leave</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Members Directory Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No members found matching criteria</h3>
          <p className="text-xs text-slate-400">Try adjusting your filters or search term, or click "Add New Member".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between card-hover relative overflow-hidden"
            >
              <div className="space-y-4">
                {/* Header row: Avatar + Roll No */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={member.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                    alt={member.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{member.name}</h3>
                    <p className="text-xs font-mono font-bold text-indigo-600">{member.rollNo}</p>
                    <p className="text-[11px] text-slate-400 truncate">{member.branch}</p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    member.planType === 'non-veg' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                  }`}>
                    {member.planType === 'non-veg' ? '🍗 Non-Veg Plan' : '🥬 Pure Veg'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    member.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : member.status === 'rebate'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {member.status === 'active' ? '● Active' : member.status === 'rebate' ? '🏖️ On Rebate' : 'Inactive'}
                  </span>
                </div>

                {/* Info List */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Building2 className="w-3.5 h-3.5" />
                      Hostel & Room:
                    </span>
                    <span className="font-semibold text-slate-800">{member.hostel} • #{member.roomNo}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Phone className="w-3.5 h-3.5" />
                      Phone:
                    </span>
                    <span className="font-semibold text-slate-800">{member.phone}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setViewCardStudent(member)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition"
                >
                  <IdCard className="w-3.5 h-3.5" />
                  <span>Mess Pass</span>
                </button>

                {role === 'admin' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleStatus(member)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-[11px] font-semibold transition"
                      title="Toggle active status"
                    >
                      {member.status === 'active' ? 'Pause' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id, member.name)}
                      className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition"
                      title="Delete Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add New Member Form */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">Register New Student / Member</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Student Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Chinmaya Pradhan"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Roll Number *</label>
                  <input
                    type="text"
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    placeholder="e.g. B124088"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hostel Residence *</label>
                  <select
                    value={formData.hostel}
                    onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Brahmaputra (BH-1)">Brahmaputra (BH-1)</option>
                    <option value="Mahanadi (BH-2)">Mahanadi (BH-2)</option>
                    <option value="Subarnarekha (BH-3)">Subarnarekha (BH-3)</option>
                    <option value="Vaitarni (BH-4)">Vaitarni (BH-4)</option>
                    <option value="Dhauli (GH-1)">Dhauli (GH-1)</option>
                    <option value="Rushikulya (GH-2)">Rushikulya (GH-2)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Room Number *</label>
                  <input
                    type="text"
                    value={formData.roomNo}
                    onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                    placeholder="e.g. 218"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Academic Department</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="Computer Engineering">CE</option>
                    <option value="Information Technology">IT</option>
                    <option value="Electronics & Telecommunication">ETC</option>
                    <option value="Electrical & Electronics">EEE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mess Plan Option *</label>
                  <select
                    value={formData.planType}
                    onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    <option value="non-veg">🍗 Non-Veg Special (₹4,500/mo)</option>
                    <option value="veg">🥦 Pure Veg Delight (₹3,600/mo)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Institute Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. b124088@iiit-bh.ac.in"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
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
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Digital ID Card */}
      <DigitalMessCardModal
        student={viewCardStudent}
        isOpen={Boolean(viewCardStudent)}
        onClose={() => setViewCardStudent(null)}
      />
    </div>
  );
}
