let candidatesMap = getCandidatesMap();
let candidatesKeys =
        ["NDA", "MLP", "EM", "BH", "NA", "PP", "JC", "JL", "JLM", "FA", "FF"];

let parsedData = null;
let filterList = new FilterList(inflateFilterList);

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
    parsedData = data.slice();
    var select = d3.select("#filter_field");
    select.selectAll("option")
            .data(data.columns)
            .enter()
            .insert("option")
            .attr("value", function (d) {
                return d;
            })
            .text(function (d) {
                return d;
            });
    addControlsListeners();
    drawChars(data);
}

function addControlsListeners() {
    d3.select("#reset_btn").on("click", function () {
        filterList.removeAll();
        drawChars(parsedData);
    });
    var fieldFilter = d3.select("#filter_field");
    fieldFilter.on("change", function () {
        console.log(fieldFilter.node().value);
    });
    var operation = d3.select("#filter_operator");
    var value = d3.select("#filter_value");

    d3.select("#add_btn").on("click", function () {
        filterList.addFilter(
                {
                    field: fieldFilter.node().value,
                    operation: operation.node().value,
                    value: value.node().value
                }
        );
        drawChars(parsedData);
    });
}


function inflateFilterList(filterList) {
    var filterDiv = d3.select("#active_filters");
    filterDiv.html("");
    filterDiv.selectAll("div").data(filterList)
            .enter().append("div")
            .attr("class", "badge")
            .html(function (d) {
                return"<span class='field'>" + d.field
                        + "</span><span class='operator'>" + StringValueOf(d.operation)
                        + "</span><span class='value'>" + d.value + "</span><button onclick=\"deleteItem('"
                        + d.field + "','" + d.operation + "','" + d.value + "')\">X</button> ";
            })
            ;
}

function deleteItem(field, op, value) {
    filterList.removeFilter({field: field, operation: op, value: value});
    drawChars(parsedData);
}
function drawChars(data) {
    d3.selectAll("svg").remove().exit();
    realVotersSVG(data);
    genderSVG(data);
    educationSVG(data);
    approvalSVG(data);
    evalSVG(data);
}

function evalSVG(data) {
    var transformData = transformEvalData(data);
    var yDomain = [0, transformData.max];
    var title = "Evaluation votes";
    if (filterList.toString() !== "") {
        title += " " + candidatesMap[filterList.elements[0].value].name;
    }
    prepareBarChart(title, "#svg_container2", toArray(transformData, candidatesKeys), candidatesKeys, yDomain, showRealVoterItems);
}

function approvalSVG(data) {
    var transformData = transformApprovalData(data);
    var yDomain = [0, transformData.max];
    var title = "Approval votes";
    if (filterList.toString() !== "") {
        title += " " + candidatesMap[filterList.elements[0].value].name;
    }
    prepareBarChart(title, "#svg_container2", toArray(transformData, candidatesKeys), candidatesKeys, yDomain, showRealVoterItems);
}

function realVotersSVG(data) {
    var xDomain = candidatesKeys.slice();
    xDomain.push("B");
    xDomain.push("NSPP");
    var transformData = transformRealVotersData(data);
    var yDomain = [0, d3.max(transformData[0], function (d) {
            return d.data.value;
        })];
    var title = "Real Votes";
    if (filterList.toString() !== "") {
        title += " " + candidatesMap[filterList.elements[0].value].name;
    }
    prepareBarChart(title, "#svg_container1", transformData, xDomain, yDomain, showRealVoterItems);
}

function genderSVG(data) {
    var xDomain = ["F", "M", "NSPP"];
    var transformData = transformNominalData(data, "SEXE");
    var yDomain = [0, transformData.max];
    var title = "Gender";
    prepareBarChart(title,
            "#svg_container1",
            toArray(transformData, xDomain),
            xDomain,
            yDomain,
            showItems,
            "Sex",
            "Count",
            new SVGHolder(250, 300, "#svg_container1"
                    , {top: 20, right: 20, bottom: 20, left: 20}
            , {top: 20, right: 0, bottom: 60, left: 70})
            );
}

function educationSVG(data) {
    var xDomain = ["1", "2", "S", "NSPP"];
    var transformData = transformNominalData(data, "ETUDE");
    var yDomain = [0, transformData.max];
    var title = "Scholar Level";
    prepareBarChart(title,
            "#svg_container1",
            toArray(transformData, xDomain),
            xDomain,
            yDomain,
            showItems,
            "Level",
            "Count",
            new SVGHolder(250, 300, "#svg_container1"
                    , {top: 20, right: 20, bottom: 20, left: 20}
            , {top: 20, right: 0, bottom: 60, left: 70})
            );
}

function transformApprovalData(data) {
    return transformData(data, "AV_");
}

function transformEvalData(data) {
    var aggregateData = transformData(data, "EV_");
    var sum = aggregateData.sum;
    for (var key in aggregateData) {
        aggregateData[key] = aggregateData[key] / sum;
    }
    return aggregateData;
}
function transformData(data, prefix) {
    var filteredData = filterList.applyFilters(data);
    var summary = {max: -1, sum: 0, count: 0};
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
            acc.count = acc.count + 1;
        }
        return acc;
    }, summary);
    return transform;
}

