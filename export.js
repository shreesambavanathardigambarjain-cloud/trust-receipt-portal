/**
 * export.js — PDF (jsPDF) and Excel (SheetJS) export
 * Trust E-Receipt Portal
 */

/* ── Individual receipt PDF ──────────────────────────────────── */

function downloadPDF(idx) {
  const r = DB.receipts[idx];
  if (r) generatePDF(r);
}

function generatePDF(r) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const s   = DB.settings;
  const W   = 210, M = 20;

  /* Header bar */
  doc.setFillColor(13, 27, 62);
  doc.rect(0, 0, W, 45, 'F');

  doc.setTextColor(201, 168, 76);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(s.trustName, W / 2, 18, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text(
    `Reg: ${s.regNo}${s.fcra ? ' | FCRA: ' + s.fcra : ''}${s.g80 ? ' | 80G: ' + s.g80 : ''}`,
    W / 2, 26, { align: 'center' }
  );
  doc.text(`${s.address} | ${s.phone}`, W / 2, 32, { align: 'center' });

  /* Receipt title band */
  doc.setFillColor(201, 168, 76);
  doc.rect(M, 50, W - M * 2, 10, 'F');
  doc.setTextColor(13, 27, 62);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DONATION RECEIPT', W / 2, 57, { align: 'center' });

  /* Details table */
  doc.setTextColor(30, 30, 30);
  const fields = [
    ['Receipt Number', r.receiptNo],
    ['Date',           formatDate(r.date)],
    ['Donor Name',     r.donorName],
    ['Phone',          r.donorPhone],
    ['Address',        r.donorAddr  || '-'],
    ['PAN / Aadhar',   r.pan        || '-'],
    ['Purpose',        r.purpose],
    ['Payment Mode',   r.payMode],
    ['Reference No.',  r.ref        || '-'],
    ['Remarks',        r.remarks    || '-']
  ];

  doc.autoTable({
    startY:  65,
    margin:  { left: M, right: M },
    body:    fields,
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold', fillColor: [248, 247, 245] },
      1: { cellWidth: 110 }
    },
    styles:       { fontSize: 9, cellPadding: 3, lineColor: [229, 224, 213], lineWidth: 0.3 },
    theme:        'grid'
  });

  /* Amount box */
  const afterTable = doc.lastAutoTable.finalY + 8;
  doc.setFillColor(13, 27, 62);
  doc.rect(M, afterTable, W - M * 2, 20, 'F');

  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text('TOTAL DONATION AMOUNT', W / 2, afterTable + 7, { align: 'center' });

  doc.setTextColor(201, 168, 76);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('₹' + parseFloat(r.amount).toLocaleString('en-IN'), W / 2, afterTable + 15, { align: 'center' });

  /* Amount in words */
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`(${numToWords(parseFloat(r.amount))} Rupees Only)`, W / 2, afterTable + 26, { align: 'center' });

  /* Signature lines */
  const sigY = afterTable + 40;
  doc.setDrawColor(200, 200, 200);
  doc.line(M,            sigY + 10, M + 50,     sigY + 10);
  doc.line(W - M - 50,  sigY + 10, W - M,       sigY + 10);

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Donor's Signature",  M + 25,    sigY + 15, { align: 'center' });
  doc.text('Authorised Signatory', W - M - 25, sigY + 15, { align: 'center' });

  /* Page footer */
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('This is a computer generated receipt. No manual signature required.', W / 2, 285, { align: 'center' });
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')} | TrustReceipt Portal`, W / 2, 289, { align: 'center' });

  doc.save(`Receipt_${r.receiptNo.replace(/\//g, '-')}.pdf`);
  toast('PDF downloaded!', 'success');
}

/* ── Full register — Excel ───────────────────────────────────── */

function exportAllExcel() {
  if (!DB.receipts.length) {
    toast('No receipts to export', 'danger');
    return;
  }

  const rows = DB.receipts.map(r => ({
    'Receipt No':    r.receiptNo,
    'Date':          formatDate(r.date),
    'Donor':         r.donorName,
    'Phone':         r.donorPhone,
    'Address':       r.donorAddr  || '',
    'PAN':           r.pan        || '',
    'Purpose':       r.purpose,
    'Payment Mode':  r.payMode,
    'Reference':     r.ref        || '',
    'Amount (₹)':    parseFloat(r.amount),
    'Remarks':       r.remarks    || '',
    'WA Donor':      r.waDonor,
    'WA Group':      r.waGroup,
    'Created By':    r.createdBy,
    'Created At':    formatDateTime(r.createdAt)
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Receipts');

  // Append WA log as second sheet
  if (DB.waLog.length) {
    const waRows = DB.waLog.map(l => ({
      'Receipt':  l.receiptNo,
      'Donor':    l.donor,
      'Phone':    l.phone,
      'Type':     l.type,
      'Status':   l.status,
      'Sent At':  formatDateTime(l.sentAt),
      'Message':  l.msg
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(waRows), 'WA Log');
  }

  const filename = `${DB.settings.trustName}_Receipts_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
  toast('Excel exported!', 'success');
}

/* ── Full register — PDF ─────────────────────────────────────── */

function exportAllPDF() {
  if (!DB.receipts.length) {
    toast('No receipts to export', 'danger');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const s   = DB.settings;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${s.trustName} — Donation Register`, 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')} | Total: ${DB.receipts.length} receipts`, 14, 22);

  doc.autoTable({
    startY: 28,
    head: [['Receipt No', 'Date', 'Donor', 'Phone', 'Purpose', 'Mode', 'Amount (₹)', 'WA Donor', 'WA Group', 'Created By']],
    body: DB.receipts.map(r => [
      r.receiptNo,
      formatDate(r.date),
      r.donorName,
      r.donorPhone,
      r.purpose,
      r.payMode,
      parseFloat(r.amount).toLocaleString('en-IN'),
      r.waDonor,
      r.waGroup,
      r.createdBy
    ]),
    styles:            { fontSize: 8 },
    headStyles:        { fillColor: [13, 27, 62], textColor: [201, 168, 76] },
    alternateRowStyles:{ fillColor: [248, 247, 245] }
  });

  const filename = `${s.trustName}_Register_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
  toast('PDF register exported!', 'success');
}

/* ── WA log — Excel ──────────────────────────────────────────── */

function exportWALogExcel() {
  if (!DB.waLog.length) {
    toast('No WhatsApp log to export', 'danger');
    return;
  }

  const rows = DB.waLog.map(l => ({
    'Receipt': l.receiptNo,
    'Donor':   l.donor,
    'Phone':   l.phone,
    'Type':    l.type,
    'Status':  l.status,
    'Sent At': formatDateTime(l.sentAt),
    'Message': l.msg
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'WA Log');
  XLSX.writeFile(wb, `${DB.settings.trustName}_WA_Log.xlsx`);
  toast('WA Log exported!', 'success');
}
