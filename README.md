# LifeLink — Connecting Blood. Saving Lives.

> **AI-Powered Smart Blood Donation & Emergency Response Platform** connecting Donors, Patients, Hospitals, Blood Banks, and Administrators to minimize **Time-to-Match** during acute clinical emergencies.

---

## 🚀 Key Features & Architectural Capabilities

1. **North Star Metric: Time-to-Match Optimization**
   - Direct emergency broadcast workflow dispatching real-time alerts in **< 3 minutes**.
   - Progressive radius escalation from 5 km $\to$ 10 km $\to$ 25 km $\to$ 50 km city-wide $\to$ blood bank cold-storage reserves.

2. **Medically Validated Blood Compatibility Engine**
   - Deterministic ABO and Rh(D) antigen transfusion logic strictly compliant with AABB and WHO guidelines (`bloodCompatibilityService.ts`).
   - Dedicated medical compatibility checker & calculator modal.

3. **Multi-Factor Donor Matching & Ranking Algorithm**
   - Multi-factor scoring formula:
     $$\text{Match Score} = \text{Compatibility (40\%)} + \text{Distance (25\%)} + \text{Availability (15\%)} + \text{Eligibility (10\%)} + \text{Response Reliability (10\%)}$$
   - **Strict Donor Privacy Guarantee**: Donor GPS coordinates are never exposed publicly; distance is calculated server-side using the Haversine formula and presented as approximate distances (e.g. *~3.2 km away*).

4. **Dedicated Role-Based Portals**
   - **🩸 Blood Donor**: Availability toggle (Online/Offline), live nearby emergency feed with 1-click *"I CAN DONATE"* response, LifePoints & gamification badges, donation records & downloadable digital certificates.
   - **🏥 Patient / Attendant**: Emergency request wizard, live 6-stage lifecycle stepper (`REQUESTED` $\to$ `MATCHED` $\to$ `DONOR_ACCEPTED` $\to$ `DONOR_ARRIVED` $\to$ `DONATION_VERIFIED` $\to$ `COMPLETED`), hospital check-in code.
   - **🩺 Hospital Transfusion Department**: Active emergency monitoring, rapid donor check-in verification via 6-character code (`LL-XXXXXX`), Recharts emergency analytics, regional blood bank stock inquiry.
   - **🏢 Blood Bank**: 8-grid blood group inventory matrix (A+, A-, B+, B-, AB+, AB-, O+, O-), batch tracking with collection and expiry dates, low-stock & expiring warnings.
   - **🛡️ Administrator**: Platform overview metrics, hospital & blood bank verification management, automated fraud & abuse detection monitor, regional demand vs supply analytics.

5. **AI Assistant & Predictive Analytics**
   - AI Emergency Assistant (Gemini API integration with deterministic medical decision-support fallback) for triage guidance and donor eligibility answers.
   - AI Blood Shortage Forecasting Engine predicting blood group deficit risks and recommending targeted donation appeals.
   - Security & Fraud Detection Service flagging rapid spam requests and unverified medical credentials.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide React Icons, Recharts, Canvas Confetti |
| **Backend** | Node.js, Express.js, TypeScript, REST API, Zod Validation |
| **Database** | MongoDB, Mongoose *(Auto-fallback to embedded `mongodb-memory-server` if local MongoDB is offline)* |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs password hashing, Role-Based Authorization Guards |
| **AI Integration** | Google Gemini API with fallback decision-support engine |
| **Geolocation** | Haversine distance engine & Interactive Radar/Map Visualization |

---

## 📂 Project Structure

```
lifelink/
├── package.json              # Root monorepo scripts (concurrent dev, build, seed)
├── .gitignore
├── .env.example
├── README.md
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── app.ts            # Express app configuration & middleware
│   │   ├── server.ts         # Server startup & DB auto-seeding
│   │   ├── config/           # MongoDB connection & in-memory fallback
│   │   ├── models/           # Mongoose models: User, BloodRequest, Donation, BloodInventory, Notification, FraudLog
│   │   ├── middleware/       # JWT Auth, Role authorization, Central error handler
│   │   ├── services/         # Compatibility matrix, donor matching, AI service, Map service, Notification service, Fraud detection
│   │   ├── controllers/      # Auth, Donors, Requests, Donations, BloodBanks, Admin, AI, Notifications
│   │   ├── routes/           # REST API routes
│   │   └── seeds/            # Comprehensive realistic seed dataset (>15 donors, 5 hospitals, 5 banks, batches, requests)
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── types/            # TypeScript interfaces
│   │   ├── context/          # AuthContext (with 1-click Demo Switcher) & NotificationContext
│   │   ├── services/         # API client & domain services
│   │   ├── routes/           # React Router route definitions & role guards
│   │   ├── components/
│   │   │   ├── common/       # Navbar, Sidebar, Footer, EmergencyBadge, BloodGroupBadge, CompatibilityMatrixModal
│   │   │   ├── emergency/    # EmergencyRequestModal, RequestStatusStepper
│   │   │   ├── map/          # InteractiveBloodMap (Live Radar & Distance Rings)
│   │   │   └── ai/           # AIAssistantWidget (Floating emergency chatbot)
│   │   └── pages/
│   │       ├── public/       # LandingPage
│   │       ├── auth/         # LoginPage, RegisterPage, ForgotPasswordPage
│   │       ├── donor/        # DonorDashboard, DonorProfile, DonorRequests, DonorDonations, DonorRewards
│   │       ├── patient/      # PatientDashboard
│   │       ├── hospital/     # HospitalDashboard, HospitalRequests, HospitalVerification, HospitalBloodBanks
│   │       ├── bloodbank/    # BloodBankDashboard, BloodBankInventory, BloodBankShortages
│   │       └── admin/        # AdminDashboard, AdminUsers, AdminFraud, AdminAnalytics
```

