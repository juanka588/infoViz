function loadScript(src) {
    var newjs = document.createElement("script");
    newjs.src = src;
    newjs.type = 'text/javascript';
    var head = document.getElementsByTagName("head")[0];
    head.appendChild(newjs);
}
function downloadObjectAsJson(exportObj, exportName) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}