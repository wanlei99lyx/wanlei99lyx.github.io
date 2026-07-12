---
layout: default
title: 博客
permalink: /blog/
---

<div class="blog-page">
  <div class="container">
    <header class="page-header">
      <h1 class="page-title">{{ page.title }}</h1>
    </header>

    {% if site.posts.size > 0 %}
      {% assign pinned = site.posts | where: "pinned", true | first %}
      {% assign featured = pinned | default: site.posts.first %}

      <section class="blog-featured">
        <a href="{{ featured.url | relative_url }}" class="blog-featured-link">
          <div class="blog-featured-content">
            <span class="blog-featured-label">精选文章</span>
            <div class="blog-featured-meta">
              <time datetime="{{ featured.date | date_to_xmlschema }}">{{ featured.date | date: "%Y-%m-%d" }}</time>
              {% if featured.categories.size > 0 %}
                <span class="post-card-category">{{ featured.categories | first }}</span>
              {% endif %}
            </div>
            <h2 class="blog-featured-title">{{ featured.title }}</h2>
            <p class="blog-featured-excerpt">{{ featured.excerpt | strip_html | truncate: 200 }}</p>
            {% if featured.tags.size > 0 %}
              <div class="blog-featured-tags">
                {% for tag in featured.tags limit:4 %}
                  <span class="tag">#{{ tag }}</span>
                {% endfor %}
              </div>
            {% endif %}
          </div>
        </a>
      </section>

      <div class="blog-tabs">
        <button class="blog-tab active" data-filter="all">全部</button>
        {% assign categories = site.posts | map: "categories" | flatten | uniq | sort %}
        {% for category in categories %}
          <button class="blog-tab" data-filter="{{ category | slugify }}">{{ category }}</button>
        {% endfor %}
      </div>

      <div class="blog-grid" id="blogGrid">
        {% for post in site.posts %}{% unless post.url == featured.url %}
          <article class="blog-card" data-category="{% for cat in post.categories %}{{ cat | slugify }} {% endfor %}">
            <a href="{{ post.url | relative_url }}" class="blog-card-link">
              <div class="post-card-meta">
                <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y-%m-%d" }}</time>
                {% if post.categories.size > 0 %}
                  <span class="post-card-category">{{ post.categories | first }}</span>
                {% endif %}
              </div>
              <h3 class="blog-card-title">{{ post.title }}</h3>
              <p class="blog-card-excerpt">{{ post.excerpt | strip_html | truncate: 120 }}</p>
              <div class="blog-card-footer">
                {% if post.tags.size > 0 %}
                  <div class="post-card-tags">
                    {% for tag in post.tags limit:3 %}
                      <span class="tag tag-sm">#{{ tag }}</span>
                    {% endfor %}
                  </div>
                {% endif %}
              </div>
            </a>
          </article>
        {% endunless %}{% endfor %}
      </div>
    {% else %}
      <p class="empty-state">还没有文章，敬请期待...</p>
    {% endif %}
  </div>
</div>

<script src="{{ '/assets/js/blog.js' | relative_url }}"></script>
