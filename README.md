# jQueryAutocomplete
Using the jQuery UI, this autocomplete widget has been modified to fetch data from multiple remote sources.

The data is fetched using jQuery's getJSON function and returned as an array of items.

The source of the widget then takes in the array of items and displayed accordingly.

The array of items can also be categorised by mapping each set of data from a remote source.

The main important part of the application is the source property of the widget

```
$('#somesearchwidget').autocomplete({
  source: function(request, response) {
    //either by using $.getJSON or other ways to retrieve json data from the remote source, convert them into a promise
    //and return the data only when all promises are fulfilled
    //or if the promise fail, handle it somehow

    var dataFromXYZ = $.getJSON("http://www.xyz.com/data", {query:request.term});

    //promisify a api function
    var dataFromABC = function() {
      var deferred = $.Deferred();
      var api = new SomeAPIService();
      api.getQuery({query:request.term}, function(apiRes, status) {
         if(status >= 200 || status < 300) {
           deferred.resolve(apiRes.data);
         } else {
           deferred.reject("Something went wrong");
         }
      });

      return deferred.promise();
    };

    //using $.when to go to the next step when all promises are fulfilled
    $.when(dataFromXYZ, dataFromABC())
    .done(function(dataSet1, dataSet2){
        //put these two data sets together
        //map the two data sets to return array of objects
        //as the menu item takes in the label and category property
        var set1 = $.map(dataSet1, function(data){
            //for every item, return just the value from description property for example
            return {
              label: data.description,
              category: "Some category"
            }
        });

        //if you do not want any categories, simply put them as an array of values
        var set2 = $.map(dataSet2, function(data){
          //plucking out just the description property
          return data.description;
        });

        //after which return one whole data set
        //i used underscorejs for its convenience
        var alldata = _.union(set1,set2);
        response(alldata); //this will return the data to the source
    })
  }
})
```

I have included the javascript file <b>zv_autocomplete.js</b> which shows an example of this
and a custom stylesheet <b>style.css</b> I have made.
