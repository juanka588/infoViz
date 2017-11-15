var divs = null;

var s = null;
var f = null;

// Define the div for the tooltip
var div = null;

function init() {
    divs = {
        '1': d3.select('.ds1'),
        '2': d3.select('.ds2'),
        '3': d3.select('.ds3'),
        '4': d3.select('.ds4'),
    };

    s = d3.formatSpecifier("f");
    s.precision = d3.precisionFixed(0.01);
    f = d3.format(s);

// Define the div for the tooltip
    div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);


    d3.tsv("./data/anscombe.tsv", function (error, data) {
        if (error)
            throw error;
        var dataS = data.sort(function (a, b) {
            return parseFloat(a.x) - parseFloat(b.x);
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

            createGraph(dataS, k);
        }
        ;
    });
}

function createGraph(data, k) {
    var margin = {top: 30, right: 20, bottom: 30, left: 50},
            width = 600 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;
// Set the ranges
    var xAxis = d3.scaleLinear().rangeRound([0, width]);
    var yAxis = d3.scaleLinear().rangeRound([height, 0]);
// Adds the svg canvas
    var svg = d3.select("#svg_container" + k)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
    var g = svg.append("g")
            .attr("transform", "translate(" + margin.left + ",0)");

    data.forEach(function (d) {
        d.x = +d.x;
        d.y = +d.y;
        d.r = 4;
    });
    xAxis.domain([0, 20]);
    yAxis.domain([0, 20]);

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
            .attr("class", "line")
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
            .attr("r", function (d) {
                return d.r;
            })
            .on('mouseover', function (d) {
                div.transition()
                        .duration(200)
                        .style("opacity", .9);
                div.html("observation: " + d.observation)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");

                d3.select(this).select("circle").transition()
                        .duration(750)
                        .attr("r", function (d) {
                            return d.r * 3;
                        });
            })
            .on('mouseout', function (d) {
                div.transition()
                        .duration(500)
                        .style("opacity", 0);
            })
            .append("svg:title")
            .text(function (d) {
                return "observation: " + d.observation;
            })
            ;
}

window.onload = function () {
    init();
};