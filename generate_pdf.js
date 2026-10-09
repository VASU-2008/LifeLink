const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const OUTPUT_PDF = path.join(__dirname, 'LifeLink_Project_Proposal.pdf');

function getImageBase64(filename) {
  const filePath = path.join(SCREENSHOTS_DIR, filename);
  if (fs.existsSync(filePath)) {
    const bitmap = fs.readFileSync(filePath);
    return `data:image/png;base64,${bitmap.toString('base64')}`;
  }
  return '';
}

const imgLanding = getImageBase64('01_landing_page.png');
const imgLogin = getImageBase64('02_login_page.png');
const imgDonor = getImageBase64('03_donor_dashboard.png');
const imgPatient = getImageBase64('04_patient_dashboard.png');
const imgHospital = getImageBase64('05_hospital_dashboard.png');
const imgBloodBank = getImageBase64('06_bloodbank_inventory.png');
const imgAdmin = getImageBase64('07_admin_dashboard.png');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>LifeLink — Project Proposal</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');

    @page {
      size: A4;
      margin: 14mm 12mm 14mm 12mm;
      @bottom-right {
        content: counter(page);
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1e293b;
      background-color: #ffffff;
      line-height: 1.55;
      font-size: 13px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page-break {
      page-break-before: always;
      break-before: page;
    }

    .avoid-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Header Banner */
    .header-banner {
      background: linear-gradient(135deg, #881337 0%, #be123c 50%, #e11d48 100%);
      color: #ffffff;
      padding: 26px 28px;
      border-radius: 14px;
      margin-bottom: 22px;
      position: relative;
      box-shadow: 0 10px 25px -5px rgba(225, 29, 72, 0.25);
    }

    .header-tagline {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.35);
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    .header-title {
      font-size: 28px;
      font-weight: 900;
      letter-spacing: -0.5px;
      margin-bottom: 6px;
      line-height: 1.2;
    }

    .header-subtitle {
      font-size: 14px;
      font-weight: 500;
      color: #ffe4e6;
      max-width: 85%;
    }

    .doc-meta {
      display: flex;
      gap: 20px;
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      font-size: 11px;
      color: #fecdd3;
    }

    /* Section Styling */
    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 22px;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid #e2e8f0;
    }

    .section-number {
      background: #be123c;
      color: #ffffff;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 800;
    }

    .section-title {
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.3px;
    }

    h3 {
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
      margin-top: 12px;
      margin-bottom: 6px;
    }

    p {
      margin-bottom: 10px;
      color: #334155;
      text-align: justify;
    }

    /* Cards & Grids */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 12px 0;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      margin: 12px 0;
    }

    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 14px;
    }

    .card-highlight {
      background: #fff1f2;
      border: 1px solid #fecdd3;
    }

    .card-title {
      font-size: 12px;
      font-weight: 700;
      color: #9f1239;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .card-desc {
      font-size: 11.5px;
      color: #475569;
      line-height: 1.45;
    }

    /* Callout Alert */
    .callout {
      background: #f0fdf4;
      border-left: 4px solid #16a34a;
      padding: 10px 14px;
      border-radius: 0 8px 8px 0;
      margin: 12px 0;
      font-size: 12px;
      color: #166534;
    }

    .callout-title {
      font-weight: 700;
      margin-bottom: 2px;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 11.5px;
    }

    th, td {
      padding: 7px 10px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }

    th {
      background: #f1f5f9;
      font-weight: 700;
      color: #334155;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
    }

    tr:nth-child(even) td {
      background: #f8fafc;
    }

    /* Screenshot Container */
    .screenshot-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 10px;
      margin-bottom: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .screenshot-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .screenshot-badge {
      background: #be123c;
      color: #ffffff;
      font-size: 9.5px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .screenshot-label {
      font-size: 12.5px;
      font-weight: 700;
      color: #0f172a;
    }

    .screenshot-img-wrapper {
      width: 100%;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      background: #020617;
    }

    .screenshot-img {
      width: 100%;
      height: auto;
      display: block;
    }

    .screenshot-caption {
      font-size: 11px;
      color: #64748b;
      margin-top: 6px;
      line-height: 1.4;
    }

    /* Badges */
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      background: #e2e8f0;
      color: #334155;
    }

    .badge-primary {
      background: #ffe4e6;
      color: #be123c;
    }

    .formula-box {
      background: #0f172a;
      color: #38bdf8;
      font-family: 'JetBrains Mono', monospace;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 11px;
      margin: 10px 0;
      border-left: 3px solid #e11d48;
    }

    ul, ol {
      margin-left: 18px;
      margin-bottom: 10px;
      color: #334155;
    }

    li {
      margin-bottom: 4px;
    }
  </style>
