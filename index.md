---
layout: page
title: 咲衣憧
tagline: 王者自由
---

<ul class="posts">
  {% for page in site.posts %}
    <li>
      {% if page.date %}
        <span class="created">{{ page.date | date: "%Y年%m月%d日" }} &raquo; </span>
      {% endif %}
      {% if page.group == "book" %}
        <a href="{{ BASE_PATH }}{{ page.url }}">{% if page.subtitle %}
          <span class="subtitle">{{ page.subtitle }}——读</span>
        {% endif %}《{{ page.title }}》</a>
      {% else %}
        <a href="{{ BASE_PATH }}{{ page.url }}">{% if page.subtitle %}
          <span class="subtitle">{{ page.subtitle }}——</span>
        {% endif %}{{ page.title }}</a>
      {% endif %}
      {% if page.update %}
        <span class="updated pull-right"> &laquo; {{ page.update | date: "%Y年%m月%d日" }}</span>
      {% endif %}
    </li>
  {% endfor %}
</ul>
