import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  IndianRupee, 
  CheckCircle2, 
  Sparkles, 
  CreditCard, 
  Ticket, 
  Edit2, 
  Check, 
  X,
  ShieldAlert,
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PricingPage() {
  const { role, showToast } = useAuth();
  const [pricingData, setPricingData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Guest Token Buy Form Modal
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenForm, setTokenForm] = useState({
    buyerName: '',
    mealType: 'lunch',
    date: new Date().toISOString().split('T')[0],
  });

  // Manager Edit Pricing Modal
  const [showEditPricing, setShowEditPricing] = useState(false);
  const [editPriceForm, setEditPriceForm] = useState({
    monthlyVeg: 3600,
    monthlyNonVeg: 4500,
    rebateDailyRate: 85,
    breakfast: 40,
    lunch: 75,
    snacks: 30,
    dinner: 75,
  });

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    try {
      setLoading(true);
      const data = await api.getPricing();
      setPricingData(data);
      if (data.pricing) {
        setEditPriceForm({
          monthlyVeg: data.pricing.monthlyVeg || 3600,
          monthlyNonVeg: data.pricing.monthlyNonVeg || 4500,
          rebateDailyRate: data.pricing.rebateDailyRate || 85,
          breakfast: data.pricing.perMeal?.breakfast || 40,
          lunch: data.pricing.perMeal?.lunch || 75,
          snacks: data.pricing.perMeal?.snacks || 30,
          dinner: data.pricing.perMeal?.dinner || 75,
        });
      }
    } catch (err) {
      showToast('Error loading pricing information', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyToken = async (e) => {
    e.preventDefault();
    try {
      const price = pricingData.pricing.perMeal[tokenForm.mealType] || 75;
      const newToken = await api.buyGuestToken({
        buyerName: tokenForm.buyerName || 'Campus Visitor',
        mealType: tokenForm.mealType,
        date: tokenForm.date,
        price,
      });

      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      showToast(`Guest Token #${newToken.id} generated successfully for ₹${price}!`, 'success');
      setShowTokenModal(false);
      setTokenForm({ buyerName: '', mealType: 'lunch', date: new Date().toISOString().split('T')[0] });
      loadPricing();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSavePricing = async (e) => {
    e.preventDefault();
    try {
      await api.updatePricing({
        monthlyVeg: Number(editPriceForm.monthlyVeg),
        monthlyNonVeg: Number(editPriceForm.monthlyNonVeg),
        rebateDailyRate: Number(editPriceForm.rebateDailyRate),
        perMeal: {
          breakfast: Number(editPriceForm.breakfast),
          lunch: Number(editPriceForm.lunch),
          snacks: Number(editPriceForm.snacks),
          dinner: Number(editPriceForm.dinner),
        },
      });

      showToast('Mess tariff and pricing schedule updated successfully!', 'success');
      setShowEditPricing(false);
      loadPricing();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading || !pricingData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-500">Loading Tariff Schedules...</p>
        </div>
      </div>
    );
  }

  const { pricing, guestTokens } = pricingData;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Mess Tariff & Subscription Pricing
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Subsidized Rates
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Approved by the IIIT Bhubaneswar Hostel & Mess Committee. Transparent rates with auto-rebate deductions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {role === 'admin' && (
            <button
              onClick={() => setShowEditPricing(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Modify Tariff</span>
            </button>
          )}

          <button
            onClick={() => setShowTokenModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Generate Guest Token</span>
          </button>
        </div>
      </div>

      {/* Main Subscription Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Tier 1: Veg Delight Plan */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between card-hover relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                🥦 Pure Veg Delight
              </span>
              <span className="text-xs font-medium text-slate-400">Regular Plan</span>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900">
                  ₹{pricing.monthlyVeg.toLocaleString('en-IN')}
                </span>
                <span className="text-sm font-semibold text-slate-500">/ month</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Subsidized student rate: approx ₹{Math.round(pricing.monthlyVeg / 30)}/day for 4 full meals daily.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Unlimited Breakfast, Lunch, Snacks & Dinner</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Paneer / Mushroom / Kofta dishes thrice weekly</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Odia festive sweets (Chhena Poda, Rasgulla, Kheer)</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Eligible for <strong>₹{pricing.rebateDailyRate}/day rebate credit</strong> during approved leaves</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-400">Billed automatically on 1st of every month.</div>
          </div>
        </div>

        {/* Tier 2: Non-Veg Special Plan */}
        <div className="bg-white rounded-3xl border-2 border-indigo-600 p-6 shadow-md flex flex-col justify-between card-hover relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-1 rounded-bl-xl">
            Popular Choice
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 uppercase tracking-wider">
                🍗 Non-Veg Special
              </span>
              <span className="text-xs font-medium text-slate-400">4x Non-Veg / Week</span>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900">
                  ₹{pricing.monthlyNonVeg.toLocaleString('en-IN')}
                </span>
                <span className="text-sm font-semibold text-slate-500">/ month</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Includes all vegetarian delicacies plus 4 dedicated non-veg feasts weekly.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Everything in Veg Delight included</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Desi Chicken Curry (Friday Lunch)</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Rohu Fish Besara / Egg Curry (Wednesday Lunch & Monday Dinner)</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Grand Sunday Hyderabadi Chicken Biryani Feast</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Eligible for <strong>₹{pricing.rebateDailyRate}/day rebate credit</strong> during approved leaves</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-400">Directly applied to monthly hostel billing ledger.</div>
          </div>
        </div>

      </div>

      {/* Per-Meal Casual / Guest Rates */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">
              Per-Meal Casual & Guest Token Pricing
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Available for day scholars, visiting parents, faculty members, and campus guests.
            </p>
          </div>
          <button
            onClick={() => setShowTokenModal(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition border border-indigo-200"
          >
            Buy Token
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Breakfast</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">₹{pricing.perMeal.breakfast}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">07:30 - 09:30 AM</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Lunch</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">₹{pricing.perMeal.lunch}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">12:30 - 02:30 PM</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Evening Snacks</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">₹{pricing.perMeal.snacks}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">05:00 - 06:15 PM</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Dinner</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">₹{pricing.perMeal.dinner}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">07:45 - 09:45 PM</p>
          </div>
        </div>
      </div>

      {/* Guest Tokens History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-indigo-600" />
            <h3 className="font-extrabold text-slate-900 text-base">Recently Issued Guest Tokens</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {guestTokens?.length || 0} tokens generated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-2.5">Token ID</th>
                <th className="py-2.5">Visitor / Student Name</th>
                <th className="py-2.5">Meal Slot</th>
                <th className="py-2.5">Date</th>
                <th className="py-2.5">Amount</th>
                <th className="py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {guestTokens?.map((token) => (
                <tr key={token.id} className="hover:bg-slate-50/70">
                  <td className="py-3 font-mono font-bold text-indigo-600">{token.id}</td>
                  <td className="py-3 font-semibold text-slate-900">{token.buyerName}</td>
                  <td className="py-3 capitalize">{token.mealType}</td>
                  <td className="py-3 text-slate-500">{token.date}</td>
                  <td className="py-3 font-bold text-slate-900">₹{token.price}</td>
                  <td className="py-3 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      token.status === 'valid' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {token.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Buy Guest Token */}
      {showTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Generate Guest Meal Token</h3>
              </div>
              <button
                onClick={() => setShowTokenModal(false)}
                className="p-1 rounded-lg hover:bg-indigo-800 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBuyToken} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Visitor / Buyer Name</label>
                <input
                  type="text"
                  value={tokenForm.buyerName}
                  onChange={(e) => setTokenForm({ ...tokenForm, buyerName: e.target.value })}
                  placeholder="e.g. Ramesh Kumar (Visiting Parent) or Self"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Meal Slot</label>
                <select
                  value={tokenForm.mealType}
                  onChange={(e) => setTokenForm({ ...tokenForm, mealType: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="breakfast">Breakfast (₹{pricing.perMeal.breakfast})</option>
                  <option value="lunch">Lunch (₹{pricing.perMeal.lunch})</option>
                  <option value="snacks">Evening Snacks (₹{pricing.perMeal.snacks})</option>
                  <option value="dinner">Dinner (₹{pricing.perMeal.dinner})</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={tokenForm.date}
                  onChange={(e) => setTokenForm({ ...tokenForm, date: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-900">Total Payable:</span>
                <span className="font-extrabold text-base text-indigo-700">
                  ₹{pricing.perMeal[tokenForm.mealType] || 75}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTokenModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition"
                >
                  Issue Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Pricing Schedule (Admin only) */}
      {showEditPricing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Revise Official Mess Tariff</h3>
                <p className="text-xs text-slate-400">Updates rates across future billings and rebates</p>
              </div>
              <button
                onClick={() => setShowEditPricing(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePricing} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Veg (₹)</label>
                  <input
                    type="number"
                    value={editPriceForm.monthlyVeg}
                    onChange={(e) => setEditPriceForm({ ...editPriceForm, monthlyVeg: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Non-Veg (₹)</label>
                  <input
                    type="number"
                    value={editPriceForm.monthlyNonVeg}
                    onChange={(e) => setEditPriceForm({ ...editPriceForm, monthlyNonVeg: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rebate Daily Deduction Rate (₹/day)
                </label>
                <input
                  type="number"
                  value={editPriceForm.rebateDailyRate}
                  onChange={(e) => setEditPriceForm({ ...editPriceForm, rebateDailyRate: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  required
                />
                <span className="text-[11px] text-slate-400">Credit refunded per approved leave day (min 3 days).</span>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Casual Token Rates (₹)</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Breakfast</label>
                    <input
                      type="number"
                      value={editPriceForm.breakfast}
                      onChange={(e) => setEditPriceForm({ ...editPriceForm, breakfast: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Lunch</label>
                    <input
                      type="number"
                      value={editPriceForm.lunch}
                      onChange={(e) => setEditPriceForm({ ...editPriceForm, lunch: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Snacks</label>
                    <input
                      type="number"
                      value={editPriceForm.snacks}
                      onChange={(e) => setEditPriceForm({ ...editPriceForm, snacks: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Dinner</label>
                    <input
                      type="number"
                      value={editPriceForm.dinner}
                      onChange={(e) => setEditPriceForm({ ...editPriceForm, dinner: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditPricing(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition"
                >
                  Save New Rates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
