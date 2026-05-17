/**
 * receipts.js — New receipt form, list, filter, pagination, modal
 * Trust E-Receipt Portal
 */

/* ── Live preview debounce ───────────────────────────────────── */

let _previewTimeout;

function initNewReceipt() {
  document.getElementById('f-date').value      = new Date().toISOString().split('T')[0];
  document.getElementById('f-receipt-no').value = genReceiptNo();
  updatePreview();

  const liveFields = ['f-donor-name', 'f-amount', 'f-purpose', 'f-paymode', 'f-date', 'f-receipt-no'];
  liveFields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const event = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(event, () => {
      clearTimeout(_previewTimeout);
      _previewTimeout = setTimeout(updatePreview, 300);
    });
  });
}

function updatePreview() {
  const s = DB.settings;
  document.getElementById('prev-rno').textContent     = document.getElementById('f-receipt-no').value || '-';
  document.getElementById('prev-date').textContent    = formatDate(document.getElementById('f-date').value) || '-';
  document.getElementById('prev-donor').textContent   = document.getElementById('f-donor-name').value || '-';
  document.getElementById('prev-purpose').textContent = document.getElementById('f-purpose').value || '-';
  document.getElementById('prev-mode').textContent    = document.getElementById('f-paymode').value || '-';

  const amt = parseFloat(document.getElementById('f-amount').value) || 0;
  document.getElementById('prev-amount').textContent       = '₹' + amt.toLocaleString('en-IN');
  document.getElementById('prev-amount-words').textContent = amt ? '(' + numToWords(amt) + ' Rupees Only)' : '';

  document.getElementById('prev-trust-name').textContent = s.trustName;
  document.getElementById('prev-trust-reg').textContent  =
    `Reg: ${s.regNo}${s.fcra ? ' | FCRA: ' + s.fcra : ''}`;
  document.getElementById('prev-trust-addr').textContent = s.address + ' | ' + s.phone;
}

/* ── Form helpers ────────────────────────────────────────────── */

function getFormData() {
  return {
    receiptNo:  document.getElementById('f-receipt-no').value,
    date:       document.getElementById('f-date').value,
    donorName:  document.getElementById('f-donor-name').value.trim(),
    donorPhone: document.getElementById('f-donor-phone').value.trim(),
    donorAddr:  document.getElementById('f-donor-addr').value.trim(),
    pan:        document.getElementById('f-pan').value.trim(),
    purpose:    document.getElementById('f-purpose').value,
    amount:     document.getElementById('f-amount').value,
    payMode:    document.getElementById('f-paymode').value,
    ref:        document.getElementById('f-ref').value.trim(),
    remarks:    document.getElementById('f-remarks').value.trim(),
    waDonor:    'not-sent',
    waGroup:    'not-sent',
    createdAt:  new Date().toISOString(),
    createdBy:  DB.currentUser.name
  };
}

function validateForm() {
  const d = getFormData();
  if (!d.donorName)                    { toast('Donor name is required', 'danger');     return false; }
  if (!d.donorPhone)                   { toast('Donor phone is required', 'danger');    return false; }
  if (!d.amount || parseFloat(d.amount) <= 0) { toast('Enter a valid amount', 'danger'); return false; }
  return d;
}

function clearForm() {
  ['f-donor-name', 'f-donor-phone', 'f-donor-addr', 'f-pan', 'f-ref', 'f-remarks', 'f-amount']
    .forEach(id => (document.getElementById(id).value = ''));
  document.getElementById('f-receipt-no').value = genReceiptNo();
  updatePreview();
}

/* ── Save actions ────────────────────────────────────────────── */

function saveReceipt() {
  const d = validateForm();
  if (!d) return;
  DB.receipts.push(d);
  DB.receiptCounter++;
  saveDB();
  toast(`Receipt ${d.receiptNo} saved!`, 'success');
  clearForm();
  showPage('receipts');
}

function saveAndSendWA() {
  const d = validateForm();
  if (!d) return;
  DB.receipts.push(d);
  DB.receiptCounter++;
  saveDB();
  toast('Receipt saved — sending WhatsApp…', '');
  const idx = DB.receipts.length - 1;
  sendWhatsApp(idx);
}

function previewReceipt() {
  const d = getFormData();
  openReceiptModal(d, -1);
}

/* ── Receipts list ───────────────────────────────────────────── */

let _filteredReceipts = [];
let _currentPage      = 1;
const PER_PAGE        = 10;

