---
layout: page
title: 咲衣憧
tagline: 王者自由
---
{% include JB/setup %}

## 博文列表

<ul class="posts">
  {% for post in site.posts %}
    <li><span>{{ post.date | date: "%Y年%m月%d日" }}</span> &raquo; <a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a></li>
  {% endfor %}
</ul>

## 读书笔记

<ul class="books">
  {% for page in site.pages %}
    {% if page.group == "book" %}
      <li><a href="{{ BASE_PATH }}{{page.url}}">《{{page.title}}》</a></li>
    {% endif %}
  {% endfor %}
</ul>
