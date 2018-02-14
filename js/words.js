let tooltipDiv;
let parsedData;
const letterMatrix = [];
const chars = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m"
            , "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "-"];

window.onload = function () {
    init();
};

function init() {
    tooltipDiv = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
}
function loadFromServer() {
    d3.json("./data/words_dictionary.json", onDataLoaded);
    d3.request("/data/compact.txt")
            .mimeType("text/plain")
            .response(data => data.response.split("\n"))
            .get(data => {
                console.log(data);
                for (var i = 0; i < data.length; i++) {
                    parseData(data[i]);
                }
            });
}
function parseData(string) {
    let c;
    let n;
    for (let i = 0; i < string.length - 1; i++) {
        c = string[i];
        n = string[i + 1];
        if (typeof (letterMatrix[i]) == "undefined") {
            letterMatrix[i] = [];
        }
        if (typeof (letterMatrix[i][c]) == "undefined") {
            letterMatrix[i][c] = [];
            letterMatrix[i][c]["sum"] = 0;
            letterMatrix[i]["sum"] = [];
        }
        if (typeof (letterMatrix[i][c][n]) == "undefined") {
            letterMatrix[i][c][n] = 0;
            letterMatrix[i]["sum"][n] = 0;
        }
        letterMatrix[i][c][n] = letterMatrix[i][c][n] + 1;
        letterMatrix[i]["sum"][n] = letterMatrix[i]["sum"][n] + 1;
        letterMatrix[i][c]["sum"] = letterMatrix[i][c]["sum"] + 1;
    }
}
function addWord() {
    const words = d3.select("#new_word_input").node().value.split(/\b(\s)/);
    for (let i = 0; i < words.length; i++) {
        parseData(words[i]);
    }
    console.log(letterMatrix);
    drawChars(letterMatrix);
}

function onDataLoaded(error, data) {
    if (error) {
        throw error;
    }
    for (let prop in data) {
        parseData(prop);
    }
    console.log(letterMatrix);
    addControlsListeners();
    drawChars(letterMatrix);
}

function addControlsListeners() {

}

function drawChars(data) {
    d3.selectAll("svg").remove().exit();
    for (var i = 0; i < data.length && i < 12; i++) {
        drawChar(data[i], i + 1);
    }
    var c;
    for (var i = 0; i < chars.length; i++) {
        c = chars[i];
        const lcc = new LineCurveChart("Position Distrib", "#svg_container" + c.toUpperCase(), [-1, 16], c.toUpperCase());
        let charDistribution = getSeriesFor(data, c);
        lcc.itemInflater(charDistribution, heatListener);
    }
}

function getSeriesFor(data, char) {
    let series = [];
    let val;
    for (var i = 0; i < data.length; i++) {
        val = data[i][char];
        if (!val) {
            val = [];
            val[i] = [];
            val[i][char] = [];
            val[i][char]["sum"] = 0;
        }
        series.push({pos: i, value: val["sum"]});
    }
    return series;
}

function drawChar(data, idx) {
    const xDomain = chars.slice();
    xDomain.sort(function (a, b) {
        const na = validateNumber(data[a]);
        const nb = validateNumber(data[b]);
        return  na - nb;
    });
    const yDomain = xDomain.slice();
    yDomain.sort(function (a, b) {
        const na = validateNumber(data[a]);
        const nb = validateNumber(data[b]);
        return  nb - na;
    });
    const hm = new HeatMap("Letters Alignment", "#svg_container" + idx, xDomain, yDomain);
    const nData = toSimpleArray(data, xDomain, "let");
    hm.itemInflater(nData, heatListener);


}

function heatListener() {

}
function validateNumber(value) {
    if (value) {
        return value.sum;
    }
    return 0;
}