process.title = 'filebot-nos'

var http = require('http')
var url = require('url')
var querystring = require('querystring')
var child_process = require('child_process')
fs = require('fs')

var PORT = 5452

var runningProcesses = {}

function getLogFile(n) {
    return './log/' + n + '.log'
}

function spawnChildProcess(options) {
    var t_start = Date.now()
    var logFileName = getLogFile(t_start)

    var process = child_process.spawn('filebot',
        ['-script', 'dev:sysenv', '--output', options.output],
        {stdio: ['ignore', fs.openSync(logFileName, 'a'), fs.openSync(logFileName, 'a')]}
    )

    runningProcesses[t_start] = {pid: process.pid, t: t_start, log: logFileName, exitCode: null, options: options}

    process.on('close', function (code) {
        runningProcesses[t_start].pid = null
        runningProcesses[t_start].exitCode = code
    })

    return t_start
}

http.createServer(function (req, res) {
    var requestParameters = url.parse(req.url)

    if ('/filebot/execute' == requestParameters.pathname) {
        var options = querystring.parse(requestParameters.query)
        spawnChildProcess(options)

        var result = {status: 'OK', runningProcesses: runningProcesses}

        res.writeHead(200, {'Content-Type': 'text/json'});
        res.end(JSON.stringify(result))
        return
    }

    res.writeHead(404, {'content-type': 'text/plain'})
    res.end('Illegal Request.')
}).listen(PORT, '127.0.0.1');

console.log('Server running at http://127.0.0.1:' + PORT + '/');
