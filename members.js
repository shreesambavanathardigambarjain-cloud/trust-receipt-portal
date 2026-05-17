/**
 * members.js — Trust member CRUD & role management
 * Trust E-Receipt Portal
 */

/* ── Render members list ─────────────────────────────────────── */

function renderMembers() {
  const list = document.getElementById('members-list');

  list.innerHTML = DB.members.map((m, i) => `
    <div class="member-row">
      <div class="member-avatar">${m.name[0].toUpperCase()}</div>
      <div class="member-info">
        <div class="mn">${m.name}</div>
        <div class="mid">
          ID: <strong>${m.id}</strong>
          &nbsp;|&nbsp; ${m.role}
          ${m.wa ? '&nbsp;|&nbsp; WA: ' + m.wa : ''}
        </div>
      </div>
      <span class="badge ${
        m.role === 'admin'     ? 'badge-danger' :
        m.role === 'treasurer' ? 'badge-warn'   : 'badge-info'
      }">${m.role}</span>
      ${DB.currentUser.role === 'admin' && m.id !== DB.currentUser.id
        ? `<button class="btn btn-ghost btn-sm" onclick="deleteMember(${i})" style="color:var(--danger)" title="Remove member">🗑</button>`
        : ''}
    </div>`).join('');
}

/* ── Add member modal ────────────────────────────────────────── */

function openAddMember() {
  ['m-name', 'm-uid', 'm-pwd', 'm-wa'].forEach(id => (document.getElementById(id).value = ''));
  document.getElementById('m-role').value = 'member';
  document.getElementById('modal-member').style.display = 'flex';
}

function addMember() {
  const name = document.getElementById('m-name').value.trim();
  const uid  = document.getElementById('m-uid').value.trim();
  const pwd  = document.getElementById('m-pwd').value.trim();
  const role = document.getElementById('m-role').value;
  const wa   = document.getElementById('m-wa').value.trim();

  if (!name || !uid || !pwd) {
    toast('Name, User ID and Password are required', 'danger');
    return;
  }
  if (DB.members.find(m => m.id === uid)) {
    toast('User ID already exists — choose a different one', 'danger');
    return;
  }

  DB.members.push({ id: uid, name, pwd, role, wa });
  saveDB();
  closeModal('modal-member');
  renderMembers();
  toast(`Member "${name}" added successfully!`, 'success');
}

/* ── Remove member ───────────────────────────────────────────── */

function deleteMember(i) {
  const member = DB.members[i];
  if (!member) return;
  if (!confirm(`Remove "${member.name}" from the portal? They will no longer be able to log in.`)) return;
  DB.members.splice(i, 1);
  saveDB();
  renderMembers();
  toast(`"${member.name}" removed`, 'danger');
}
