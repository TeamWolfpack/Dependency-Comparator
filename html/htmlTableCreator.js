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
        headers+= "<th class=\"depNameOrVer\">";
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
            rowString += "<td style=\"padding: 0px\" class=\"" + color + "Version " + headerArray[writeHeaderIterator] + "\"><div class=\"cellDiv " + color + "\">" + version + "</div></td>";
            var infoString = "Dependency: " + depName + "<br>Latest: " + npmVersion + "<br>Project: " + table.options.head[c];
            rowString += "<td class=\"" + color + "Version " + headerArray[writeHeaderIterator] + "\"><a href=\"\">" + path +
                "<div class='popup'>" + infoString + "</div></a></td>";
        }
    }
    else{
        var writeHeaderIterator = 0;

        for (var c = 1; c < row.length; c += 2) {
            var version = row[c] ? row[c].version : "";
            var color = row[c] ? row[c].color : "";

            var path = row[c + 1] ? row[c + 1].path : "";
            rowString += "<td class=\"" + color + " " + color + "Version " + headerArray[writeHeaderIterator] + "\"><div>" + version + "</div></td>";
            rowString += "<td class=\"" + color + "Version " + headerArray[writeHeaderIterator] + "\">" + path + "</td>";
            writeHeaderIterator++;
        }
    }
	rowString += "</tr>";
    tableText += rowString;
}

htmlTable.innerHTML = tableText;

function download(name) {
    var a = document.getElementById("a");
    var htmlHeaders = "<html><head>"
            +"<meta charset=\"UTF-8\">"
            + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">"
            + "<title>dep-tool</title>"
            + "<link rel=\"stylesheet\" type=\"text/css\" href=\"dep-tool.css\">"
            + "<link rel=\"stylesheet\" href=\"http://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css\">"
            + "<script src=\"https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js\"></script>"
            + "<script src=\"http://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js\"></script>"
            + "<script src=\"https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js\"></script>"
            + "</head><body><table>";
    var htmlHeadersEnd = "</table></body></html>";
    var length = document.getElementsByClassName("popup").length;
    for(var i = 0; i < length; i++){
        document.getElementsByClassName("popup")[i].style = "display: none";
    }
    var tbl = document.getElementById("htmlTable");
    var text = tbl.innerHTML;
    //var popup = document.getElementsByClassName("popup");
    var file = new Blob([htmlHeaders+text+htmlHeadersEnd], {type: "text/html"});
    a.href = URL.createObjectURL(file);
    a.download = name;
    console.log("Saved at "+name);
    for(var i = 0; i < length; i++){
        document.getElementsByClassName("popup")[i].style = "display: show";
    }
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

function filterMajor(isChecked){
    if(isChecked){return;}
    var length = document.getElementsByClassName("majorVersion").length;
    for(var i = 0; i < length; i++){
        document.getElementsByClassName("majorVersion")[i].firstChild.style="display:none;";
    }

}
function filterMinor(isChecked){
    if(isChecked){return;}
    var length = document.getElementsByClassName("minorVersion").length;
    for(var i = 0; i < length; i++){
        document.getElementsByClassName("minorVersion")[i].firstChild.style="display:none;";
    }

}
function filterPatch(isChecked){
    if(isChecked){return;}
    var length = document.getElementsByClassName("patchVersion").length;
    for(var i = 0; i < length; i++){
        document.getElementsByClassName("patchVersion")[i].firstChild.style="display:none;";
    }

}
function filterUpToDate(isChecked){
    if(isChecked){return;}
    var length = document.getElementsByClassName("upToDateVersion").length;
    for(var i = 0; i < length; i++){
        document.getElementsByClassName("upToDateVersion")[i].firstChild.style="display:none;";
    }

}

function initializeShowOrHide(element){
	
    if(document.getElementById("exclude").checked){
        element.style = "display: show";
    }
    else{
        if(!element.classList.contains("depNameOrVer")){
            element.style = "display: none";
        }
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
        document.getElementsByTagName("td")[i].style.padding="0px";
		if(document.getElementsByTagName("td")[i].firstChild){
			initializeShowOrHide(document.getElementsByTagName("td")[i].firstChild);
		}
    }
    var length = document.getElementsByTagName("th").length;
    for(var i = 0; i < length; i++){
        //initializeShowOrHide(document.getElementsByTagName("th")[i].parentNode);
        initializeShowOrHide(document.getElementsByTagName("th")[i]);
    }
    filterProjNames(document.getElementById("projectFilter").value);
    filterDepNames(document.getElementById("dependencyFilter").value);
    filterMajor(document.getElementById("Mjr").checked);
    filterMinor(document.getElementById("Mnr").checked);
    filterPatch(document.getElementById("Ptch").checked);
    filterUpToDate(document.getElementById("UTD").checked);
    console.log("Filtering");
});