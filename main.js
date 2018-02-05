const http = require('http');
const fs = require('fs');
console.log("Starting");
const host = "127.0.0.1";
const port = 8384;
const server = http.createServer(function (request, response) {
    console.log("Recieved request:" + request.url);
    fs.readFile("./" + request.url, function (error, data) {
        if (error) {
            response.writeHead(404, {"Content-type": "text/plain"});
            response.end("Sorry the page was not found");
        } else {
            response.writeHead(202, {"Content-type": "text/html"});
            response.end(data);

        }
    });
});
server.listen(port, host, function () {
    console.log("Listening " + host + ":" + port);
});