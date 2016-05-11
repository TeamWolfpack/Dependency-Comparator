var tableText = "";
var headers = "<tr>";
var headerArray = [""];
var headerIterator = 0;
var IteratorLimiter = 0;
for (var header in table.options.head) {
    if(headerIterator!=0){

        headers+= "<th class=\"PROJ" + table.options.head[header] + "\">";
        headerArray[headerIterator-1] = "PROJ"+table.options.head[header];
    }
    else{
        headers+= "<th>";
    }
	headers += table.options.head[header] + "</th>";
    headerIterator+=IteratorLimiter;
    IteratorLimiter = (IteratorLimiter+1)%2;
}
headers += "</tr>";
tableText += headers;

var rowCount = table.length - 1;
for (var r = 0; r < rowCount; r++) {
    var rowString = "<tr>";
	var row = table[r];
    var depName = "";
    if(row[0].rowSpan >= 1){
        var writeHeaderIterator = 0;
        var depName = row[0].content;
        rowString = "<tr class=\"DEP"+depName+"\">";
        var npmVersion = row[1].version;
        var npmColor = row[1].color;

        rowString += "<td rowspan=\""+row[0].rowSpan+"\" class=\"name DEP"+depName+"\">" + depName + "</td>";
        rowString += "<td rowspan=\""+row[0].rowSpan+"\" class=\"" + npmColor + " DEP"+depName+"\">" + npmVersion + "</td>";

        for (var c = 2; c < row.length; c += 2) {
            var version = row[c] ? row[c].version : "";
            var color = row[c] ? row[c].color : "";

            var path = row[c + 1] ? row[c + 1].path : "";
            rowString += "<td class=\"" + color + " DEP" + depName + " " + headerArray[writeHeaderIterator] + "\">" + version + "</td>";
            var infoString = "Dependency: " + depName + "<br>Latest: " + npmVersion + "<br>Project: " + table.options.head[c];
            rowString += "<td class=\"DEP" + depName + " " + headerArray[writeHeaderIterator] + "\">" + path +
                "<div class='popup'>" + infoString + "</div></a></td>";
        }
    }
    else{
        var writeHeaderIterator = 0;
        rowString += "<td class=\"name\">" + "</td>" + "<td>" + "</td>";

        for (var c = 1; c < row.length; c += 2) {
            var version = row[c] ? row[c].version : "";
            var color = row[c] ? row[c].color : "";

            var path = row[c + 1].path;
            rowString += "<td class=\"" + color + " DEP" + depName + " " + headerArray[writeHeaderIterator] + "\">" + version + "</td>";
            rowString += "<td class=\"DEP" + depName + " " + headerArray[writeHeaderIterator] + "\">" + path + "</td>";
            writeHeaderIterator++;
        }
    }
	rowString += "</tr>";
    tableText += rowString;
}

htmlTable.innerHTML = tableText;

function download(name) {
    var a = document.getElementById("a");
    var htmlHeaders = "<html><head></head><body><table>";
    var htmlHeadersEnd = "</table></body></html>";
    var tbl = document.getElementById("htmlTable");
    var text = tbl.innerHTML;
    var file = new Blob([htmlHeaders+text+htmlHeadersEnd], {type: "text/html"});
    a.href = URL.createObjectURL(file);
    a.download = name;
    console.log("Saved at "+name);
}
function showOrHideElementWithFilter(element){
    if(document.getElementById("exclude").checked){
        element.style = "display: none";
    }
    else{
        element.style = "display: show";
    }
}
function filterProjNames(name){
    name = String(name);
    var names = name.split("; ");
    for(var i = 0; i<names.length; i++) {
        var length = document.getElementsByClassName("PROJ" + names[i]).length;
        for (var j = 0; j < length; j++) {
            showOrHideElementWithFilter(document.getElementsByClassName("PROJ" + names[i])[j]);
        }
        console.log("Filtering by " + "PROJ" + names[i]);
    }

}
function filterDepNames(name){
    name = String(name);
    var names = name.split("; ");
    for(var i = 0; i<names.length; i++) {
        var length = document.getElementsByClassName("DEP" + names[i]).length;
        for (var j = 0; j < length; j++) {
            showOrHideElementWithFilter(document.getElementsByClassName("DEP" + names[i])[j]);
        }
        console.log("Filtering by " + "DEP" + names[i]);
    }
}

/*
Filters dependencies by regex

function filterDepNames(expression){
	var dependencies = $.map(document.getElementsByTagName("tr"),
		function(value, index) {return [value]});
	var pattern = new RegExp(expression);
	
	var deps;
	if(document.getElementById("exclude").checked){
        deps = dependencies.filter(function(d) {
			return pattern.test(d.className);
		});
    }
    else{
        deps = dependencies.filter(function(d) {
			return !pattern.test(d.className);
		});
    }
    
	for (var j = 0; j < deps.length; j++) {
		deps[j].style = "display: none";
	}
}
*/

function initializeShowOrHide(element){
    if(document.getElementById("exclude").checked){
        element.style = "display: show";
    }
    else{
        element.style = "display: none";
    }
}

$( "#saveButton" ).click(function() {
    console.log("Saving");
    download("table.html");
});

$( "#filterButton" ).click(function() {
    var length = document.getElementsByTagName("td").length;
    for(var i = 0; i < length; i++){
        initializeShowOrHide(document.getElementsByTagName("td")[i].parentNode);
        initializeShowOrHide(document.getElementsByTagName("td")[i]);
    }
    var length = document.getElementsByTagName("th").length;
    for(var i = 0; i < length; i++){
        initializeShowOrHide(document.getElementsByTagName("th")[i].parentNode);
        initializeShowOrHide(document.getElementsByTagName("th")[i]);
    }
    filterProjNames(document.getElementById("projectFilter").value);
    filterDepNames(document.getElementById("dependencyFilter").value);
    console.log("Filtering");
});