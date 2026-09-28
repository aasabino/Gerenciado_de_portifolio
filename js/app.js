/**
 * app.js - Orquestrador Principal da Aplicação
 * Roteamento entre Visão Pública e Painel Administrativo, Modais, Toasts e Abas.
 */

const App = {
  currentView: 'public', // 'public' | 'admin'
  currentAdminTab: 'projects', // 'projects' | 'messages' | 'profile' | 'settings'

  init() {
    // Inicializar módulos
    Auth.initEvents();
    Projects.init();
    Contact.init();
    this.initNavigation();
    this.initAdminTabs();
    this.initSettings();
    this.initMobileMenu();

    // Atualizar UI de autenticação inicial
    Auth.updateAuthUI();

    // Atalho demo no modal de login
    const btnDemoLogin = document.getElementById('btn-fill-demo');
    if (btnDemoLogin) {
      btnDemoLogin.addEventListener('click', () => {
        document.getElementById('login-email').value = 'admin@portfolio.com';
        document.getElementById('login-password').value = 'admin123';
        this.showToast('Credenciais de demonstração preenchidas!', 'info');
      });
    }

    console.log('🚀 Portfolio Manager inicializado com sucesso.');
  },

  // Alterna entre o Portfólio Público e o Painel Administrativo
  showView(viewName) {
    if (viewName === 'admin' && !Auth.isAuthenticated()) {
      this.showToast('Faça login para acessar o painel administrativo.', 'warning');
      const authModal = document.getElementById('auth-modal');
      if (authModal) {
        Auth.switchTab('login');
        authModal.classList.add('active');
      }
      return;
    }

    this.currentView = viewName;
    const publicView = document.getElementById('view-public');
    const adminView = document.getElementById('view-admin');

    if (viewName === 'admin') {
      publicView.classList.add('hidden');
      adminView.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Atualizar dados frescos no painel
      Projects.renderAdminProjects();
      Contact.renderAdminMessages();
      Contact.renderProfile();
    } else {
      adminView.classList.add('hidden');
      publicView.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Atualizar dados frescos no público
      Projects.renderPublicProjects();
      Contact.renderProfile();
    }
  },

  // Navegação entre seções públicas e botões de troca de visão
  initNavigation() {
    const navDashboardBtn = document.getElementById('btn-nav-dashboard');
    const backToPublicBtns = document.querySelectorAll('.btn-back-to-public');

    if (navDashboardBtn) {
      navDashboardBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showView('admin');
      });
    }

    backToPublicBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showView('public');
      });
    });

    // Rolagem suave para links de âncora da navegação pública (#about, #projects, #contact)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#' || !href.startsWith('#')) return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          if (this.currentView !== 'public') {
            this.showView('public');
            setTimeout(() => {
              target.scrollIntoView({ behavior: 'smooth' });
            }, 50);
          } else {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  },

  // Gerenciamento de abas dentro do Painel Administrativo
  initAdminTabs() {
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    const tabPanes = document.querySelectorAll('.admin-tab-pane');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));

        btn.classList.add('active');
        const activePane = document.getElementById(`tab-pane-${targetTab}`);
        if (activePane) activePane.classList.add('active');

        this.currentAdminTab = targetTab;
      });
    });
  },

  // Configurações e Backup
  initSettings() {
    const btnExport = document.getElementById('btn-export-data');
    const fileImport = document.getElementById('file-import-data');
    const btnReset = document.getElementById('btn-reset-defaults');

    // Exportar dados como JSON
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const backup = {
          version: '1.0',
          exportedAt: new Date().toISOString(),
          profile: Storage.getProfile(),
          projects: Storage.getProjects(),
          messages: Storage.getMessages()
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `backup_portfolio_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        this.showToast('Backup exportado com sucesso!', 'success');
      });
    }

    // Importar backup JSON
    if (fileImport) {
      fileImport.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            if (data.profile) Storage.saveProfile(data.profile);
            if (data.projects) Storage.saveProjects(data.projects);
            if (data.messages) Storage.saveMessages(data.messages);

            Contact.renderProfile();
            Projects.renderPublicProjects();
            Projects.renderAdminProjects();
            Contact.renderAdminMessages();

            this.showToast('Dados restaurados com sucesso a partir do backup!', 'success');
            fileImport.value = '';
          } catch (err) {
            this.showToast('Arquivo de backup inválido. Verifique o formato JSON.', 'error');
          }
        };
        reader.readAsText(file);
      });
    }

    // Resetar para dados padrão
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('Atenção: Isso redefinirá seus projetos, perfil e mensagens para os dados originais de demonstração. Deseja continuar?')) {
          Storage.resetToDefaults();
          Contact.renderProfile();
          Projects.renderPublicProjects();
          Projects.renderAdminProjects();
          Contact.renderAdminMessages();
          this.showToast('Portfólio restaurado para o modelo padrão!', 'info');
        }
      });
    }
  },

  // Menu mobile hambúrguer
  initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (toggleBtn && navLinks) {
      toggleBtn.addEventListener('click', () => {
        navLinks.classList.toggle('open');
      });

      // Fechar menu ao clicar em um link
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('open');
        });
      });
    }
  },

  // Sistema de Notificações Toast Moderno
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    } else if (type === 'warning') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-message">${this.escapeHtml(message)}</div>
      <button class="toast-close">&times;</button>
    `;

    container.appendChild(toast);

    // Animar entrada
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    const removeToast = () => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 300);
    };

    toast.querySelector('.toast-close').addEventListener('click', removeToast);

    // Auto-remover após 4 segundos
    setTimeout(removeToast, 4000);
  },

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

// Disparar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
