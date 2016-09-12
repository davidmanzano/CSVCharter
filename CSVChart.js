var table;
var dataSet = new Array();
var lines;
var seperator;
var parse = false;

google.charts.load('current', { 'packages': ['corechart', 'line'] });

function myDateFilter(val, idx, arr) {
    if (idx != 2)
        return false;
    else
        return true;
}

function myStatFilter(val, idx, arr) {
    if (idx == 0 || idx == 1 || idx == 2 || idx == 3 || idx == 4 || idx == 5) {
        return false;
    }
    else
        return true;
}

function parseHeaders() {
  var headers = new Array();
  //console.log(lines[0].toString().substring(lines[0].toString().indexOf(','),5));
  var h = lines[0].toString().substring(lines[0].toString().indexOf(',')+1);
  //console.log(h);
  var header;
  var finalHeaders = new Array();
  headers = h.split(',');
  //console.log(headers);
  for(var i = 0; i < headers.length; i++) {
    header = headers[i].substring(headers[i].indexOf('\"')+1, headers[i].indexOf(":")-1);
    finalHeaders.push(header);
  }
  return finalHeaders;
}

function parseData() {
  var data = new Array();
  var finaldata = new Array();
  var finaldataList = new Array();
  var d;
  var elem;
  for(var i = 0; i < lines.length; i++) {
    d = lines[i].toString().substring(lines[i].toString().indexOf(',')+1);
    //console.log(d);
    data = d.split(',');
      for(var j = 0; j < data.length; j++) {
        //console.log(data[j]);
        //console.log(data[j].substring(data[j].indexOf(':')+1));
        elem = data[j].substring(data[j].indexOf(':')+1);
        finaldata.push(elem);
      }
      finaldataList.push(finaldata);
      finaldata = [];
  }
  //console.log(finaldataList);
  return finaldataList;

}

function drawChart() {
    var stats;
    var date;
    var finalData = new Array();
    var stats = new Array();
    var headers = new Array();
    var dataList = new Array();
    var line;

    if(lines[0].includes("_id"))
      parse = true;

    if(parse)
    {
      //console.log(parseHeaders())
      //console.log(parseData());
      var finalData = new Array();
      headers = parseHeaders();
      dataList = parseData();
      dataList.unshift(headers);
      //console.log(finalData);
      for (var i = 0; i < dataList.length-1; i++) {
          line = dataList[i];
          //console.log(line);
          date = line.filter(myDateFilter);
          //console.log(date);
          stats = line.filter(myStatFilter);
          //console.log(stats);
          if (i != 0) {
              for (var j = 0; j < stats.length; j++) {
                  stats[j] = parseInt(stats[j]);
                  //console.log(stats[j]);
              }
          }
          line = date.concat(stats);
          finalData.push(line);
        }
      parse = false;
    }
    else {
      parse = false;
      console.log(lines);
      for (var i = 0; i < lines.length-1; i++) {
          line = lines[i].split(seperator);
          console.log(line);
          date = line.filter(myDateFilter);
          console.log(date);
          stats = line.filter(myStatFilter);
          console.log(stats);
          if (i != 0) {
              for (var j = 0; j < stats.length; j++) {
                  stats[j] = parseInt(stats[j]);
                  //console.log(stats[j]);
              }
          }
          line = date.concat(stats);
          finalData.push(line);
        }
    }
    var data = google.visualization.arrayToDataTable(finalData);

    var options = {
        explorer: { axis: 'vertical', actions: ['dragToZoom', 'rightClickToReset', 'dragToPan'], maxZoomIn: 8, maxZoomOut: 10, keepInBounds: true },
        title: 'CSV Data Line Graph',
        curveType: 'function',
        //legend: { position: 'bottom' },
        //width: 2000,
        //height: 1000,

    };

    var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

    chart.draw(data, options);
}

function getContent() {
        NProgress.start();
        if (table) {
            table.destroy();
            $("#csvTable").html("");
        }
        if (dataSet) {
            dataSet = [];
        }
        if (lines) {
            lines = [];
        }

        var f = document.getElementById('file');
        var file = f.files[0];
        var tmp;
        var cols = new Array();
        var data;
        var e = document.getElementById('seperators');
        seperator = e.options[e.selectedIndex].value;
        if (seperator != ',')
            seperator = '\t';

        var e = document.getElementById('headers');
        var header_switch = e.options[e.selectedIndex].value;

        var reader = new FileReader();
        NProgress.inc();
        reader.onload = function (progressEvent) {

            lines = this.result.split("\n");
            tmp = lines[0].split(seperator);
            if (header_switch == "on") {
                if (/"/i.test(tmp[tmp.length - 1])) tmp[tmp.length - 1] = tmp[tmp.length - 1].substring(0, (tmp[tmp.length - 1].length) - 2);
                if (/"/i.test(tmp[0])) tmp[0] = tmp[0].substring(1);
            }

            for (var line = 1; line < lines.length-1; line++) {
                data = lines[line].split(seperator);
                if (/"/i.test(data[0])) data[0] = data[0].substring(1);
                if (/"/i.test(data[data.length-1])) data[data.length-1] = data[data.length-1].substring(0, data[data.length-1].length-2);
                dataSet.push(data);
            }
            if (header_switch == "on") {
                for (var i = 0; i < tmp.length; i++) {
                    cols.push({ title: tmp[i] });
                }
            }
            else {
                for (var i = 0; i < tmp.length; i++) {
                    cols.push({ title: "" });
                }
            }

            $(document).ready(function () {
                table = $('#csvTable').DataTable({
                    "bSort": false,
                    data: dataSet,
                    columns: cols
                });
            });
            google.charts.setOnLoadCallback(drawChart());
        };
        NProgress.inc();
        reader.readAsText(file);

        NProgress.done();

}
