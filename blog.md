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

      <!-- Featured section — JS replaces content with top viewed from CountAPI -->
      {% assign pinned = site.posts | where: "pinned", true | first %}
      {% assign fallback = pinned | default: site.posts.first %}

      <section class="blog-featured" id="blogFeatured">
        <div class="blog-featured-header">
          <span class="blog-featured-label" id="blogFeaturedLabel">精选文章</span>
        </div>
        <div id="blogFeaturedContent">
          <a href="{{ fallback.url | relative_url }}" class="blog-featured-link">
            <div class="blog-featured-content">
              {% if pinned %}<span class="blog-featured-badge">置顶</span>{% endif %}
              <div class="blog-featured-meta">
                <time datetime="{{ fallback.date | date_to_xmlschema }}">{{ fallback.date | date: "%Y-%m-%d" }}</time>
              </div>
              <h2 class="blog-featured-title">{{ fallback.title }}</h2>
              <p class="blog-featured-excerpt">{{ fallback.excerpt | strip_html | truncate: 200 }}</p>
              {% if fallback.tags.size > 0 %}
                <div class="blog-featured-tags">
                  {% for tag in fallback.tags limit:4 %}
                    <span class="tag">#{{ tag }}</span>
                  {% endfor %}
                </div>
              {% endif %}
            </div>
          </a>
        </div>
      </section>

      <!-- Post data for JS -->
      <script id="blogPostsData" type="application/json">[
        {% for post in site.posts %}
        {% assign pv = site.data.views | where: "url", post.url | first %}
        {
          "url": "{{ post.url }}",
          "title": {{ post.title | jsonify }},
          "excerpt": {{ post.excerpt | strip_html | truncate: 200 | jsonify }},
          "date": "{{ post.date | date: "%Y-%m-%d" }}",
          "views": {{ pv.views | default: 0 }},
          "tags": [{% for tag in post.tags limit:4 %}{{ tag | jsonify }}{% unless forloop.last %},{% endunless %}{% endfor %}]
        }{% unless forloop.last %},{% endunless %}
        {% endfor %}
      ]</script>

      <div class="blog-grid" id="blogGrid">
        {% for post in site.posts %}
          <article class="blog-card" data-url="{{ post.url }}">
            <a href="{{ post.url | relative_url }}" class="blog-card-link">
              <div class="post-card-meta">
                <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y-%m-%d" }}</time>
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
        {% endfor %}
      </div>
    {% else %}
      <p class="empty-state">还没有文章，敬请期待...</p>
    {% endif %}
  </div>
</div>

<script src="{{ '/assets/js/blog.js' | relative_url }}"></script>
