// CONFIGURATION AND GLOBAL VARIABLES

var PORT = 5452
var HOST = '127.0.0.1'

var ACTIVE_TASKS = []
var LOG_FOLDER = './log'


// INCLUDES


var http = require('http')
var url = require('url')
var querystring = require('querystring')
var child_process = require('child_process')
var fs = require('fs')
var path = require('path')


var RESPONSE_HEADERS_JSON = {'Content-Type': 'text/json', 'Access-Control-Allow-Origin': '*'}
var RESPONSE_HEADERS_TEXT = {'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*'}


// HELPER FUNCTIONS


function getLogFile(id) {
    return path.join(LOG_FOLDER, id + '.log')
}

function getCommand() {
    return 'filebot'
}

function getCommandArguments(options) {
    var args = []
    if (options.fn == 'amc') {
        args.push('-script')
        args.push('fn:amc')
        args.push(options.input)
        args.push('--output')
        args.push(options.output)
        args.push('--action')
        args.push('TEST')
        if (options.strict == 'on') args.push('-non-strict')
    } else {
        throw new Error('Illegal options: ' + JSON.stringify(options))
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


function version(requestParameters) {
    var process = child_process.spawnSync(getCommand(), ['-version'])
    if (process.status == 0) {
        return process.stdout.toString('UTF-8').trim()
    } else {
        throw new Error('Failed to call ' + getCommand())
    }
}

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

function handleRequest(request, response) {
    var requestParameters = url.parse(request.url)
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

    if ('/version' == requestPath) {
        return version(requestParameters)
    }

    var logPathPattern = /^\/logs\/(\d+)$/
    if (logPathPattern.test(requestPath)) {
        var id = requestPath.match(logPathPattern)[1]
        var readStream = fs.createReadStream(getLogFile(id))
        readStream.on('open', function () {
            response.writeHead(200, RESPONSE_HEADERS_TEXT)
            readStream.pipe(response)
        })
        readStream.on('error', function (error) {
            response.writeHead(404, RESPONSE_HEADERS_JSON)
            response.end(JSON.stringify(error))
        })
        return true
    }

    return false
}


// START NODE SERVER


process.title = 'filebot-nos'


http.createServer(function (request, response) {
    console.log('-----------------------------')
    console.log(request.method)
    console.log(request.url)

    var result = null
    var status = 200

    try {
        // try to process request
        result = handleRequest(request, response)

        // check if response has already been taken care of
        if (result === true) {
            return;
        }

        // or report failure otherwise
        if (result === false) {
            result = {success: false, error: 'ILLEGAL REQUEST'}
            status = 400
        }
    } catch (error) {
        result = {success: false, error: error.toString()}
        status = 500
    }

    response.writeHead(status, RESPONSE_HEADERS_JSON)
    response.end(JSON.stringify({success: true, data: result}))
}).listen(PORT, HOST);


console.log('FileBot Node Server running at http://' + HOST + ':' + PORT + '/');
