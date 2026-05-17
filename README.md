# 🏛️ Trust E-Receipt Portal

A complete **donation receipt management system** for trusts and NGOs — runs entirely in the browser, no server required.

![Preview](https://img.shields.io/badge/status-ready-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![No Backend](https://img.shields.io/badge/backend-none-lightgrey)

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 **Multi-user Login** | Each trust member gets a unique User ID + Password + Role |
| 📄 **PDF Receipts** | Professional A4 receipt with letterhead, amount in words, signatures |
| 💬 **WhatsApp via UltraMsg** | Send receipts to donor + trust group automatically |
| 📊 **Excel Export** | Full register + WhatsApp log in one `.xlsx` file |
| 🖨️ **PDF Register** | Landscape summary of all receipts |
| 📡 **WA Delivery Tracking** | See Sent / Failed / Not Sent for every message |
| ⚙️ **Custom Templates** | Personalise WhatsApp messages with dynamic variables |
| 👥 **Member Management** | Add/remove members, set roles (Admin / Treasurer / Member) |

---

## 🚀 Quick Start

### Option 1 — Open Directly
```bash
# Just open index.html in any browser
open index.html
```

### Option 2 — GitHub Pages (Recommended)
1. Fork this repo
2. Go to **Settings → Pages → Deploy from branch → main → / (root)**
3. Your portal will be live at `https://yourusername.github.io/trust-receipt-portal`

### Option 3 — Local Server
```bash
# Python
python3 -m http.server 8080

# Node
npx serve .

# Then open http://localhost:8080
```

---

## 🔑 Default Login

| User ID | Password | Role |
|---|---|---|
| `admin` | `admin123` | Administrator |
| `treasurer1` | `ram123` | Treasurer |
| `member1` | `priya123` | Member |

> ⚠️ Change passwords immediately after first login via **Members** page.

---

## 💬 WhatsApp Setup (UltraMsg)

1. Sign up at [ultramsg.com](https://ultramsg.com)
2. Create an instance and scan the QR code with WhatsApp
3. Copy your **Instance ID** and **Token**
4. In the portal → **Settings → UltraMsg / WhatsApp**
5. Paste Instance ID, Token, and your Trust Group number
6. Click **Test WhatsApp** to verify

### Message Template Variables
```
{receipt_no}   → Receipt number
{donor_name}   → Donor's full name
{amount}       → Donation amount (formatted)
{purpose}      → Donation purpose
{date}         → Date of donation
{trust_name}   → Your trust name
```

---

## 📁 Project Structure

```
trust-receipt-portal/
├── index.html              ← Entry point (open this)
├── css/
│   └── style.css           ← All styles
├── js/
│   ├── db.js               ← Data store & localStorage
│   ├── utils.js            ← Helpers (toast, date, number-to-words)
│   ├── auth.js             ← Login / logout
│   ├── app.js              ← Navigation & dashboard
│   ├── receipts.js         ← Receipt form, list, preview
│   ├── whatsapp.js         ← UltraMsg API & WA log
│   ├── export.js           ← PDF & Excel export
│   ├── members.js          ← Member management
│   └── settings.js         ← Settings page
└── README.md
```

---

## 🔒 Data Storage

All data is stored in **browser localStorage** — nothing leaves the device unless you send a WhatsApp message.

> For multi-device / team use, consider adding a backend (Firebase, Supabase, etc.) and swapping `db.js` persistence layer.

---

## 🛠️ Customisation

**Change trust name, reg number, address:**
Settings → Trust Info tab

**Change receipt number format:**
`js/db.js` → `genReceiptNo()` function

**Add more payment modes:**
`index.html` → `<select id="f-paymode">` options

---

## 📦 Dependencies (CDN — no install needed)

| Library | Purpose |
|---|---|
| [jsPDF 2.5.1](https://github.com/parallax/jsPDF) | PDF generation |
| [jsPDF-AutoTable 3.8.2](https://github.com/simonbengtsson/jsPDF-AutoTable) | PDF tables |
| [SheetJS 0.18.5](https://sheetjs.com) | Excel export |
| [Google Fonts — Playfair Display + DM Sans](https://fonts.google.com) | Typography |

---

## 📜 License

MIT — free to use, modify, and distribute.

---

## 🙏 Contributing

Pull requests welcome! Please open an issue first for major changes.

---

*Built for trusts, temples, NGOs, and charitable organisations in India.*
