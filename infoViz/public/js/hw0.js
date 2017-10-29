
var body = d3.select("body");
var chartContainer = document.getElementById("data_vis_container");
var divs = {
    '1': body.append('div'),
    '2': body.append('div'),
    '3': body.append('div'),
    '4': body.append('div'),
};

var s = d3.formatSpecifier("f");
s.precision = d3.precisionFixed(0.01);
var f = d3.format(s);

d3.tsv("./data/anscombe.tsv", function (error, data) {
    if (error)
        throw error;
    var dataS = data.sort(function (a, b) {
        return +a.x - +b.x;
    });
    console.log(dataS);
    for (var k in divs) {
        var div = divs[k];
        var table = div.append('table');
        table.append('caption')
                .text('data set ' + k);

        var header = table.append('tr');
        header.append('th')
                .text('observation');
        header.append('th')
                .text('x');
        header.append('th')
                .text('y');

        var row = table.selectAll('row')
                .data(dataS)
                .enter().filter(function (d) {
            return d.dataset == k;
        }).append('tr');

        row.append('td')
                .text(function (d) {
                    return d.observation;
                });

        row.append('td')
                .text(function (d) {
                    return d.x;
                });

        row.append('td')
                .text(function (d) {
                    return f(d.y);
                });
        createGraph(dataS, k, chartContainer);
    }
    ;
});

function createGraph(data, k, container) {
    var margin = {top: 30, right: 20, bottom: 30, left: 50},
            width = 600 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;
// Set the ranges
    var xAxis = d3.scaleLinear().rangeRound([0, width]);
    var yAxis = d3.scaleLinear().rangeRound([height, 0]);
// Adds the svg canvas
    var svg = d3.select("body")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
    var g = svg.append("g")
            .attr("transform", "translate(" + margin.left + ",0)");
    data.forEach(function (d) {
        d.x = +d.x;
        d.y = +d.y;
    });
    xAxis.domain(d3.extent(data, function (d) {
        return  d.x;
    }));
    yAxis.domain(d3.extent(data, function (d) {
        return  d.y;
    }));

    var line = d3.line()
            .x(function (d) {
                return xAxis(d.x);
            })
            .y(function (d) {
                return yAxis(3 + 0.5 * d.x);
            });

    // Add the X Axis
    svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + margin.left + "," + height + ")")
            .call(d3.axisBottom(xAxis));

    // Add the Y Axis
    svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + margin.left + ",0)")
            .call(d3.axisLeft(yAxis));

    g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line);

    g.selectAll("circle")
            .data(data)
            .enter()
            .filter(function (d) {
                return d.dataset == k;
            })
            .append("circle")
            .attr("class", "dots" + k)
            .attr("cx", function (d) {
                return xAxis(d.x);
            })
            .attr("cy", function (d) {
                return yAxis(d.y);
            })
            .attr("r", 2)
            .append("title")
            .text(function (d) {
                return d.observation;
            })
            .append("text")
            .text(function (d) {
                return d.observation;
            });

}