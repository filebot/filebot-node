// INCLUDES

var http = require('http')
var url = require('url')
var querystring = require('querystring')
var child_process = require('child_process')
fs = require('fs')

// CONFIGURATION AND GLOBAL VARIABLES

var PORT = 5452
var HOST = '127.0.0.1'

var ACTIVE_TASKS = []
var LOG_FOLDER = './log'


// HELPER FUNCTIONS


function getLogFile(id) {
    return LOG_FOLDER + '/' + id + '.log'
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
    var logFile = getLogFile(id)

    var pd = {
        pid: null,
        t: id,
        exitCode: null,
        duration: null,
        command: command,
        arguments: arguments
    }

    var process = child_process.spawn(
        command,
        arguments,
        {stdio: ['ignore', fs.openSync(logFile, 'a'), fs.openSync(logFile, 'a')]}
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


// ROUTES

function execute(requestParameters) {
    var options = querystring.parse(requestParameters.query)
    var pd = spawnChildProcess(getCommand(), getCommandArguments(options))

    ACTIVE_TASKS.push(pd)

    return pd
}

function listTasks(requestParameters) {
    return ACTIVE_TASKS
}

function listLogs(requestParameters) {
    return fs.readdirSync(LOG_FOLDER).map(function (s) {
        return s.substr(0, s.lastIndexOf('.'))
    })
}

function getLogContent(id) {
    return fs.readFileSync(getLogFile(id), 'UTF-8')
}

function handleRequest(requestParameters) {
    var requestPath = requestParameters.pathname

    if ('/execute' == requestPath) {
        return execute(requestParameters)
    }

    if ('/tasks' == requestPath) {
        return listTasks(requestParameters)
    }

    if ('/logs' == requestPath) {
        return listLogs(requestParameters)
    }

    if (/\/logs\/\w+/.test(requestPath)) {
        return getLogContent(requestPath.match(/\/logs\/(\w+)/)[1])
    }

    return null
}


// START NODE SERVER


process.title = 'filebot-nos'


http.createServer(function (req, res) {
    var requestParameters = url.parse(req.url)
    var result = null
    var status = 200

    try {
        // try to process request
        result = handleRequest(requestParameters)

        // or report failure otherwise
        if (result == null) {
            result = {status: 'ERROR', error: 'ILLEGAL REQUEST'}
            status = 400
        }
    } catch (error) {
        result = {status: 'ERROR', error: error.toString()}
        status = 500
    }

    res.writeHead(status, {'Content-Type': 'text/json'})
    res.end(JSON.stringify(result))
}).listen(PORT, HOST);


console.log('FileBot Node Server running at http://' + HOST + ':' + PORT + '/version');
