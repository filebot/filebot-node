process.title = 'filebot-nos'

var http = require('http')
var url = require('url')
var querystring = require('querystring')
var child_process = require('child_process')
fs = require('fs')

var PORT = 5000

var storage = {}

http.createServer(function (req, res) {
    var requestParameters = url.parse(req.url)
    console.log(requestParameters.pathname);
    if ('/filebot/execute' == requestParameters.pathname) {
        var options = querystring.parse(requestParameters.query)
        var id = Date.now().toString()
        var logFileName = './log/'+id+'.log'

        storage[id] = {t: id, log: logFileName, exitCode: null}

        var process = child_process.spawn('filebot',
            ['-version', '--output', options.output],
            {stdio: [ 'ignore', fs.openSync(logFileName, 'a'), fs.openSync(logFileName, 'a') ]}
        )
        process.on('close', function (code) {
            storage[id].exitCode = code
            console.log(storage)
        })

        var result = {status:'OK', t: id, pid: process.pid}

        res.writeHead(200, {'Content-Type': 'text/json'});
        res.end(JSON.stringify(result))
        return
    }

    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(requestParameters.toString());
}).listen(PORT, '127.0.0.1');

console.log('Server running at http://127.0.0.1:' + PORT + '/');
