const fs = require('fs');
const path = require('path');
const {
  initialPricing,
  initialMembers,
  initialMenu,
  initialRebates,
  initialBilling,
  initialFeedback,
  initialNotices,
  initialGuestTokens,
  initialAttendanceToday,
} = require('./seedData');

const DB_FILE = path.join(__dirname, 'data', 'mess_db.json');

function initializeDB() {
  if (!fs.existsSync(path.dirname(DB_FILE))) {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const defaultData = {
      pricing: initialPricing,
      members: initialMembers,
      menu: initialMenu,
      rebates: initialRebates,
      billing: initialBilling,
      feedback: initialFeedback,
      notices: initialNotices,
      guestTokens: initialGuestTokens,
      attendance: initialAttendanceToday,
      activeUserRole: 'student', // 'student' or 'admin'
      currentStudentId: 'STU-001',
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
    return defaultData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB, re-initializing...', err);
    return initializeDB();
  }
}

function getDB() {
  return initializeDB();
}

function saveDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Failed to write DB file:', err);
    return false;
  }
}

module.exports = {
  getDB,
  saveDB,

  // Overview
  getOverview() {
    const db = getDB();
    const totalMembers = db.members.length;
    const activeMembers = db.members.filter(m => m.status === 'active').length;
    const pendingRebates = db.rebates.filter(r => r.status === 'pending').length;
    const totalCollected = db.billing
      .filter(b => b.status === 'paid')
      .reduce((sum, b) => sum + (b.netPayable || 0), 0);
    const pendingCollections = db.billing
      .filter(b => b.status === 'pending' || b.status === 'overdue')
      .reduce((sum, b) => sum + (b.netPayable || 0), 0);

    const feedbackCount = db.feedback.length;
    const avgRating = feedbackCount > 0
      ? (db.feedback.reduce((sum, f) => sum + f.ratings.overall, 0) / feedbackCount).toFixed(1)
      : "4.5";

    // Determine current live meal
    const hour = new Date().getHours();
    let currentMeal = 'Snacks';
    if (hour >= 6 && hour < 10) currentMeal = 'Breakfast';
    else if (hour >= 10 && hour < 15) currentMeal = 'Lunch';
    else if (hour >= 15 && hour < 19) currentMeal = 'Snacks';
    else currentMeal = 'Dinner';

    const todayAttendanceCount = db.attendance ? db.attendance.length : 0;

    return {
      totalMembers,
      activeMembers,
      pendingRebates,
      totalCollected,
      pendingCollections,
      avgRating,
      currentMeal,
      todayAttendanceCount,
      activeUserRole: db.activeUserRole || 'student',
      currentStudentId: db.currentStudentId || 'STU-001',
      recentFeedback: db.feedback.slice(0, 3),
      urgentNotices: db.notices.filter(n => n.priority === 'urgent' || n.priority === 'normal'),
    };
  },

  // Members
  getMembers() {
    return getDB().members;
  },
  getMemberById(id) {
    return getDB().members.find(m => m.id === id || m.rollNo.toLowerCase() === id.toLowerCase());
  },
  addMember(memberData) {
    const db = getDB();
    const newId = `STU-${String(db.members.length + 1).padStart(3, '0')}`;
    const newMember = {
      id: newId,
      balance: 0,
      joinDate: new Date().toISOString().split('T')[0],
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      status: 'active',
      ...memberData,
    };
    db.members.unshift(newMember);

    // Auto-generate current month bill for this new member
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    const baseFee = newMember.planType === 'non-veg' ? db.pricing.monthlyNonVeg : db.pricing.monthlyVeg;

    const newBill = {
      id: `INV-${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(db.billing.length + 1).padStart(3, '0')}`,
      studentId: newMember.id,
      studentName: newMember.name,
      rollNo: newMember.rollNo,
      hostel: newMember.hostel,
      roomNo: newMember.roomNo,
      month: currentMonth,
      year: currentYear,
      planType: newMember.planType,
      baseAmount: baseFee,
      guestTokens: 0,
      rebateDeduction: 0,
      fine: 0,
      netPayable: baseFee,
      status: 'pending',
      paymentDate: null,
      paymentMethod: null,
      transactionId: null,
      receiptUrl: null,
    };
    db.billing.push(newBill);

    saveDB(db);
    return newMember;
  },
  updateMember(id, updates) {
    const db = getDB();
    const index = db.members.findIndex(m => m.id === id);
    if (index === -1) return null;
    db.members[index] = { ...db.members[index], ...updates };
    saveDB(db);
    return db.members[index];
  },
  deleteMember(id) {
    const db = getDB();
    const index = db.members.findIndex(m => m.id === id);
    if (index === -1) return false;
    db.members.splice(index, 1);
    saveDB(db);
    return true;
  },

  // Active Session / User Switcher
  switchSession(role, studentId) {
    const db = getDB();
    db.activeUserRole = role;
    if (studentId) db.currentStudentId = studentId;
    saveDB(db);
    return { role: db.activeUserRole, currentStudentId: db.currentStudentId };
  },

  // Menu
  getMenu() {
    return getDB().menu;
  },
  updateMeal(day, mealType, mealData) {
    const db = getDB();
    if (!db.menu[day]) {
      db.menu[day] = {};
    }
    db.menu[day][mealType] = {
      ...db.menu[day][mealType],
      ...mealData,
    };
    saveDB(db);
    return db.menu[day][mealType];
  },
  resetMenu() {
    const db = getDB();
    db.menu = initialMenu;
    saveDB(db);
    return db.menu;
  },

  // Pricing
  getPricing() {
    const db = getDB();
    return {
      pricing: db.pricing,
      guestTokens: db.guestTokens || [],
    };
  },
  updatePricing(newPricing) {
    const db = getDB();
    db.pricing = { ...db.pricing, ...newPricing };
    saveDB(db);
    return db.pricing;
  },
  buyGuestToken(tokenData) {
    const db = getDB();
    const token = {
      id: `TKN-${Math.floor(1000 + Math.random() * 9000)}`,
      buyerName: tokenData.buyerName || 'Campus Visitor',
      mealType: tokenData.mealType || 'lunch',
      date: tokenData.date || new Date().toISOString().split('T')[0],
      price: tokenData.price || db.pricing.perMeal[tokenData.mealType || 'lunch'] || 75,
      status: 'valid',
      issuedAt: new Date().toISOString(),
      qrCode: `IIITBBSR-MEAL-TOKEN-${Date.now()}`,
    };
    if (!db.guestTokens) db.guestTokens = [];
    db.guestTokens.unshift(token);
    saveDB(db);
    return token;
  },

  // Rebates
  getRebates(filterStudentId) {
    const db = getDB();
    if (filterStudentId) {
      return db.rebates.filter(r => r.studentId === filterStudentId);
    }
    return db.rebates;
  },
  addRebate(rebateData) {
    const db = getDB();
    // Validate minimum days
    const start = new Date(rebateData.startDate);
    const end = new Date(rebateData.endDate);
    const diffTime = Math.abs(end - start);
    const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const minDays = db.pricing.minRebateDays || 3;
    if (durationDays < minDays) {
      throw new Error(`Minimum ${minDays} consecutive days required for rebate approval as per Mess Bylaw.`);
    }

    const rate = db.pricing.rebateDailyRate || 85;
    const amount = durationDays * rate;

    const student = db.members.find(m => m.id === rebateData.studentId) || {
      name: rebateData.studentName || 'Student',
      rollNo: rebateData.rollNo || 'B122001',
      hostel: rebateData.hostel || 'Hostel',
      roomNo: rebateData.roomNo || '101',
    };

    const newRebate = {
      id: `REB-${new Date().getFullYear()}-${String(db.rebates.length + 101).padStart(3, '0')}`,
      studentId: rebateData.studentId,
      studentName: student.name,
      rollNo: student.rollNo,
      hostel: student.hostel,
      roomNo: student.roomNo,
      startDate: rebateData.startDate,
      endDate: rebateData.endDate,
      durationDays,
      dailyRate: rate,
      amount,
      reasonCategory: rebateData.reasonCategory || 'Academic Leave',
      description: rebateData.description || '',
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0],
      adminComment: '',
      decisionDate: null,
    };

    db.rebates.unshift(newRebate);
    saveDB(db);
    return newRebate;
  },
  updateRebateStatus(id, status, adminComment) {
    const db = getDB();
    const rebate = db.rebates.find(r => r.id === id);
    if (!rebate) return null;

    rebate.status = status;
    rebate.adminComment = adminComment || (status === 'approved' ? 'Approved by Mess Warden.' : 'Rejected.');
    rebate.decisionDate = new Date().toISOString().split('T')[0];

    // If approved, update student status during rebate window & apply credit deduction to student's pending bill!
    if (status === 'approved') {
      const student = db.members.find(m => m.id === rebate.studentId);
      if (student) {
        student.status = 'rebate';
      }

      // Check for pending bill and subtract the rebate credit
      const pendingBill = db.billing.find(b => b.studentId === rebate.studentId && b.status === 'pending');
      if (pendingBill) {
        pendingBill.rebateDeduction = (pendingBill.rebateDeduction || 0) + rebate.amount;
        pendingBill.netPayable = Math.max(0, (pendingBill.baseAmount + pendingBill.guestTokens + pendingBill.fine) - pendingBill.rebateDeduction);
      }
    } else if (status === 'rejected') {
      const student = db.members.find(m => m.id === rebate.studentId);
      if (student && student.status === 'rebate') {
        student.status = 'active';
      }
    }

    saveDB(db);
    return rebate;
  },

  // Billing
  getBilling(studentId) {
    const db = getDB();
    if (studentId) {
      return db.billing.filter(b => b.studentId === studentId);
    }
    return db.billing;
  },
  payBill(billId, paymentDetails) {
    const db = getDB();
    const bill = db.billing.find(b => b.id === billId);
    if (!bill) return null;

    bill.status = 'paid';
    bill.paymentDate = new Date().toISOString().split('T')[0];
    bill.paymentMethod = paymentDetails.paymentMethod || 'UPI (Instant)';
    bill.transactionId = `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    bill.receiptUrl = `/api/billing/${bill.id}/receipt`;

    // Reset member's balance
    const member = db.members.find(m => m.id === bill.studentId);
    if (member) {
      member.balance = 0;
    }

    saveDB(db);
    return bill;
  },
  generateBills(month, year) {
    const db = getDB();
    let generatedCount = 0;
    const targetMonth = month || new Date().toLocaleString('default', { month: 'long' });
    const targetYear = year || new Date().getFullYear();

    db.members.forEach(member => {
      // Check if bill already exists
      const exists = db.billing.some(b => b.studentId === member.id && b.month === targetMonth && b.year === targetYear);
      if (!exists) {
        const baseFee = member.planType === 'non-veg' ? db.pricing.monthlyNonVeg : db.pricing.monthlyVeg;
        // Check for any approved rebates in this period
        const approvedRebates = db.rebates.filter(r => r.studentId === member.id && r.status === 'approved');
        const rebateDeductions = approvedRebates.reduce((sum, r) => sum + r.amount, 0);

        const newBill = {
          id: `INV-${targetYear}-${String(db.billing.length + 1).padStart(3, '0')}`,
          studentId: member.id,
          studentName: member.name,
          rollNo: member.rollNo,
          hostel: member.hostel,
          roomNo: member.roomNo,
          month: targetMonth,
          year: targetYear,
          planType: member.planType,
          baseAmount: baseFee,
          guestTokens: 0,
          rebateDeduction: rebateDeductions,
          fine: 0,
          netPayable: Math.max(0, baseFee - rebateDeductions),
          status: 'pending',
          paymentDate: null,
          paymentMethod: null,
          transactionId: null,
          receiptUrl: null,
        };
        db.billing.push(newBill);
        generatedCount++;
      }
    });

    saveDB(db);
    return { generatedCount, month: targetMonth, year: targetYear };
  },

  // Feedback
  getFeedback() {
    return getDB().feedback;
  },
  addFeedback(feedbackData) {
    const db = getDB();
    const student = db.members.find(m => m.id === feedbackData.studentId) || {
      name: feedbackData.studentName || 'Student',
      rollNo: feedbackData.rollNo || 'B122001',
    };

    const newFeedback = {
      id: `FB-${String(db.feedback.length + 1).padStart(3, '0')}`,
      studentId: feedbackData.studentId,
      studentName: student.name,
      rollNo: student.rollNo,
      mealType: feedbackData.mealType || 'lunch',
      mealDate: feedbackData.mealDate || new Date().toISOString().split('T')[0],
      category: feedbackData.category || 'Food Quality',
      ratings: {
        overall: feedbackData.ratings?.overall || 4,
        taste: feedbackData.ratings?.taste || 4,
        hygiene: feedbackData.ratings?.hygiene || 4,
        quantity: feedbackData.ratings?.quantity || 4,
      },
      comment: feedbackData.comment || '',
      status: 'open',
      adminResponse: '',
      createdAt: new Date().toISOString(),
    };

    db.feedback.unshift(newFeedback);
    saveDB(db);
    return newFeedback;
  },
  respondFeedback(id, responseText, newStatus) {
    const db = getDB();
    const fb = db.feedback.find(f => f.id === id);
    if (!fb) return null;
    fb.adminResponse = responseText;
    if (newStatus) fb.status = newStatus;
    saveDB(db);
    return fb;
  },

  // Attendance / Meal Check-in
  getAttendance() {
    const db = getDB();
    return db.attendance || [];
  },
  recordAttendance(rollNo, mealType) {
    const db = getDB();
    const member = db.members.find(m => m.rollNo.toLowerCase() === rollNo.toLowerCase().trim());
    if (!member) {
      throw new Error(`Student with Roll No "${rollNo}" is not registered in the Mess Database.`);
    }

    if (member.status === 'rebate') {
      throw new Error(`Student ${member.name} (${member.rollNo}) is currently on APPROVED REBATE LEAVE. Meal check-in disallowed.`);
    }

    if (!db.attendance) db.attendance = [];

    // Check if already swiped for this meal today
    const nowTimeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const existing = db.attendance.find(a => a.rollNo.toLowerCase() === rollNo.toLowerCase() && a.mealType === mealType);
    if (existing) {
      throw new Error(`Already checked in for ${mealType.toUpperCase()} at ${existing.time}. Duplicate entry prevented.`);
    }

    const record = {
      rollNo: member.rollNo,
      name: member.name,
      hostel: member.hostel,
      mealType,
      time: nowTimeStr,
      planType: member.planType,
    };

    db.attendance.unshift(record);
    saveDB(db);
    return { success: true, member, record };
  },

  // Notices
  getNotices() {
    return getDB().notices || [];
  },
  addNotice(noticeData) {
    const db = getDB();
    const newNotice = {
      id: `NOT-${String((db.notices?.length || 0) + 1).padStart(3, '0')}`,
      title: noticeData.title,
      content: noticeData.content,
      date: new Date().toISOString().split('T')[0],
      priority: noticeData.priority || 'normal',
      author: noticeData.author || 'Mess Secretary',
    };
    if (!db.notices) db.notices = [];
    db.notices.unshift(newNotice);
    saveDB(db);
    return newNotice;
  },
  deleteNotice(id) {
    const db = getDB();
    const idx = db.notices.findIndex(n => n.id === id);
    if (idx === -1) return false;
    db.notices.splice(idx, 1);
    saveDB(db);
    return true;
  },
};
