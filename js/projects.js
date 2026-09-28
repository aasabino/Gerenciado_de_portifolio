/**
 * projects.js - Gerenciamento de Projetos (CRUD & Renderização)
 * Exibição no Portfólio Público e Painel de Controle Administrativo.
 */

const Projects = {
  activeCategory: 'all',
  searchQuery: '',
  adminSearchQuery: '',
  currentEditingId: null,

  init() {
    this.renderPublicProjects();
    this.renderAdminProjects();
    this.initEvents();
  },

  // Renderiza os projetos no portfólio público
  renderPublicProjects() {
    const grid = document.getElementById('public-projects-grid');
    if (!grid) return;

    let projects = Storage.getProjects();

    // Filtro de Categoria
    if (this.activeCategory !== 'all') {
      projects = projects.filter(p => 
        (p.category && p.category.toLowerCase() === this.activeCategory.toLowerCase()) ||
        (p.tags && p.tags.some(t => t.toLowerCase() === this.activeCategory.toLowerCase()))
      );
    }

    // Filtro de Busca
    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();
      projects = projects.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    if (projects.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <h3>Nenhum projeto encontrado</h3>
          <p>Tente buscar por outro termo ou selecione outra categoria.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = projects.map(proj => `
      <article class="project-card ${proj.featured ? 'featured' : ''}" data-id="${proj.id}">
        <div class="project-img-wrapper">
          <img src="${proj.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'}" 
               alt="${this.escapeHtml(proj.title)}" 
               loading="lazy" 
               onerror="this.src='https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'">
          ${proj.featured ? '<span class="badge badge-featured">Destaque</span>' : ''}
          <span class="badge badge-category">${this.escapeHtml(proj.category || 'Geral')}</span>
        </div>
        <div class="project-content">
          <div class="project-tags">
            ${(proj.tags || []).map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
          </div>
          <h3 class="project-title">${this.escapeHtml(proj.title)}</h3>
          <p class="project-desc">${this.escapeHtml(proj.description)}</p>
          <div class="project-actions">
            ${proj.demoUrl ? `
              <a href="${proj.demoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                Ver Demo
              </a>
            ` : ''}
            ${proj.githubUrl ? `
              <a href="${proj.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-secondary">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                Código
              </a>
            ` : ''}
          </div>
        </div>
      </article>
    `).join('');
  },

  // Renderiza a tabela/cards do painel administrativo
  renderAdminProjects() {
    const list = document.getElementById('admin-projects-list');
    const countBadge = document.getElementById('stat-total-projects');
    if (!list) return;

    let projects = Storage.getProjects();

    if (countBadge) {
      countBadge.textContent = projects.length;
    }

    if (this.adminSearchQuery.trim() !== '') {
      const q = this.adminSearchQuery.toLowerCase();
      projects = projects.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    if (projects.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <p>Nenhum projeto cadastrado ainda. Clique em "Novo Projeto" para começar!</p>
        </div>
      `;
      return;
    }

    list.innerHTML = projects.map(proj => `
      <div class="admin-project-row" data-id="${proj.id}">
        <div class="admin-project-thumb">
          <img src="${proj.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=200&q=80'}" alt="">
        </div>
        <div class="admin-project-info">
          <div class="admin-project-title-row">
            <h4>${this.escapeHtml(proj.title)}</h4>
            ${proj.featured ? '<span class="badge badge-featured">Destaque</span>' : ''}
            <span class="badge badge-category">${this.escapeHtml(proj.category || 'Geral')}</span>
          </div>
          <p class="admin-project-desc">${this.escapeHtml(proj.description)}</p>
          <div class="admin-project-tags">
            ${(proj.tags || []).map(t => `<span class="tag-sm">${this.escapeHtml(t)}</span>`).join('')}
          </div>
        </div>
        <div class="admin-project-actions">
          <button class="btn-icon btn-edit-proj" data-id="${proj.id}" title="Editar Projeto">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="btn-icon btn-delete-proj text-danger" data-id="${proj.id}" title="Excluir Projeto">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `).join('');

    // Conectar botões de ação nos itens criados
    list.querySelectorAll('.btn-edit-proj').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.openEditModal(id);
      });
    });

    list.querySelectorAll('.btn-delete-proj').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.confirmDelete(id);
      });
    });
  },

  // Abrir modal de criação
  openCreateModal() {
    this.currentEditingId = null;
    const modal = document.getElementById('project-modal');
    const form = document.getElementById('form-project');
    const title = document.getElementById('project-modal-title');
    
    if (form) form.reset();
    if (title) title.textContent = 'Adicionar Novo Projeto';
    
    // Reset preview de imagem
    const imgPreview = document.getElementById('project-image-preview');
    if (imgPreview) {
      imgPreview.src = '';
      imgPreview.classList.add('hidden');
    }

    if (modal) modal.classList.add('active');
  },

  // Abrir modal de edição preenchido com dados existentes
  openEditModal(id) {
    const projects = Storage.getProjects();
    const proj = projects.find(p => p.id === id);
    if (!proj) return;

    this.currentEditingId = id;
    const modal = document.getElementById('project-modal');
    const title = document.getElementById('project-modal-title');

    if (title) title.textContent = 'Editar Projeto';

    document.getElementById('proj-title').value = proj.title || '';
    document.getElementById('proj-category').value = proj.category || 'Frontend';
    document.getElementById('proj-tags').value = (proj.tags || []).join(', ');
    document.getElementById('proj-description').value = proj.description || '';
    document.getElementById('proj-image').value = proj.image || '';
    document.getElementById('proj-demo').value = proj.demoUrl || '';
    document.getElementById('proj-github').value = proj.githubUrl || '';
    document.getElementById('proj-featured').checked = !!proj.featured;

    const imgPreview = document.getElementById('project-image-preview');
    if (imgPreview && proj.image) {
      imgPreview.src = proj.image;
      imgPreview.classList.remove('hidden');
    } else if (imgPreview) {
      imgPreview.classList.add('hidden');
    }

    if (modal) modal.classList.add('active');
  },

  // Salvar projeto (Criar ou Atualizar)
  saveFromForm() {
    const title = document.getElementById('proj-title').value.trim();
    const category = document.getElementById('proj-category').value;
    const tagsInput = document.getElementById('proj-tags').value;
    const description = document.getElementById('proj-description').value.trim();
    const image = document.getElementById('proj-image').value.trim();
    const demoUrl = document.getElementById('proj-demo').value.trim();
    const githubUrl = document.getElementById('proj-github').value.trim();
    const featured = document.getElementById('proj-featured').checked;

    if (!title || !description) {
      App.showToast('Por favor, preencha o título e a descrição do projeto.', 'error');
      return false;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const projectData = {
      title,
      category,
      tags,
      description,
      image: image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      demoUrl,
      githubUrl,
      featured
    };

    if (this.currentEditingId) {
      Storage.updateProject(this.currentEditingId, projectData);
      App.showToast('Projeto atualizado com sucesso!', 'success');
    } else {
      Storage.addProject(projectData);
      App.showToast('Projeto cadastrado com sucesso!', 'success');
    }

    const modal = document.getElementById('project-modal');
    if (modal) modal.classList.remove('active');

    this.renderPublicProjects();
    this.renderAdminProjects();
    return true;
  },

  // Confirmação e exclusão de projeto
  confirmDelete(id) {
    const projects = Storage.getProjects();
    const proj = projects.find(p => p.id === id);
    if (!proj) return;

    if (confirm(`Tem certeza que deseja excluir o projeto "${proj.title}"? Esta ação não pode ser desfeita.`)) {
      Storage.deleteProject(id);
      App.showToast('Projeto excluído com sucesso.', 'info');
      this.renderPublicProjects();
      this.renderAdminProjects();
    }
  },

  // Event Listeners dos botões de criação, filtros e modal
  initEvents() {
    const btnNewProject = document.getElementById('btn-new-project');
    const projectModal = document.getElementById('project-modal');
    const closeProjectModal = document.getElementById('close-project-modal');
    const cancelProjectBtn = document.getElementById('btn-cancel-project');
    const formProject = document.getElementById('form-project');
    const imageInput = document.getElementById('proj-image');
    const imageFile = document.getElementById('proj-image-file');
    const imgPreview = document.getElementById('project-image-preview');

    if (btnNewProject) {
      btnNewProject.addEventListener('click', () => this.openCreateModal());
    }

    if (closeProjectModal) {
      closeProjectModal.addEventListener('click', () => projectModal.classList.remove('active'));
    }

    if (cancelProjectBtn) {
      cancelProjectBtn.addEventListener('click', () => projectModal.classList.remove('active'));
    }

    if (projectModal) {
      projectModal.addEventListener('click', (e) => {
        if (e.target === projectModal) projectModal.classList.remove('active');
      });
    }

    if (formProject) {
      formProject.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveFromForm();
      });
    }

    // Pré-visualização da URL da imagem
    if (imageInput && imgPreview) {
      imageInput.addEventListener('input', () => {
        if (imageInput.value.trim()) {
          imgPreview.src = imageInput.value.trim();
          imgPreview.classList.remove('hidden');
        } else {
          imgPreview.classList.add('hidden');
        }
      });
    }

    // Suporte para upload de arquivo de imagem local (convertido para base64)
    if (imageFile && imageInput && imgPreview) {
      imageFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            imageInput.value = event.target.result;
            imgPreview.src = event.target.result;
            imgPreview.classList.remove('hidden');
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Filtros de Categoria no Portfólio Público
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = btn.getAttribute('data-filter') || 'all';
        this.renderPublicProjects();
      });
    });

    // Busca de Projetos no Portfólio Público
    const publicSearchInput = document.getElementById('public-project-search');
    if (publicSearchInput) {
      publicSearchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderPublicProjects();
      });
    }

    // Busca de Projetos no Painel Admin
    const adminSearchInput = document.getElementById('admin-project-search');
    if (adminSearchInput) {
      adminSearchInput.addEventListener('input', (e) => {
        this.adminSearchQuery = e.target.value;
        this.renderAdminProjects();
      });
    }
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
