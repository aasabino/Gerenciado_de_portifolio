/**
 * storage.js - Camada de Persistência Local (LocalStorage)
 * Gerencia projetos, mensagens de contato, perfil do usuário e autenticação.
 */

const STORAGE_KEYS = {
  CURRENT_USER: 'devportfolio_current_user',
  USERS: 'devportfolio_users',
  PROJECTS: 'devportfolio_projects',
  MESSAGES: 'devportfolio_messages',
  PROFILE: 'devportfolio_profile'
};

// Dados padrão iniciais (Seed Data) para uma experiência rica no primeiro uso
const DEFAULT_PROFILE = {
  name: 'Andrey Alves',
  role: 'Desenvolvedor Full Stack & UI/UX Designer',
  bio: 'Criando soluções web modernas, responsivas e de alta performance. Apaixonado por interfaces elegantes, arquiteturas limpas e experiências digitais memoráveis.',
  email: 'AndreyAlves@exemple.com',
  phone: '+55 (11) 98765-4321',
  location: 'Alagoas, Brasil',
  avatar: 'img/default-avatar.svg',
  github: 'https://github.com',
  linkedin: 'https://linkedin.com',
  website: 'https://meuportforlio.dev',
  skills: ['JavaScript', 'HTML5 & CSS3', 'React / Vue', 'Node.js', 'UI/UX Design', 'Git & GitHub', 'REST APIs', 'PostgreSQL']
};

