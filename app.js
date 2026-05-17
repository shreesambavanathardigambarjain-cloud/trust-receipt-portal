/**
 * app.js — Navigation, dashboard rendering, app bootstrap
 * Trust E-Receipt Portal
 */

let currentPage = 'dashboard';

const PAGE_META = {
  'dashboard':     ['Dashboard',    'Overview of trust receipts and donations'],
  'new-receipt':   ['New Receipt',  'Create and send a new donation receipt'],
  'receipts':      ['All Receipts', 'Manage and track all donation receipts'],
  'whatsapp-log':  ['WhatsApp Log', 'Delivery status for all messages sent'],
  'members':       ['Members',      'Manage trust member accounts'],
  'settings':      ['Settings',     'Configure WhatsApp, trust info and templates']
};

/* ── Navigation ──────────────────────────────────────────────── */

function showPage(p) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(el => (el.style.display = 'none'));

  // Deactivate all nav items
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

  // Show target page
  const pageEl = document.getElementById('page-' + p);
  if (pageEl) pageEl.style.display = 'block';

  // Activate matching nav item
  document.querySelectorAll('.nav-item').forEach(el => {
    const onclick = el.getAttribute('onclick') || '';
    if (onclick.includes(`'${p}'`)) el.classList.add('active');
  });

  currentPage = p;

  // Update topbar titles
  if (PAGE_META[p]) {
    document.getElementById('page-title').textContent = PAGE_META[p][0];
    document.getElementById('page-sub').textContent   = PAGE_META[p][1];
  }

  // Trigger page-specific render
  if (p === 'dashboard')    renderDashboard();
  if (p === 'receipts')     renderReceipts();
  if (p === 'whatsapp-log') renderWALog();
  if (p === 'members')      renderMembers();
  if (p === 'settings')     loadSettings();
  if (p === 'new-receipt')  initNewReceipt();
}

/* ── App bootstrap ───────────────────────────────────────────── */

function initApp() {
  // Topbar date
  document.getElementById('topbar-date').textContent = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  });

  loadSettings();
  renderDashboard();
  initNewReceipt();
}

/* ── Dashboard ───────────────────────────────────────────────── */

function renderDashboard() {
  const receipts = DB.receipts;

  // Stat cards
  document.getElementById('stat-total').textContent  = receipts.length;
  const totalAmt = receipts.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  document.getElementById('stat-amount').textContent = '₹' + totalAmt.toLocaleString('en-IN');
  const waSent = DB.waLog.filter(l => l.status === 'sent').length;
  document.getElementById('stat-wa-sent').textContent = waSent;
  const failed  = DB.waLog.filter(l => l.status !== 'sent').length;
  document.getElementById('stat-pending').textContent = failed;

  // Recent receipts table
  const tbody  = document.getElementById('dashboard-tbody');
  const recent = receipts.slice(-5).reverse();
  tbody.innerHTML = recent.length
    ? recent.map(r => `
        <tr>
          <td><strong>${r.receiptNo}</strong></td>
          <td>${r.donorName}</td>
          <td><strong>₹${parseFloat(r.amount).toLocaleString('en-IN')}</strong></td>
          <td>${formatDate(r.date)}</td>
          <td>${waStatusBadge(r.waDonor)}</td>
        </tr>`).join('')
    : '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:2rem">No receipts yet</td></tr>';

  // Payment method breakdown
  const chartEl = document.getElementById('pay-method-chart');
  const modes   = {};
  receipts.forEach(r => { modes[r.payMode] = (modes[r.payMode] || 0) + 1; });

  if (!receipts.length) {
    chartEl.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--muted);font-size:.85rem">No data yet</div>';
    return;
  }

  const colors = ['var(--gold)', 'var(--navy)', '#16a34a', 'var(--info)', '#d97706', '#6b7280'];
  let i = 0;
  chartEl.innerHTML = Object.entries(modes).map(([mode, cnt]) => {
    const pct = Math.round(cnt / receipts.length * 100);
    const c   = colors[i++ % colors.length];
    return `
      <div style="margin-bottom:.75rem">
        <div style="display:flex;justify-content:space-between;font-size:.8rem;margin-bottom:.3rem">
          <span>${mode}</span><span style="font-weight:600">${cnt} (${pct}%)</span>
        </div>
        <div style="background:#f0ede8;border-radius:4px;height:8px">
          <div style="background:${c};width:${pct}%;height:8px;border-radius:4px;transition:width .5s"></div>
        </div>
      </div>`;
  }).join('');
}
