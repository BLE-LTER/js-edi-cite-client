// Requires cors.js to be loaded first

"use strict";

// Parse citation dictionary into HTML
function buildHtml(citations) {
   var html = [];
   var citationCount = Object.keys(citations).length;

   for (var i = 0; i < citationCount; i++) {
      var citation = citations[i];
      var authors = citation["authors"];
      var date = (citation["pub_year"]) ? " Published " + citation["pub_year"] + "" : "";
      // default ESIP formatting has trailing period after DOI
      var link = (citation["doi"]) ? citation["doi"].slice(0, -1) : "https://portal.edirepository.org/nis/mapbrowse?packageid=" + citation["pid"];
      var title = '<a rel="external noopener" href="' + link + '" target="_blank">' + citation["title"] + '</a>';
      var row = '<p><span class="dataset-title">' + title +
         '</span><br><span class="dataset-author">' + authors + date +
         '</span></p>';
      html.push(row);
   }
   if (citationCount) {
      return html.join("\n");
   } else {
      return "<p>No results returned.</p>";
   }
}

// Download citations to a dictionary keyed by package ID
function getCitations(packageIds) {
   var header = {
      "Accept": "application/json"
   };
   var callsRemaining = packageIds.length;
   var baseUri = "https://cite.edirepository.org/cite/";
   var citations = {};

   packageIds.forEach(function (pid, index) {
      var uri = baseUri + pid;
      console.log(uri);
      makeCorsRequest(
         uri,
         header,
         (function (index) { // enable the callback to know which package this is
            return function (headers, response) {
               var citation = JSON.parse(response);
               citation["pid"] = packageIds[index];
               citations[index] = citation;

               --callsRemaining;
               if (callsRemaining <= 0) {
                  console.log(citations);
                  var html = buildHtml(citations);
                  document.getElementById("results").innerHTML = html;
               }
            };
         })(index), // immediately call the closure with the current index value
         errorCallback
      );
   });
}

// Function to call if CORS request fails
function errorCallback() {
   alert("There was an error making the request.");
}

// Process package IDs when user clicks button
function handleInputs() {
   const splitLines = str => str.split(/\r?\n/);
   const userText = document.getElementById("packageIdList").value;
   const lines = splitLines(userText);
   const pids = lines.filter(n => n.trim()); // Get non-empty lines
   getCitations(pids);
}