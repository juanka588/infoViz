function DiscreteBubbleChart(title,
        containerID,
        xDomain,
        yDomain,
        xTitle = "Age",
        yTitle = "Scholar level",
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

    this.sizeAxis = d3.scaleSqrt().domain([0, 50]);
    this.sizeAxis.range([0, 15]);

    this.svgHolder.addBottomAxis(this.xAxis, xTitle);
    this.svgHolder.addLeftAxis(this.yAxis, yTitle);
    this.itemInflater = function (data, elementListener, candidatesMap) {
        var self = this;
        var displayGroup = this.svgHolder.mainGroup
                .selectAll("g")
                .data(data)
                .enter().append("g")
                .attr("transform", function (d) {
                    return "translate(0," + self.yAxis(d.key) + ")";
                })
                .selectAll("g")
                .data(function (d) {
                    return d.values;
                })
                .enter().append("g");

        displayGroup
                .append("rect")
                .attr("class", "discrete-separator")
                .attr("transform", function (d) {
                    return "translate(" + self.xAxis(d.key) + ",0)";
                })
                .attr("width", self.xAxis.bandwidth())
                .attr("height", self.yAxis.bandwidth());

        displayGroup
                .selectAll("circle")
                .data(function (d) {
                    var tempData = d.values.slice();
                    var simulation1 = d3.forceSimulation(d.values)
                            .force('charge', d3.forceManyBody().strength(5))
                            .force('center', d3.forceCenter(200 / 2, 200 / 2))
                            .force('collision', d3.forceCollide().radius(function (d) {
                                return d.values.length;
                            }))
                            .on('tick', function () {
                                var u = displayGroup
                                        .selectAll("circle").data(tempData);
                                u.enter()
                                        .append('circle')
                                        .attr("class", "bubble")
                                        .attr("fill", function (d) {
                                            var temp = candidatesMap[d["key"]];
                                            return temp.color;
                                        })
                                        .attr('r', function (d) {
                                            return self.sizeAxis(d.values.length);
                                        })
                                        .merge(u)
                                        .attr('cx', function (d) {
                                            return d.x;
                                        })
                                        .attr('cy', function (d) {
                                            return d.y;
                                        });

                                u.exit().remove();
                            });
                    return d.values;
                })
                ;
//                .enter()
//                .append("circle")
//                .attr("class", "bubble")
//                .attr("transform", function (d) {
//                    return "translate(" + (self.xAxis(d.key) + self.yAxis.bandwidth() / 2) + "," + self.yAxis.bandwidth() / 2 + ")";
//                })
//                .attr("r", function (d) {
//                    return self.sizeAxis(100);
//                });
        // elementListener(displayElement);
    };

}