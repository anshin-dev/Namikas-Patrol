// تنظیمات
const SPREADSHEET_ID = '16nOQQcR_N2qMB0FqsukH178RWe0_EdwsrSPBcJ-yCPA';
const API_KEY = 'AIzaSyDdKZiW8YwQvqo0XeZ6t1s1jL2w9u8m0qA'; // فقط خواندن
const RANGE = 'گشت نگهبانی!A1:I';
const GAS_SCRIPT_ID = 'AKfycbxr97Sq3HEzStB1ylXtFYoI1QEG4bDFb8wjk1SEEski1XCQt6CZb_6Km0UNAs2CWXo6Ig'; // 👈 بعداً اینجا قرارش بده
const GAS_API_URL = `https://script.googleapis.com/v1/scripts/${GAS_SCRIPT_ID}:run`;

// المنت‌ها
const tableBody = document.getElementById('table-body');
const searchInput = document.getElementById('search-input');
const shiftFilter = document.getElementById('shift-filter');
const roundFilter = document.getElementById('round-filter');
const statusFilter = document.getElementById('status-filter');
const printBtn = document.getElementById('print-btn');
const themeToggle = document.getElementById('theme-toggle');

// آمار
const totalCountEl = document.getElementById('total-count');
const normalCountEl = document.getElementById('normal-count');
const issueCountEl = document.getElementById('issue-count');

// تب‌ها
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

let data = [];

// تاریخ شمسی امروز
function updateJalaliDate() {
  const now = new Date();
  const jDate = jalaali.toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const formatted = `${jDate.jy}/${String(jDate.jm).padStart(2, '0')}/${String(jDate.jd).padStart(2, '0')}`;
  document.getElementById('jalali-date').value = formatted;
}

// بارگذاری داده‌ها
async function loadData() {
  try {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}&t=${Date.now()}`);
    const result = await res.json();
    const rows = result.values;

    if (!rows || rows.length <= 1) {
      tableBody.innerHTML = `<tr><td colspan="9">داده‌ای یافت نشد.</td></tr>`;
      return;
    }

    const headers = rows[0];
    const records = rows.slice(1);

    data = records.map(row => ({
      date: row[0] || '-',
      time: row[1] || '-',
      round: row[2] || '-',
      guard: row[3] || '-',
      shift: row[4] || '-',
      location: row[5] || '-',
      status: row[6] || '-',
      note: row[7] || '-',
      approved: row[8] ? '✅' : '-'
    }));

    renderTable(data);
    updateStats(data);
  } catch (error) {
    tableBody.innerHTML = `<tr><td colspan="9">خطا در بارگیری داده‌ها.</td></tr>`;
    console.error("Error loading data:", error);
  }
}

function renderTable(items) {
  tableBody.innerHTML = items.length
    ? items.map(item => `
      <tr>
        <td>${item.date}</td>
        <td>${item.time}</td>
        <td>${item.round}</td>
        <td>${item.guard}</td>
        <td>${item.shift}</td>
        <td>${item.location}</td>
        <td class="${item.status === 'مشکل دارد' ? 'status-issue' : 'status-normal'}">${item.status}</td>
        <td>${item.note || '-'}</td>
        <td>${item.approved === '✅' ? '<span class="checkmark">✅</span>' : '-'}</td>
      </tr>
    `).join('')
    : `<tr><td colspan="9">مطابق فیلترها، داده‌ای یافت نشد.</td></tr>`;
}

function filterData() {
  const query = searchInput.value.toLowerCase().trim();
  const shift = shiftFilter.value;
  const round = roundFilter.value;
  const status = statusFilter.value;

  const filtered = data.filter(item =>
    (item.date.includes(query) ||
     item.time.includes(query) ||
     item.guard.includes(query) ||
     item.location.includes(query) ||
     item.note.includes(query) ||
     item.shift.includes(query) ||
     item.round.includes(query)) &&
    (shift === '' || item.shift === shift) &&
    (round === '' || item.round === round) &&
    (status === '' || item.status === status)
  );

  renderTable(filtered);
  updateStats(filtered);
}

function updateStats(items) {
  totalCountEl.textContent = items.length;
  const normal = items.filter(i => i.status === 'عادی').length;
  const issue = items.filter(i => i.status === 'مشکل دارد').length;
  normalCountEl.textContent = normal;
  issueCountEl.textContent = issue;
}

// ثبت گشت جدید
document.getElementById('add-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;

  const formData = new FormData(form);
  const values = Object.fromEntries(formData);

  const payload = {
    date: document.getElementById('jalali-date').value,
    time: values.time,
    round: values.round,
    guard: values.guard,
    shift: values.shift,
    location: values.location,
    status: values.status,
    note: values.note
  };

  try {
    const res = await fetch(GAS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ function: 'doPost', parameters: [payload] })
    });

    const result = await res.json();

    if (result.response.result === 'success') {
      alert('✅ گشت با موفقیت ثبت شد!');
      form.reset();
      updateJalaliDate(); // تاریخ جدید
      loadData(); // بروزرسانی لیست
    } else {
      alert('❌ خطا: ' + result.response.error);
    }
  } catch (error) {
    alert('❌ مشکلی در اتصال وجود داشت. لطفاً اینترنت خود را چک کنید.');
    console.error(error);
  }
});

// تب‌ها
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab + '-tab').classList.add('active');
  });
});

// تم
themeToggle.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? '' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// چاپ
printBtn.addEventListener('click', () => window.print());

// اجرا در بارگیری
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
  updateJalaliDate();
  loadData();
});
