let candidatesMap = getCandidatesMap();
let candidatesKeys =
    ["NDA", "MLP", "EM", "BH", "NA", "PP", "JC", "JL", "JLM", "FA", "FF"];

let parsedData = null;
let filterList = new FilterList(inflateFilterList);

let tooltipDiv;

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
    for (let key in candidatesMap) {
        if (!(key === "B" || key.includes("NSPP"))) {
            d["AV_" + key] = parseFloat(d["AV_" + key]);
            const newVal = parseFloat(d["EV_" + key]);
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
    const select = d3.select("#filter_field");
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
    const fieldFilter = d3.select("#filter_field");
    fieldFilter.on("change", function () {
        console.log(fieldFilter.node().value);
    });
    const operation = d3.select("#filter_operator");
    const value = d3.select("#filter_value");

    d3.select("#relative_size").on("change", function () {
        console.log(d3.select("#relative_size").node().value);
        drawChars(parsedData);
    });

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
    const filterDiv = d3.select("#active_filters");
    filterDiv.html("");
    filterDiv.selectAll("div").data(filterList)
        .enter().append("div")
        .attr("class", "badge")
        .html(function (d) {
            return "<span class='field'>" + d.field
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
    candidatesSVG(data);
}

function candidatesSVG(data) {
    const transformedData = transformVotersData(data);
    const xDomain = ["NSPP", "18", "30", "40", "50", "60", "70"];
    const yDomain = ["S", "2", "1", "NSPP"];
    const title = "Candidates Approved";
    const dbc = new DiscreteBubbleChart(title, "#svg_container4", xDomain, yDomain);
    dbc.itemInflater(transformedData, candidatesBubbleListener, d3.select("#relative_size").node().value === "true");
}

function transformVotersData(data) {
    const filteredData = filterList.applyFilters(data);
    const groups = d3.nest()
        .key(function (d) {
            return d["ETUDE"];
        })
        .key(function (d) {
            return d["AGE"];
        })
        .key(function (d) {
            return d["VOTE"];
        })
        .entries(filteredData);
    return groups;
}

function evalSVG(data) {
    const transformedData = transformEvalData(data);
    const yDomain = [0, transformedData.max];
    let title = "Evaluation votes";
    if (filterList.toString() !== "") {
        title += " " + candidatesMap[filterList.elements[0].value].name;
    }
    const newData = toArray(transformedData, candidatesKeys);
    const sbc = new SimpleBarChart(title, "#svg_container2", candidatesKeys, yDomain);
    sbc.composedItemInflater(newData, evaluationListeners);
}


function approvalSVG(data) {
    const transformedData = transformApprovalData(data);
    const yDomain = [0, transformedData.max];
    let title = "Approval votes";
    if (filterList.toString() !== "") {
        title += " " + candidatesMap[filterList.elements[0].value].name;
    }
    const newData = toArray(transformedData, candidatesKeys);
    const sbc = new SimpleBarChart(title, "#svg_container2", candidatesKeys, yDomain);
    sbc.itemInflater(newData, voterListeners);
}

function realVotersSVG(data) {
    const xDomain = candidatesKeys.slice();
    xDomain.push("B");
    xDomain.push("NSPP");
    const transformedData = transformRealVotersData(data);
    const yDomain = [0, d3.max(transformedData[0], function (d) {
        return d.data.value;
    })];
    let title = "Real Votes";
    if (filterList.toString() !== "") {
        title += " " + candidatesMap[filterList.elements[0].value].name;
    }

    const sbc = new SimpleBarChart(title, "#svg_container1", xDomain, yDomain);
    sbc.itemInflater(transformedData, voterListeners);
}

function genderSVG(data) {
    const xDomain = ["F", "M", "NSPP"];
    const transformedData = transformNominalData(data, "SEXE");
    const title = "Gender";
    const newData = toSimpleArray(transformedData, xDomain, "SEXE");
    const genderPie = new PieChart(title, "#svg_container1");
    genderPie.itemInflater(newData, voterListeners);
}

function educationSVG(data) {
    const xDomain = ["1", "2", "S", "NSPP"];
    const transformedData = transformNominalData(data, "ETUDE");
    const title = "Scholar Level";
    const newData = toSimpleArray(transformedData, xDomain, "ETUDE");
    const educationPie = new PieChart(title, "#svg_container1");
    educationPie.itemInflater(newData, voterListeners);
}

function transformApprovalData(data) {
    return transformData(data, "AV_");
}

function transformEvalData(data) {
    const filteredData = filterList.applyFilters(data);
    const summary = {max: -1, sum: 0, count: 0};
    const prefix = "EV_";
    const transform = filteredData.reduce(function (acc, d) {
        let key;
        let value;
        for (let i = 0; i < candidatesKeys.length; i++) {
            key = candidatesKeys[i];
            value = d[prefix + key];
            if (typeof (acc[key]) == "undefined") {
                acc[key] = [];
                acc[key]["D"] = 0;
                acc[key]["N"] = 0;
                acc[key]["A"] = 0;
                acc[key]["T"] = 0;
            }
            if (value < 0.3) {
                acc[key]["D"] = acc[key]["D"] + 1;
            }
            if (value >= 0.3 && value < 0.6) {
                acc[key]["N"] = acc[key]["N"] + 1;
            }
            if (value >= 0.6) {
                acc[key]["A"] = acc[key]["A"] + 1;
            }
            acc[key]["T"] = acc[key]["T"] + 1;
            if (acc[key]["T"] > acc.max) {
                acc.max = acc[key]["T"];
            }
            acc.count = acc.count + 1;
        }
        return acc;
    }, summary);
    return transform;
}

function transformData(data, prefix) {
    const filteredData = filterList.applyFilters(data);
    const summary = {max: -1, sum: 0, count: 0};
    const transform = filteredData.reduce(function (acc, d) {
        let key;
        for (let i = 0; i < candidatesKeys.length; i++) {
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
    const filteredData = filterList.applyFilters(data);
    const groups = d3.nest()
        .key(function (d) {
            return d["VOTE"];
        })
        .rollup(function (v) {
            return v.length;
        })
        .entries(filteredData);
    const series = d3.stack().keys(["value"])(groups);
    return series;
}

function transformNominalData(data, key) {
    const filteredData = filterList.applyFilters(data);
    const summary = {max: -1, sum: 0, count: 0};
    const transform = filteredData.reduce(function (acc, d) {
        const value = d[key];
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

function candidatesBubbleListener(element) {
    element.on("click", function (d) {
        showDetails(d);
    })
        .on('mouseover', function (d) {
            tooltipDiv.transition()
                .duration(200)
                .style("opacity", .9);
            tooltipDiv.html("<img class='round' src='./images/" + candidatesMap[d["key"]].image + "'>"
                + "<span class='axis-title'>Count: </span> " + d["values"].length
                + "<br /> <span>Name: " + candidatesMap[d["key"]].name + "</span>")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on('mouseout', function () {
            tooltipDiv.transition()
                .duration(500)
                .style("opacity", 0);
        });
}

function voterListeners(element) {
    element.on("click", function (d) {
        showDetails(d.data);
    })
        .on('mouseover', function (d) {
            tooltipDiv.transition()
                .duration(200)
                .style("opacity", .9);
            tooltipDiv.html("<img class='round' src='./images/" + candidatesMap[d.data["key"]].image + "'>"
                + "<span class='axis-title'>Count: </span> " + d.data["value"]
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
            return "observation: " + d.data["value"];
        });
}

function evaluationListeners(element) {
    element.on("click", function (d) {
        const data = d.data;
        let lowerBound, upperBound;
        switch (data.key) {
            case "D":
                lowerBound = 0;
                upperBound = 0.3;
                break;
            case "N":
                lowerBound = 0.3;
                upperBound = 0.6;
                break;
            case "A":
                lowerBound = 0.6;
                upperBound = 1.01;
                break;
        }
        filterList.addFilter({field: data.field, operation: "lt", value: upperBound});
        showDetails({field: data.field, operation: "ge", key: lowerBound});
    })
        .on('mouseover', function (d) {
            tooltipDiv.transition()
                .duration(200)
                .style("opacity", .9);
            tooltipDiv.html("<span class='axis-title'>Count: </span> " + d[1])
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


function showDetails(element) {
    if (typeof (element.field) == "undefined") {
        filterList.addFilter({field: "VOTE", operation: "eq", value: element.key});
    } else if (typeof (element.operation) == "undefined") {
        filterList.addFilter({field: element.field, operation: "eq", value: element.key});
    } else {
        filterList.addFilter({field: element.field, operation: element.operation, value: element.key});
    }
    drawChars(parsedData);
}

function downloadData() {
    const filteredData = filterList.applyFilters(parsedData);
    downloadObjectAsJson(filteredData, "votes");
}

/**
 * @return {string}
 */
function StringValueOf(operator) {
    switch (operator) {
        case "eq":
            return "=";
        case "neq":
            return "!=";
        case "lt":
            return "&lt;";
        case "le":
            return "&lt;=";
        case "gt":
            return "&gt;";
        case "ge":
            return "&gt;=";
        default:
            return operator;
    }
}

function getCandidatesMap() {
    const map = [];
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