let tooltipDiv;
const chars = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m"
    , "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "-"];
const letterMatrix = [];
const letterFreq = [];
const symbols = [];
const sizes = [];
const trie = [];
const MAX_DEEP = 3;

let words = 0;

let MAX_LENGTH = -1;

window.onload = function () {
    init();
};

function init() {
    tooltipDiv = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    addControlsListeners();
}

function loadFromServer() {
    d3.json("./data/words_dictionary.json", onDataLoaded);
    // d3.request("/data/compact_complex.txt")
    //     .mimeType("text/plain")
    //     .response(data => data.response.split("\n"))
    //     .get(data => {
    //         // console.log(data);
    //         for (var i = 0; i < data.length; i++) {
    //             parseData(data[i]);
    //         }
    //         drawChars(letterMatrix);
    //     });

}

function addIncidentChar(pos, src, target) {
    if (!letterMatrix[pos]) {
        letterMatrix[pos] = [];
    }
    if (!letterMatrix[pos][src]) {
        letterMatrix[pos][src] = [];
        letterMatrix[pos][src]["sum"] = 0;
        letterMatrix[pos]["sum"] = [];
    }
    if (!letterMatrix[pos][src][target]) {
        letterMatrix[pos][src][target] = 0;
        letterMatrix[pos]["sum"][target] = 0;
    }
    letterMatrix[pos][src][target] = letterMatrix[pos][src][target] + 1;
    letterMatrix[pos]["sum"][target] = letterMatrix[pos]["sum"][target] + 1;
    letterMatrix[pos][src]["sum"] = letterMatrix[pos][src]["sum"] + 1;
}

function addCharPos(pos, c, size) {
    if (!letterFreq[size]) {
        letterFreq[size] = [];
    }
    if (!letterFreq[size][pos]) {
        letterFreq[size][pos] = [];
    }
    if (!letterFreq[size][pos][c]) {
        letterFreq[size][pos][c] = 0;
    }
    letterFreq[size][pos][c] = letterFreq[size][pos][c] + 1;
}

function addSymbol(pos, c) {
    if (!symbols[pos]) {
        symbols[pos] = [];
        symbols[pos]["count"] = 0;
    }
    if (!symbols[pos][c]) {
        symbols[pos][c] = 1;
        symbols[pos]["count"] = symbols[pos]["count"] + 1;
    }
}

function addTrieNode(idx, c, wordPos, lastChars) {
    if (idx > MAX_DEEP) {
        return;
    }
    let current = c;
    let node = trie;
    for (let i = 0; i < lastChars.length; i++) {
        current = lastChars[i];
        if (!node[current]) {
            node[current] = {pos: wordPos, children: []};
        }
        node = node[current]["children"];
    }
}

function parseData(string) {
    let c;
    let n;
    let i;
    let length = string.length;
    let lastChars = [];
    if (length > MAX_LENGTH) {
        MAX_LENGTH = length;
    }
    if (!sizes[length]) {
        sizes[length] = 0;
    }
    sizes[length] = sizes[length] + 1;

    for (i = 0; i < length - 1; i++) {

        c = string[i];
        n = string[i + 1];
        addIncidentChar(i, c, n);
        addCharPos(i, c, length);
        addSymbol(i, c);
        addTrieNode(i, c, words, lastChars);
        lastChars.push(c);
    }
    if (n) {
        addCharPos(i, n, length);
        addSymbol(i, n);
    } else {
        addCharPos(i, string[0], length)
    }
    words = words + 1;
}

function addWord() {
    const words = d3.select("#new_word_input").node().value.split(/\b(\s)/);
    for (let i = 0; i < words.length; i++) {
        parseData(words[i]);
    }
    drawChars(letterMatrix);
}

function drawLetterFreq(data, min = 1, max = MAX_LENGTH) {
    d3.select(".letter-container").selectAll("svg").remove().exit();
    let c;
    for (let i = 0; i < chars.length; i++) {
        c = chars[i];
        const lcc = new LineCurveChart("", "#svg_container" + c.toUpperCase(), [-1, d3.max([8, max])], c.toUpperCase());
        let charDistribution = getSeriesFor(data, c, min, max);
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
    drawChars(letterMatrix);
}

function addControlsListeners() {
    document.getElementById('max_length').addEventListener("change", () =>
        updateTextInput(document.getElementById('min_length').value
            , document.getElementById('max_length').value));
    document.getElementById('min_length').addEventListener("change", () =>
        updateTextInput(document.getElementById('min_length').value
            , document.getElementById('max_length').value));
}

function updateTextInput(min, max) {
    let minVal = parseFloat(min);
    let maxVal = parseFloat(max);
    if (minVal > maxVal) {
        minVal = maxVal;
        document.getElementById('min_length').value = minVal;
    }
    document.getElementById('min_length').max = MAX_LENGTH;
    document.getElementById('max_length').max = MAX_LENGTH;

    document.getElementById('max_size_label').innerText = `max word size: ${maxVal}`;
    document.getElementById('min_size_label').innerText = `min word size: ${minVal}`;
    drawLetterFreq(letterFreq, minVal, maxVal);
    drawWordStats(minVal, maxVal);
}

function drawSizesDistribution(data, min = 1, max = MAX_LENGTH) {
    const lcc = new LineCurveChart("", "#sizes_svg", [min, max], "Word sizes");
    const sizesDistribution = [];
    let obj;
    for (let i = min; i < MAX_LENGTH; i++) {
        obj = data[i];
        if (!obj) {
            obj = 0;
        }
        sizesDistribution.push({pos: i, value: obj});
    }
    lcc.itemInflater(sizesDistribution, letterFreqListener);
}

function drawSymbolsDistribution(data, min = 1, max = MAX_LENGTH) {
    const lcc = new LineCurveChart("", "#symbols_svg", [min, max], "Symbols used per position");
    const symbolsDistribution = [];
    let obj;
    for (let i = min; i < MAX_LENGTH; i++) {
        obj = data[i];
        if (!obj) {
            obj = {"count": 0};
        }
        symbolsDistribution.push({pos: i, value: obj["count"]});
    }
    lcc.itemInflater(symbolsDistribution, letterFreqListener);
}

function drawWordStats(min = 1, max = MAX_LENGTH) {
    d3.select(".word-properties").selectAll("svg").remove().exit();
    drawSizesDistribution(sizes, min, max);
    drawSymbolsDistribution(symbols, min, max);
    document.getElementById("vocabulary_size").innerHTML = "vocabulary size: " + words;
}

function drawChars(data) {
    d3.select(".incidence-container").selectAll("svg").remove().exit();
    for (let i = 0; i < data.length && i < 12; i++) {
        drawChar(data[i], i + 1);
    }
    drawLetterFreq(letterFreq);
    drawWordStats();
}

function getSeriesFor(data, char, minLen, maxLen) {
    let series = [];
    let val;
    for (let i = 0; i < maxLen; i++) {
        val = 0;
        for (let s = minLen + i; s <= maxLen; s++) {
            if (data[s]) {
                if (data[s][i][char]) {
                    val += data[s][i][char];
                }
            }
        }
        series.push({pos: i, value: val});
    }

    return series;
}

function drawChar(data, idx) {
    const xDomain = chars.slice();
    xDomain.sort((a, b) => {
        const na = validateNumber(data[a]);
        const nb = validateNumber(data[b]);
        return na - nb;
    });
    const yDomain = xDomain.slice();
    yDomain.sort((a, b) => {
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