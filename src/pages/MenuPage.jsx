import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Utensils, 
  Clock, 
  Flame, 
  Edit3, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Plus, 
  X,
  AlertCircle
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = [
  { key: 'breakfast', name: 'Breakfast', defaultTime: '07:30 AM - 09:30 AM' },
  { key: 'lunch', name: 'Lunch', defaultTime: '12:30 PM - 02:30 PM' },
  { key: 'snacks', name: 'Evening Snacks', defaultTime: '05:00 PM - 06:15 PM' },
  { key: 'dinner', name: 'Dinner', defaultTime: '07:45 PM - 09:45 PM' },
];

export default function MenuPage() {
  const { role, showToast } = useAuth();
  
  // Default to today's day
  const todayDayName = DAYS[(new Date().getDay() + 6) % 7];
  const [selectedDay, setSelectedDay] = useState(todayDayName);
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit modal state
  const [editingMeal, setEditingMeal] = useState(null);
  const [editForm, setEditForm] = useState({
    items: '',
    type: 'both',
    isSpecial: false,
    calories: 600,
    time: '',
  });

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const data = await api.getMenu();
      setMenu(data);
    } catch (err) {
      showToast('Error loading mess menu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (mealKey, mealData) => {
    setEditingMeal(mealKey);
    setEditForm({
      items: mealData?.items ? mealData.items.join(', ') : '',
      type: mealData?.type || 'both',
      isSpecial: Boolean(mealData?.isSpecial),
      calories: mealData?.calories || 600,
      time: mealData?.time || '',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingMeal) return;

    try {
      const itemsArray = editForm.items
        .split(',')
        .map(i => i.trim())
        .filter(i => i.length > 0);

      if (itemsArray.length === 0) {
        showToast('Please provide at least one food item', 'error');
        return;
      }

      await api.updateMeal(selectedDay, editingMeal, {
        ...editForm,
        items: itemsArray,
      });

      showToast(`Updated ${selectedDay} ${editingMeal.toUpperCase()} menu successfully!`, 'success');
      setEditingMeal(null);
      loadMenu();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleResetMenu = async () => {
    if (!window.confirm('Reset the entire weekly menu back to IIIT-BBSR standard schedule?')) return;
    try {
      await api.resetMenu();
      showToast('Weekly menu reset to official institute default schedule', 'success');
      loadMenu();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading || !menu) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-500">Loading Weekly Dining Schedule...</p>
        </div>
      </div>
    );
  }

  const currentDayMenu = menu[selectedDay] || {};

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              IIIT Central Mess Weekly Menu
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
              Autumn Sem 2026
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Nutritious, hygienic meals prepared daily by Annapurna Catering Services for IIIT-BBSR hostels.
          </p>
        </div>

        {role === 'admin' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetMenu}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
              ✏️ Admin Edit Mode Active
            </span>
          </div>
        )}
      </div>

      {/* Days Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {DAYS.map((day) => {
          const isSelected = selectedDay === day;
          const isToday = todayDayName === day;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-1 min-w-[105px] py-3 px-3 rounded-2xl text-xs font-bold transition-all text-center relative ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-[1.02]'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <div>{day}</div>
              {isToday && (
                <span className={`inline-block mt-0.5 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                }`}>
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Meals Grid for the selected day */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {MEAL_TYPES.map(({ key, name, defaultTime }) => {
          const meal = currentDayMenu[key] || {
            name,
            time: defaultTime,
            items: ['Menu not specified'],
            type: 'veg',
            isSpecial: false,
            calories: 500,
          };

          return (
            <div
              key={key}
              className={`bg-white rounded-3xl border transition-all p-5 shadow-xs flex flex-col justify-between card-hover ${
                meal.isSpecial ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200/80'
              }`}
            >
              <div className="space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-lg">{name}</h3>
                      {meal.isSpecial && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          Special Feast
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{meal.time || defaultTime}</span>
                    </p>
                  </div>

                  {/* Role action or badge */}
                  {role === 'admin' ? (
                    <button
                      onClick={() => openEditModal(key, meal)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition border border-indigo-200"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Meal</span>
                    </button>
                  ) : (
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      meal.type === 'veg' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : meal.type === 'both' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {meal.type === 'veg' ? '🥦 Pure Veg' : meal.type === 'both' ? '🍳 Veg / Non-Veg' : '🍗 Non-Veg'}
                    </span>
                  )}
                </div>

                {/* Items List */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Menu Items ({meal.items?.length || 0})
                  </p>
                  <ul className="space-y-2">
                    {meal.items && meal.items.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom nutrition row */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  <span>Est. Calories: <strong className="text-slate-800">{meal.calories || 550} kcal</strong></span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {meal.type === 'veg' ? '100% Vegetarian Prep' : 'Prepared in separate stations'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Meal Modal */}
      {editingMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Edit Menu: {selectedDay} ({editingMeal.toUpperCase()})</h3>
                <p className="text-xs text-slate-400">Changes will reflect live on all student dashboards</p>
              </div>
              <button
                onClick={() => setEditingMeal(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Food Dishes (Comma separated)
                </label>
                <textarea
                  rows={4}
                  value={editForm.items}
                  onChange={(e) => setEditForm({ ...editForm, items: e.target.value })}
                  placeholder="e.g. Basmati Rice, Odia Dalma, Chicken Curry, Salad, Gulab Jamun"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  required
                />
                <span className="text-[11px] text-slate-400">Separate each dish with a comma.</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Meal Dietary Type</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="veg">Pure Vegetarian</option>
                    <option value="both">Both (Veg & Non-Veg)</option>
                    <option value="non-veg">Non-Veg Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Estimated Calories (kcal)</label>
                  <input
                    type="number"
                    value={editForm.calories}
                    onChange={(e) => setEditForm({ ...editForm, calories: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Meal Timing Display</label>
                <input
                  type="text"
                  value={editForm.time}
                  onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                  placeholder="e.g. 12:30 PM - 02:30 PM"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="specialCheckbox"
                  checked={editForm.isSpecial}
                  onChange={(e) => setEditForm({ ...editForm, isSpecial: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <label htmlFor="specialCheckbox" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Mark as Special Feast / Chef Recommended Dish
                </label>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMeal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition"
                >
                  Save & Update Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
