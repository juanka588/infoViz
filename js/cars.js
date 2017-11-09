let MARK_SIZE = 60;

let margin = {top: 20, right: 20, bottom: 20, left: 20};
let padding = {top: 0, right: 150, bottom: 80, left: 60};
let width = 800;
let height = 600;
let graphWidth = width - margin.left - margin.right - padding.left - padding.right;
let graphHeight = height - margin.top - margin.bottom - padding.top - padding.bottom;


var modal = null;
var span = null;

// Define the div for the tooltip
var tooltipDiv = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

let fixedSize = MARK_SIZE / 15.5;
let symbolSympleCross = function (size) {
    return  "M -" + size + ",0 L " + size + ",0 M 0,-" + size + " L 0," + size;
};

function init() {
    addModalLogic();
    d3.tsv("./data/cars.tsv", function (error, data) {
        if (error)
            throw error;

        data.forEach(function (d) {
            d.weight = parseFloat(d.weight);
            d.acceleration = parseFloat(d.acceleration);
            d.cylinders = parseFloat(d.cylinders);
            d.displacement = parseFloat(d.displacement);
            d.horsepower = parseFloat(d.horsepower);
            d.mpg = parseFloat(d.mpg);
            d.year = parseFloat(d.year);
        });
        data.sort(function (a, b) {
            return a.origin - b.origin;
        });
        console.log(data);
        prepareSVG(data);
    });
}
function addModalLogic() {
    modal = document.getElementById('car_info');
    span = document.getElementsByClassName("close")[0];
    span.onclick = function () {
        modal.style.display = "none";
    };
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
}

function prepareSVG(data) {
    // Set the ranges
    var xAxis = d3.scaleLinear().rangeRound([0, graphWidth]);
    var yAxis = d3.scaleLinear().rangeRound([graphHeight, 0]);
    var colorAxis = d3.scaleSequential(d3.interpolateBlues)
            .domain(d3.extent(data, function (d) {
                return  d.year;
            })).nice();

//    xAxis.domain(d3.extent(data, function (d) {
//        return  d.weight;
//    })).nice();

    xAxis.domain([1500, 5500]).nice();

//    yAxis.domain(d3.extent(data, function (d) {
//        return  d.mpg;
//    })).nice();
    yAxis.domain([5, 50]).nice();

    // Adds the svg canvas
    var svg = d3.select("#svg_container")
            .append("svg")
            .attr("width", width)
            .attr("height", height);
    var g = svg.append("g")
            .attr("transform", "translate("
                    + (margin.left + padding.left)
                    + ","
                    + (margin.top + padding.top)
                    + ")");

    showAxis(svg, xAxis, yAxis);
//    showDebug(svg, g);
    //add points
    var symbolsMap = [
        {
            k: "Europe",
            s: d3.symbol()
                    .size(function (d) {
                        return MARK_SIZE;
                    })
                    .type(function (d) {
                        return d3.symbolCircle;
                    })
        },
        {
            k: "Japan",
            s: d3.symbol()
                    .size(function (d) {
                        return MARK_SIZE;
                    })
                    .type(function (d) {
                        return d3.symbolSquare;
                    })
        },
        {
            k: "USA",
            s: symbolSympleCross(fixedSize),
        },
    ];
    symbolsMap.forEach(function (item) {
        displayItem(item, g, data, xAxis, yAxis, colorAxis);
    });
    addLegend(svg, colorAxis);
}
function displayItem(e, g, data, xAxis, yAxis, colorAxis) {
    var displayElement = g.selectAll("g")
            .data(data)
            .enter()
            .filter(function (d) {
                return d.origin == e.k;
            })
            .append("path")
            .attr("transform", function (d) {
                return "translate(" + xAxis(d.weight) + "," + yAxis(d.mpg) + ")";
            })
            .attr("class", "country " + e.k)
            .style("stroke", function (d) {
                return colorAxis(d.year);
            })
            .style("fill", function () {
                return "transparent";
            })
            .attr("d", e.s);
    addListeners(displayElement);
}


function addListeners(element) {
    element.on("click", function (d) {
        modal.style.display = "block";
        displayInfo(d);
    })
            .on('mouseover', function (d) {
                tooltipDiv.transition()
                        .duration(200)
                        .style("opacity", .9);
                tooltipDiv.html("<span class='axis-title'>Weight: </span> " + d.weight
                        + "<br /><span class='axis-title'>MPG: </span>" + d.mpg)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");

            })
            .on('mouseout', function () {
                tooltipDiv.transition()
                        .duration(500)
                        .style("opacity", 0);
            })
            .append("svg:title")
            .text(function (d) {
                return "observation: " + d.name;
            });
}

