function HeatMap(title,
        containerID,
        xDomain,
        yDomain,
        xTitle = "Letters",
        yTitle = "Letters",
        svgHolder) {
    if (typeof (svgHolder) == "undefined") {
        this.svgHolder = new SVGHolder(700, 500, containerID
                , {top: 20, right: 20, bottom: 20, left: 20}
        , {top: 20, right: 0, bottom: 60, left: 70});
    } else {
        this.svgHolder = svgHolder;
    }
    this.svgHolder.addChartTitle(title);
    this.xAxis = d3.scaleBand()
            .rangeRound([0, this.svgHolder.graphWidth])
            .paddingInner(0.05)
            .align(0.1);
    this.yAxis = d3.scaleBand()
            .rangeRound([0, this.svgHolder.graphHeight])
            .paddingInner(0.05)
            .align(0.1);
    this.xAxis.domain(xDomain);
    this.yAxis.domain(yDomain);

    this.colorAxis = d3.scaleSequential(d3.interpolateYlGnBu);
//    this.colorAxis = d3.scaleLinear();
//    this.colorAxis.interpolate(d3.interpolateHcl);
//    this.colorAxis.range([d3.rgb("#FFCE00"), d3.rgb('#0005B2')]);
    this.opacityAxis = d3.scaleLog().range([0, 1]);

    this.svgHolder.addBottomAxis(this.xAxis, xTitle);
    this.svgHolder.addLeftAxis(this.yAxis, yTitle);
    this.itemInflater = function (data, elementListener) {
        var self = this;
        var dataMax = -1;
        var displayGroup = self.svgHolder.mainGroup
                .selectAll("g")
                .data(data)
                .enter()
                .selectAll("g")
                .data(function (d) {
                    return d;
                })
                .enter()
                .selectAll("g")
                .data(function (d) {
                    var row = toSimpleArray(d.value, self.xAxis.domain(), "let");
                    for (var i = 0; i < row[0].length; i++) {
                        row[0][i].parent = d.key;
                    }
                    return row;
                })
                .enter()
                .selectAll("g")
                .data(function (d) {
                    return d;
                }).enter()
                .append("rect")
                .attr("transform", function (d) {
                    if (d.value > dataMax) {
                        dataMax = d.value;
                    }
                    return "translate(" + self.xAxis(d.parent) + "," + self.yAxis(d.key) + ")";
                })
                .attr("width", self.xAxis.bandwidth())
                .attr("height", self.yAxis.bandwidth())
                .attr("fill", function (d) {
                    self.colorAxis.domain([dataMax, -1]).nice();
                    return self.colorAxis(d.value);
                })
                .attr("fill-opacity", function (d) {
                    self.opacityAxis.domain([1, dataMax]);
                    return self.opacityAxis(d.value);
                })
                ;

        displayGroup
                .on('mouseover', function (d) {
                    tooltipDiv.transition()
                            .duration(200)
                            .style("opacity", .9);
                    tooltipDiv.html(
                            "<span class='axis-title'>Source: </span> " + d.parent
                            +
                            "<br /><span class='axis-title'>Target: </span> " + d.key
                            +
                            "<br /><span class='axis-title'>Count: </span> " + d.value)
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                })
                .on('mouseout', function () {
                    tooltipDiv.transition()
                            .duration(500)
                            .style("opacity", 0);
                })
                ;
        displayGroup.append("svg:title").text(function (d) {
            return "value: " + d.value;
        });
    };
}