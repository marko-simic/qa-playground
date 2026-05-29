const STORAGE_KEY = 'qap_users';

function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveUser(user) {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function findUser(email, password) {
  return getUsers().find(u => u.email === email && u.password === password);
}

function emailExists(email) {
  return getUsers().some(u => u.email === email);
}

const registerView = document.getElementById('register-view');
const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');

function showView(view) {
  registerView.hidden = true;
  loginView.hidden = true;
  dashboardView.hidden = true;
  view.hidden = false;
  clearAll();
}

function clearAll() {
  document.querySelectorAll('.field-error').forEach(el => (el.textContent = ''));
  document.querySelectorAll('.form-alert').forEach(el => {
    el.textContent = '';
    el.className = 'form-alert';
  });
  document.querySelectorAll('.field input').forEach(el => el.classList.remove('invalid'));
}

function setFieldError(inputId, errorId, msg) {
  document.getElementById(errorId).textContent = msg;
  document.getElementById(inputId).classList.add('invalid');
}

function setAlert(id, msg, type) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = `form-alert ${type}`;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

document.getElementById('register-form').addEventListener('submit', function (e) {
  e.preventDefault();
  clearAll();

  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;

  let valid = true;

  if (!name) {
    setFieldError('reg-name', 'reg-name-error', 'Full name is required');
    valid = false;
  }

  if (!email) {
    setFieldError('reg-email', 'reg-email-error', 'Email is required');
    valid = false;
  } else if (!emailRegex.test(email)) {
    setFieldError('reg-email', 'reg-email-error', 'Enter a valid email address');
    valid = false;
  } else if (emailExists(email)) {
    setFieldError('reg-email', 'reg-email-error', 'This email is already registered');
    valid = false;
  }

  if (!password) {
    setFieldError('reg-password', 'reg-password-error', 'Password is required');
    valid = false;
  } else if (password.length < 8) {
    setFieldError('reg-password', 'reg-password-error', 'Password must be at least 8 characters');
    valid = false;
  }

  if (!confirm) {
    setFieldError('reg-confirm', 'reg-confirm-error', 'Please confirm your password');
    valid = false;
  } else if (password && confirm !== password) {
    setFieldError('reg-confirm', 'reg-confirm-error', 'Passwords do not match');
    valid = false;
  }

  if (!valid) return;

  saveUser({ name, email, password });
  document.getElementById('register-form').reset();
  showView(loginView);
  setAlert('login-alert', 'Account created successfully! Please log in.', 'success');
});

document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();
  clearAll();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  let valid = true;

  if (!email) {
    setFieldError('login-email', 'login-email-error', 'Email is required');
    valid = false;
  }

  if (!password) {
    setFieldError('login-password', 'login-password-error', 'Password is required');
    valid = false;
  }

  if (!valid) return;

  const user = findUser(email, password);
  if (!user) {
    setAlert('login-alert', 'Invalid email or password', 'error');
    return;
  }

  document.getElementById('login-form').reset();
  document.getElementById('welcome-name').textContent = user.name;
  document.getElementById('welcome-email').textContent = user.email;
  showView(dashboardView);
});

document.querySelectorAll('.toggle-password').forEach(btn => {
  btn.addEventListener('click', function () {
    const input = document.getElementById(this.dataset.target);
    if (input.type === 'password') {
      input.type = 'text';
      this.textContent = 'Hide';
    } else {
      input.type = 'password';
      this.textContent = 'Show';
    }
  });
});

document.getElementById('go-to-login').addEventListener('click', function (e) {
  e.preventDefault();
  showView(loginView);
});

document.getElementById('go-to-register').addEventListener('click', function (e) {
  e.preventDefault();
  showView(registerView);
});

document.getElementById('logout-btn').addEventListener('click', function () {
  showView(loginView);
});
