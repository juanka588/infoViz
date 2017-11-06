let MARK_SIZE = 60;

let margin = {top: 30, right: 20, bottom: 30, left: 50},
        width = 800 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;


var modal = null;
var span = null;

// Define the div for the tooltip
var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

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
    var xAxis = d3.scaleLinear().rangeRound([0, width]).nice();
    var yAxis = d3.scaleLinear().rangeRound([height, 0]).nice();


//    xAxis.domain(d3.extent(data, function (d) {
//        return  d.weight;
//    }));

    xAxis.domain([1500, 5500]);

//    yAxis.domain(d3.extent(data, function (d) {
//        return  d.mpg;
//    }));
    yAxis.domain([5, 50]);

    // Adds the svg canvas
    var svg = d3.select("#svg_container")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
    var g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    showAxis(svg, xAxis, yAxis);

    //add points
    var symbolsMap = [
        {
            k: "Europe"
            , s: d3.symbol()
                    .size(function (d) {
                        return MARK_SIZE;
                    })
                    .type(function (d) {
                        return d3.symbolCircle;
                    })},
        {
            k: "Japan"
            , s: d3.symbol()
                    .size(function (d) {
                        return MARK_SIZE;
                    })
                    .type(function (d) {
                        return d3.symbolSquare;
                    })},
        {
            k: "USA",
            s: "M -4,0 L 4,0 M 0,-4 L 0,4"
        },
    ];
    symbolsMap.forEach(function (item) {
        displayItem(item, g, data, xAxis, yAxis);
    });
}
function displayItem(e, g, data, xAxis, yAxis) {
    var blues = d3.scaleSequential(d3.interpolateBlues).domain([1950, 1980]);
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
                return blues(d.year);
            })
            .style("fill", function () {
                return "transparent";
            })
            .attr("d", e.s);
    addListeners(displayElement);
}


function addListeners(element) {
    element.on("click", function (d) {
        displayInfo(d);
    })
            .on('mouseover', function (d) {
                div.transition()
                        .duration(200)
                        .style("opacity", .9);
                div.html("weight: " + d.weight + "<br>mpg: " + d.mpg)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");

            })
            .on('mouseout', function () {
                div.transition()
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
    svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
            .call(d3.axisBottom(xAxis));

    // Add the Y Axis
    svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("text", "mpg")
            .call(d3.axisLeft(yAxis));

    svg.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate(" + (margin.left) + "," + (height / 2) + ")rotate(-90)")  // centre below axis
            .text("MPG");


    svg.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate(" + (width / 2) + "," + (height + margin.top) + ")")  // centre below axis
            .text("Weight");
}

function displayInfo(d) {
    modal.style.display = "block";
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

window.onload = function () {
    init();
};