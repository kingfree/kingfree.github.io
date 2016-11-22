$(document).ready(function () {

  var category = $('#category');

  $("h2, h3").each(function (i, item) {
    if ($(item).attr('id') == undefined) {
      $(item).attr("id", "section" + i);
    }
    var itemId = $(item).attr("id");
    var className = $(item).get(0).localName;

    if (className == 'h2') {
      category = $('#category');
      category.append('<li><a href="#' + itemId + '">' + $(this).text() + '</a><ul id="ulSection' + i + '" class="nav"></ul></li>');
      category = $('#ulSection' + i);
    } else if (className == 'h3') {
      category.append('<li><a href="#' + itemId + '">' + $(this).text() + '</a></li>');
    }
  });

  $('body').scrollspy({target: '.bs-docs-sidebar'});
});
