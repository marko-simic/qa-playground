const STORAGE_KEY = 'qap_board';

const COLUMN_LABELS = {
  todo: 'To Do',
  inprogress: 'In Progress',
  inreview: 'In Review',
  done: 'Done',
};

const DEFAULT_ISSUES = [
  {
    id: 'QAP-1',
    title: 'Fix login form validation',
    type: 'bug',
    priority: 'high',
    assignee: 'Alice',
    column: 'todo',
    description: 'Login form accepts empty passwords and does not validate email format.',
  },
  {
    id: 'QAP-2',
    title: 'Add user profile page',
    type: 'story',
    priority: 'medium',
    assignee: 'Bob',
    column: 'todo',
    description: 'Users should be able to view and update their profile information.',
  },
  {
    id: 'QAP-3',
    title: 'Write REST API tests',
    type: 'task',
    priority: 'low',
    assignee: 'Carol',
    column: 'todo',
    description: 'Create automated tests covering all public REST endpoints.',
  },
  {
    id: 'QAP-4',
    title: 'Update navigation menu',
    type: 'task',
    priority: 'medium',
    assignee: 'Alice',
    column: 'inprogress',
    description: 'Re-order navigation items according to the latest design specifications.',
  },
  {
    id: 'QAP-5',
    title: 'Improve dashboard performance',
    type: 'story',
    priority: 'high',
    assignee: 'Bob',
    column: 'inprogress',
    description: 'Dashboard takes over 4 seconds to load. Optimize queries and add caching.',
  },
  {
    id: 'QAP-6',
    title: 'Fix broken search results',
    type: 'bug',
    priority: 'critical',
    assignee: 'Carol',
    column: 'inreview',
    description: 'Search returns incorrect results when the query contains special characters.',
  },
  {
    id: 'QAP-7',
    title: 'Implement dark mode',
    type: 'story',
    priority: 'low',
    assignee: 'Alice',
    column: 'done',
    description: 'Add a dark mode toggle to the settings page and persist the preference.',
  },
  {
    id: 'QAP-8',
    title: 'Fix mobile layout overflow',
    type: 'bug',
    priority: 'high',
    assignee: 'Bob',
    column: 'done',
    description: 'Cards overflow the viewport on screens narrower than 375px.',
  },
];

let state = loadState();
let draggedId = null;

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return { issues: DEFAULT_ISSUES.map(i => ({ ...i })), nextNum: 9 };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function getInitials(name) {
  if (!name || name === 'Unassigned') return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function createCard(issue) {
  const card = document.createElement('div');
  card.className = 'issue-card';
  card.setAttribute('draggable', 'true');
  card.dataset.id = issue.id;
  card.setAttribute('data-type', issue.type);
  card.setAttribute('data-priority', issue.priority);
  card.setAttribute('data-assignee', issue.assignee);
  card.setAttribute('data-column', issue.column);

  card.innerHTML = `
    <div class="card-top">
      <span class="type-badge type-${esc(issue.type)}">${esc(issue.type)}</span>
      <button class="card-delete" aria-label="Delete ${esc(issue.id)}">&times;</button>
    </div>
    <p class="card-title">${esc(issue.title)}</p>
    <div class="card-bottom">
      <span class="priority-badge priority-${esc(issue.priority)}">${esc(issue.priority)}</span>
      <span class="avatar" title="${esc(issue.assignee)}">${getInitials(issue.assignee)}</span>
    </div>
    <div class="card-id">${esc(issue.id)}</div>
  `;

  card.addEventListener('dragstart', e => {
    draggedId = issue.id;
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => card.classList.add('dragging'), 0);
  });

  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
    draggedId = null;
  });

  card.addEventListener('click', e => {
    if (!e.target.closest('.card-delete')) showDetail(issue.id);
  });

  card.querySelector('.card-delete').addEventListener('click', e => {
    e.stopPropagation();
    showConfirm(issue.id);
  });

  return card;
}

function render() {
  const filterAssignee = document.getElementById('filter-assignee').value;
  const filterPriority = document.getElementById('filter-priority').value;
  const columns = ['todo', 'inprogress', 'inreview', 'done'];

  columns.forEach(col => {
    const body = document.getElementById(`body-${col}`);
    body.innerHTML = '';

    const visible = state.issues.filter(i => {
      if (i.column !== col) return false;
      if (filterAssignee && i.assignee !== filterAssignee) return false;
      if (filterPriority && i.priority !== filterPriority) return false;
      return true;
    });

    if (visible.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'column-empty';
      empty.textContent = filterAssignee || filterPriority ? 'No matching issues' : 'No issues';
      body.appendChild(empty);
    } else {
      visible.forEach(issue => body.appendChild(createCard(issue)));
    }

    // Counts always reflect the unfiltered total per column
    const total = state.issues.filter(i => i.column === col).length;
    document.getElementById(`count-${col}`).textContent = total;
  });

  const total = state.issues.length;
  document.getElementById('total-count').textContent =
    `${total} issue${total !== 1 ? 's' : ''}`;
}