function transformRealVotersData(data) {
    var filteredData = filterList.applyFilters(data);
    var groups = d3.nest()
            .key(function (d) {
                return d["VOTE"];
            })
            .rollup(function (v) {
                return v.length;
            })
            .entries(filteredData);
    var series = d3.stack().keys(["value"])(groups);
    return series;
}

function transformNominalData(data, key) {
    var filteredData = filterList.applyFilters(data);
    var summary = {max: -1, sum: 0, count: 0};
    var transform = filteredData.reduce(function (acc, d) {
        var value = d[key];
        if (typeof (acc[value]) == "undefined") {
            acc[value] = 0;
        }
        acc[value] = acc[value] + 1;
        if (acc[value] > acc.max) {
            acc.max = acc[value];
        }
        return acc;
    }, summary);
    return transform;
}

function prepareBarChart(title,
        containerID,
        data,
        xDomain,
        yDomain,
        itemInflater,
        xTitle = "Candidates",
        yTitle = "Votes",
        svgHolder = new SVGHolder(500, 300, containerID
                , {top: 20, right: 20, bottom: 20, left: 20}
        , {top: 20, right: 0, bottom: 60, left: 70}
        )) {
    svgHolder.addChartTitle(title);
//    svgHolder.showDebug();
    var xAxis = d3.scaleBand()
            .rangeRound([0, svgHolder.graphWidth])
            .paddingInner(0.05)
            .align(0.1);
    var yAxis = d3.scaleLinear().rangeRound([svgHolder.graphHeight, 0]);
    xAxis.domain(xDomain);
    yAxis.domain(yDomain);
    svgHolder.addBottomAxis(xAxis, xTitle);
    svgHolder.addLeftAxis(yAxis, yTitle);
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
            .data(function (d) {
                return d;
            }).enter()
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
        showDetails(d.data);
    })
            .on('mouseover', function (d) {
                tooltipDiv.transition()
                        .duration(200)
                        .style("opacity", .9);
                tooltipDiv.html("<img class='round' src='./images/" + candidatesMap[d.data["key"]].image + "'>"
                        + "<span class='axis-title'>Count: </span> " + d[1]
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

function showDetails(element) {
    filterList.addFilter({field: "VOTE", operation: "eq", value: element.key});
    drawChars(parsedData);
}

function downloadData() {
    var filteredData = filterList.applyFilters(parsedData);
    var exportData = [];
    exportData["data"] = filteredData;
    downloadObjectAsJson(exportData, "votes");
}

function StringValueOf(operator) {
    switch (operator) {
        case "eq":
            return"=";
        case "neq":
            return"!=";
        case "lt":
            return"&lt;";
        case "le":
            return"&lt;=";
        case "gt":
            return"&gt;";
        case "ge":
            return"&gt;=";
        default:
            return operator;
    }
}

function getCandidatesMap() {
    var map = [];
    map["1"] = {
        id: "1",
        color: "#65DBFF",
        name: "Primary",
        image: "primary.png"
    };
    map["2"] = {
        id: "2",
        color: "#4299E8",
        name: "Secondary",
        image: "secondary.jpg"
    };
    map["S"] = {
        id: "S",
        color: "#4247E8",
        name: "Superior",
        image: "superior.png"
    };
    map["F"] = {
        id: "F",
        color: "#ee3d5d",
        name: "Female",
        image: "F.png"
    };
    map["M"] = {
        id: "M",
        color: "#187ec2",
        name: "Male",
        image: "M.png"
    };
    map["NDA"] = {
        id: "NDA",
        color: "#0088c6",
        name: "Nicolas Dupont-Aignan",
        image: "NDA.jpg"
    };
    map["MLP"] = {
        id: "MLP",
        color: "#83726d",
        name: "Marine Le Pen",
        image: "MLP.jpg"
    };
    map["EM"] = {
        id: "EM",
        color: "#ffd850",
        name: "Emmanuel Macron",
        image: "EM.jpg"
    };
    map["BH"] = {
        id: "BH",
        color: "#f39dc7",
        name: "Benoît Hamon",
        image: "BH.jpg"
    };
    map["NA"] = {
        id: "NA",
        color: "#a21700",
        name: "Nathalie Arthaud",
        image: "NA.jpg"
    };
    map["PP"] = {
        id: "PP",
        color: "#f96f43",
        name: "Philippe Pouton",
        image: "PP.jpg"
    };
    map["JC"] = {
        id: "JC",
        color: "#464a4c",
        name: "Jacques Cheminade",
        image: "JC.jpg"
    };
    map["JL"] = {
        id: "JL",
        color: "#cee9f8",
        name: "Jean Lassalle",
        image: "JL.jpg"
    };
    map["JLM"] = {
        id: "JLM",
        color: "#de2707",
        name: "Jean-Luc Mélenchon",
        image: "JLM.jpg"
    };
    map["FA"] = {
        id: "FA",
        color: "#131413",
        name: "François Asselineau",
        image: "FA.jpg"
    };
    map["FF"] = {
        id: "FF",
        color: "#75bbe2",
        name: "François Fillon",
        image: "FF.jpg"
    };
    map["B"] = {
        id: "B",
        color: "#B0B29C",
        name: "White vote",
        image: "B.jpg"
    };
    map["NSPP"] = {
        id: "NSPP",
        color: "#14CC47",
        name: "No answer",
        image: "NSPP.png"
    };
    return map;
}