function renderReceipts() {
  const searchInput = document.querySelector('#page-receipts .search-box input');
  const search  = searchInput ? searchInput.value.toLowerCase() : '';
  const paymode = document.getElementById('filter-paymode').value;
  const wa      = document.getElementById('filter-wa').value;

  _filteredReceipts = DB.receipts.filter(r => {
    const matchSearch  = !search || r.donorName.toLowerCase().includes(search)
                                 || r.receiptNo.toLowerCase().includes(search)
                                 || r.donorPhone.includes(search);
    const matchPaymode = !paymode || r.payMode === paymode;
    const matchWa      = !wa     || r.waDonor === wa || r.waGroup === wa;
    return matchSearch && matchPaymode && matchWa;
  });

  const tbody = document.getElementById('receipts-tbody');
  const empty = document.getElementById('receipts-empty');

  if (!_filteredReceipts.length) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    document.getElementById('receipts-pagination').innerHTML = '';
    return;
  }

  empty.style.display = 'none';
  const start = (_currentPage - 1) * PER_PAGE;
  const page  = _filteredReceipts.slice().reverse().slice(start, start + PER_PAGE);

  tbody.innerHTML = page.map(r => {
    const idx = DB.receipts.indexOf(r);
    return `
      <tr>
        <td><strong>${r.receiptNo}</strong></td>
        <td>${formatDate(r.date)}</td>
        <td>${r.donorName}</td>
        <td style="font-size:.78rem">${r.donorPhone}</td>
        <td style="font-size:.8rem">${r.purpose}</td>
        <td>${r.payMode}</td>
        <td><strong>₹${parseFloat(r.amount).toLocaleString('en-IN')}</strong></td>
        <td>${waStatusBadge(r.waDonor)}</td>
        <td>${waStatusBadge(r.waGroup)}</td>
        <td>
          <div style="display:flex;gap:.35rem">
            <button class="btn btn-ghost btn-sm" onclick="openReceiptModal(DB.receipts[${idx}],${idx})" title="View">👁</button>
            <button class="btn btn-ghost btn-sm" onclick="downloadPDF(${idx})" title="PDF">📄</button>
            <button class="btn btn-ghost btn-sm" onclick="sendWhatsApp(${idx})" title="WhatsApp">💬</button>
            <button class="btn btn-ghost btn-sm" onclick="deleteReceipt(${idx})" title="Delete" style="color:var(--danger)">🗑</button>
          </div>
        </td>
      </tr>`;
  }).join('');

  renderPagination();
}

function filterReceipts() {
  _currentPage = 1;
  renderReceipts();
}

function renderPagination() {
  const total = Math.ceil(_filteredReceipts.length / PER_PAGE);
  const pag   = document.getElementById('receipts-pagination');
  if (total <= 1) { pag.innerHTML = ''; return; }
  let html = '';
  for (let i = 1; i <= total; i++) {
    html += `<button class="pag-btn${i === _currentPage ? ' active' : ''}" onclick="goPage(${i})">${i}</button>`;
  }
  pag.innerHTML = html;
}

function goPage(p) {
  _currentPage = p;
  renderReceipts();
}

function deleteReceipt(idx) {
  if (!confirm('Delete this receipt? This cannot be undone.')) return;
  DB.receipts.splice(idx, 1);
  saveDB();
  toast('Receipt deleted', 'danger');
  renderReceipts();
  if (currentPage === 'dashboard') renderDashboard();
}

/* ── Receipt view modal ──────────────────────────────────────── */

let _modalReceiptIdx = -1;

function openReceiptModal(r, idx) {
  _modalReceiptIdx = idx;
  const s = DB.settings;

  document.getElementById('modal-receipt-content').innerHTML = `
    <div class="receipt-preview">
      <div class="rp-header">
        <h2>${s.trustName}</h2>
        <p>${s.regNo}${s.fcra ? ' | FCRA: ' + s.fcra : ''}</p>
      </div>
      <div class="rp-body">
        <div class="rp-row"><span class="lbl">Receipt #</span><span class="val">${r.receiptNo}</span></div>
        <div class="rp-row"><span class="lbl">Date</span><span class="val">${formatDate(r.date)}</span></div>
        <div class="rp-row"><span class="lbl">Donor</span><span class="val">${r.donorName}</span></div>
        <div class="rp-row"><span class="lbl">Phone</span><span class="val">${r.donorPhone}</span></div>
        ${r.pan ? `<div class="rp-row"><span class="lbl">PAN</span><span class="val">${r.pan}</span></div>` : ''}
        <div class="rp-row"><span class="lbl">Purpose</span><span class="val">${r.purpose}</span></div>
        <div class="rp-row"><span class="lbl">Mode</span><span class="val">${r.payMode}${r.ref ? ' (' + r.ref + ')' : ''}</span></div>
        ${r.remarks ? `<div class="rp-row"><span class="lbl">Remarks</span><span class="val">${r.remarks}</span></div>` : ''}
      </div>
      <div class="rp-amount">
        <div style="font-size:.75rem;color:rgba(255,255,255,.5)">DONATION AMOUNT</div>
        <div class="amt">₹${parseFloat(r.amount).toLocaleString('en-IN')}</div>
        <div style="font-size:.7rem;color:rgba(255,255,255,.5);margin-top:.2rem">(${numToWords(parseFloat(r.amount))} Rupees Only)</div>
      </div>
      <div class="rp-footer">
        <div>WA Donor: ${waStatusBadge(r.waDonor)} &nbsp; WA Group: ${waStatusBadge(r.waGroup)}</div>
        <div style="margin-top:.3rem;color:#aaa">Computer generated receipt</div>
      </div>
    </div>`;

  const dlBtn   = document.getElementById('modal-download-pdf');
  const waBtn   = document.getElementById('modal-send-wa');
  dlBtn.onclick = () => { idx >= 0 ? downloadPDF(idx) : generatePDF(r); };
  waBtn.onclick = () => { closeModal('modal-receipt'); if (idx >= 0) sendWhatsApp(idx); else toast('Save receipt first', 'danger'); };
  waBtn.style.display = idx >= 0 ? '' : 'none';

  document.getElementById('modal-receipt').style.display = 'flex';
}
