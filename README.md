# 🍲 IIIT Bhubaneswar - Central Mess Management System (MessMate)

> **Dynamic Full-Stack Web Application for IIIT Bhubaneswar Mess Operations**  
> Built for the **Internet and Web Technology (IWT)** Project.  
> *Ready for instantaneous deployment with zero external database configuration.*

---

## 🚀 Quick Start (Zero-Setup Deployment)

### 1. Run Locally in 10 Seconds:
```bash
# 1. Clone or open the project directory
cd IWT_Project

# 2. Install dependencies (if not already installed)
npm install

# 3. Build & launch the complete full-stack app
npm run build
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser!

### 2. For Live Development (Hot Reloading):
```bash
npm run dev
```
Runs both the Express API backend on port `5000` and the Vite React frontend on port `5173` concurrently with live proxying.

---

## 🌟 Deploy in 1 Click (Render / Railway / Vercel / VPS)

This project has been engineered specifically for **rapid, zero-headache deployment**:
- **No external MySQL / PostgreSQL database servers required**: Comes with an embedded, robust file-backed JSON database (`server/data/mess_db.json`) preloaded with rich seed data tailored to **IIIT Bhubaneswar** students, hostels, and authentic regional dining menus.
- **Unified Single-Port Delivery**: In production, the Express server serves both the REST API on `/api/*` and the high-performance Vite React static single-page application from `/dist`.

### Deployment Settings for Platforms (e.g. Render.com / Railway.app):
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Port Variable**: `PORT=5000` (or automatically populated by host)

---

## 🎯 Key Features & Modules

### 1. 💰 Pricing & Plans
- **Tiered Subsidized Subscriptions**:
  - Pure Veg Delight: **₹3,600 / month** (~₹120/day)
  - Non-Veg Special: **₹4,500 / month** (includes 4 weekly non-veg feasts: Chicken, Fish Besara, Egg Curry, Biryani)
- **Per-Meal Casual Token Generator**:
  - Instant digital meal pass generation for day scholars, visiting parents, and faculty (Breakfast ₹40, Lunch ₹75, Snacks ₹30, Dinner ₹75).
- **Manager Tariff Revisions**:
  - Mess Warden / Secretary can dynamically update monthly fees, daily rebate refund rates, and casual token prices.

### 2. 👥 Member Management (Add & Manage Members)
- **Student Enrollment Form**:
  - Full Name, University Roll No (e.g. `B122001`, `B122045`), Hostel (Brahmaputra BH-1, Mahanadi BH-2, Subarnarekha BH-3, Vaitarni BH-4, Dhauli GH-1, Rushikulya GH-2), Room No, Academic Department (CSE, CE, IT, ETC, EEE), and Dietary Plan.
- **Search & Multi-Filter Directory**:
  - Instant filtering by hostel residence, dietary preference (Veg / Non-Veg), and active status.
- **Digital Mess Card Generation**:
  - Instant printable smart ID card with student photo, barcode/QR code, validity, and room details.

### 3. 📊 Overview / Executive Dashboard
- **Live KPI Statistics**:
  - Total registered students, active dining members, pending rebate claims, monthly collections (₹), and current food satisfaction score.
- **Live "Serving Now" Widget**:
  - Automatically identifies the current dining slot based on the user's system clock (Breakfast, Lunch, Snacks, Dinner) and showcases today's hot dishes and estimated calories.
- **Notice Board Ticker**:
  - Real-time university mess notices (e.g. festive feasts, exam week timing extensions).

### 4. 🍽️ Menu Management (Able to Change Menu)
- **Full 7-Day Weekly Schedule (Monday - Sunday)**:
  - 4 meal sessions daily: Breakfast (07:30 - 09:30 AM), Lunch (12:30 - 02:30 PM), Snacks (05:00 - 06:15 PM), Dinner (07:45 - 09:45 PM).
  - Authentic regional specials: *Odia Dalma, Chhena Poda, Fish Besara, Hyderabadi Chicken Biryani, Paneer Butter Masala, Singada, Cuttack Aloo Chop, Chaulabara*.
- **Manager Menu Editor**:
  - Mess Manager can edit dishes for any day/meal with 1 click.
  - Mark chef-recommended festive specials, toggle veg/non-veg tags, and calibrate calorie counters.
  - "Reset Default" button to revert to the official institute dining schedule at any time.

### 5. 🏖️ Refund & Rebate System
- **Student Rebate Application**:
  - Select leave duration (Start Date to End Date).
  - Built-in validation: **Minimum 3 continuous days required** (as per IIIT-BBSR Mess Bylaws).
  - Real-time refund calculator: `Days × ₹85/day = Total Rebate Credit`.
  - Categories: *Academic Leave (SIH/Hackathons), Internship, Medical, Home Visit, Vacation*.
- **Warden Approval & Auto-Billing Deduction**:
  - Manager review interface to Approve or Reject rebate claims.
  - **Automated Ledger Credit**: When approved, the rebate amount is automatically deducted from the student's next monthly invoice!
  - **Gate Security Lock**: Students with active approved rebates are automatically flagged and blocked from swiping into dining halls during their leave period.

### 6. 💳 Billing, Ledger & Invoicing
- **Monthly Mess Invoices**:
  - Detailed line-item breakdown: `Base Fee + Extra Guest Meals + Late Fee - Approved Rebate Refund = Net Payable`.
- **Simulated Payment Gateway**:
  - Supports UPI (Google Pay / PhonePe / Paytm), Campus RFID Smart Card, Net Banking, and Debit/Credit Cards.
  - Instant payment confirmation with celebratory animation.
- **Official Printable E-Receipt**:
  - Generates official IIIT Bhubaneswar letterhead receipts with student details, invoice number, breakdown, and verified university seal.
- **Batch Bill Generation (Admin)**:
  - Mess Manager can generate monthly bills across all students in one click.

### 7. 📲 Meal Turnstile & Attendance Scanner
- **Smart Dining Hall Check-In**:
  - Gatekeeper can enter or scan student Roll Number for Breakfast, Lunch, Snacks, or Dinner.
  - **Anti-Fraud Security**: Prevents double-swipes for the same meal slot on the same day.
  - **Rebate Enforcement**: Immediately blocks meal check-ins if the student is currently on an approved rebate vacation.
- **Live Dining Entries Table**:
  - Real-time logging of students dining in the hall today with exact timestamps.

### 8. ⭐ Feedback & Grievance Cell
- **Student Dining Ratings**:
  - 1-to-5 star ratings for Overall Experience, Taste & Flavor, Hygiene & Cleanliness, and Portion Quantity.
  - Categorized reviews (*Food Quality, Cleanliness, Timings & Queues, Catering Staff*).
- **Administrative Resolution Workflow**:
  - Mess Secretary / Warden can review complaints and post official action taken notes (*Investigating, Resolved, Acknowledged*).

### 9. 📢 Notices & Announcements
- Hostel bulletin board with priority tags (`URGENT`, `NORMAL`, `INFO`).
- Warden office can broadcast announcements for festive dinners, pest control, and timing adjustments.

---

## 🧪 Demo & Evaluation Guide for Reviewers

At the top right of the navigation bar, you can test the system across roles:
1. **Role Switcher**:
   - Click **"Mess Manager"** to test admin features (edit menus, change pricing, approve rebates, generate bills, add members).
   - Click **"Student"** to test student features (view menu, apply for rebate, pay monthly bill, view digital ID card, submit feedback).
2. **Student Profile Selector**:
   - When in Student view, click the profile dropdown to switch between pre-seeded students:
     - `Aarav Mohapatra` (`B122001`) - Non-Veg Plan, Brahmaputra Hostel
     - `Sneha Tripathy` (`B122045`) - Veg Plan, Dhauli Girls Hostel (Has approved rebate credited to her bill!)
     - `Rohan Kumar Jena` (`B123012`) - Mahanadi Hostel (Has pending monthly bill)
     - `Debashis Sahoo` (`B121019`) - Subarnarekha Hostel (Overdue account)

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js, Express.js 5, CORS, RESTful API Architecture |
| **Database** | Embedded atomic JSON database with auto-seeding & persistence (`server/data/mess_db.json`) |
| **Tooling** | Concurrently, Path-to-regexp, Modern ES Modules & CommonJS bridge |

---

## 📂 Project Directory Structure

```text
IWT_Project/
├── package.json               # Full-stack scripts (dev, build, start)
├── vite.config.js             # Vite 8 + Tailwind CSS v4 configuration
├── index.html                 # HTML entry point with university branding
├── dist/                      # Compiled production static bundle
├── public/                    # Static assets
├── server/
│   ├── server.js              # Express REST API & static file server
│   ├── db.js                  # Database manager & business logic
│   ├── seedData.js            # Preloaded IIIT Bhubaneswar datasets
│   └── data/
│       └── mess_db.json       # Auto-created persistent storage
└── src/
    ├── main.jsx               # React entry point
    ├── App.jsx                # Layout & page router
    ├── index.css              # Tailwind styles & theme
    ├── context/
    │   └── AuthContext.jsx    # Session, role & toast context
    ├── services/
    │   └── api.js             # API client for backend communication
    ├── components/
    │   ├── Navbar.jsx         # Header with role & student switcher
    │   ├── Sidebar.jsx        # Navigation drawer
    │   ├── DigitalMessCardModal.jsx # Printable student pass
    │   ├── ReceiptModal.jsx   # Official fee receipt modal
    │   └── NotificationToast.jsx # Floating alerts
    └── pages/
        ├── OverviewPage.jsx   # Executive dashboard & live meal
        ├── MenuPage.jsx       # Weekly menu & live menu editor
        ├── PricingPage.jsx    # Tariff & guest token generator
        ├── MembersPage.jsx    # Add members & student directory
        ├── RebatePage.jsx     # Leave rebate & refund approval
        ├── BillingPage.jsx    # Fee invoices & payment simulation
        ├── AttendanceScannerPage.jsx # QR/Roll No meal check-in
        ├── FeedbackPage.jsx   # Star reviews & grievance resolution
        └── NoticesPage.jsx    # Campus bulletins
```

---

## 🏫 Institute Attribution
- **Institution**: International Institute of Information Technology, Bhubaneswar (IIIT-BBSR)
- **Campus**: Gothapatna, PO: Malipada, Bhubaneswar, Odisha – 751003
- **Course**: Internet and Web Technology (IWT) Full-Stack Project
