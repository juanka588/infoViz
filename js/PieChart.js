function PieChart(title,
        containerID) {
    this.svgHolder = new SVGHolder(500, 300, containerID
            , {top: 20, right: 20, bottom: 20, left: 20}
    , {top: 20, right: 0, bottom: 60, left: 70});
    this.svgHolder.addChartTitle(title);
}