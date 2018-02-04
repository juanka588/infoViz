var tooltipDiv;
var parsedData;
var letterMatrix = [];

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
}
function parseData(string) {
    var c;
    var n;
    for (var i = 0; i < string.length - 1; i++) {
        c = string[i];
        n = string[i + 1];
        if (typeof (letterMatrix[c]) == "undefined") {
            letterMatrix[c] = [];
        }
        if (typeof (letterMatrix[c][n]) == "undefined") {
            letterMatrix[c][n] = 0;
        }
        letterMatrix[c][n] = letterMatrix[c][n] + 1;
    }
}
function addWord() {
    var words = d3.select("#new_word_input").node().value.split(" ");
    for (var i = 0; i < words.length; i++) {
        parseData(words[i]);
    }
    drawChars(letterMatrix);
}

function onDataLoaded(error, data) {
    if (error) {
        throw error;
    }
    for (var prop in data) {
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
    var xDomain = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m"
                , "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "-"];
    var yDomain = xDomain.slice();
//    yDomain.sort(function (a, b) {
//        return b - a;
//    });
    var hm = new HeatMap("Letters Alignment", "#svg_container1", xDomain, yDomain);
    var nData = toSimpleArray(data, xDomain, "let");
    hm.itemInflater(nData, heatListener);
}
function heatListener() {

}
