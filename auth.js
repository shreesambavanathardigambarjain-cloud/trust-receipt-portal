/**
 * auth.js — Authentication: login, logout, session
 * Trust E-Receipt Portal
 */

/** Attempt login with credentials from the login form */
function doLogin() {
  const uid  = document.getElementById('login-uid').value.trim();
  const pwd  = document.getElementById('login-pwd').value.trim();
  const role = document.getElementById('login-role').value;

  const member = DB.members.find(m => m.id === uid && m.pwd === pwd && m.role === role);

  if (!member) {
    const errEl = document.getElementById('login-error');
    errEl.style.display = 'block';
    errEl.textContent = 'Invalid credentials. Try: admin / admin123 / Administrator';
    return;
  }

  DB.currentUser = member;
  _startSession(member);
}

/** Sign out the current user */
function doLogout() {
  DB.currentUser = null;
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-uid').value = '';
  document.getElementById('login-pwd').value = '';
  document.getElementById('login-error').style.display = 'none';
}

/** Internal: wire up the UI after successful login */
function _startSession(member) {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('app').style.display = 'flex';

  // Sidebar user info
  document.getElementById('user-avatar').textContent = member.name[0].toUpperCase();
  document.getElementById('user-name').textContent = member.name;
  document.getElementById('user-role-label').textContent =
    member.role.charAt(0).toUpperCase() + member.role.slice(1);
  document.getElementById('sidebar-trust-name').textContent = DB.settings.trustName;

  // Hide Members nav for non-admins
  if (member.role === 'member') {
    document.getElementById('nav-members').style.display = 'none';
  }

  initApp();
}

// Allow pressing Enter on the login form
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('login-page').style.display !== 'none') {
    doLogin();
  }
});
