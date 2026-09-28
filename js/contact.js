/**
 * contact.js - Gestão de Mensagens e Informações de Contato / Perfil
 * Trata o formulário de contato público, caixa de entrada do admin e edição do perfil.
 */

const Contact = {
  init() {
    this.renderProfile();
    this.renderAdminMessages();
    this.initEvents();
  },

  // Renderiza as informações do dono do portfólio no público e no formulário de edição
  renderProfile() {
    const profile = Storage.getProfile();

    // Atualização nos elementos públicos
    const nameEls = document.querySelectorAll('.profile-name');
    const roleEls = document.querySelectorAll('.profile-role');
    const bioEls = document.querySelectorAll('.profile-bio');
    const emailEls = document.querySelectorAll('.profile-email');
    const phoneEls = document.querySelectorAll('.profile-phone');
    const locationEls = document.querySelectorAll('.profile-location');
    const avatarEls = document.querySelectorAll('.profile-avatar');
    const githubEls = document.querySelectorAll('.profile-github');
    const linkedinEls = document.querySelectorAll('.profile-linkedin');
    const websiteEls = document.querySelectorAll('.profile-website');
    const skillsContainer = document.getElementById('profile-skills-list');

    nameEls.forEach(el => el.textContent = profile.name || 'Seu Nome');
    roleEls.forEach(el => el.textContent = profile.role || 'Desenvolvedor');
    bioEls.forEach(el => el.textContent = profile.bio || '');
    emailEls.forEach(el => {
      el.textContent = profile.email || 'contato@exemplo.com';
      if (el.tagName === 'A') el.href = `mailto:${profile.email}`;
    });
    phoneEls.forEach(el => {
      el.textContent = profile.phone || '';
      if (el.tagName === 'A' && profile.phone) {
        const cleanPhone = profile.phone.replace(/\D/g, '');
        el.href = `https://wa.me/${cleanPhone}`;
      }
    });
    locationEls.forEach(el => el.textContent = profile.location || 'Brasil');

    avatarEls.forEach(el => {
      if (el.tagName === 'IMG') {
        el.src = profile.avatar || 'img/default-avatar.svg';
        el.alt = profile.name || 'Foto de Perfil';
        el.onerror = function() {
          this.onerror = null;
          this.src = 'img/default-avatar.svg';
        };
      }
    });

    if (githubEls) {
      githubEls.forEach(el => {
        if (profile.github) {
          el.href = profile.github;
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      });
    }

    if (linkedinEls) {
      linkedinEls.forEach(el => {
        if (profile.linkedin) {
          el.href = profile.linkedin;
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      });
    }

    if (websiteEls) {
      websiteEls.forEach(el => {
        if (profile.website) {
          el.href = profile.website;
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      });
    }

    // Lista de Habilidades / Skills
    if (skillsContainer) {
      const skills = profile.skills || [];
      skillsContainer.innerHTML = skills.map(skill => `
        <span class="skill-pill">
          <span class="skill-dot"></span>
          ${this.escapeHtml(skill)}
        </span>
      `).join('');
    }

    // Preenche o formulário no painel administrativo
    const inputName = document.getElementById('edit-profile-name');
    const inputRole = document.getElementById('edit-profile-role');
    const inputBio = document.getElementById('edit-profile-bio');
    const inputEmail = document.getElementById('edit-profile-email');
    const inputPhone = document.getElementById('edit-profile-phone');
    const inputLocation = document.getElementById('edit-profile-location');
    const inputAvatar = document.getElementById('edit-profile-avatar');
    const inputGithub = document.getElementById('edit-profile-github');
    const inputLinkedin = document.getElementById('edit-profile-linkedin');
    const inputWebsite = document.getElementById('edit-profile-website');
    const inputSkills = document.getElementById('edit-profile-skills');

    if (inputName) inputName.value = profile.name || '';
    if (inputRole) inputRole.value = profile.role || '';
    if (inputBio) inputBio.value = profile.bio || '';
    if (inputEmail) inputEmail.value = profile.email || '';
    if (inputPhone) inputPhone.value = profile.phone || '';
    if (inputLocation) inputLocation.value = profile.location || '';
    if (inputAvatar) inputAvatar.value = profile.avatar || '';
    if (inputGithub) inputGithub.value = profile.github || '';
    if (inputLinkedin) inputLinkedin.value = profile.linkedin || '';
    if (inputWebsite) inputWebsite.value = profile.website || '';
    if (inputSkills) inputSkills.value = (profile.skills || []).join(', ');
  },

  // Salvar perfil editado no painel administrativo
  saveProfileFromForm() {
    const name = document.getElementById('edit-profile-name').value.trim();
    const role = document.getElementById('edit-profile-role').value.trim();
    const bio = document.getElementById('edit-profile-bio').value.trim();
    const email = document.getElementById('edit-profile-email').value.trim();
    const phone = document.getElementById('edit-profile-phone').value.trim();
    const location = document.getElementById('edit-profile-location').value.trim();
    const avatar = document.getElementById('edit-profile-avatar').value.trim();
    const github = document.getElementById('edit-profile-github').value.trim();
    const linkedin = document.getElementById('edit-profile-linkedin').value.trim();
    const website = document.getElementById('edit-profile-website').value.trim();
    const skillsRaw = document.getElementById('edit-profile-skills').value;

    if (!name || !email) {
      App.showToast('Por favor, informe ao menos seu nome e e-mail de contato.', 'error');
      return;
    }

    const skills = skillsRaw
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const updatedProfile = {
      name,
      role,
      bio,
      email,
      phone,
      location,
      avatar,
      github,
      linkedin,
      website,
      skills
    };

    Storage.saveProfile(updatedProfile);
    this.renderProfile();
    App.showToast('Informações de perfil e contato salvas com sucesso!', 'success');
  },

  // Renderiza a caixa de entrada de mensagens no painel
  renderAdminMessages() {
    const list = document.getElementById('admin-messages-list');
    const countBadge = document.getElementById('stat-total-messages');
    const unreadBadge = document.getElementById('badge-unread-messages');
    if (!list) return;

    const messages = Storage.getMessages();
    const unreadCount = messages.filter(m => !m.read).length;

    if (countBadge) countBadge.textContent = messages.length;
    if (unreadBadge) {
      if (unreadCount > 0) {
        unreadBadge.textContent = unreadCount;
        unreadBadge.classList.remove('hidden');
      } else {
        unreadBadge.classList.add('hidden');
      }
    }

    if (messages.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <p>Nenhuma mensagem recebida ainda.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = messages.map(msg => `
      <div class="admin-message-card ${msg.read ? 'read' : 'unread'}" data-id="${msg.id}">
        <div class="msg-header">
          <div class="msg-sender">
            <span class="msg-status-dot ${msg.read ? 'dot-read' : 'dot-unread'}"></span>
            <strong>${this.escapeHtml(msg.name)}</strong>
            <span class="msg-email">&lt;${this.escapeHtml(msg.email)}&gt;</span>
          </div>
          <span class="msg-date">${msg.date}</span>
        </div>
        <div class="msg-subject">${this.escapeHtml(msg.subject || 'Sem assunto')}</div>
        <p class="msg-body">${this.escapeHtml(msg.message)}</p>
        <div class="msg-actions">
          <a href="mailto:${this.escapeHtml(msg.email)}?subject=Re: ${encodeURIComponent(msg.subject || 'Contato do Portfólio')}" class="btn btn-sm btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            Responder
          </a>
          <button class="btn btn-sm btn-ghost btn-toggle-read" data-id="${msg.id}">
            ${msg.read ? 'Marcar como não lida' : 'Marcar como lida'}
          </button>
          <button class="btn btn-sm btn-ghost text-danger btn-delete-msg" data-id="${msg.id}">
            Excluir
          </button>
        </div>
      </div>
    `).join('');

    // Eventos nos botões das mensagens
    list.querySelectorAll('.btn-toggle-read').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const msg = messages.find(m => m.id === id);
        if (msg) {
          Storage.markMessageRead(id, !msg.read);
          this.renderAdminMessages();
        }
      });
    });

    list.querySelectorAll('.btn-delete-msg').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Deseja realmente excluir esta mensagem?')) {
          Storage.deleteMessage(id);
          this.renderAdminMessages();
          App.showToast('Mensagem excluída.', 'info');
        }
      });
    });
  },

  // Inicializa eventos do formulário de contato público e do perfil
  initEvents() {
    const contactForm = document.getElementById('public-contact-form');
    const profileForm = document.getElementById('form-edit-profile');

    // Envio do formulário público de contato
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const subject = document.getElementById('contact-subject').value.trim();
        const message = document.getElementById('contact-message').value.trim();

        if (!name || !email || !message) {
          App.showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
          return;
        }

        Storage.addMessage({ name, email, subject, message });
        contactForm.reset();
        App.showToast('Obrigado! Sua mensagem foi enviada com sucesso.', 'success');
        this.renderAdminMessages();
      });
    }

    // Formulário de Perfil no Admin
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveProfileFromForm();
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
