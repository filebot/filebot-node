// CONFIGURATION AND GLOBAL VARIABLES

var PORT = process.env['FILEBOT_NODE_PORT']
var HOST = process.env['FILEBOT_NODE_HOST']
var AUTH = process.env['FILEBOT_NODE_AUTH']

var LOG_FOLDER = './log'
var ACTIVE_PROCESSES = {}
var TASKS = []

// update task list via If-Last-Modified
TASKS.lastModified = Date.now()


// INCLUDES


var http = require('http')
var url = require('url')
var querystring = require('querystring')
var child_process = require('child_process')
var fs = require('fs')
var path = require('path')

var SIGKILL_EXIT_CODE = 137


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
        args.push(options.action)
        if (options.strict == 'on') {
            args.push('-non-strict')
        }
        if (options.filter) {
            args.push('--filter')
            args.push(options.filter)
        }
        args.push('--def')
        if (options.label) args.push('ut_label=' + options.label)
        args.push('music=y')
        args.push('artwork=y')
        args.push('deleteAfterExtract=y')
        args.push('unsorted=y')
        if (options.clean == 'on') args.push('clean=y')
        if (options.seriesFormat) args.push('seriesFormat=' + options.seriesFormat)
        if (options.animeFormat) args.push('animeFormat=' + options.animeFormat)
        if (options.movieFormat) args.push('movieFormat=' + options.movieFormat)
        if (options.musicFormat) args.push('musicFormat=' + options.musicFormat)
    } else {
        throw new Error('Illegal options: ' + JSON.stringify(options))
    }
    return args
}

function spawnChildProcess(command, arguments) {
    var id = Date.now()
    var logFile = getLogFile(id)

    var pd = {
        id: id,
        status: null
    }

    // each log contains the original command (as JSON) in the first line
    fs.writeFileSync(logFile, JSON.stringify({'command': command, 'args': arguments, 't': pd.id}) + '\n')

    var process = child_process.spawn(
        command,
        arguments,
        {stdio: ['ignore', fs.openSync(logFile, 'a'), fs.openSync(logFile, 'a')]}
    )

    ACTIVE_PROCESSES[id] = process
    TASKS.push(pd)
    TASKS.lastModified = Date.now()

    process.on('close', function (code) {
        console.log('Task complete: ' + JSON.stringify(pd))

        // remove process object reference
        delete ACTIVE_PROCESSES[id]

        // store exit code
        pd.status = code != null ? code : SIGKILL_EXIT_CODE
        TASKS.lastModified = Date.now()
    })

    return pd
}


// ROUTES


function version() {
    var process = child_process.spawnSync(getCommand(), ['-version'])
    if (process.status == 0) {
        return process.stdout.toString('UTF-8').trim()
    } else {
        throw new Error('Failed to call ' + getCommand())
    }
}

function execute(options) {
    var pd = spawnChildProcess(getCommand(), getCommandArguments(options))
    return pd
}

function kill(options) {
    var id = options.id
    var process = ACTIVE_PROCESSES[id]
    console.log(id)
    console.log(process)
    if (process) {
        // remove process object reference
        delete ACTIVE_PROCESSES[id]
        process.kill()
        return {id: id, status: SIGKILL_EXIT_CODE}
    } else {
        throw new Error('No such process')
    }
}

function listLogs() {
    return fs.readdirSync(LOG_FOLDER).map(function (s) {
        return s.substr(0, s.lastIndexOf('.'))
    })
}

function handleRequest(request, response) {
    var requestParameters = url.parse(request.url)
    var requestPath = requestParameters.pathname

    if ('/tasks' == requestPath) {
        if (modifiedSince(request, TASKS.lastModified)) {
            return ok(response, TASKS, TASKS.lastModified)
        } else {
            return notModified(response)
        }
    }

    if ('/logs' == requestPath) {
        var data = listLogs()
        return ok(response, data)
    }

    if ('/execute' == requestPath) {
        var options = querystring.parse(requestParameters.query)
        var data = execute(options)
        return ok(response, data)
    }

    if ('/kill' == requestPath) {
        var options = querystring.parse(requestParameters.query)
        var data = kill(options)
        return ok(response, data)
    }

    if ('/version' == requestPath) {
        var data = version()
        return ok(response, data)
    }

    if ('/log' == requestPath) {
        var options = querystring.parse(requestParameters.query)
        var id = options.id
        if (id > 0) {
            return file(request, response, getLogFile(id), 'text/plain; charset=utf-8')
        }
    }

    throw new Error('ILLEGAL REQUEST')
}

function modifiedSince(request, lastModified) {
    var header = request.headers['if-modified-since']
    if (header) {
        var lastModifiedInSeconds = Math.floor(lastModified / 1000)
        var ifModifiedSinceInSeconds = Date.parse(header) / 1000 // UTC STRING IS ONLY IN SECONDS PRECISION !!!
        return lastModifiedInSeconds > ifModifiedSinceInSeconds
    }
    return true // assume modified by default
}

function ok(response, data, lastModified) {
    var result = {success: true, data: data}

    response.statusCode = 200
    response.setHeader('Content-Type', 'text/json')
    response.setHeader('Access-Control-Allow-Origin', '*')
    if (lastModified > 0) {
        response.setHeader('Cache-Control', 'Cache-Control: private, max-age=0, no-cache')
        response.setHeader('Last-Modified', new Date(lastModified).toUTCString())
    }
    response.end(JSON.stringify(result))
}

function file(request, response, file, contentType) {
    fs.stat(file, function(error, stats) {
        if (error) {
            return error(response, error.toString())
        }

        if (modifiedSince(request, stats.mtime.getTime())) {
            var readStream = fs.createReadStream(file)
            readStream.on('open', function() {
                response.statusCode = 200
                response.setHeader('Content-Type', contentType)
                response.setHeader('Cache-Control', 'Cache-Control: private, max-age=0, no-cache')
                response.setHeader('Last-Modified', stats.mtime.toUTCString())
                response.setHeader('Access-Control-Allow-Origin', '*')
                readStream.pipe(response) // response.end() is called automatically
            })
            readStream.on('error', function(error) {
                return error(response, error.toString())
            })
        } else {
            return notModified(response)
        }
    })
}

function notModified(response) {
    response.statusCode = 304
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.end()
}

function error(response, msg) {
    var result = {success: false, error: msg}

    response.statusCode = 500
    response.setHeader('Content-Type', 'text/json')
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.end(JSON.stringify(result))
}


// START NODE SERVER
process.title = 'filebot-nos'

http.createServer(function (request, response) {
    console.log('-----------------------------')
    console.log(new Date().toString())
    console.log(request.method)
    console.log(request.url)

    try {
        handleRequest(request, response)
    } catch (e) {
        error(response, e.toString())
    }
}).listen(PORT, HOST);


console.log('FileBot Node Server running at http://' + HOST + ':' + PORT + '/');
