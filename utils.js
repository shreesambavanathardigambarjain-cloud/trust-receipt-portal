/**
 * utils.js — Shared helper utilities
 * Trust E-Receipt Portal
 */

/* ── Toast notifications ──────────────────────────────────────── */

/**
 * Show a toast notification.
 * @param {string} msg  - Message text
 * @param {string} type - 'success' | 'danger' | 'warn' | ''
 */
function toast(msg, type = '') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast${type ? ' ' + type : ''}`;
  const icons = { success: '✅', danger: '❌', warn: '⚠️' };
  el.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity .4s';
    setTimeout(() => el.remove(), 400);
  }, 3500);
}

/* ── Date / time formatting ───────────────────────────────────── */

function formatDate(d) {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  } catch { return d; }
}

function formatDateTime(d) {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  } catch { return d; }
}

/* ── Number to Indian words ───────────────────────────────────── */

function numToWords(n) {
  if (!n) return 'Zero';
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
    'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convert(n) {
    if (n < 20)      return ones[n];
    if (n < 100)     return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000)    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
    if (n < 100000)  return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000)return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  }

  return convert(Math.floor(n));
}

/* ── WhatsApp status badge ────────────────────────────────────── */

function waStatusBadge(status) {
  const map = {
    sent:      '<span class="badge badge-success">✓ Sent</span>',
    failed:    '<span class="badge badge-danger">✗ Failed</span>',
    pending:   '<span class="badge badge-warn">⏳ Pending</span>',
    'not-sent':'<span class="badge badge-muted">— Not Sent</span>'
  };
  return map[status] || map['not-sent'];
}

/* ── Template variable substitution ──────────────────────────── */

/**
 * Fill a message template with dynamic values.
 * @param {string} tpl  - Template string with {variable} placeholders
 * @param {Object} vars - Key-value map of variables
 */
function fillTemplate(tpl, vars) {
  return tpl.replace(/\{(\w+)\}/g, (match, key) => vars[key] !== undefined ? vars[key] : match);
}

/* ── Modal helpers ────────────────────────────────────────────── */

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

/* ── Tab switcher ─────────────────────────────────────────────── */

function switchTab(tabId, clickedTab) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  clickedTab.classList.add('active');
}
