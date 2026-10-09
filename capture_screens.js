const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function captureAll() {
  console.log('Launching Chrome from:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,960']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 2 });

  // 1. Landing Page
  console.log('1. Capturing Landing Page...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await delay(1200);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_landing_page.png') });

  // 2. Login Page
  console.log('2. Capturing Login Page...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await delay(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_login_page.png') });

  // Helper function to log in and capture
  async function loginAndCapture(role, filename, extraPath = '') {
    console.log(`Logging in as ${role}...`);
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    await delay(600);

    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes(role)) {
        await btn.click();
        break;
      }
    }

    await delay(1800);
    if (extraPath) {
      await page.goto(`http://localhost:5173${extraPath}`, { waitUntil: 'networkidle0' });
      await delay(1200);
    }

    console.log(`Saving ${filename}...`);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, filename) });
  }

  // 3. Donor Dashboard
  await loginAndCapture('DONOR', '03_donor_dashboard.png');

  // 4. Patient Dashboard
  await loginAndCapture('PATIENT', '04_patient_dashboard.png');

  // 5. Hospital Transfusion Center
  await loginAndCapture('HOSPITAL', '05_hospital_dashboard.png');

  // 6. Blood Bank Inventory Matrix
  await loginAndCapture('BLOOD_BANK', '06_bloodbank_inventory.png', '/bloodbank/inventory');

  // 7. Admin Dashboard
  await loginAndCapture('ADMIN', '07_admin_dashboard.png');

  // 8. Admin Fraud & Quality Monitor
  await loginAndCapture('ADMIN', '08_admin_fraud.png', '/admin/fraud');

  await browser.close();
  console.log('All rich screenshots captured successfully!');
}

captureAll().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
