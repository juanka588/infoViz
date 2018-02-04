function loadScript(src) {
    var newjs = document.createElement("script");
    newjs.src = src;
    newjs.type = 'text/javascript';
    var head = document.getElementsByTagName("head")[0];
    head.appendChild(newjs);
}
function downloadObjectAsJson(exportObj, exportName) {
    var jsonStr = JSON.stringify(exportObj);
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonStr);
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function toArray(obj, properties, field) {
    var arr = [];
    var prop;
    for (var i = 0; i < properties.length; i++) {
        prop = properties[i];
        arr.push(
                {
                    0: 0
                    , 1: obj[prop]
                    , data: {key: prop, value: obj[prop], field: field}
                }
        );
    }
    return [arr];
}

function toSimpleArray(obj, properties, field) {
    var arr = [];
    var prop;
    for (var i = 0; i < properties.length; i++) {
        prop = properties[i];
        arr.push({
            key: prop,
            value: obj[prop] ? obj[prop] : -1,
            field: field
        });
    }
    return [arr];
}