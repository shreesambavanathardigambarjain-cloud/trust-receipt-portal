/**
 * db.js — Central data store & localStorage persistence
 * Trust E-Receipt Portal
 */

const DB = {
  receipts: [],
  waLog: [],
  members: [
    { id: 'admin',      name: 'Administrator',  pwd: 'admin123', role: 'admin',     wa: '' },
    { id: 'treasurer1', name: 'Ramesh Kumar',   pwd: 'ram123',   role: 'treasurer', wa: '919876543210' },
    { id: 'member1',    name: 'Priya Sharma',   pwd: 'priya123', role: 'member',    wa: '' }
  ],
  settings: {
    instance: '',
    token: '',
    groupWa: '',
    trustName: 'Sri Ram Trust',
    regNo: 'TRUST/2024/001',
    fcra: '',
    g80: '',
    phone: '9876543210',
    address: '123 Temple Street, Chennai - 600001',
    donorTemplate:
      '🙏 *Donation Receipt*\n\nDear {donor_name},\n\nThank you for your generous donation!\n\n' +
      '📄 Receipt No: *{receipt_no}*\n💰 Amount: *₹{amount}*\n🎯 Purpose: {purpose}\n📅 Date: {date}\n\n' +
      'Trust: *{trust_name}*\n\n_This is an auto-generated receipt. God bless you!_ 🙏',
    groupTemplate:
      '📢 *New Donation Received*\n\n👤 Donor: {donor_name}\n💰 Amount: ₹{amount}\n' +
      '🎯 Purpose: {purpose}\n📄 Receipt: {receipt_no}\n📅 Date: {date}\n\n' +
      '✅ Receipt sent to donor via WhatsApp.'
  },
  currentUser: null,
  receiptCounter: 1001
};

/** Load persisted data from localStorage */
function loadDB() {
  try {
    const saved = localStorage.getItem('trustReceiptDB');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(DB, parsed);
    }
  } catch (e) {
    console.warn('Could not load DB from localStorage:', e);
  }
}

/** Persist current DB state to localStorage */
function saveDB() {
  try {
    localStorage.setItem('trustReceiptDB', JSON.stringify(DB));
  } catch (e) {
    console.warn('Could not save DB to localStorage:', e);
  }
}

/** Generate next receipt number */
function genReceiptNo() {
  const year = new Date().getFullYear();
  const initials = DB.settings.trustName
    .split(' ')
    .map(w => w[0])
    .join('');
  const num = String(DB.receiptCounter).padStart(4, '0');
  return `${initials}/${year}/${num}`;
}

/** Seed sample data when portal is first opened */
function seedSampleData() {
  if (DB.receipts.length > 0) return;

  DB.receipts = [
    {
      receiptNo: 'SRT/2025/1001', date: '2025-05-01',
      donorName: 'Rajan Pillai', donorPhone: '919876543210',
      donorAddr: 'Chennai', pan: 'ABCDE1234F',
      purpose: 'Temple Development', amount: '11000',
      payMode: 'UPI', ref: 'UPI001', remarks: 'Pooja fund',
      waDonor: 'sent', waGroup: 'sent',
      createdAt: '2025-05-01T09:00:00Z', createdBy: 'Administrator'
    },
    {
      receiptNo: 'SRT/2025/1002', date: '2025-05-05',
      donorName: 'Meena Krishnan', donorPhone: '919876500001',
      donorAddr: 'Hosur', pan: '',
      purpose: 'Education Fund', amount: '5500',
      payMode: 'Cash', ref: '', remarks: '',
      waDonor: 'sent', waGroup: 'not-sent',
      createdAt: '2025-05-05T10:30:00Z', createdBy: 'Ramesh Kumar'
    },
    {
      receiptNo: 'SRT/2025/1003', date: '2025-05-10',
      donorName: 'Suresh Babu', donorPhone: '919123456789',
      donorAddr: 'Bangalore', pan: 'PQRST9876Y',
      purpose: 'Food Distribution', amount: '25000',
      payMode: 'Cheque', ref: 'CHQ-4521', remarks: 'Annual donation',
      waDonor: 'failed', waGroup: 'sent',
      createdAt: '2025-05-10T14:00:00Z', createdBy: 'Administrator'
    },
    {
      receiptNo: 'SRT/2025/1004', date: '2025-05-12',
      donorName: 'Kavitha Rajan', donorPhone: '918888888888',
      donorAddr: 'Salem', pan: '',
      purpose: 'General Donation', amount: '2100',
      payMode: 'UPI', ref: 'UPI-2024', remarks: '',
      waDonor: 'not-sent', waGroup: 'not-sent',
      createdAt: '2025-05-12T11:00:00Z', createdBy: 'Ramesh Kumar'
    }
  ];

  DB.waLog = [
    { receiptNo: 'SRT/2025/1001', donor: 'Rajan Pillai',  phone: '919876543210', type: 'Donor', status: 'sent',   sentAt: '2025-05-01T09:05:00Z', msg: 'Delivered' },
    { receiptNo: 'SRT/2025/1001', donor: 'Rajan Pillai',  phone: 'group@g.us',   type: 'Group', status: 'sent',   sentAt: '2025-05-01T09:05:00Z', msg: 'Delivered' },
    { receiptNo: 'SRT/2025/1002', donor: 'Meena Krishnan',phone: '919876500001', type: 'Donor', status: 'sent',   sentAt: '2025-05-05T10:32:00Z', msg: 'Delivered' },
    { receiptNo: 'SRT/2025/1003', donor: 'Suresh Babu',   phone: '919123456789', type: 'Donor', status: 'failed', sentAt: '2025-05-10T14:02:00Z', msg: 'Error: Invalid number' },
    { receiptNo: 'SRT/2025/1003', donor: 'Suresh Babu',   phone: 'group@g.us',   type: 'Group', status: 'sent',   sentAt: '2025-05-10T14:03:00Z', msg: 'Delivered' }
  ];

  DB.receiptCounter = 1005;
  saveDB();
}

// Boot
loadDB();
seedSampleData();
