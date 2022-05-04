function loadScript(src) {
    const newJS = document.createElement("script");
    newJS.src = src;
    newJS.type = 'text/javascript';
    const head = document.getElementsByTagName("head")[0];
    head.appendChild(newJS);
}

function downloadObjectAsJson(exportObj, exportName) {
    const jsonStr = JSON.stringify(exportObj);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonStr);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function toArray(obj, properties, field) {
    const arr = [];
    let prop;
    for (let i = 0; i < properties.length; i++) {
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
    const arr = [];
    let prop;
    for (let i = 0; i < properties.length; i++) {
        prop = properties[i];
        arr.push({
            key: prop,
            value: obj[prop] ? obj[prop] : -1,
            field: field
        });
    }
    return [arr];
}