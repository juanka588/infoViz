function PieChart(title, containerID, svgHolder) {
    if (typeof (svgHolder) == "undefined") {
        this.svgHolder = new SVGHolder(250, 300, containerID
                , {top: 20, right: 20, bottom: 20, left: 20}
        , {top: 0, right: 0, bottom: 0, left: 0});
    } else {
        this.svgHolder = svgHolder;
    }
    this.svgHolder.addChartTitle(title);
    this.itemInflater = function (data, elementListener) {
        var self = this;
        var data2 = data[0];
        var radius = Math.min(this.svgHolder.graphWidth, this.svgHolder.graphHeight) / 2;
        var pie = d3.pie()
                .sort(null)
                .value(function (d) {
                    return d["value"];
                });
        var path = d3.arc()
                .outerRadius(radius - 10)
                .innerRadius(0);
        var label = d3.arc()
                .outerRadius(radius - 60)
                .innerRadius(radius - 40);

        var displayElement = this.svgHolder.mainGroup.selectAll(".arc")
                .data(pie(data2))
                .enter().append("g")
                .attr("class", "arc");

        displayElement.append("path")
                .attr("transform",
                        "translate(" + this.svgHolder.graphWidth / 2
                        + ","
                        + this.svgHolder.graphHeight / 2 + ")")
                .attr("d", function (d) {
                    return path.startAngle(d.startAngle).endAngle(d.endAngle)();
                })
                .attr("class", function (d) {
                    return "c-" + d.data["key"];
                });
        displayElement.append("text")
                .attr("class", "arc-label")
                .attr("transform", function (d) {
                    var centroid = label.centroid(d);
                    centroid[0] = centroid[0] + self.svgHolder.graphWidth / 2;
                    centroid[1] = centroid[1] + self.svgHolder.graphHeight / 2;
                    return "translate(" + centroid + ")";
                })
                .attr("dy", "0.35em")
                .text(function (d) {
                    return d.data["key"];
                });

        displayElement
                .transition()
                .duration(1000)
                .attrTween("d", function (d) {
                    var interpolate = d3.interpolate(d.startAngle, d.endAngle);
                    return function (t) {
                        d.endAngle = interpolate(t);
                        return path.startAngle(d.startAngle).endAngle(d.endAngle)();
                    };
                })
                ;
        elementListener(displayElement);
    };
}
