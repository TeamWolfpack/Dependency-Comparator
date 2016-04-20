/**
 * Created by farrowc on 4/20/2016.
 */

var resultDiv = document.getElementById("resultTable");
var resultTable = "<table>";
var comparisonResults = JSON.parse(FileReader.readAsText("./search.json"));

var headers = "<tr>";
for(var header in comparisonResults.options.head){
    headers += "<th>" + comparisonResults.options.head[header] + "</th>";
}
headers += "</tr>";
resultTable += headers;

var length = comparisonResults.length-1;

for(i in length){
    var row = comparisonResults[i];
    var depName = row[0].content;
    var npmVersion = row[1].version;
    //TODO add color support (row[1].color)
    var rowString = "<tr>";
    rowString += "<td>"+depName+"</td>" + "<td>"+npmVersion+"</td>";
    for(var j = 2; j< row.length; j+=2){
        var version = row[j].version;
        //TODO add color support (row[j].color)
        var path = row[j+1];
        rowString+="<td>"+version+"</td>"+"<td>"+path+"</td>";
    }
    rowString+="</tr>";
    resultTable+=rowString;
}
resultTable+="</table>";
resultDiv.innerHTML = resultTable;