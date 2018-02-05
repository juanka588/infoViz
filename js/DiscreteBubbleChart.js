class DiscreteBubbleChart {
    constructor(title,
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

        this.svgHolder.addBottomAxis(this.xAxis, xTitle);
        this.svgHolder.addLeftAxis(this.yAxis, yTitle);

    }

    itemInflater(data, elementListener, realSize) {
        const self = this;
        const displayGroup = self.svgHolder.mainGroup
            .selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("transform", d => "translate(0," + self.yAxis(d.key) + ")")
            .selectAll("g")
            .data(d => {
                d.values.forEach(element => {
                    element.parent = d.key;
                    element.sum = getSum(element);
                });
                return d.values;
            })
            .enter().append("g");

        displayGroup
            .append("rect")
            .attr("class", "discrete-separator")
            .attr("transform", d => "translate(" + self.xAxis(d.key) + ",0)")
            .attr("width", self.xAxis.bandwidth())
            .attr("height", self.yAxis.bandwidth())
            .on('mouseover', d => {
                tooltipDiv.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltipDiv.html("<span class='axis-title'>Count: </span> " + d.sum)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on('mouseout', () => {
                tooltipDiv.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
        ;
        let counter = 0;
        displayGroup
            .selectAll("circle")
            .data(function (d) {
                const tempData = d.values.slice();
                let sAxis = d3.scaleSqrt().domain([0, d.sum]);
                if (realSize) {
                    sAxis = d3.scaleSqrt().domain([0, 150]);
                }
                sAxis.range([
                    0,
                    d3.min([self.xAxis.bandwidth(), self.yAxis.bandwidth()]) / 2.0 - 13
                ]);
                const center = {
                    x: self.xAxis(d.key) + self.xAxis.bandwidth() / 2
                    , y: self.yAxis(d.parent) + self.yAxis.bandwidth() / 2
                };
                const cs = new CustomSimulator(tempData, self.svgHolder.mainGroup, center, sAxis, "c" + counter, elementListener);
                counter++;
                return d.values;
            })
        ;
    }
}

function refresh(u, cName, sizeAxis) {
    u.enter()
        .append('circle')
        .attr("class", d => "bubble " + cName + " c-" + d["key"])
        .attr('r', d => sizeAxis(d.values.length))
        .merge(u)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

    u.exit().remove();
}

function getSum(array) {
    let sum = 0;
    for (let i = 0; i < array.values.length; i++) {
        const temp = array.values[i];
        sum += temp.values.length;
    }
    return sum;
}


function CustomSimulator(data, parent, center, sizeAxis, cName, elementListener) {
    this.data = data;
    this.parent = parent;
    this.center = center;
    this.sizeAxis = sizeAxis;
    this.cName = cName;
    this.elementListener = elementListener;
    this.build = function () {
        const self = this;
        d3.forceSimulation(self.data)
            .force('charge', d3.forceManyBody().strength(5))
            .force('center', d3.forceCenter(self.center.x, self.center.y))
            .force('collision', d3.forceCollide().radius(function (d) {
                return self.sizeAxis(d.values.length);
            }))
            .on('tick', function () {
                const u = parent
                    .selectAll('.' + self.cName)
                    .data(self.data);
                refresh(u, self.cName, self.sizeAxis);
                self.elementListener(u);
            })
        ;
    };
    this.build();
}