---

## 🔑 Demo Accounts (Instant 1-Click Login)

The application includes pre-seeded demo accounts. Password for all accounts is **`password123`**:

| Role | Demo Email | Persona Details |
|---|---|---|
| **Donor** | `donor@lifelink.demo` | Rahul Sharma (O- Star Donor, 2,350 LifePoints, Badges) |
| **Patient** | `patient@lifelink.demo` | Sarah Jenkins (Patient / Attendant) |
| **Hospital** | `hospital@lifelink.demo` | Metropolitan General Hospital (Level 1 Trauma Center) |
| **Blood Bank** | `bloodbank@lifelink.demo` | Red Cross Regional Blood Bank (Cold storage reserve) |
| **Admin** | `admin@lifelink.demo` | Dr. John Sterling (Platform Administrator) |

> 💡 **Quick Switcher**: Click the **"Demo Switcher"** button in the top navigation bar at any time to instantly switch between any of these roles!

---

## ⚙️ Installation & Running Locally

### 1. Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 2. Install Dependencies
Run from the root directory:
```bash
npm run install:all
```
*(or run `npm install` inside root, `backend/`, and `frontend/`)*

### 3. Environment Variables (Optional)
Copy `.env.example` to `.env` in the root or `backend/`:
```bash
cp .env.example backend/.env
```
*(If `MONGODB_URI` or `GEMINI_API_KEY` are not provided, LifeLink automatically boots an embedded in-memory MongoDB instance and activates the safe deterministic mock AI/Maps engine).*

### 4. Seed Database (Optional)
```bash
npm run seed
```
*(The server also auto-seeds automatically on first boot if the database is empty).*

### 5. Run Backend & Frontend Concurrently
```bash
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Endpoint**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 6. Build for Production
```bash
npm run build
```

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Register new user (Donor, Patient, Hospital, Blood Bank).
- `POST /api/auth/login`: Authenticate and receive JWT token.
- `GET /api/auth/me`: Get current authenticated user profile.
- `POST /api/auth/verify-otp`: OTP verification simulation.
- `POST /api/auth/forgot-password`: Dispatch password reset token.
- `POST /api/auth/reset-password`: Set new password with token.

### Emergency Blood Requests (`/api/requests`)
- `POST /api/requests`: Create emergency request, calculate matched donors, evaluate fraud risk, broadcast notifications.
- `GET /api/requests`: List requests filtered by status, urgency, or user role.
- `GET /api/requests/:id`: Get detailed request tracking, hospital coordinates, and status timeline.
- `POST /api/requests/:id/respond`: Donor action (`ACCEPT` / `DECLINE`).
- `PUT /api/requests/:id/status`: Update status (`DONOR_ARRIVED`, `DONATION_VERIFIED`, `COMPLETED`, `CANCELLED`).
- `POST /api/requests/:id/broadcast-escalate`: Expand search radius from 5 km $\to$ 10 km $\to$ 35 km.

### Donors (`/api/donors`)
- `GET /api/donors/me/dashboard`: Donor dashboard stats, LifePoints, nearby emergency broadcasts.
- `PUT /api/donors/me/availability`: Toggle Online/Offline availability status.
- `PUT /api/donors/me/profile`: Update medical details, age, gender, address.
- `GET /api/donors/leaderboard`: Top community donors ranked by LifePoints.
- `GET /api/donors/matches`: Query compatible donors with match scores.

### Donations & Certificates (`/api/donations`)
- `GET /api/donations/my-donations`: Donor verified donation history with certificate IDs.
- `GET /api/donations/:id`: Single donation certificate record.
- `POST /api/donations/verify`: Hospital verifies completed donation, issues digital certificate, awards +750 LifePoints.

### Blood Banks (`/api/bloodbanks`)
- `GET /api/bloodbanks`: List all blood banks and available units.
- `GET /api/bloodbanks/inventory`: Get 8-group stock matrix and batches.
- `POST /api/bloodbanks/inventory`: Register new blood batch.
- `PUT /api/bloodbanks/inventory/:id`: Update batch units or status.
- `DELETE /api/bloodbanks/inventory/:id`: Discard expired batch.
- `GET /api/bloodbanks/alerts/shortages`: Get low-stock (&lt;5 units) and expiring batch alerts.

### Admin (`/api/admin`)
- `GET /api/admin/metrics`: Platform KPIs, average time-to-match, network donor pool.
- `GET /api/admin/users`: User management with role filter.
- `PUT /api/admin/users/:id/verify`: Approve/verify medical institution license.
- `GET /api/admin/fraud-alerts`: Review flagged suspicious requests and risk logs.
- `PUT /api/admin/fraud-alerts/:id/resolve`: Resolve fraud alert.
- `GET /api/admin/analytics`: Blood group demand vs supply trends and urgency distribution.

### AI Engine (`/api/ai`)
- `POST /api/ai/chat`: Interactive emergency assistant with medical safety filters.
- `GET /api/ai/predict-shortage`: Blood shortage forecast engine.
- `POST /api/ai/match`: ABO/Rh compatibility explanation breakdown.

---

## ⚕️ Important Medical Safety Disclaimer

> [!WARNING]
> LifeLink is designed as an emergency coordination and decision-support platform.
> - LifeLink AI does **not** provide medical diagnosis or prescribe medical treatments.
> - Blood compatibility matching rules (`bloodCompatibilityService.ts`) are provided as clinical decision support in accordance with AABB/WHO standards.
> - All transfusions **must** be crossmatched and administered by qualified medical professionals at certified clinical facilities.
