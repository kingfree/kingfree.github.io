$(document).ready(function() {
  var cte = $("#category");
  $("h2, h3").each(function(i, item) {
    if ($(item).attr("id") == undefined) {
      $(item).attr("id", "section" + i);
    }
    var sta = $(item).get(0).localName;
    if (sta == 'h2') {
      cte = $("#category");
    }
    console.log(cte);
    cte.append('<li>' + '<a href="#' + $(item).attr("id") + '">' + $(this).text() + '</a>' + '</li>');
    if (sta == 'h2') {
      cte.append('<ul id="ulsection' + i + '" class="nav"></ul>');
      cte = $("#ulsection" + i);
    }
  });
});

!function(a){
  "use strict";
  a(function(){
    var b=a(window),
    c=a(document.body);
    c.scrollspy({target:".bs-docs-sidebar"}),
    b.on("load",function(){c.scrollspy("refresh")}),
    a(".bs-docs-container [href=#]").click(function(a){a.preventDefault()}),
    setTimeout(function(){
      var b=a(".bs-docs-sidebar");
      b.affix({
        offset:{
          top:function(){
            var c=b.offset().top,d=parseInt(b.children(0).css("margin-top"),10),e=a(".bs-docs-nav").height();
            return this.top=c-e-d
          },
          bottom:function(){return this.bottom=a(".bs-docs-footer").outerHeight(!0)}
        }
      })
    },100),
    setTimeout(function(){
      a(".bs-top").affix()
    },100),
    function(){
      var b=a("#bs-theme-stylesheet"),
      c=a(".bs-docs-theme-toggle"),
      d=function(){
        b.attr("href",b.attr("data-href")),
        c.text("Disable theme preview"),
        localStorage.setItem("previewTheme",!0)
      };
      localStorage.getItem("previewTheme")&&d(),
      c.click(function(){
        var a=b.attr("href");
        a&&0!==a.indexOf("data")?(b.attr("href",""),c.text("Preview theme"),localStorage.removeItem("previewTheme")):d()
      })
    }(),
    a(".tooltip-demo").tooltip({selector:'[data-toggle="tooltip"]',container:"body"}),
    a(".popover-demo").popover({selector:'[data-toggle="popover"]',container:"body"}),
    a(".tooltip-test").tooltip(),
    a(".popover-test").popover(),
    a(".bs-docs-popover").popover(),
    a("#loading-example-btn").on("click",function(){
      var b=a(this);
      b.button("loading"),setTimeout(function(){b.button("reset")},3e3)
    }),
    a("#exampleModal").on("show.bs.modal",function(b){
      var c=a(b.relatedTarget),d=c.data("whatever"),e=a(this);
      e.find(".modal-title").text("New message to "+d),e.find(".modal-body input").val(d)
    }),
    a(".bs-docs-activate-animated-progressbar").on("click",function(){
      a(this).siblings(".progress").find(".progress-bar-striped").toggleClass("active")
    })
  })
}(jQuery),function(){
  "use strict";
}();

