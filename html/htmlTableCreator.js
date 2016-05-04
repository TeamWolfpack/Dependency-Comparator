var tableText = "";

var headers = "<thead><tr>";
for (var header in table.options.head) {
	headers += "<th>" + table.options.head[header] + "</th>";
}
headers += "</tr></thead>";
tableText += headers + "<tbody>";

var rowCount = table.length - 1;
for (var r = 0; r < rowCount; r++) {
    var rowString = "<tr>";
	var row = table[r];
	console.log(row.rowSpan);
    var depName = row[0].content;
    var npmVersion = row[1].version;
    var npmColor = row[1].color;
    if(row[0].rowSpan >= 1){
        rowString += "<td class=\"filterable-cell\">" + depName + "</td>";
        rowString += "<td class=\"filterable-cell " + npmColor + "\">" + npmVersion + "</td>";

        for (var c = 2; c < row.length; c += 2) {
            var version = row[c] ? row[c].version : "";
            var color = row[c] ? row[c].color : "";

            var path = row[c + 1];
            rowString += "<td class=\"filterable-cell " + color + "\">" + version + "</td>";

            var infoString = "Dependency: " + depName + "<br>Latest: " + npmVersion + "<br>Project: " + table.options.head[c];
            rowString += "<td class=\"filterable-cell\"><a href=\"#\">" + path +
                "<div class='popup'>" + infoString + "</div></a></td>";
        }
    }
    else{

        rowString += "<td class=\"filterable-cell\">" + "</td>" + "<td class=\"filterable-cell\">" + "</td>";

        for (var c = 1; c < row.length; c += 2) {
            var version = row[c] ? row[c].version : "";
            var color = row[c] ? row[c].color : "";

            var path = row[c + 1];
            rowString += "<td class=\"filterable-cell " + color + "\">" + version + "</td>";
            rowString += "<td class=\"filterable-cell\">" + path + "</td>";
        }
    }
	rowString += "</tr>";
    tableText += rowString;
}
tableText += "</tbody>";

htmlTable.innerHTML = tableText;