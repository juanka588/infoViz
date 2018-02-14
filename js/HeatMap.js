function HeatMap(title,
        containerID,
        xDomain,
        yDomain,
        xTitle = "Letters",
        yTitle = "Letters",
        svgHolder) {
    if (typeof (svgHolder) == "undefined") {
        this.svgHolder = new SVGHolder(500, 500, containerID
                , {top: 10, right: 10, bottom: 10, left: 10}
        , {top: 20, right: 0, bottom: 50, left: 50});
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
        const self = this;
        let dataMax = -1;
        const displayGroup = self.svgHolder.mainGroup
            .selectAll("g")
            .data(data)
            .enter()
            .selectAll("g")
            .data(d => d)
            .enter()
            .selectAll("g")
            .data(d => {
                const row = toSimpleArray(d.value, self.xAxis.domain(), "let");
                for (let i = 0; i < row[0].length; i++) {
                    row[0][i].parent = d.key;
                }
                return row;
            })
            .enter()
            .selectAll("g")
            .data(d => d).enter()
            .append("rect")
            .attr("transform", d => {
                if (d.value > dataMax) {
                    dataMax = d.value;
                }
                return "translate(" + self.xAxis(d.parent) + "," + self.yAxis(d.key) + ")";
            })
            .attr("width", self.xAxis.bandwidth())
            .attr("height", self.yAxis.bandwidth())
            .attr("fill", d => {
                self.colorAxis.domain([dataMax, -1]).nice();
                return self.colorAxis(d.value);
            })
            .attr("fill-opacity", d => {
                self.opacityAxis.domain([1, dataMax]);
                return self.opacityAxis(d.value);
            })
        ;

        displayGroup
            .on('mouseover', d => {
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
            .on('mouseout', () => {
                    tooltipDiv.transition()
                            .duration(500)
                            .style("opacity", 0);
                })
                ;
        elementListener(displayGroup);
        displayGroup.append("svg:title").text(d => "value: " + d.value);
    };
}