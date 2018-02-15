let tooltipDiv;
let parsedData;
const letterMatrix = [];
const chars = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m"
    , "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "-"];
const letterFreq = [];

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
    let i;
    for (i = 0; i < string.length - 1; i++) {
        c = string[i];
        n = string[i + 1];
        if (typeof (letterMatrix[i]) == "undefined") {
            letterMatrix[i] = [];

            letterFreq[i] = [];
        }
        if (typeof (letterMatrix[i][c]) == "undefined") {
            letterFreq[i][c] = 0;

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

        letterFreq[i][c] = letterFreq[i][c] + 1;
    }
    if (!letterFreq[i]) {
        letterFreq[i] = [];
    }
    if (!letterFreq[i][n]) {
        letterFreq[i][n] = 0;
    }
    letterFreq[i][n] = letterFreq[i][n] + 1;
}

function addWord() {
    const words = d3.select("#new_word_input").node().value.split(/\b(\s)/);
    for (let i = 0; i < words.length; i++) {
        parseData(words[i]);
    }
    drawChars(letterMatrix);
}

function drawLetterFreq(data) {
    var c;
    for (var i = 0; i < chars.length; i++) {
        c = chars[i];
        const lcc = new LineCurveChart("", "#svg_container" + c.toUpperCase(), [-1, 16], c.toUpperCase());
        let charDistribution = getSeriesFor(data, c);
        lcc.itemInflater(charDistribution, letterFreqListener);
    }
}

function onDataLoaded(error, data) {
    if (error) {
        throw error;
    }
    for (let prop in data) {
        parseData(prop);
    }
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
    drawLetterFreq(letterFreq);
}

function getSeriesFor(data, char) {
    let series = [];
    let val;
    for (var i = 0; i < data.length; i++) {
        val = data[i][char];
        if (!val) {
            val = 0;
        }
        series.push({pos: i, value: val});
    }
    return series;
}

function drawChar(data, idx) {
    const xDomain = chars.slice();
    xDomain.sort(function (a, b) {
        const na = validateNumber(data[a]);
        const nb = validateNumber(data[b]);
        return na - nb;
    });
    const yDomain = xDomain.slice();
    yDomain.sort(function (a, b) {
        const na = validateNumber(data[a]);
        const nb = validateNumber(data[b]);
        return nb - na;
    });
    const hm = new HeatMap("Letters Alignment Pos: " + idx, "#svg_container" + idx, xDomain, yDomain);
    const nData = toSimpleArray(data, xDomain, "let");
    hm.itemInflater(nData, heatListener);


}

function heatListener() {

}

function letterFreqListener(element) {
    element.on("click", d => {
        // modal.style.display = "block";
        // displayInfo(d);
    })
        .on('mouseover', d => {
            tooltipDiv.transition()
                .duration(200)
                .style("opacity", .9);
            tooltipDiv.html(`<span class='axis-title'>pos: </span> ${d.pos}<br /><span class='axis-title'>frq: </span>${d.value}`)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");

        })
        .on('mouseout', () => {
            tooltipDiv.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .append("svg:title")
        .text(d => "observation: " + d.value);
}

function validateNumber(value) {
    if (value) {
        return value.sum;
    }
    return 0;
}