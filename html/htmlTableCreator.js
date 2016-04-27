var tableText = "";
var headers = "<tr>";
for (var header in table.options.head) {
	headers += "<th>" + table.options.head[header] + "</th>";
}
headers += "</tr>";
tableText += headers;

var rowCount = table.length - 1;
for (var r = 0; r < rowCount; r++) {
    var rowString = "<tr>";
	var row = table[r];
	console.log(row.rowSpan);
    if(row[0].rowSpan >= 1){
        var depName = row[0].content;
        var npmVersion = row[1].version;
        var npmColor = row[1].color;

        rowString += "<td>" + depName + "</td>";
        rowString += "<td class=\"" + npmColor + "\">" + npmVersion + "</td>";

        for (var c = 2; c < row.length; c += 2) {
            var version = row[c] ? row[c].version : "";
            var color = row[c] ? row[c].color : "";

            var path = row[c + 1];
            rowString += "<td class=\"" + color + "\">" + version + "</td>";
            rowString += "<td>" + path + "</td>";

        }
    }
    else{

        rowString += "<td>" + "</td>" + "<td>" + "</td>";

        for (var c = 1; c < row.length; c += 2) {
            var version = row[c] ? row[c].version : "";
            var color = row[c] ? row[c].color : "";

            var path = row[c + 1];
            rowString += "<td class=\"" + color + "\">" + version + "</td>";
            rowString += "<td>" + path + "</td>";

        }
    }
	rowString += "</tr>";
	tableText += rowString;
}
htmlTable.innerHTML = tableText;