// ── Drag & drop ──
document.querySelectorAll('.column-body').forEach(body => {
  body.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    body.classList.add('drag-over');
  });

  body.addEventListener('dragleave', e => {
    if (!body.contains(e.relatedTarget)) body.classList.remove('drag-over');
  });

  body.addEventListener('drop', e => {
    e.preventDefault();
    body.classList.remove('drag-over');
    if (!draggedId) return;
    const targetColumn = body.dataset.column;
    const issue = state.issues.find(i => i.id === draggedId);
    if (issue && issue.column !== targetColumn) {
      issue.column = targetColumn;
      saveState();
      render();
    }
  });
});

// ── Create modal ──
const createModal = document.getElementById('create-modal');
const createForm = document.getElementById('create-form');

document.getElementById('create-btn').addEventListener('click', () => {
  createForm.reset();
  document.getElementById('new-title-error').textContent = '';
  document.getElementById('new-title').classList.remove('invalid');
  createModal.hidden = false;
  document.getElementById('new-title').focus();
});

function closeCreate() {
  createModal.hidden = true;
}

document.getElementById('create-close').addEventListener('click', closeCreate);
document.getElementById('create-cancel').addEventListener('click', closeCreate);
createModal.addEventListener('click', e => { if (e.target === createModal) closeCreate(); });

createForm.addEventListener('submit', e => {
  e.preventDefault();
  const titleInput = document.getElementById('new-title');
  const title = titleInput.value.trim();

  if (!title) {
    document.getElementById('new-title-error').textContent = 'Title is required';
    titleInput.classList.add('invalid');
    titleInput.focus();
    return;
  }

  const issue = {
    id: `QAP-${state.nextNum++}`,
    title,
    type: document.getElementById('new-type').value,
    priority: document.getElementById('new-priority').value,
    assignee: document.getElementById('new-assignee').value,
    column: 'todo',
    description: document.getElementById('new-desc').value.trim(),
  };

  state.issues.push(issue);
  saveState();
  render();
  closeCreate();
});

// ── Confirm delete modal ──
const confirmModal = document.getElementById('confirm-modal');
let pendingDeleteId = null;

function showConfirm(id) {
  const issue = state.issues.find(i => i.id === id);
  if (!issue) return;
  pendingDeleteId = id;
  document.getElementById('confirm-message').textContent =
    `${issue.id}: "${issue.title}" will be permanently removed.`;
  confirmModal.hidden = false;
}

function closeConfirm() {
  confirmModal.hidden = true;
  pendingDeleteId = null;
}

document.getElementById('confirm-cancel').addEventListener('click', closeConfirm);
confirmModal.addEventListener('click', e => { if (e.target === confirmModal) closeConfirm(); });

document.getElementById('confirm-delete').addEventListener('click', () => {
  if (!pendingDeleteId) return;
  state.issues = state.issues.filter(i => i.id !== pendingDeleteId);
  saveState();
  render();
  closeConfirm();
});

// ── Detail modal ──
const detailModal = document.getElementById('detail-modal');

function showDetail(id) {
  const issue = state.issues.find(i => i.id === id);
  if (!issue) return;

  document.getElementById('detail-id').textContent = issue.id;

  const typeEl = document.getElementById('detail-type');
  typeEl.textContent = issue.type;
  typeEl.className = `type-badge type-${issue.type}`;

  const priEl = document.getElementById('detail-priority');
  priEl.textContent = issue.priority;
  priEl.className = `priority-badge priority-${issue.priority}`;

  document.getElementById('detail-modal-title').textContent = issue.title;
  document.getElementById('detail-status').textContent = COLUMN_LABELS[issue.column];
  document.getElementById('detail-assignee').textContent = issue.assignee;
  document.getElementById('detail-desc').textContent = issue.description || '—';

  detailModal.hidden = false;
}

function closeDetail() {
  detailModal.hidden = true;
}

document.getElementById('detail-close').addEventListener('click', closeDetail);
document.getElementById('detail-close-btn').addEventListener('click', closeDetail);
detailModal.addEventListener('click', e => { if (e.target === detailModal) closeDetail(); });

// Close modals on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeCreate();
    closeDetail();
    closeConfirm();
  }
});

// ── Filters ──
document.getElementById('filter-assignee').addEventListener('change', render);
document.getElementById('filter-priority').addEventListener('change', render);

// ── Init ──
render();
