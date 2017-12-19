function FilterList(render) {
    this.elements = [];
    this.render = render;
    this.filterOperation = "AND";
    this.addFilter = function (filterObj) {
        if (this.getElementIndex(filterObj) !== -1) {
            return;
        }
        this.elements.push(filterObj);
        this.render(this.elements);
    };
    this.removeAll = function () {
        this.elements = [];
        this.render(this.elements);
    };

    this.removeFilter = function (filterObj) {
        var index = this.getElementIndex(filterObj);
        this.elements.splice(index, 1);
        this.render(this.elements);
    };
    this.getElementIndex = function (obj) {
        var curr;
        for (var i = 0; i < this.elements.length; i++) {
            curr = this.elements[i];
            if (curr.value === obj.value && curr.operation === obj.operation && curr.field === obj.field) {
                return i;
            }
        }
        return -1;
    };
    this.toString = function () {
        return "";
    };

    this.applyFilters = function (data) {
        if (this.elements.length < 1) {
            return data;
        }
        var self = this;
        var transform = data.filter(function (d) {
            var cond = true;
            var filter;
            for (var i = 0; i < self.elements.length; i++) {
                filter = self.elements[i];
                switch (self.filterOperation) {
                    case "AND":
                        cond = cond && self.applyFilter(filter, d);
                        if (!cond) {
                            return cond;
                        }
                        break;
                }
            }
            return cond;
        });
        return transform;
    };

    this.applyFilter = function (filter, d) {
        var actual = d[filter.field];
        var expected = filter.value;
        switch (filter.operation) {
            case "gt":
                return actual > expected;
            case "ge":
                return actual >= expected;
            case "lt":
                return actual < expected;
            case "le":
                return actual <= expected;
            case "neq":
                return actual != expected;
            default:
                return actual == expected;
        }
    };
}