</head>
<body>

  <!-- ==================== COVER & HEADER ==================== -->
  <div class="header-banner">
    <div class="header-tagline">Project Proposal & Technical Document</div>
    <div class="header-title">LifeLink — Connecting Blood. Saving Lives.</div>
    <div class="header-subtitle">AI-Powered Smart Blood Donation & Emergency Response Platform</div>
    <div class="doc-meta">
      <div><strong>Platform:</strong> Full-Stack Web App</div>
      <div><strong>Core Metric:</strong> Time-to-Match &lt; 3 Minutes</div>
      <div><strong>Compliance:</strong> AABB & WHO Transfusion Standards</div>
      <div><strong>Architecture:</strong> Node.js, React, MongoDB, Gemini AI</div>
    </div>
  </div>

  <!-- ==================== SECTION 1 ==================== -->
  <div class="section-header">
    <div class="section-number">1</div>
    <div class="section-title">Project Objective</div>
  </div>

  <p>
    <strong>LifeLink</strong> is an emergency-critical medical response platform engineered to drastically minimize the <strong>"Time-to-Match"</strong> duration during acute clinical blood emergencies. In critical trauma, severe surgical hemorrhages, and obstetric crises, the survival window is governed by the medical "Golden Hour" — where every minute lost searching for compatible blood exponentially increases patient mortality.
  </p>

  <p>
    The central purpose and goals of the LifeLink project are:
  </p>

  <div class="grid-2">
    <div class="card card-highlight">
      <div class="card-title">⏱️ Rapid Emergency Dispatch (&lt; 3 Mins)</div>
      <div class="card-desc">Automate real-time notification broadcasts to verified, eligible, and medically compatible donors within immediate geographical proximity in under 3 minutes of request submission.</div>
    </div>
    <div class="card card-highlight">
      <div class="card-title">🩺 Deterministic Clinical Compatibility</div>
      <div class="card-desc">Eliminate human error by embedding strict ABO and Rh(D) antigen transfusion rules compliant with AABB (Association for the Advancement of Blood & Biotherapies) and WHO clinical protocols.</div>
    </div>
    <div class="card card-highlight">
      <div class="card-title">🌐 Multi-Stakeholder Unified Ecosystem</div>
      <div class="card-desc">Seamlessly synchronize five distinct healthcare roles — Voluntary Donors, Patients/Attendants, Hospital Transfusion Units, Regional Blood Banks, and Health Administrators.</div>
    </div>
    <div class="card card-highlight">
      <div class="card-title">🤖 AI-Driven Triage & Fraud Shield</div>
      <div class="card-desc">Integrate generative AI (Google Gemini API) with deterministic fallbacks for instant donor eligibility assessments, clinical guidance, and algorithmic duplicate request prevention.</div>
    </div>
  </div>

  <!-- ==================== SECTION 2 ==================== -->
  <div class="section-header">
    <div class="section-number">2</div>
    <div class="section-title">Problem Statement / Need for the Solution</div>
  </div>

  <p>
    Despite advancements in modern healthcare, emergency blood procurement remains plagued by severe systemic inefficiencies, fragmented communication channels, and opacity in blood bank reserves:
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Traditional Bottleneck</th>
        <th style="width: 35%;">Observed Clinical Impact</th>
        <th style="width: 40%;">LifeLink Engineered Solution</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Manual Telephone & Social Media Relays</strong></td>
        <td>Panic-driven WhatsApp broadcasts and telephone chains cause 45–120 minute delays during critical golden hours.</td>
        <td><strong>Sub-3-Minute Automated Dispatch</strong> via progressive geo-radius escalation algorithm (5km &rarr; 10km &rarr; 25km &rarr; 50km).</td>
      </tr>
      <tr>
        <td><strong>Incompatible Transfusion Risks</strong></td>
        <td>Cross-matching errors and non-validated donor matching risk fatal acute hemolytic transfusion reactions.</td>
        <td><strong>Deterministic Medical Compatibility Engine</strong> evaluating exact donor-recipient antigen matrices server-side.</td>
      </tr>
      <tr>
        <td><strong>Opaque Blood Bank Inventory</strong></td>
        <td>Hospitals lack visibility into nearby regional blood bank reserves, leading to preventable blood expiration and shortages.</td>
        <td><strong>Live 8-Grid Blood Inventory Matrix</strong> with batch tracking, expiration warnings, and inter-hospital stock inquiries.</td>
      </tr>
      <tr>
        <td><strong>Donor Fatigue & Privacy Concerns</strong></td>
        <td>Unregulated public sharing of donor phone numbers and addresses causes privacy violations and donor churn.</td>
        <td><strong>Strict Privacy Guarantee</strong>: Donor GPS coordinates are never exposed; distances are computed server-side via the Haversine formula.</td>
      </tr>
    </tbody>
  </table>

  <div class="callout">
    <div class="callout-title">The Need for LifeLink:</div>
    By replacing ad-hoc, chaotic emergency coordination with an intelligent, automated, and medically validated matching pipeline, LifeLink turns a multi-hour logistical struggle into an orchestrated, life-saving response in minutes.
  </div>

  <!-- ==================== SECTION 3 ==================== -->
  <div class="page-break"></div>

  <div class="section-header">
    <div class="section-number">3</div>
    <div class="section-title">Key Features & Technical Innovation</div>
  </div>

  <h3>1. Multi-Factor Donor Matching & Ranking Algorithm</h3>
  <p>
    Rather than relying on naive distance alone, LifeLink executes a weighted multi-factor scoring formula to identify and alert the highest-probability responders:
  </p>

  <div class="formula-box">
    Match Score = (Compatibility × 40%) + (Distance × 25%) + (Availability × 15%) + (Eligibility × 10%) + (Response Reliability × 10%)
  </div>

  <div class="grid-3">
    <div class="card">
      <div class="card-title">📍 Progressive Escalation</div>
      <div class="card-desc">Automatically expands search radius (5km &rarr; 10km &rarr; 25km &rarr; 50km city-wide) before failing over to regional cold storage reserves.</div>
    </div>
    <div class="card">
      <div class="card-title">🔒 6-Digit Transfusion Code</div>
      <div class="card-desc">Each matched emergency generates an immutable verification token (<code>LL-XXXXXX</code>) to validate physical hospital arrival and prevent fraud.</div>
    </div>
    <div class="card">
      <div class="card-title">🏆 LifePoints & Gamification</div>
      <div class="card-desc">Rewards voluntary donors with tiered badges (Bronze, Silver, Gold, Star Donor) and downloadable digital certificates of honor.</div>
    </div>
  </div>

  <h3>2. Dedicated Role-Based Portals</h3>
  <ul>
    <li><strong>🩸 Blood Donor Portal:</strong> Real-time Online/Offline availability toggle, nearby emergency radar with 1-click <em>"I CAN DONATE"</em> confirmation, donation history ledger, and digital certificate downloads.</li>
    <li><strong>🏥 Patient / Attendant Portal:</strong> Streamlined 3-step emergency request submission wizard with live 6-stage lifecycle stepper (<code>REQUESTED &rarr; MATCHED &rarr; ACCEPTED &rarr; ARRIVED &rarr; VERIFIED &rarr; COMPLETED</code>).</li>
    <li><strong>🩺 Hospital Transfusion Department:</strong> Live emergency board, donor check-in verification terminal via 6-digit code, transfusion analytics, and real-time regional blood bank stock inquiry.</li>
    <li><strong>🏢 Regional Blood Bank Portal:</strong> 8-group inventory matrix (A+, A-, B+, B-, AB+, AB-, O+, O-), batch tracking with collection/expiry dates, low-stock threshold triggers, and shortage alerts.</li>
    <li><strong>🛡️ System Administrator Portal:</strong> Platform-wide KPIs, hospital credential verification, automated fraud detection (duplicate requests, frequency anomalies), and regional supply-demand heatmap.</li>
  </ul>

  <h3>3. AI Emergency Assistant & Clinical Decision Support</h3>
  <p>
    Powered by the Google Gemini API with a deterministic medical fallback engine, the integrated AI Assistant provides real-time donor eligibility screening (interval checks, medical history triage, travel deferrals) and emergency guidance for attendants.
  </p>

  <!-- ==================== SECTION 4 ==================== -->
  <div class="page-break"></div>

  <div class="section-header">
    <div class="section-number">4</div>
    <div class="section-title">Project Screenshots & Interface Walkthrough</div>
  </div>

  <p>
    Below are actual, high-resolution screenshots of the implemented LifeLink platform, showcasing each interface and operational workflow:
  </p>

  <!-- Screenshot 1: Landing Page -->
  <div class="screenshot-card avoid-break">
    <div class="screenshot-header">
      <span class="screenshot-label">1. Public Landing Page & Emergency Response Hub</span>
      <span class="screenshot-badge">Public Portal</span>
    </div>
    <div class="screenshot-img-wrapper">
      <img src="${imgLanding}" class="screenshot-img" alt="Landing Page">
    </div>
    <div class="screenshot-caption">
      <strong>Figure 4.1:</strong> Modern, responsive landing page highlighting the North Star metric (&lt;3 min dispatch), real-time emergency metrics, compatibility checker access, and intuitive role-based onboarding.
    </div>
  </div>

  <!-- Screenshot 2: Login / Auth -->
  <div class="screenshot-card avoid-break">
    <div class="screenshot-header">
      <span class="screenshot-label">2. Secure Authentication & 1-Click Multi-Role Switcher</span>
      <span class="screenshot-badge">Authentication</span>
    </div>
    <div class="screenshot-img-wrapper">
      <img src="${imgLogin}" class="screenshot-img" alt="Login Page">
    </div>
    <div class="screenshot-caption">
      <strong>Figure 4.2:</strong> Secure JWT authentication interface featuring instant 1-click role switcher for evaluating Donor, Patient, Hospital, Blood Bank, and Admin user environments.
    </div>
  </div>

  <!-- Screenshot 3: Donor Dashboard -->
  <div class="page-break"></div>
  <div class="screenshot-card avoid-break">
    <div class="screenshot-header">
      <span class="screenshot-label">3. Voluntary Blood Donor Portal & Nearby Emergency Feed</span>
      <span class="screenshot-badge">Donor Portal</span>
    </div>
    <div class="screenshot-img-wrapper">
      <img src="${imgDonor}" class="screenshot-img" alt="Donor Dashboard">
    </div>
    <div class="screenshot-caption">
      <strong>Figure 4.3:</strong> Active donor dashboard displaying Online/Offline availability toggle, proximity emergency feed with 1-click acceptance, LifePoints score (2,350 pts), badges, and medical eligibility tracker.
    </div>
  </div>

  <!-- Screenshot 4: Patient Dashboard -->
  <div class="screenshot-card avoid-break">
    <div class="screenshot-header">
      <span class="screenshot-label">4. Patient Emergency Request & Live Lifecycle Stepper</span>
      <span class="screenshot-badge">Patient Portal</span>
    </div>
    <div class="screenshot-img-wrapper">
      <img src="${imgPatient}" class="screenshot-img" alt="Patient Dashboard">
    </div>
    <div class="screenshot-caption">
      <strong>Figure 4.4:</strong> Patient emergency tracking interface featuring real-time 6-stage lifecycle stepper, hospital check-in code display, matched donor ETA, and interactive map.
    </div>
  </div>

  <!-- Screenshot 5: Hospital Transfusion Dashboard -->
  <div class="page-break"></div>
  <div class="screenshot-card avoid-break">
    <div class="screenshot-header">
      <span class="screenshot-label">5. Hospital Transfusion Unit & Verification Terminal</span>
      <span class="screenshot-badge">Hospital Portal</span>
    </div>
    <div class="screenshot-img-wrapper">
      <img src="${imgHospital}" class="screenshot-img" alt="Hospital Dashboard">
    </div>
    <div class="screenshot-caption">
      <strong>Figure 4.5:</strong> Hospital transfusion command center showing active emergencies, rapid 6-character check-in code verification terminal, emergency unit logs, and transfusion analytics.
    </div>
  </div>

  <!-- Screenshot 6: Blood Bank Inventory Matrix -->
  <div class="screenshot-card avoid-break">
    <div class="screenshot-header">
      <span class="screenshot-label">6. Blood Bank 8-Group Inventory Matrix & Batch Tracking</span>
      <span class="screenshot-badge">Blood Bank Portal</span>
    </div>
    <div class="screenshot-img-wrapper">
      <img src="${imgBloodBank}" class="screenshot-img" alt="Blood Bank Inventory">
    </div>
    <div class="screenshot-caption">
      <strong>Figure 4.6:</strong> Comprehensive 8-group blood matrix (A+, A-, B+, B-, AB+, AB-, O+, O-), batch tracking with collection and expiry dates, critical shortage alerts, and stock modification actions.
    </div>
  </div>

  <!-- Screenshot 7: Admin Dashboard & Fraud Monitor -->
  <div class="page-break"></div>
  <div class="screenshot-card avoid-break">
    <div class="screenshot-header">
      <span class="screenshot-label">7. Platform Administrator Oversight & Fraud Shield</span>
      <span class="screenshot-badge">Admin Portal</span>
    </div>
    <div class="screenshot-img-wrapper">
      <img src="${imgAdmin}" class="screenshot-img" alt="Admin Dashboard">
    </div>
    <div class="screenshot-caption">
      <strong>Figure 4.7:</strong> Super-admin overview presenting real-time system metrics, pending hospital/blood bank credential approvals, automated fraud detection flags, and supply vs. demand analytics.
    </div>
  </div>

  <!-- ==================== TECH STACK & SUMMARY ==================== -->
  <div class="section-header">
    <div class="section-number">✓</div>
    <div class="section-title">Technical Architecture & Stack Summary</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Layer</th>
        <th>Technologies Used</th>
        <th>Key Architectural Role</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Frontend</strong></td>
        <td>React 18, TypeScript, Tailwind CSS, Lucide Icons, Leaflet, Recharts</td>
        <td>High-performance responsive UI, live geospatial maps, dark-mode medical theme.</td>
      </tr>
      <tr>
        <td><strong>Backend API</strong></td>
        <td>Node.js, Express.js, TypeScript, REST Architecture</td>
        <td>Deterministic compatibility engine, multi-factor scoring, JWT security.</td>
      </tr>
      <tr>
        <td><strong>Database</strong></td>
        <td>MongoDB, Mongoose ODM, Geospatial 2dsphere Indexing</td>
        <td>Scalable document store with sub-millisecond geospatial radius queries.</td>
      </tr>
      <tr>
        <td><strong>Real-Time & AI</strong></td>
        <td>Socket.io (WebSocket), Google Gemini AI API</td>
        <td>Instant emergency broadcast alerts and AI-assisted clinical triage support.</td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top: 24px; padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; font-size: 11px; color: #64748b;">
    <strong>LifeLink Platform Proposal</strong> &bull; Developed by Vasu Chandra &bull; Connecting Blood. Saving Lives.
  </div>

</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'proposal_template.html'), htmlContent);

async function generatePDF() {
  console.log('Launching Chrome to generate PDF...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  await page.emulateMediaType('print');

  console.log('Rendering PDF to:', OUTPUT_PDF);
  await page.pdf({
    path: OUTPUT_PDF,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '12mm',
      bottom: '12mm',
      left: '12mm',
      right: '12mm'
    }
  });

  await browser.close();
  console.log('PDF generated successfully at:', OUTPUT_PDF);
}

generatePDF().catch(err => {
  console.error('PDF generation failed:', err);
  process.exit(1);
});
