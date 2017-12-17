let candidatesMap = getCandidatesMap();
let candidatesKeys =
        ["NDA", "MLP", "EM", "BH", "NA", "PP", "JC", "JL", "JLM", "FA", "FF"];

var tooltipDiv;
window.onload = function () {
    init();
};
function init() {
    tooltipDiv = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    d3.csv("./data/votes.csv")
            .row(parseData)
            .get(onDataLoaded);
}

function parseData(d) {
    for (var key in  candidatesMap) {
        if (!(key === "B" || key.includes("NSPP"))) {
            d["AV_" + key] = parseFloat(d["AV_" + key]);
            var newVal = parseFloat(d["EV_" + key]);
            d["EV_" + key] = d3.min([1, d3.max([0, newVal])]);
        }
    }
    return d;
}

function onDataLoaded(error, data) {
    if (error)
        throw error;
    console.log(data);
    realVotersSVG(data);
    approvalSVG(data);
    evalSVG(data);
}

function evalSVG(data) {
    var transformData = transformEvalData(data);
    var yDomain = [0, transformData.max];
    prepareBarChart("#svg_container3", toArray(transformData, candidatesKeys), candidatesKeys, yDomain, showRealVoterItems);
}

function approvalSVG(data) {
    var transformData = transformApprovalData(data);
    var yDomain = [0, transformData.max];
    prepareBarChart("#svg_container2", toArray(transformData, candidatesKeys), candidatesKeys, yDomain, showRealVoterItems);
}

function realVotersSVG(data) {
    var xDomain = candidatesKeys.slice();
    xDomain.push("B");
    xDomain.push("NSPP");
    var transformData = transformRealVotersData(data);
    var yDomain = [0, d3.max(transformData[0], function (d) {
            return d.data.value;
        })];
    prepareBarChart("#svg_container1", transformData, xDomain, yDomain, showRealVoterItems);
}

function transformApprovalData(data) {
    return transformData(data, "AV_");
}

function transformEvalData(data) {
    return transformData(data, "EV_");
}
function transformData(data, prefix) {
    var filteredData = data.filter(function (d) {
        return true;
    });
    var summary = {max: -1, sum: 0};
    var transform = filteredData.reduce(function (acc, d) {
        var key;
        for (var i = 0; i < candidatesKeys.length; i++) {
            key = candidatesKeys[i];
            if (typeof (acc[key]) == "undefined") {
                acc[key] = 0;
            }
            acc[key] = acc[key] + d[prefix + key];
            if (acc[key] > acc.max) {
                acc.max = acc[key];
            }
            acc.sum = acc.sum + d[prefix + key];
        }
        return acc;
    }, summary);
    return transform;
}

function transformRealVotersData(data) {
    var filteredData = data.filter(function (d) {
        return true;
    });
    var groups = d3.nest()
            .key(function (d) {
                return d["VOTE"];
            })
            .rollup(function (v) {
                return v.length;
            })
            .entries(filteredData);
    console.log(groups);
    var series = d3.stack().keys(["value"])(groups);
    console.log(series);
    return series;
}

function prepareBarChart(containerID, data, xDomain, yDomain, itemInflater) {
    var svgHolder = new SVGHolder(500, 300, containerID
            , {top: 20, right: 20, bottom: 20, left: 20}
    , {top: 0, right: 0, bottom: 60, left: 60}
    );
//    svgHolder.showDebug();
    var xAxis = d3.scaleBand()
            .rangeRound([0, svgHolder.graphWidth])
            .paddingInner(0.05)
            .align(0.1);
    var yAxis = d3.scaleLinear().rangeRound([svgHolder.graphHeight, 0]);
    xAxis.domain(xDomain);
    yAxis.domain(yDomain);
    showAxis(svgHolder, xAxis, yAxis);
    itemInflater(svgHolder, data, xAxis, yAxis);
}

