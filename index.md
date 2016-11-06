---
layout: page
title: 咲衣憧
tagline: 王者自由
---
{% include JB/setup %}

## 博文列表

<ul class="posts">
  {% for page in site.posts %}
      <li>
	  {% if page.date %}<span>{{ page.date | date: "%Y年%m月%d日" }} &raquo; </span>{% endif %}
	  <a href="{{ BASE_PATH }}{{page.url}}">{{page.title}}</a>
	  {% if page.update %}<span class="pull-right"> &laquo; {{ page.update | date: "%Y年%m月%d日" }}</span>{% endif %}
      </li>
  {% endfor %}
</ul>

## 读书笔记

<ul class="books">
  {% for page in site.pages reversed %}
    {% if page.group == "book" %}
      <li>
	  {% if page.date %}<span>{{ page.date | date: "%Y年%m月%d日" }} &raquo; </span>{% endif %}
	  <a href="{{ BASE_PATH }}{{page.url}}">《{{page.title}}》</a>
	  {% if page.update %}<span class="pull-right"> &laquo; {{ page.update | date: "%Y年%m月%d日" }}</span>{% endif %}
	  </li>
    {% endif %}
  {% endfor %}
</ul>
