function SVGHolder(width = 800, height = 600, containerID = "#svg_container") {
    this.margin = {top: 20, right: 20, bottom: 20, left: 20};
    this.padding = {top: 0, right: 150, bottom: 80, left: 60};
    this.width = width;
    this.height = height;
    this.graphWidth = this.width - this.margin.left - this.margin.right - this.padding.left - this.padding.right;
    this.graphHeight = this.height - this.margin.top - this.margin.bottom - this.padding.top - this.padding.bottom;

    this.svg = null;
    this.mainGroup = null;

    this.build = function () {
        this.svg = d3.select(containerID)
                .append("svg")
                .attr("width", this.width)
                .attr("height", this.height);
        this.mainGroup = this.svg.append("g")
                .attr("transform", "translate("
                        + this.getLeft()
                        + ","
                        + this.getTop()
                        + ")");
    };

    this.showDebug = function () {
        this.svg.attr("class", "debug");
        this.svg.append("rect")
                .attr("x", this.margin.left)
                .attr("y", this.margin.top)
                .attr("width", this.width - this.margin.left - this.margin.right)
                .attr("height", this.height - this.margin.top - this.margin.bottom)
                .attr("fill", "#FF000000")
                .attr("fill-opacity", "0.3")
                ;
        this.mainGroup.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", graphWidth)
                .attr("height", graphHeight)
                .attr("fill", "red")
                .attr("fill-opacity", "0.3")
                ;
    };

    this.addBottomAxis = function (xAxis, title) {
        this.svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate("
                        + this.getLeft()
                        + ","
                        + (this.graphHeight + this.getTop())
                        + ")")
                .call(d3.axisBottom(xAxis));
        this.svg.append("text")
                .attr("text-anchor", "middle")
                .attr("class", "axis-title")
                .attr("transform", "translate("
                        + (this.graphWidth / 2 + this.getLeft())
                        + ","
                        + (this.height - this.margin.bottom - this.padding.bottom / 2)
                        + ")")
                .text(title);
    };

    this.addLeftAxis = function (yAxis, title) {
        this.svg.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate("
                        + this.getLeft()
                        + ","
                        + this.getTop()
                        + ")")
                .attr("text", "mpg")
                .call(d3.axisLeft(yAxis));

        this.svg.append("text")
                .attr("text-anchor", "middle")
                .attr("class", "axis-title")
                .attr("transform", "translate("
                        + (this.margin.left + this.padding.left / 2)
                        + ","
                        + (this.graphHeight / 2 + this.getTop())
                        + ")rotate(-90)")
                .text(title);
    };

    this.getLeft = function () {
        return margin.left + padding.left;
    };
    this.getTop = function () {
        return padding.top + margin.top;
    };

    this.enableZoom = function (callback) {
        this.svg.call(d3.zoom()
                .scaleExtent([1 / 2, 8])
                .on("zoom", callback));
    };

    this.build();
}