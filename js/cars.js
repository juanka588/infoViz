let MARK_SIZE = 60;

let modal = null;
let span = null;
// Define the div for the tooltip
let tooltipDiv = null;

let fixedSize = MARK_SIZE / 15.5;
let symbolSimpleCross = function (size) {
    return  "M -" + size + ",0 L " + size + ",0 M 0,-" + size + " L 0," + size;
};

function init() {
    tooltipDiv = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

    addModalLogic('car_info');
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


function addModalLogic(modalId) {
    modal = document.getElementById(modalId);
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
    const svgHolder = new SVGHolder(800, 600);

    const xAxis = d3.scaleLinear().rangeRound([0, svgHolder.graphWidth]);
    const yAxis = d3.scaleLinear().rangeRound([svgHolder.graphHeight, 0]);
    const colorAxis = d3.scaleSequential(d3.interpolateBlues);

    colorAxis.domain([1965, 1985]).nice();

    xAxis.domain([1500, 5500]).nice();

    yAxis.domain([5, 50]).nice();

    showAxis(svgHolder, xAxis, yAxis);

    //add points
    const symbolsMap = [
        {
            k: "Europe",
            s: d3.symbol()
                .size(d => MARK_SIZE)
                .type(d => d3.symbolCircle)
        },
        {
            k: "Japan",
            s: d3.symbol()
                .size(d => MARK_SIZE)
                .type(d => d3.symbolSquare)
        },
        {
            k: "USA",
            s: symbolSimpleCross(fixedSize),
        },
    ];
    symbolsMap.forEach(item => {
        displayItem(item, svgHolder.mainGroup, data, xAxis, yAxis, colorAxis);
    });
    addLegend(svgHolder, colorAxis);
}
function displayItem(e, g, data, xAxis, yAxis, colorAxis) {
    const displayElement = g.selectAll("g")
        .data(data)
        .enter()
        .filter(function (d) {
            return d.origin == e.k;
        })
        .append("path")
        .attr("transform", d => "translate(" + xAxis(d.weight) + "," + yAxis(d.mpg) + ")")
        .attr("class", "country " + e.k)
        .style("stroke", d => colorAxis(d.year))
        .style("fill", function () {
            return "transparent";
        })
        .attr("d", e.s);
    addListeners(displayElement);
}

function zoomed() {
    g.attr("transform", d3.zoomIdentity);
}

function addListeners(element) {
    element.on("click", d => {
        modal.style.display = "block";
        displayInfo(d);
    })
        .on('mouseover', d => {
                tooltipDiv.transition()
                        .duration(200)
                        .style("opacity", .9);
                tooltipDiv.html("<span class='axis-title'>Weight: </span> " + d.weight
                        + "<br /><span class='axis-title'>MPG: </span>" + d.mpg)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");

            })
        .on('mouseout', () => {
                tooltipDiv.transition()
                        .duration(500)
                        .style("opacity", 0);
            })
            .append("svg:title")
        .text(d => "observation: " + d.name);
}

function showAxis(svgHolder, xAxis, yAxis) {
    svgHolder.addBottomAxis(xAxis, "Weight");
    svgHolder.addLeftAxis(yAxis, "MPG");
}

function addLegend(svgHolder, colorAxis) {
    let itemHeight = 30;
    let innerMargin = {left: 20, top: 10};
    let elements = getLegendElements(colorAxis);
    for (let i = 0; i < elements.length; i++) {
        const markWidth = 20;
        let x = (svgHolder.width - svgHolder.getRight()) + innerMargin.left;
        const y = (svgHolder.getTop() + innerMargin.top + itemHeight * i);
        if (elements[i].mark != null) {
            let path = svgHolder.svg.append("path");
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
        let txt = svgHolder.svg.append("text");
        txt.attr("transform", "translate(" + x + "," + y + ")")
                .text(elements[i].label);
        if (elements[i].mark == null) {
            txt.attr("class", "axis-title");
        }
    }
}


function getLegendElements(colorAxis) {
    let elements = [
        {label: "Origin", mark: null},
        {label: "Europe", mark: d3.symbol().size(MARK_SIZE).type(d3.symbolCircle), class: "legend-symbol"},
        {label: "Japan", mark: d3.symbol().size(MARK_SIZE).type(d3.symbolSquare), class: "legend-symbol"},
        {label: "USA", mark: symbolSimpleCross(fixedSize), class: "legend-symbol"},
        {label: "Year", mark: null}
    ];
    for (let i = 0; i < 10; i++) {
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
    const nameSpan = document.getElementById("car_name");
    const weightSpan = document.getElementById("car_weight");
    const mpgSpan = document.getElementById("car_mpg");
    const accSpan = document.getElementById("car_acceleration");
    const cylSpan = document.getElementById("car_cylinders");
    const displacementSpan = document.getElementById("car_displacement");
    const hpSpan = document.getElementById("car_horsepower");
    const yearSpan = document.getElementById("car_year");
    const originSpan = document.getElementById("car_origin");

    nameSpan.innerHTML = d.name;
    weightSpan.innerHTML = d.weight;
    mpgSpan.innerHTML = d.mpg;
    accSpan.innerHTML = d.acceleration;
    cylSpan.innerHTML = d.cylinders;
    displacementSpan.innerHTML = d.displacement;
    hpSpan.innerHTML = d.horsepower;
    yearSpan.innerHTML = d.year;
    originSpan.innerHTML = d.origin;
}

window.onload = function () {
    init();
};