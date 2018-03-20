function LineCurveChart(title,
                        containerID,
                        xDomain,
                        xTitle,
                        yTitle,
                        svgHolder) {
    if (typeof (svgHolder) == "undefined") {
        this.svgHolder = new SVGHolder(300, 250, containerID
            , {top: 10, right: 10, bottom: 10, left: 10}
            , {top: 20, right: 0, bottom: 60, left: 100});
    } else {
        this.svgHolder = svgHolder;
    }
    this.svgHolder.addChartTitle(title);
    this.xAxis = d3.scaleLinear()
        .range([0, this.svgHolder.graphWidth]);
    // this.yAxis = d3.scaleSqrt()
    this.yAxis = d3.scaleLinear()
        .range([this.svgHolder.graphHeight, 0]);
    this.xAxis.domain(xDomain);
    this.svgHolder.addBottomAxis(this.xAxis, xTitle);

    this.itemInflater = function (data, elementListener) {
        const self = this;
        self.yAxis.domain(d3.extent(data, function (d) {
            return d.value;
        }));
        self.svgHolder.addLeftAxis(self.yAxis, yTitle);
        const curve = d3.line()
            .curve(d3.curveCatmullRom)
            .x(d => self.xAxis(d.pos))
            .y(d => {
                if (!d.value) {
                    d.value = 0;
                }
                return self.yAxis(d.value);
            });
        self.svgHolder.mainGroup
            .append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", curve);

        const displayElement = self.svgHolder.mainGroup
            .selectAll("g")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "data-point")
            .attr("transform", d => `translate(${self.xAxis(d.pos)},${self.yAxis(d.value)})`)
            .attr("r", 2)
        ;
        elementListener(displayElement);
    };

}