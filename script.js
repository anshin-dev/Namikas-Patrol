// تنظیمات
const SCRIPT_ID = 'AKfycbyY8ZoQW8oFfC3FbxsPo6olX-5UOqZGxFGvIUy_4r_ufwA-qzaNEDUjYzSkUV1SIQbW-Q';

// المنت‌ها
const tableBody = document.getElementById('table-body');
const searchInput = document.getElementById('search-input');
const shiftFilter = document.getElementById('shift-filter');
const roundFilter = document.getElementById('round-filter');
const statusFilter = document.getElementById('status-filter');
const printBtn = document.getElementById('print-btn');

// آمار
const totalCountEl = document.getElementById('total-count');
const normalCountEl = document.getElementById('normal-count');
const issueCountEl = document.getElementById('issue-count');

let data = [];

// بارگذاری داده‌ها از Google Apps Script
async function loadData() {
  try {
    const url = `https://script.googleapis.com/v1/scripts/${SCRIPT_ID}:run`;

    const response = await fetch(url);
    const result = await response.json();

    if (result.error || !result.response.result) {
      throw new Error(result.error?.message || 'خطا در دریافت داده');
    }

    const rows = result.response.result.values;

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
    tableBody.innerHTML = `<tr><td colspan="9">❌ خطایی رخ داده. لطفاً صفحه را رفرش کنید.</td></tr>`;
    console.error("Error loading data:", error);
  }
}

// رندر جدول
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

// فیلتر و جستجو
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

// آمار
function updateStats(items) {
  totalCountEl.textContent = items.length;
  const normal = items.filter(i => i.status === 'عادی').length;
  const issue = items.filter(i => i.status === 'مشکل دارد').length;
  normalCountEl.textContent = normal;
  issueCountEl.textContent = issue;
}

// چاپ
printBtn.addEventListener('click', () => {
  window.print();
});

// رویدادها
searchInput.addEventListener('input', filterData);
shiftFilter.addEventListener('change', filterData);
roundFilter.addEventListener('change', filterData);
statusFilter.addEventListener('change', filterData);

// بارگذاری در ابتدا
document.addEventListener('DOMContentLoaded', () => {
  loadData();
});
