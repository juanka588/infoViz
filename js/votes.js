let candidatesMap = getCandidatesMap();

window.onload = function () {
    init();
};


function init() {
    d3.csv("./data/votes.csv")
            .row(parseData)
            .get(onDataLoaded);
}

function parseData(d) {
    var candidate;
    for (var i = 0; i < candidatesMap.length; i++) {
        candidate = candidatesMap[i];
        d["AV_" + candidate.id] = parseFloat(d["AV_" + candidate.id]);
        d["EV_" + candidate.id] = parseFloat(d["EV_" + candidate.id]);
    }
    return d;
}

function onDataLoaded(error, data) {
    if (error)
        throw error;

    console.log(data);
    prepareSVG(data);
}

function prepareSVG(data) {
    var svgHolder = new SVGHolder(800, 600);
//    svgHolder.showDebug();
    var xAxis = d3.scaleBand()
            .rangeRound([0, svgHolder.graphWidth])
            .paddingInner(0.05)
            .align(0.1);

    var yAxis = d3.scaleLinear().rangeRound([svgHolder.graphHeight, 0]);
    var colorAxis = d3.scaleSequential(d3.interpolateBlues);

    colorAxis.domain([0, data.length]).nice();

    xAxis.domain(data.map(function (d) {
        return d.VOTE;
    }));

    yAxis.domain([0, data.length]).nice();

    showAxis(svgHolder, xAxis, yAxis);

    showItems(svgHolder, data, xAxis, yAxis, colorAxis);
}

function showItems(svgHolder, data, xAxis, yAxis, colorAxis) {
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
    var g = [
        {count: 15, women: 15, group_by: "EM"}
        , {count: 15, women: 85, group_by: "EM"}
        , {count: 40, women: 35, group_by: "JL"}
        , {count: 40, women: 12, group_by: "JL"}
    ];
    var series = d3.stack().keys(["value"])(groups);
    svgHolder.mainGroup
            .selectAll("g")
            .data(series)
            .enter()
            .selectAll("rect")
            .data(function (d) {
                return d;
            })
            .enter().append("rect")
            .attr("fill", function (d) {
                return colorAxis(1000);
            })
            .attr("height", function (d) {
                return yAxis(d[0]) - yAxis(d[1]);
            })
            .attr("width", xAxis.bandwidth())
            .attr("transform", function (d) {
                return "translate(" + xAxis(d.data["key"]) + "," + yAxis(d[1]) + "),rotate(0)";
            });

}

function showAxis(svgHolder, xAxis, yAxis) {
    svgHolder.addBottomAxis(xAxis, "Candidates");
    svgHolder.addLeftAxis(yAxis, "Votes");
}

function getCandidatesMap() {
    return [
        {
            id: "NDA",
            color: "#0088c6",
            name: "Nicolas Dupont-Aignan"
        },
        {
            id: "MLP",
            color: "#83726d",
            name: "Marine Le Pen"
        },
        {
            id: "EM",
            color: "#ffd850",
            name: "Emmanuel Macron"
        },
        {
            id: "BH",
            color: "#f39dc7",
            name: "Benoît Hamon"
        },
        {
            id: "NA",
            color: "#a21700",
            name: "Nathalie Arthaud"
        },
        {
            id: "PP",
            color: "#f96f43",
            name: "Philippe Pouton"
        },
        {
            id: "JC",
            color: "#464a4c",
            name: "Jacques Cheminade"
        },
        {
            id: "JL",
            color: "#cee9f8",
            name: "Jean Lassalle"
        },
        {
            id: "JLM",
            color: "#de2707",
            name: "Jean-Luc Mélenchon"
        },
        {
            id: "FA",
            color: "#131413",
            name: "François Asselineau"
        },
        {
            id: "FF",
            color: "#75bbe2",
            name: "François Fillon"
        },
    ];
}