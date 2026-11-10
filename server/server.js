const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  }
  next();
});

// ----------------------------------------------------
// 1. Session & Role Management
// ----------------------------------------------------
app.get('/api/session', (req, res) => {
  const currentDB = db.getDB();
  const student = db.getMemberById(currentDB.currentStudentId) || db.getMembers()[0];
  res.json({
    role: currentDB.activeUserRole || 'student',
    currentStudent: student,
    allStudents: db.getMembers(),
  });
});

app.post('/api/session/switch', (req, res) => {
  const { role, studentId } = req.body;
  const session = db.switchSession(role, studentId);
  const student = db.getMemberById(session.currentStudentId) || db.getMembers()[0];
  res.json({
    role: session.role,
    currentStudent: student,
  });
});

// ----------------------------------------------------
// 2. Overview / Dashboard Statistics
// ----------------------------------------------------
app.get('/api/overview', (req, res) => {
  try {
    const stats = db.getOverview();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 3. Members Management
// ----------------------------------------------------
app.get('/api/members', (req, res) => {
  try {
    let members = db.getMembers();
    const { search, hostel, plan, status } = req.query;

    if (search) {
      const q = search.toLowerCase();
      members = members.filter(
        m => m.name.toLowerCase().includes(q) || m.rollNo.toLowerCase().includes(q) || m.roomNo.includes(q)
      );
    }
    if (hostel && hostel !== 'all') {
      members = members.filter(m => m.hostel.toLowerCase().includes(hostel.toLowerCase()));
    }
    if (plan && plan !== 'all') {
      members = members.filter(m => m.planType === plan);
    }
    if (status && status !== 'all') {
      members = members.filter(m => m.status === status);
    }

    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/members/:id', (req, res) => {
  const member = db.getMemberById(req.params.id);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  res.json(member);
});

app.post('/api/members', (req, res) => {
  try {
    const { name, rollNo, email, phone, hostel, roomNo, branch, batch, planType } = req.body;
    if (!name || !rollNo || !hostel || !roomNo) {
      return res.status(400).json({ error: 'Name, Roll No, Hostel, and Room No are required.' });
    }
    const existing = db.getMemberById(rollNo);
    if (existing) {
      return res.status(400).json({ error: `Member with Roll No "${rollNo}" already exists.` });
    }

    const newMember = db.addMember({
      name,
      rollNo: rollNo.toUpperCase().trim(),
      email: email || `${rollNo.toLowerCase()}@iiit-bh.ac.in`,
      phone: phone || '+91 98765 00000',
      hostel,
      roomNo,
      branch: branch || 'Computer Science & Engineering',
      batch: batch || '2024-2028',
      planType: planType || 'non-veg',
    });

    res.status(201).json(newMember);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/members/:id', (req, res) => {
  try {
    const updated = db.updateMember(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Member not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/members/:id', (req, res) => {
  try {
    const success = db.deleteMember(req.params.id);
    if (!success) return res.status(404).json({ error: 'Member not found' });
    res.json({ message: 'Member deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 4. Menu Management
// ----------------------------------------------------
app.get('/api/menu', (req, res) => {
  try {
    const menu = db.getMenu();
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/menu/:day/:mealType', (req, res) => {
  try {
    const { day, mealType } = req.params;
    const { items, type, isSpecial, calories, time, notes } = req.body;

    const updated = db.updateMeal(day, mealType, {
      items: Array.isArray(items) ? items : items.split(',').map(s => s.trim()),
      type: type || 'both',
      isSpecial: Boolean(isSpecial),
      calories: Number(calories) || 500,
      time: time || undefined,
      notes: notes || undefined,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/menu/reset', (req, res) => {
  try {
    const menu = db.resetMenu();
    res.json({ message: 'Menu reset to official IIIT-BBSR default schedule', menu });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 5. Pricing & Plans
// ----------------------------------------------------
app.get('/api/pricing', (req, res) => {
  try {
    const data = db.getPricing();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/pricing', (req, res) => {
  try {
    const updated = db.updatePricing(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pricing/buy-token', (req, res) => {
  try {
    const token = db.buyGuestToken(req.body);
    res.status(201).json(token);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 6. Rebates & Refunds
// ----------------------------------------------------
app.get('/api/rebates', (req, res) => {
  try {
    const { studentId } = req.query;
    const rebates = db.getRebates(studentId);
    res.json(rebates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rebates', (req, res) => {
  try {
    const newRebate = db.addRebate(req.body);
    res.status(201).json(newRebate);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/rebates/:id/status', (req, res) => {
  try {
    const { status, adminComment } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved, rejected, or pending' });
    }
    const updated = db.updateRebateStatus(req.params.id, status, adminComment);
    if (!updated) return res.status(404).json({ error: 'Rebate not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 7. Billing & Invoices
// ----------------------------------------------------
app.get('/api/billing', (req, res) => {
  try {
    const { studentId } = req.query;
    const bills = db.getBilling(studentId);
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/billing/generate', (req, res) => {
  try {
    const { month, year } = req.body;
    const result = db.generateBills(month, year);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/billing/:id/pay', (req, res) => {
  try {
    const bill = db.payBill(req.params.id, req.body);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    res.json({ message: 'Payment processed successfully', bill });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 8. Feedback & Grievances
// ----------------------------------------------------
app.get('/api/feedback', (req, res) => {
  try {
    const feedback = db.getFeedback();
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/feedback', (req, res) => {
  try {
    const newFeedback = db.addFeedback(req.body);
    res.status(201).json(newFeedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/feedback/:id/respond', (req, res) => {
  try {
    const { adminResponse, status } = req.body;
    const updated = db.respondFeedback(req.params.id, adminResponse, status);
    if (!updated) return res.status(404).json({ error: 'Feedback not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 9. Meal Attendance & Check-in
// ----------------------------------------------------
app.get('/api/attendance', (req, res) => {
  try {
    const attendance = db.getAttendance();
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/attendance/check-in', (req, res) => {
  try {
    const { rollNo, mealType } = req.body;
    if (!rollNo || !mealType) {
      return res.status(400).json({ error: 'Roll No and Meal Type are required.' });
    }
    const result = db.recordAttendance(rollNo, mealType);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 10. Announcements / Notices
// ----------------------------------------------------
app.get('/api/notices', (req, res) => {
  try {
    const notices = db.getNotices();
    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notices', (req, res) => {
  try {
    const newNotice = db.addNotice(req.body);
    res.status(201).json(newNotice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/notices/:id', (req, res) => {
  try {
    const success = db.deleteNotice(req.params.id);
    if (!success) return res.status(404).json({ error: 'Notice not found' });
    res.json({ message: 'Notice deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// Static Production Serving
// ----------------------------------------------------
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Fallback for SPA routing in Express 5
app.use((req, res) => {
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, err => {
    if (err) {
      res.send(`
        <div style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2>IIIT Bhubaneswar Mess Management System API Server</h2>
          <p>API is running smoothly on port ${PORT}.</p>
          <p>Please run <code>npm run build</code> or start the Vite frontend with <code>npm run dev</code>.</p>
        </div>
      `);
    }
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🍽️  IIIT Bhubaneswar Mess Management System Server`);
  console.log(`🌐  API Server listening on: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