function showRealVoterItems(svgHolder, series, xAxis, yAxis) {
    var displayElement = svgHolder.mainGroup
            .selectAll("g")
            .data(series)
            .enter().append("g")
            .attr("class", "series")
            .selectAll("rect")
            .data(function (d) {
                return d;
            })
            .enter().append("rect")
            .attr("fill", function (d) {
                var temp = candidatesMap[d.data["key"]];
                return temp.color;
            })
            .attr("height", function (d) {
                return yAxis(d[0]) - yAxis(d[1]);
            })
            .attr("width", xAxis.bandwidth())
            .attr("transform", function (d) {
                return "translate(" + xAxis(d.data["key"]) + "," + yAxis(d[1]) + ")";
            })
            ;
    addListeners(displayElement);
}

function showItems(svgHolder, data, xAxis, yAxis) {
    var displayElement = svgHolder.mainGroup
            .selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("class", "series")
            .selectAll("rect")
            .append("rect")
            .attr("fill", function (d) {
                var temp = candidatesMap[d.data["key"]];
                return temp.color;
            })
            .attr("height", function (d) {
                return yAxis(d[0]) - yAxis(d[1]);
            })
            .attr("width", xAxis.bandwidth())
            .attr("transform", function (d) {
                return "translate(" + xAxis(d.data["key"]) + "," + yAxis(d[1]) + ")";
            })
            ;
    addListeners(displayElement);
}


function addListeners(element) {
    element.on("click", function (d) {
//        modal.style.display = "block";
//        displayInfo(d);
    })
            .on('mouseover', function (d) {
                tooltipDiv.transition()
                        .duration(200)
                        .style("opacity", .9);
                tooltipDiv.html("<span class='axis-title'>Count: </span> " + d[1]
                        + "<br /> <span>Name: " + candidatesMap[d.data["key"]].name + "</span>")
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
                return "observation: " + d[1];
            });
}

function showAxis(svgHolder, xAxis, yAxis) {
    svgHolder.addBottomAxis(xAxis, "Candidates");
    svgHolder.addLeftAxis(yAxis, "Votes");
}

function toArray(obj, properties) {
    var arr = [];
    var prop;
    for (var i = 0; i < properties.length; i++) {
        prop = properties[i];
        arr.push(
                {
                    0: 0
                    , 1: obj[prop]
                    , data: {key: prop, value: obj[prop]}
                }
        );
    }
    return [arr];
}


function getCandidatesMap() {
    var map = [];
    map["NDA"] = {id: "NDA", color: "#0088c6", name: "Nicolas Dupont-Aignan"};
    map["MLP"] = {
        id: "MLP",
        color: "#83726d",
        name: "Marine Le Pen"
    };
    map["EM"] = {
        id: "EM",
        color: "#ffd850",
        name: "Emmanuel Macron"
    };
    map["BH"] = {
        id: "BH",
        color: "#f39dc7",
        name: "Benoît Hamon"
    };
    map["NA"] = {
        id: "NA",
        color: "#a21700",
        name: "Nathalie Arthaud"
    };
    map["PP"] = {
        id: "PP",
        color: "#f96f43",
        name: "Philippe Pouton"
    };
    map["JC"] = {
        id: "JC",
        color: "#464a4c",
        name: "Jacques Cheminade"
    };
    map["JL"] = {
        id: "JL",
        color: "#cee9f8",
        name: "Jean Lassalle"
    };
    map["JLM"] = {
        id: "JLM",
        color: "#de2707",
        name: "Jean-Luc Mélenchon"
    };
    map["FA"] = {
        id: "FA",
        color: "#131413",
        name: "François Asselineau"
    };
    map["FF"] = {
        id: "FF",
        color: "#75bbe2",
        name: "François Fillon"
    };
    map["B"] = {
        id: "B",
        color: "#eee",
        name: "White vote"
    };
    map["NSPP"] = {
        id: "NSPP",
        color: "#000",
        name: "No answer"
    };
    return map;
}