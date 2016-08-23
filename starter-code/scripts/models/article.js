function Article (opts) {
  for (keys in opts) {
    this[keys] = opts[keys];
  }
}

/* TODO: DONE Instead of a global `articles = []` array, let's track this list of all
 articles directly on the constructor function. Note: it is NOT on the prototype.
 In JavaScript, functions are themselves objects, which means we can add
 properties/values to them at any time. In this case, we have a key:value pair
 to track, that relates to ALL of the Article objects, so it does not belong on
 the prototype, as that would only be relevant to a single instantiated Article.
 */

Article.allArticles = [];

Article.prototype.toHtml = function(scriptTemplateId) {
  var template = Handlebars.compile($(scriptTemplateId).text());
  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
  this.publishStatus = this.publishedOn ? 'published ' + this.daysAgo + ' days ago' : '(draft)';
  this.body = marked(this.body);
  return template(this);
};

/* NOTE: There are some other functions that also relate to all articles,
 rather than just single instances. Object-oriented programming would
 call these "class-level" functions, that are relevant to the entire "class"
 of objects that are Articles, rather than just one instance. */

/* TODO: DONE Refactor this code into a function for greater control.
    It will take in our data, and process it via the Article constructor: */

Article.loadAll = function(inputData) {
  inputData.sort(function(a,b) {
    return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
  }).forEach(function(ele) {
    Article.allArticles.push(new Article(ele));
  });
};

/* This function below will retrieve the data from either a local or remote
 source, process it, then hand off control to the View: */
Article.fetchAll = function() {
  if (!localStorage.hackerIpsum) {
    $.getJSON('../data/hackeripsum.json', function(data, message, xhr) {
      console.log(xhr.getResponseHeader('eTag'));
      localStorage.hackerIpsum = JSON.stringify(data);
      localStorage.eTag = JSON.stringify(xhr.getResponseHeader('eTag'));
      console.log(typeof(xhr.getResponseHeader('eTag')));
      console.log('got fresh data');
      Article.fetchAll(); // recursive call
    });

    /* When our data is already in localStorage:
    1. We can process and load it,
    2. Then we can render the index page.  */
  }
  else {
    $.getJSON('../data/hackeripsum.json', function(data, message, xhr) {
      console.log(xhr);
      var newEtag = JSON.stringify(xhr.getResponseHeader('eTag'));
      console.log('new eTag', newEtag, 'old eTag', localStorage.eTag);
      if (newEtag !== localStorage.eTag) {
        //eTag has changed
        localStorage.hackerIpsum = JSON.stringify(data);
        localStorage.eTag = newEtag;
        console.log('overriding local data', newEtag, localStorage.eTag);
      }
      else {
        //eTag hasn't changed
        console.log('data is the same');
      }
      //render
      var retreivedData = JSON.parse(localStorage.hackerIpsum);
      Article.loadAll(retreivedData);
      // console.log(retreivedData);
      console.log('rendering!');
      articleView.renderIndexPage();
    });
  }
  // console.log('did nothing');
    /* Without our localStorage in memory, we need to:
    1. Retrieve our JSON file with $.getJSON
      1.a Load our json data
      1.b Store that data in localStorage so that we can skip the server call next time,
      1.c And then render the index page.*/

};



/* Great work so far! STRETCH GOAL TIME!? Refactor your fetchAll above, or
   get some additional typing practice below. Our main goal in this part of the
   lab will be saving the eTag located in Headers, to see if it's been updated!
// STRETCH GOAL IS DONE!
  Article.fetchAll = function() {
    if (localStorage.hackerIpsum) {
      // Let's make a request to get the eTag (hint: you may need to use a different
      // jQuery method for this more explicit request).
    } else {}
  }
*/