const DEFAULT_PROJECTS = [
  {
    id: 'proj_1',
    title: 'Nexus Flow - SaaS Analytics Dashboard',
    description: 'Plataforma SaaS moderna para métricas em tempo real, visualização de conversões e gráficos interativos com suporte a multi-inquilinos.',
    category: 'Full Stack',
    tags: ['JavaScript', 'CSS Grid', 'APIs', 'Charts'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
    demoUrl: 'https://exemplo.com/demo-analytics',
    githubUrl: 'https://github.com/exemplo/nexus-flow',
    featured: true,
    createdAt: '2026-02-15'
  },
  {
    id: 'proj_2',
    title: 'Aura Market - E-Commerce Minimalista',
    description: 'Experiência de compras ultra fluida com checkout simplificado, filtros dinâmicos de produtos e microinterações de interface.',
    category: 'Frontend',
    tags: ['UI/UX', 'CSS Glassmorphism', 'Vanilla JS', 'E-commerce'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
    demoUrl: 'https://exemplo.com/aura-market',
    githubUrl: 'https://github.com/exemplo/aura-market',
    featured: true,
    createdAt: '2026-03-01'
  },
  {
    id: 'proj_3',
    title: 'TaskMaster Pro - Gestor de Tarefas Ágil',
    description: 'Sistema Kanban interativo com drag-and-drop, prazos, prioridades e notificações de produtividade no navegador.',
    category: 'Web App',
    tags: ['JavaScript', 'LocalStorage', 'Kanban', 'Produtividade'],
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=900&q=80',
    demoUrl: 'https://exemplo.com/taskmaster',
    githubUrl: 'https://github.com/exemplo/taskmaster-pro',
    featured: false,
    createdAt: '2026-03-10'
  }
];

const DEFAULT_USERS = [
  {
    id: 'user_admin',
    name: 'Andrey Alves',
    email: 'admin@portfolio.com',
    password: 'admin123' // Para fins de demonstração no ambiente local
  }
];

const DEFAULT_MESSAGES = [
  {
    id: 'msg_1',
    name: 'Carolina Mendes',
    email: 'carolina@techcorp.io',
    subject: 'Proposta para Projeto Freelance',
    message: 'Olá Andrey! Adorei seus projetos de dashboard. Estamos buscando um desenvolvedor para renovar nossa plataforma web neste trimestre.',
    date: '2026-03-20 14:35',
    read: false
  },
  {
    id: 'msg_2',
    name: 'Rodrigo Bastos',
    email: 'rodrigo@startupbr.com',
    subject: 'Oportunidade Full Stack',
    message: 'Boa tarde! Vimos seu portfólio e gostaríamos de bater um papo sobre uma posição sênior na nossa equipe.',
    date: '2026-03-18 10:12',
    read: true
  }
];

// Helper seguro de Storage
const Storage = {
  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`Erro ao ler localStorage [${key}]:`, e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Erro ao salvar no localStorage [${key}]:`, e);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Erro ao remover do localStorage [${key}]:`, e);
    }
  },

  // Inicializa dados padrão se o storage estiver vazio
  initDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
      this.set(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    } else {
      const savedProfile = this.get(STORAGE_KEYS.PROFILE);
      let updated = false;
      if (savedProfile && (savedProfile.name === 'Alexandre Silva' || savedProfile.name === 'Alexandre')) {
        savedProfile.name = DEFAULT_PROFILE.name;
        updated = true;
      }
      if (savedProfile && (!savedProfile.avatar || savedProfile.avatar.includes('icon-icons.com'))) {
        savedProfile.avatar = DEFAULT_PROFILE.avatar;
        updated = true;
      }
      if (updated) {
        this.set(STORAGE_KEYS.PROFILE, savedProfile);
      }
    }

    if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
      this.set(STORAGE_KEYS.PROJECTS, DEFAULT_PROJECTS);
    }

    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.set(STORAGE_KEYS.USERS, DEFAULT_USERS);
    } else {
      const savedUsers = this.get(STORAGE_KEYS.USERS, []);
      let updatedUsers = false;
      savedUsers.forEach(u => {
        if (u.name === 'Alexandre Silva' || u.name === 'Alexandre') {
          u.name = DEFAULT_USERS[0].name;
          updatedUsers = true;
        }
      });
      if (updatedUsers) this.set(STORAGE_KEYS.USERS, savedUsers);
    }

    // Se houver usuário logado salvo com o nome antigo, atualiza
    const currentUser = this.getCurrentUser();
    if (currentUser && (currentUser.name === 'Alexandre Silva' || currentUser.name === 'Alexandre')) {
      currentUser.name = DEFAULT_USERS[0].name;
      this.setCurrentUser(currentUser);
    }

    if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
      this.set(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES);
    }
  },

  // Perfil
  getProfile() {
    return this.get(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  },
  saveProfile(profile) {
    return this.set(STORAGE_KEYS.PROFILE, profile);
  },

  // Projetos
  getProjects() {
    return this.get(STORAGE_KEYS.PROJECTS, []);
  },
  saveProjects(projects) {
    return this.set(STORAGE_KEYS.PROJECTS, projects);
  },
  addProject(project) {
    const projects = this.getProjects();
    project.id = 'proj_' + Date.now();
    project.createdAt = new Date().toISOString().split('T')[0];
    projects.unshift(project);
    this.saveProjects(projects);
    return project;
  },
  updateProject(id, updatedData) {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updatedData };
      this.saveProjects(projects);
      return projects[index];
    }
    return null;
  },
  deleteProject(id) {
    const projects = this.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    this.saveProjects(filtered);
    return filtered.length !== projects.length;
  },

  // Mensagens
  getMessages() {
    return this.get(STORAGE_KEYS.MESSAGES, []);
  },
  saveMessages(messages) {
    return this.set(STORAGE_KEYS.MESSAGES, messages);
  },
  addMessage(msg) {
    const messages = this.getMessages();
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newMsg = {
      ...msg,
      id: 'msg_' + Date.now(),
      date: formattedDate,
      read: false
    };
    messages.unshift(newMsg);
    this.saveMessages(messages);
    return newMsg;
  },
  markMessageRead(id, isRead = true) {
    const messages = this.getMessages();
    const msg = messages.find(m => m.id === id);
    if (msg) {
      msg.read = isRead;
      this.saveMessages(messages);
    }
  },
  deleteMessage(id) {
    const messages = this.getMessages();
    const filtered = messages.filter(m => m.id !== id);
    this.saveMessages(filtered);
  },

  // Usuários & Sessão
  getUsers() {
    return this.get(STORAGE_KEYS.USERS, []);
  },
  saveUsers(users) {
    return this.set(STORAGE_KEYS.USERS, users);
  },
  getCurrentUser() {
    return this.get(STORAGE_KEYS.CURRENT_USER, null);
  },
  setCurrentUser(user) {
    if (user) {
      const safeUser = { id: user.id, name: user.name, email: user.email };
      this.set(STORAGE_KEYS.CURRENT_USER, safeUser);
    } else {
      this.remove(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // Reset para demonstração
  resetToDefaults() {
    this.set(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    this.set(STORAGE_KEYS.PROJECTS, DEFAULT_PROJECTS);
    this.set(STORAGE_KEYS.USERS, DEFAULT_USERS);
    this.set(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES);
  }
};

// Auto-inicializar ao carregar o script
Storage.initDefaults();
