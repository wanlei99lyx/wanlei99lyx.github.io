---
layout: page
title: 开源项目
permalink: /projects/
---

{% for project in site.projects %}
  <article class="post-card" style="margin-bottom: 1.5rem;">
    <a href="{{ project.url | relative_url }}" class="post-card-link">
      <div class="post-card-content">
        <div class="post-card-meta">
          {% if project.language %}
            <span class="post-card-category">{{ project.language }}</span>
          {% endif %}
          {% if project.stars %}
            <span>⭐ {{ project.stars }}</span>
          {% endif %}
        </div>
        <h3 class="post-card-title">{{ project.title }}</h3>
        <p class="post-card-excerpt">{{ project.description }}</p>
      </div>
    </a>
  </article>
{% else %}
  <p class="empty-state">项目展示即将上线...</p>
{% endfor %}
