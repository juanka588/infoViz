function SimpleBarChart(title,
        containerID,
        xDomain,
        yDomain,
        xTitle = "Candidates",
        yTitle = "Votes",
        svgHolder) {
    if (typeof (svgHolder) == "undefined") {
        this.svgHolder = new SVGHolder(500, 300, containerID
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
    this.yAxis = d3.scaleLinear().rangeRound([this.svgHolder.graphHeight, 0]);
    this.xAxis.domain(xDomain);
    this.yAxis.domain(yDomain);
    this.svgHolder.addBottomAxis(this.xAxis, xTitle);
    this.svgHolder.addLeftAxis(this.yAxis, yTitle);

    this.itemInflater = function (data, elementListener, candidatesMap) {
        var self = this;
        var displayElement = this.svgHolder.mainGroup
                .selectAll("g")
                .data(data)
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
                    return 0;
                })
                .attr("width", this.xAxis.bandwidth())
                .attr("transform", function (d) {
                    return "translate(" + self.xAxis(d.data["key"]) + "," + self.svgHolder.graphHeight + ")";
                })
                ;
        displayElement
                .transition()
                .duration(1000)
                .attr("transform", function (d) {
                    return "translate(" + self.xAxis(d.data["key"]) + "," + self.yAxis(d[1]) + ")";
                })
                .attr("height", function (d) {
                    return self.yAxis(d[0]) - self.yAxis(d[1]);
                });
        elementListener(displayElement);
    };

    this.composedItemInflater = function (data, elementListener) {
        var self = this;
        var subAxis = d3.scaleBand()
                .paddingInner(0.05);

        subAxis.domain(["D", "N", "A"]).rangeRound([0, self.xAxis.bandwidth()]);
        var displayElement = this.svgHolder.mainGroup
                .selectAll("g")
                .data(data)
                .enter().append("g")
                .attr("class", "series")
                .selectAll("rect")
                .data(function (d) {
                    return d;
                })
                .enter()
                .append("g")
                .attr("transform", function (d) {
                    var temp = self.xAxis(d.data.key);
                    return "translate(" + temp + ",0)";
                })
                .selectAll("rect")
                .data(function (d) {
                    var trans = toArray(d.data.value, ["A", "D", "N"], "EV_" + d.data.key);
                    return trans;
                })
                .enter()
                .selectAll("rect")
                .data(function (d) {
                    return d;
                }).enter()
                .append("rect")
                .attr("fill", function (d) {
                    var temp = d.data["key"];
                    if (temp == "D") {
                        return "red";
                    }
                    if (temp == "A") {
                        return "green";
                    }
                    return "gray";
                })
                .attr("height", function (d) {
                    return self.yAxis(d[0]) - self.yAxis(d[1]);
                })
                .attr("width", subAxis.bandwidth())
                .attr("transform", function (d) {
                    return "translate(" + subAxis(d.data["key"]) + "," + self.yAxis(d[1]) + ")";
                })
                ;
        elementListener(displayElement);
    };
}