function showAxis(svg, xAxis, yAxis) {
    // Add the X Axis
    addBottomAxis(svg, xAxis, "Weight");
    // Add the Y Axis
    addLeftAxis(svg, yAxis, "MPG");
}

function addLeftAxis(svg, yAxis, title) {
    svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate("
                    + (margin.left + padding.left)
                    + ","
                    + (margin.top + padding.top)
                    + ")")
            .attr("text", "mpg")
            .call(d3.axisLeft(yAxis));

    svg.append("text")
            .attr("text-anchor", "middle")
            .attr("class", "axis-title")
            .attr("transform", "translate("
                    + (margin.left + padding.left / 2)
                    + ","
                    + (graphHeight / 2 + margin.top + padding.top)
                    + ")rotate(-90)")
            .text(title);
}

function addBottomAxis(svg, xAxis, title) {
    svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate("
                    + (margin.left + padding.left)
                    + ","
                    + (graphHeight + padding.top + margin.top)
                    + ")")
            .call(d3.axisBottom(xAxis));
    svg.append("text")
            .attr("text-anchor", "middle")
            .attr("class", "axis-title")
            .attr("transform", "translate("
                    + (graphWidth / 2 + margin.left + padding.left)
                    + ","
                    + (height - margin.bottom - padding.bottom / 2)
                    + ")")
            .text(title);
}

function addLegend(svg, colorAxis) {
    let itemHeight = 30;
    let innerMargin = {left: 20, top: 10};
    let elements = getLeyendElements(colorAxis);
    for (var i = 0; i < elements.length; i++) {
        var markWidth = 20;
        var x = (width - margin.right - padding.right + innerMargin.left);
        var y = (margin.top + padding.top + innerMargin.top + itemHeight * i);
        if (elements[i].mark != null) {
            let path = svg.append("path");
            path.attr("transform", function () {
                return "translate(" + x + "," + (y - 5) + ")";
            })
                    .attr("class", elements[i].class)
                    .attr("d", elements[i].mark);
            if (elements[i].class === "fixed-color") {
                path.attr("fill", elements[i].color);
            }
            x = x + markWidth;
        }
        let txt = svg.append("text");
        txt.attr("transform", "translate(" + x + "," + y + ")")
                .text(elements[i].label);
        if (elements[i].mark == null) {
            txt.attr("class", "axis-title");
        }
    }
}


function getLeyendElements(colorAxis) {
    let elements = [
        {label: "Origin", mark: null},
        {label: "Europe", mark: d3.symbol().size(MARK_SIZE).type(d3.symbolCircle), class: "legend-symbol"},
        {label: "Japan", mark: d3.symbol().size(MARK_SIZE).type(d3.symbolSquare), class: "legend-symbol"},
        {label: "USA", mark: symbolSympleCross(fixedSize), class: "legend-symbol"},
        {label: "Year", mark: null}
    ];
    for (var i = 0; i < 10; i++) {
        elements.push({
            label: "7" + i,
            mark: d3.symbol().size(MARK_SIZE * 2).type(d3.symbolSquare),
            class: "fixed-color",
            color: colorAxis(1970 + i)
        });
    }
    return elements;
}
function displayInfo(d) {
    var nameSpan = document.getElementById("car_name");
    var weightSpan = document.getElementById("car_weight");
    var mpgSpan = document.getElementById("car_mpg");
    var accSpan = document.getElementById("car_acceleration");
    var cylSpan = document.getElementById("car_cylinders");
    var displaSpan = document.getElementById("car_displacement");
    var hpSpan = document.getElementById("car_horsepower");
    var yearSpan = document.getElementById("car_year");
    var originSpan = document.getElementById("car_origin");

    nameSpan.innerHTML = d.name;
    weightSpan.innerHTML = d.weight;
    mpgSpan.innerHTML = d.mpg;
    accSpan.innerHTML = d.acceleration;
    cylSpan.innerHTML = d.cylinders;
    displaSpan.innerHTML = d.displacement;
    hpSpan.innerHTML = d.horsepower;
    yearSpan.innerHTML = d.year;
    originSpan.innerHTML = d.origin;
}

function showDebug(svg, g) {
    svg.attr("class", "debug");
    svg.append("rect")
            .attr("x", margin.left)
            .attr("y", margin.top)
            .attr("width", width - margin.left - margin.right)
            .attr("height", height - margin.top - margin.bottom)
            .attr("fill", "#FF000000")
            .attr("fill-opacity", "0.3")
            ;
    g.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", graphWidth)
            .attr("height", graphHeight)
            .attr("fill", "red")
            .attr("fill-opacity", "0.3")
            ;
}

window.onload = function () {
    init();
};