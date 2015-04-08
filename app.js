process.title = 'filebot-nos'

var http = require('http')
var url = require('url')
var querystring = require('querystring')
var child_process = require('child_process')
fs = require('fs')

var PORT = 5452

var runningProcesses = []

function getLogFile(n) {
    return './log/' + n + '.log'
}

function getCommand() {
    return 'filebot'
}

function getCommandArguments(options) {
    var args = ['-script', 'dev:sysenv'] // TEST

    var keys = Object.keys(options)
    for (var i = 0, length = keys.length; i < length; i++) {
        var k = keys[i]
        args.push(k)
        args.push(options[k])
    }


    return args
}

function spawnChildProcess(command, arguments) {
    var id = Date.now()
    var pd = {pid: null, t: id, log: getLogFile(id), exitCode: null, duration: null, command: command, arguments: arguments}

    var process = child_process.spawn(
        command,
        arguments,
        {stdio: ['ignore', fs.openSync(pd.log, 'a'), fs.openSync(pd.log, 'a')]}
    )
    pd.pid = process.pid

    console.log('Task started: ' + JSON.stringify(pd))
    process.on('close', function (code) {
        pd.pid = null
        pd.exitCode = code
        pd.duration = Date.now() - pd.t
        console.log('Task complete: ' + JSON.stringify(pd))
    })

    return pd
}

http.createServer(function (req, res) {
    var requestParameters = url.parse(req.url)

    if ('/filebot/execute' == requestParameters.pathname) {
        var options = querystring.parse(requestParameters.query)
        var pd = spawnChildProcess(getCommand(), getCommandArguments(options))

        var result = {status: 'OK', process: pd}

        res.writeHead(200, {'Content-Type': 'text/json'});
        res.end(JSON.stringify(result))
        return
    }

    res.writeHead(404, {'content-type': 'text/plain'})
    res.end('Illegal Request.')
}).listen(PORT, '127.0.0.1');

console.log('Server running at http://127.0.0.1:' + PORT + '/');
