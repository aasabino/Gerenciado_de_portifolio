/**
 * auth.js - Módulo de Autenticação de Usuários
 * Trata login, registro de novos usuários, logout e controle de sessão.
 */

const Auth = {
  // Retorna o usuário logado atualmente ou null
  getUser() {
    return Storage.getCurrentUser();
  },

  isAuthenticated() {
    return this.getUser() !== null;
  },

  // Realiza login
  login(email, password) {
    const users = Storage.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);

    if (!user) {
      return { success: false, message: 'E-mail ou senha incorretos. Tente novamente.' };
    }

    Storage.setCurrentUser(user);
    this.updateAuthUI();
    return { success: true, user };
  },

  // Registra um novo usuário
  register(name, email, password) {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      return { success: false, message: 'Por favor, preencha todos os campos.' };
    }

    if (password.length < 6) {
      return { success: false, message: 'A senha deve ter no mínimo 6 caracteres.' };
    }

    const users = Storage.getUsers();
    const exists = users.some(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, message: 'Já existe uma conta cadastrada com este e-mail.' };
    }

    const newUser = {
      id: 'user_' + Date.now(),
      name: cleanName,
      email: cleanEmail,
      password: password
    };

    users.push(newUser);
    Storage.saveUsers(users);

    // Auto-login do usuário recém-criado
    Storage.setCurrentUser(newUser);
    this.updateAuthUI();

    return { success: true, user: newUser };
  },

  // Efetua logout
  logout() {
    Storage.setCurrentUser(null);
    this.updateAuthUI();
    App.showView('public');
    App.showToast('Você saiu da sua conta.', 'info');
  },

  // Atualiza botões e indicadores na interface de acordo com a sessão ativa
  updateAuthUI() {
    const user = this.getUser();
    const guestNavBtn = document.getElementById('btn-nav-login');
    const userNavBtn = document.getElementById('btn-nav-dashboard');
    const adminUserBadge = document.getElementById('admin-user-name');

    if (user) {
      if (guestNavBtn) guestNavBtn.classList.add('hidden');
      if (userNavBtn) {
        userNavBtn.classList.remove('hidden');
        userNavBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span>Painel Admin</span>
        `;
      }
      if (adminUserBadge) {
        adminUserBadge.textContent = user.name;
      }
    } else {
      if (guestNavBtn) guestNavBtn.classList.remove('hidden');
      if (userNavBtn) userNavBtn.classList.add('hidden');
    }
  },

  // Configuração dos formulários e modais de autenticação
  initEvents() {
    const authModal = document.getElementById('auth-modal');
    const openLoginBtns = document.querySelectorAll('.open-login-btn');
    const closeAuthBtn = document.getElementById('close-auth-modal');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    const btnLogout = document.getElementById('btn-logout');

    // Abrir modal de Login
    openLoginBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchTab('login');
        authModal.classList.add('active');
      });
    });

    // Fechar modal
    if (closeAuthBtn) {
      closeAuthBtn.addEventListener('click', () => {
        authModal.classList.remove('active');
      });
    }

    // Fechar ao clicar no backdrop
    if (authModal) {
      authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
          authModal.classList.remove('active');
        }
      });
    }

    // Alternar abas Login / Registro
    if (tabLogin && tabRegister) {
      tabLogin.addEventListener('click', () => this.switchTab('login'));
      tabRegister.addEventListener('click', () => this.switchTab('register'));
    }

    // Submissão do Login
    if (formLogin) {
      formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const result = this.login(email, password);
        if (result.success) {
          authModal.classList.remove('active');
          formLogin.reset();
          App.showToast(`Bem-vindo de volta, ${result.user.name}!`, 'success');
          App.showView('admin');
        } else {
          App.showToast(result.message, 'error');
        }
      });
    }

    // Submissão do Cadastro
    if (formRegister) {
      formRegister.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        const result = this.register(name, email, password);
        if (result.success) {
          authModal.classList.remove('active');
          formRegister.reset();
          App.showToast(`Conta criada com sucesso! Bem-vindo, ${result.user.name}.`, 'success');
          App.showView('admin');
        } else {
          App.showToast(result.message, 'error');
        }
      });
    }

    // Logout
    if (btnLogout) {
      btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }
  },

  switchTab(tab) {
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    const modalTitle = document.getElementById('auth-modal-title');

    if (tab === 'login') {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      formLogin.classList.remove('hidden');
      formRegister.classList.add('hidden');
      if (modalTitle) modalTitle.textContent = 'Acessar Painel';
    } else {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      formRegister.classList.remove('hidden');
      formLogin.classList.add('hidden');
      if (modalTitle) modalTitle.textContent = 'Criar Conta de Administrador';
    }
  }
};
