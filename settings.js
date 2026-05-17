/**
 * settings.js — Load and save all portal settings
 * Trust E-Receipt Portal
 */

/* ── Load settings into form fields ─────────────────────────── */

function loadSettings() {
  const s = DB.settings;
  _setVal('s-instance',       s.instance        || '');
  _setVal('s-token',          s.token           || '');
  _setVal('s-group',          s.groupWa         || '');
  _setVal('s-trust-name',     s.trustName       || '');
  _setVal('s-reg-no',         s.regNo           || '');
  _setVal('s-fcra',           s.fcra            || '');
  _setVal('s-80g',            s.g80             || '');
  _setVal('s-phone',          s.phone           || '');
  _setVal('s-address',        s.address         || '');
  _setVal('s-donor-template', s.donorTemplate   || '');
  _setVal('s-group-template', s.groupTemplate   || '');
}

/* ── Save settings from form fields ─────────────────────────── */

function saveSettings() {
  const s = DB.settings;
  s.instance      = _getVal('s-instance');
  s.token         = _getVal('s-token');
  s.groupWa       = _getVal('s-group');
  s.trustName     = _getVal('s-trust-name')     || s.trustName;
  s.regNo         = _getVal('s-reg-no');
  s.fcra          = _getVal('s-fcra');
  s.g80           = _getVal('s-80g');
  s.phone         = _getVal('s-phone');
  s.address       = _getVal('s-address');
  s.donorTemplate = _getVal('s-donor-template');
  s.groupTemplate = _getVal('s-group-template');

  saveDB();

  // Reflect trust name change in sidebar immediately
  document.getElementById('sidebar-trust-name').textContent = s.trustName;

  toast('Settings saved successfully!', 'success');
}

/* ── Private helpers ─────────────────────────────────────────── */

function _getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function _setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}
