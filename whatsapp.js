/**
 * whatsapp.js — UltraMsg API integration & WhatsApp log
 * Trust E-Receipt Portal
 */

/* ── Send receipt via WhatsApp ───────────────────────────────── */

async function sendWhatsApp(idx) {
  const r = DB.receipts[idx];
  if (!r) return;

  const s = DB.settings;

  if (!s.instance || !s.token) {
    toast('Configure UltraMsg Instance ID & Token in Settings first', 'danger');
    showPage('settings');
    return;
  }

  // Build template variables
  const vars = {
    receipt_no: r.receiptNo,
    donor_name: r.donorName,
    amount:     parseFloat(r.amount).toLocaleString('en-IN'),
    purpose:    r.purpose,
    date:       formatDate(r.date),
    trust_name: s.trustName
  };

  const donorMsg = fillTemplate(s.donorTemplate, vars);
  const groupMsg = fillTemplate(s.groupTemplate, vars);

  // Check checkboxes if on new-receipt page
  const sendDonor = document.getElementById('wa-send-donor')?.checked !== false;
  const sendGroup = document.getElementById('wa-send-group')?.checked !== false;

  toast('Sending WhatsApp message(s)…', '');

  // Send to donor
  if (sendDonor && r.donorPhone) {
    const res = await _ultraMsgSend(s.instance, s.token, r.donorPhone, donorMsg);
    r.waDonor = res.ok ? 'sent' : 'failed';
    _logWA(r.receiptNo, r.donorName, r.donorPhone, 'Donor', r.waDonor,
           res.ok ? 'Delivered' : 'Error: ' + res.err);
  }

  // Send to group
  if (sendGroup && s.groupWa) {
    const res = await _ultraMsgSend(s.instance, s.token, s.groupWa, groupMsg);
    r.waGroup = res.ok ? 'sent' : 'failed';
    _logWA(r.receiptNo, r.donorName, s.groupWa, 'Group', r.waGroup,
           res.ok ? 'Delivered' : 'Error: ' + res.err);
  }

  saveDB();

  const allOk = r.waDonor === 'sent' || r.waGroup === 'sent';
  toast(
    allOk ? 'WhatsApp sent successfully! ✅' : 'WhatsApp failed — check your settings.',
    allOk ? 'success' : 'danger'
  );

  // Refresh current page if relevant
  if (currentPage === 'receipts')    renderReceipts();
  if (currentPage === 'dashboard')   renderDashboard();
  if (currentPage === 'whatsapp-log') renderWALog();
}

/* ── UltraMsg API call ───────────────────────────────────────── */

/**
 * Send a WhatsApp message via UltraMsg REST API.
 * Docs: https://docs.ultramsg.com/api/post/messages/chat
 *
 * @param {string} instance - UltraMsg instance ID
 * @param {string} token    - UltraMsg secret token
 * @param {string} to       - Recipient phone (with country code) or group ID
 * @param {string} body     - Message text
 * @returns {{ ok: boolean, err?: string }}
 */
async function _ultraMsgSend(instance, token, to, body) {
  try {
    const response = await fetch(`https://api.ultramsg.com/${instance}/messages/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token, to, body }).toString()
    });

    const data = await response.json();

    // UltraMsg returns { sent: "true", id: "..." } on success
    if (data.sent === 'true' || data.id) return { ok: true };
    return { ok: false, err: data.error || JSON.stringify(data) };

  } catch (e) {
    return { ok: false, err: e.message };
  }
}

/* ── Test WhatsApp connection ────────────────────────────────── */

async function testWA() {
  const instance = document.getElementById('s-instance').value.trim();
  const token    = document.getElementById('s-token').value.trim();
  const group    = document.getElementById('s-group').value.trim();

  if (!instance || !token) {
    toast('Enter Instance ID and Token first', 'danger');
    return;
  }

  const to = group || DB.currentUser?.wa || '';
  if (!to) {
    toast('Enter a Group number or your own WhatsApp number to test', 'danger');
    return;
  }

  toast('Sending test message…', '');
  const res = await _ultraMsgSend(
    instance, token, to,
    '🧪 Test message from TrustReceipt Portal. WhatsApp integration is working! ✅'
  );
  toast(res.ok ? 'Test message sent! ✅' : 'Failed: ' + res.err, res.ok ? 'success' : 'danger');
}

/* ── WA log ──────────────────────────────────────────────────── */

function _logWA(receiptNo, donor, phone, type, status, msg) {
  DB.waLog.push({
    receiptNo, donor, phone, type, status,
    sentAt: new Date().toISOString(),
    msg
  });
}

function renderWALog() {
  const tbody = document.getElementById('wa-log-tbody');
  const empty = document.getElementById('wa-log-empty');
  const logs  = DB.waLog.slice().reverse();

  if (!logs.length) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  tbody.innerHTML = logs.map(l => `
    <tr>
      <td><strong>${l.receiptNo}</strong></td>
      <td>${l.donor}</td>
      <td style="font-size:.78rem">${l.phone}</td>
      <td>${l.type === 'Donor'
          ? '<span class="badge badge-info">Donor</span>'
          : '<span class="badge badge-muted">Group</span>'}</td>
      <td>${waStatusBadge(l.status)}</td>
      <td style="font-size:.78rem">${formatDateTime(l.sentAt)}</td>
      <td style="font-size:.75rem;color:var(--muted)">${l.msg}</td>
    </tr>`).join('');
}
