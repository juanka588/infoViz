function loadScript(src) {
    var newjs = document.createElement("script");
    newjs.src = src;
    newjs.type = 'text/javascript';
    var head = document.getElementsByTagName("head")[0];
    head.appendChild(newjs);
}