//from JQUERY UI autocomplete with category example

//widget render custom
$.widget( "custom.catcomplete", $.ui.autocomplete, {
  _create: function() {
    this._super();
    this.widget().menu( "option", "items", "> :not(.ui-autocomplete-category)" );
  },
  _renderMenu: function( ul, items ) {
    var that = this,
      currentCategory = "";

    //get the element's sibling which is the input with hint class and change its value.
    var userInput = that.term;
    var hintInput = items[0].value.substr(userInput.length);
    $(that.element[0].previousElementSibling).val(userInput + hintInput);
    $.each( items, function( index, item ) {
      var li;
      if ( item.category != currentCategory ) {
        ul.append( "<li class='ui-autocomplete-category'>" + item.category + "</li>" );
        currentCategory = item.category;
      }
      li = that._renderItemData( ul, item );
      if ( item.category ) {
        li.attr( "aria-label", item.category + " : " + item.label );
      }
    });
  }
});
$(function() {
  function split( val ) {
    return val.split( /,\s*/ );
  }
  function extractLast( term ) {
    return split( term ).pop();
  }

  $( "#search" )
    // don't navigate away from the field on tab when selecting an item
    .bind( "keydown", function( event ) {
      if ( event.keyCode === $.ui.keyCode.TAB &&
          $( this ).autocomplete( "instance" ).menu.active ) {
        event.preventDefault();
      }
    })
    .catcomplete({
      source: function( request, response ) {
        //Special thanks to google place API
        var getGooglePlaces = function() {
          var deferred = $.Deferred();

          var service = new google.maps.places.AutocompleteService();
          service.getQueryPredictions({ input: request.term }, function(data, status){
            if(status === "OK") {
              deferred.resolve(data);
            } else {
              deferred.reject("Something went wrong");
            }
          });
          return deferred.promise();
        };

        //Special thanks to Twitter for nba and nhl teams json file
        var getTwitterNBATeams = $.getJSON("https://twitter.github.io/typeahead.js/data/nba.json");
        var getTwitterNHLTeams = $.getJSON("https://twitter.github.io/typeahead.js/data/nhl.json");

        $.when(getGooglePlaces(), getTwitterNBATeams, getTwitterNHLTeams).done(function(places, nbas, nhls){
          //when you have all the data, process the json file and map them so that the suggestion list box can render each item accordingly
          var googlePlaces = $.map(places, function(place){
            return {
              label: place.description,
              category: "Places (by Google)"
            } //return each item as an object with just the label and category property
          });

          var twitterNBA = $.map(nbas[0], function(nba){
            return {
              label: nba.team,
              category: "NBA Team (by Twitter)"
            }
          });

          var twitterNHL = $.map(nhls[0], function(nhl){
            return {
              label: nhl.team,
              category: "NHL Team (by Twitter)"
            }
          })

          //After which you merge all of them into one single array and then return them
          //I use underscoreJS for this, feel free to merge using other method that you prefer
          var alldata = _.union(googlePlaces, twitterNBA, twitterNHL);
          //return the data to the widget by using response(data)
          response(alldata);
        })
      },
      search: function() {
        // custom minLength
        var term = extractLast( this.value );
        if ( term.length < 2 ) {
          return false;
        }
      },
      focus: function() {
        // prevent value inserted on focus
        return false;
      },
      select: function( event, ui ) {
        var terms = split( this.value );
        // remove the current input
        terms.pop();
        // add the selected item
        terms.push( ui.item.value );

        this.value = terms;
        return false;
      }
    });
});
