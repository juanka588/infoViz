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
    svgHolder.showDebug();
    var xAxis = d3.scaleLinear().rangeRound([0, svgHolder.graphWidth]);
    var yAxis = d3.scaleLinear().rangeRound([svgHolder.graphHeight, 0]);
    var colorAxis = d3.scaleSequential(d3.interpolateBlues);

    colorAxis.domain([1965, 1985]).nice();

    xAxis.domain([1500, 5500]).nice();

    yAxis.domain([5, 50]).nice();

    showAxis(svgHolder, xAxis, yAxis);
}

function showAxis(svgHolder, xAxis, yAxis) {
    svgHolder.addBottomAxis(xAxis, "Weight");
    svgHolder.addLeftAxis(yAxis, "MPG");
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