/* ============================================================
   Lógica del portfolio: idioma automático (es/en) + perfiles
   ============================================================ */

(function () {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  /* ---------- Estado ---------- */
  // Idioma: preferencia guardada > idioma del navegador > español
  let lang = localStorage.getItem('lang');
  if (!lang) {
    lang = (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en';
  }
  // Perfil: preferencia guardada > developer
  let profile = localStorage.getItem('profile') || 'dev';

  /* ---------- Render ---------- */
  function render() {
    const t = CONTENT[lang];
    const p = t.profiles[profile];

    document.documentElement.lang = lang;
    document.body.dataset.profile = profile;
    localStorage.setItem('lang', lang);
    localStorage.setItem('profile', profile);

    // Textos estáticos marcados con data-i18n
    $$('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      if (t.ui[key]) el.textContent = t.ui[key];
    });

    // Botón de idioma muestra el idioma al que se cambia
    $('[data-lang-label]').textContent = lang === 'es' ? 'EN' : 'ES';

    // Hero
    swap($('#heroRole'), p.role);
    swap($('#heroTagline'), p.tagline);
    swap($('#heroSummary'), p.summary);
    $('#chipTop').textContent = p.chipTop;
    $('#chipBottom').textContent = p.chipBottom;
    $('#cvDownload').setAttribute('href', p.cv);

    // Tabs de perfil
    $$('[data-profile-btn]').forEach((btn) => {
      const active = btn.dataset.profileBtn === profile;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active);
    });

    // Sobre mí
    $('#aboutText').innerHTML = p.about.map((par) => `<p>${par}</p>`).join('');
    $('#aboutFacts').innerHTML = p.facts
      .map(
        (f) => `
        <div class="fact-card reveal visible">
          <span class="fact-value">${f.value}</span>
          <span class="fact-label">${f.label}</span>
        </div>`
      )
      .join('');

    // Habilidades
    $('#skillsGrid').innerHTML = p.skills
      .map(
        (s) => `
        <div class="skill-card fade-swap">
          <h3><span class="icon">${ICONS[s.icon] || ''}</span>${s.title}</h3>
          <div class="chips">${s.items.map((i) => `<span class="chip">${i}</span>`).join('')}</div>
        </div>`
      )
      .join('');

    // Proyectos
    $('#projectsGrid').innerHTML = p.projects
      .map(
        (pr) => `
        <article class="project-card fade-swap">
          <div class="project-head">
            <h3 class="project-title">${pr.title}</h3>
            <span class="project-status ${pr.status === 'live' ? 'status-live' : 'status-wip'}">${pr.statusLabel}</span>
          </div>
          <p class="project-subtitle">${pr.subtitle}</p>
          <ul class="project-bullets">${pr.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>
          <div class="project-tags">${pr.tags.map((tg) => `<span class="tag">${tg}</span>`).join('')}</div>
          ${
            pr.link
              ? `<div class="project-links">
                   <a class="project-link" href="${pr.link}" target="_blank" rel="noopener">
                     ${pr.linkLabel}
                     <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                   </a>
                 </div>`
              : ''
          }
        </article>`
      )
      .join('');

    // Experiencia
    $('#experienceTimeline').innerHTML = p.experience
      .map(
        (e) => `
        <div class="timeline-item fade-swap">
          <span class="timeline-date">${e.date}</span>
          <h3 class="timeline-role">${e.role}</h3>
          <p class="timeline-org">${e.org}</p>
          <ul class="timeline-desc">${e.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>
        </div>`
      )
      .join('');

    // Formación (compartida entre perfiles)
    $('#educationGrid').innerHTML = t.education
      .map(
        (e) => `
        <div class="edu-card fade-swap">
          <span class="edu-status">${e.status}</span>
          <h3 class="edu-title">${e.title}</h3>
          <p class="edu-org">${e.org}</p>
        </div>`
      )
      .join('');

    // Información adicional
    $('#extrasBlock').innerHTML = t.extras
      .map(
        (x) => `
        <div class="extra-item fade-swap">
          <span class="icon">${ICONS[x.icon] || ''}</span>
          <div><h4>${x.title}</h4><p>${x.desc}</p></div>
        </div>`
      )
      .join('');

    // Título del documento
    document.title =
      lang === 'es'
        ? `Emilio Maidana — ${p.role}`
        : `Emilio Maidana — ${p.role}`;
  }

  // Pequeña transición al reemplazar texto
  function swap(el, text) {
    el.classList.remove('fade-swap');
    void el.offsetWidth; // reinicia la animación
    el.textContent = text;
    el.classList.add('fade-swap');
  }

  /* ---------- Eventos ---------- */
  $('#langToggle').addEventListener('click', () => {
    lang = lang === 'es' ? 'en' : 'es';
    render();
  });

  $$('[data-profile-btn]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.profileBtn !== profile) {
        profile = btn.dataset.profileBtn;
        render();
      }
    });
  });

  // Menú móvil
  const menuBtn = $('#menuBtn');
  const mobileMenu = $('#mobileMenu');
  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      menuBtn.classList.remove('open');
      mobileMenu.classList.remove('open');
    }
  });

  /* ---------- Animaciones de scroll ---------- */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  $$('.section').forEach((s) => {
    s.classList.add('reveal');
    observer.observe(s);
  });

  /* ---------- Init ---------- */
  $('#year').textContent = new Date().getFullYear();
  render();
})();
