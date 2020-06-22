
hljs.initHighlightingOnLoad();
var nbSlides = $(".step.slide").length;
var showPopover = new URL(window.location).searchParams.get("showPopover");

var rootElement = document.getElementById( "impress" );

rootElement.addEventListener( "impress:stepenter", function(event) {

  var currentStep = event.target;
  var numeroSlide = $(currentStep).attr("data-nb");
  $("#numSlide").html(numeroSlide);
  var percentageSlide = Math.round(numeroSlide * 100 / nbSlides);
  $("#progress").attr("style", "width: " + percentageSlide + "%;");
  $("#progress").attr("aria-valuenow", percentageSlide);

  if(showPopover === "true") {
    setTimeout(function(){
      $('#' + currentStep.id + ' [data-toggle="popover"]').popover('show', {
        container: 'body'
      });
  }, 1000);
  } else {
    $('#' + currentStep.id + ' [data-toggle="popover"]').popover({
      container: 'body'
    });
  }

  
});

rootElement.addEventListener( "impress:stepleave", function(event) {

  var currentStep = event.target;
  $('#' + currentStep.id + ' [data-toggle="popover"]').popover('dispose');
});

$(window).on('hashchange', function(e){
    //Gérer dropdown-toggle
    var origEvent = e.originalEvent;
    oldHash = origEvent.oldURL.substring(origEvent.oldURL.lastIndexOf("#")).replace("/","");
    newHash = origEvent.newURL.substring(origEvent.newURL.lastIndexOf("#")).replace("/","");
    $('#my-navbar li a').removeClass("active");
    $('#my-navbar li a[href="' + newHash.substring(0,newHash.indexOf("-")) + '"]').addClass("active");
    urls = newHash.split("-");
    if(urls.length > 3){
      $('#my-navbar li a[href="' + urls[0] + "-" + urls[1] + '"]').addClass("active");
    } else {
      $('#my-navbar li a[href="' + newHash.substring(0,newHash.lastIndexOf("-")) + '"]').addClass("active");
    }
    $('#my-navbar li a[href="' + newHash + '"]').addClass("active");
    
});

//-------------------

$("#generateData").click(function(event) {
  faker.locale="fr";
  $("#testData").text("");
  for(var i = 2000; i < 2200; i++ ){
    var dateB = moment(faker.date.between('1970-01-01', '2000-01-01')).format("DD/MM/YYYY");
    $("#testData").append(`{ "index" : { "_index": "people", "_id": ${i} } }
{ "nom": "${faker.name.lastName()}","prenom": "${faker.name.firstName()}","sexe": "${faker.random.arrayElement(["F", "M"])}","dateNaissance": "${dateB}","departementNaissance": "${faker.address.zipCode().substring(0,2)}","bio": "${faker.lorem.sentence()}" }\n`)
  }
});

$("div.step.slide").each(function(index, el) {
  var id = $(el).attr("id");
  var title = $(el).find("h1.display-3").text();
  $(el).attr("data-nb", index + 1);
  var yOffset = 1100;
  var xOffset = 2000;
  var ybase = 1100;
  var xbase = 0; 
  if(id !== 'accueil' && id !== 'conclusion'){
    if(id.indexOf("-") > 0){
      if(id.lastIndexOf("-") != id.indexOf("-")){
        if(id.split("-").length == 4){
          $(el).attr("data-rel-x", xOffset);
          $(el).attr("data-rel-y", 0);
          $(el).attr("data-rotate-x", 90);
          $(el).attr("data-z", -2000);
        } else {
          $(el).attr("data-rel-x", 0);
          $(el).attr("data-rel-y", 0);
          $(el).attr("data-z", -2000);
          $(el).attr("data-rotate-x", 90);
        }
      } else {
        var baseId = id.substring(0,id.indexOf("-"));
        console.log(baseId);
        $("div#dropdown-"+baseId).append('<a class="dropdown-item" href="#'+id+'">'+title+'</a>');
        $(el).attr("data-rel-x", xOffset);
        $(el).attr("data-rel-y", 0);
        $(el).attr("data-z", 0);
      }
    } else {
      if($('div[id^="'+id+'-"]').length > 0){
        $("ul.nav.nav-pills.mr-auto").append('<li class="nav-item dropdown"> <a class="nav-link dropdown-toggle" id="navbarDropdown'+id+'" href="#'+id+'" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+title+'</a> <div id="dropdown-'+id+'" class="dropdown-menu" aria-labelledby="navbarDropdown'+id+'"></div></li>');  
        $(el).attr("data-x", 0);
        $(el).attr("data-rel-y", yOffset);
        $(el).attr("data-z", 0);
      } else {
        $("ul.nav.nav-pills.mr-auto").append('<li class="nav-item"><a class="nav-link" href="#'+id+'">'+title+'</a></li>');  
        $(el).attr("data-x", 0);
        $(el).attr("data-rel-y", yOffset);
        $(el).attr("data-z", 0);
      }
    }
  }
});

var imp = impress();
imp.init();

function executeRest(httpMethod, url, bodyElementId, responseElementId){
  $.ajax({
    url: $("#elasticServer").val() + url,
    method: httpMethod,
    contentType: "application/json",
    data: $("#"+bodyElementId).text(),
    beforeSend: function (xhr) {
      xhr.setRequestHeader ("Authorization", "Basic " + btoa($("#elasticUser").val() + ":" + $("#elasticPwd").val()));
    },
  }).done(function(data) {
    $( "#" + responseElementId ).html( JSON.stringify(data, null, 2) );
    hljs.highlightBlock(document.getElementById(responseElementId));
  }).fail(function(jqXHR, textStatus, errorThrown){
    $( "#" + responseElementId ).html(JSON.stringify(jqXHR.responseJSON, null, 2) );
    hljs.highlightBlock(document.getElementById(responseElementId));
  });
}

function executeRestExo1(){
  $.ajax({
    url: $("#elasticServer").val() + '/people/_search',
    method: "POST",
    contentType: "application/json",
    data: $("#exoAutoCompletion").text().replace("%VALUE%", $("#nameInputExo1").val()),
    beforeSend: function (xhr) {
      xhr.setRequestHeader ("Authorization", "Basic " + btoa($("#elasticUser").val() + ":" + $("#elasticPwd").val()));
    },
  }).done(function(data) {
    $( "#resultsExo1" ).html("");
    for(var i=0; i<data.hits.total.value; i++){
      $( "#resultsExo1" ).append("<li class='list-group-item'>" + data.hits.hits[i]._source.prenom + " " + data.hits.hits[i]._source.nom + "</li>")
    }
  })
}

function correctionExo1(){
  $("#exoAutoCompletion").text(JSON.stringify({ 
    "query": { 
        "multi_match": { 
            "fields": ["nom", "prenom"],
            "query": "%VALUE%", 
            "fuzziness": "AUTO" 
        } 
    }
}, null, 2));
}