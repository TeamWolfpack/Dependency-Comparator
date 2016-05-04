//var tableHeaderText = "";
//var tableBodyText = "";
var tableText = "";

var headers = "<thead><tr>";
for (var header in table.options.head) {
	headers += "<th>" + table.options.head[header] + "</th>";
}
headers += "</tr></thead>";
//tableHeaderText += headers;
//tableBodyText += "<tbody>";
tableText += headers + "<tbody>";

var rowCount = table.length - 1;
for (var r = 0; r < rowCount; r++) {
    var rowString = "<tr>";
	var row = table[r];
	console.log(row.rowSpan);
    if(row[0].rowSpan >= 1){
        var depName = row[0].content;
        var npmVersion = row[1].version;
        var npmColor = row[1].color;

        rowString += "<td class=\"filterable-cell\">" + depName + "</td>";
        rowString += "<td class=\"filterable-cell " + npmColor + "\">" + npmVersion + "</td>";

        for (var c = 2; c < row.length; c += 2) {
            var version = row[c] ? row[c].version : "";
            var color = row[c] ? row[c].color : "";

            var path = row[c + 1];
            rowString += "<td class=\"filterable-cell " + color + "\">" + version + "</td>";
            rowString += "<td class=\"filterable-cell\">" + path + "</td>";

        }
    }
    else{

        rowString += "<td class=\"filterable-cell\">" + "</td>" + "<td class=\"filterable-cell\">" + "</td>";

        for (var c = 1; c < row.length; c += 2) {
            var version = row[c] ? row[c].version : "";
            var color = row[c] ? row[c].color : "";

            var path = row[c + 1];
            rowString += "<td class=\"filterable-cell " + color + "\">" + version + "</td>";
            rowString += "<td>" + path + "</td>";

        }
    }
	rowString += "</tr>";
    //tableBodyText += rowString;
    tableText += rowString;
}
//tableBodyText += "</tbody>";
tableText += "</tbody>";

////freeze pane
//var updateFreezePane = function() {
//    var tableHeader = $("#tableHeader");
//    var tableBody = $("#tableBody");
//    var tableOffset = tableBody.offset().top;
//    var tableWidth = tableBody.width();
//    var offset = $(this).scrollTop();
//    var header = $("#tableHeader > thead");
//
//    if (offset >= 0) {
//        tableHeader.show();
//
//        var tableHeaderThs = tableHeader.find('tr > th');
//
//        //dynamically copy the width of each original th to the fixed header th
//
//        $.each(header.find('tr > th'), function(ind, val){
//            var originalWidth = $(val).width();
//            $(tableHeaderThs[ind]).width(originalWidth);
//        });
//    } else {
//        tableHeader.hide();
//    }
//};
//
//$(window).bind("scroll", updateFreezePane);
//$(window).bind("resize", updateFreezePane);

/*** hover over element to show info for cell ***/
//function getCellInfo()

//tableBody.innerHTML = tableBodyText;
//tableHeader.innerHTML = tableHeaderText;
.innerHTML = tableText;