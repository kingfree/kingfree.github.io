$(document).ready(function () {
    var category = $('#category');
    $("h2, h3").each(function (i, item) {
        if ($(item).attr('id') == undefined) {
            $(item).attr("id", "section" + i);
        }
        var itemId = $(item).attr("id");
        var className = $(item).get(0).localName;
        var text = $(this).clone()    //clone the element
            .children() //select all the children
            .remove()   //remove all the children
            .end()  //again go back to selected element
            .text();

        if (className == 'h2') {
            category = $('#category');
            category.append('<li><a href="#' + itemId + '">' + text + '</a><ul id="ulSection' + i + '" class="nav"></ul></li>');
            category = $('#ulSection' + i);
        } else if (className == 'h3') {
            category.append('<li><a href="#' + itemId + '">' + text + '</a></li>');
        }
    });
    //$('body').scrollspy({target: '.bs-docs-sidebar'});
});
