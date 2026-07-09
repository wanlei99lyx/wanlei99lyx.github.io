(function() {
  const username = 'wanlei99lyx';

  // Exclude repos that shouldn't appear
  const excludeRepos = ['wanlei99lyx.github.io', username.toLowerCase() + '.github.io'];

  function renderRepo(repo) {
    return `
      <a href="${repo.html_url}" target="_blank" rel="noopener" class="project-card">
        <div class="project-card-icon">${repo.language ? '📦' : '📄'}</div>
        <h3 class="project-card-title">${repo.name}</h3>
        <p class="project-card-desc">${repo.description || '暂无描述'}</p>
        <div class="project-card-meta">
          ${repo.language ? `<span>${repo.language}</span>` : ''}
          <span>⭐ ${repo.stargazers_count}</span>
          <span>⑂ ${repo.forks_count}</span>
        </div>
      </a>
    `;
  }

  function loadProjects(container, limit) {
    if (!container) return;

    fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`)
      .then(res => res.json())
      .then(repos => {
        if (!Array.isArray(repos)) return;
        const filtered = repos
          .filter(r => !excludeRepos.includes(r.name))
          .sort((a, b) => b.stargazers_count - a.stargazers_count);

        const list = filtered.slice(0, limit || filtered.length);
        container.innerHTML = list.map(renderRepo).join('');
      })
      .catch(() => {
        container.innerHTML = '<p class="empty-state">无法加载项目数据</p>';
      });
  }

  // Auto-init — respect data-projects attribute as limit
  document.querySelectorAll('[data-projects]').forEach(el => {
    const limit = parseInt(el.getAttribute('data-projects')) || 0;
    loadProjects(el, limit || undefined);
  });
})();
