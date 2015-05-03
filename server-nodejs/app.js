// PROCESS NAME
process.title = 'filebot-node'

// INCLUDES
var http = require('http')
var https = require('https')
var url = require('url')
var querystring = require('querystring')
var child_process = require('child_process')
var fs = require('fs')
var path = require('path')
var shellescape = require('shell-escape')

// CONFIGURATION AND GLOBAL VARIABLES
var AUTH = process.env['FILEBOT_NODE_AUTH']
var CLIENT = process.env['FILEBOT_NODE_CLIENT']
var FILEBOT_EXECUTABLE = process.env['FILEBOT_EXECUTABLE']

var PUBLIC_HTML = '/filebot/'
var MIME_TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.gif': 'image/gif', '.json': 'text/javascript', '.log': 'text/plain; charset=utf-8'}
var DASHLINE = '------------------------------------------'
var SIGKILL_EXIT_CODE = 137

// INITIALIZERS
var ACTIVE_PROCESSES = {}
var TASKS = []

// update task list via If-Last-Modified
TASKS.lastModified = Date.now()

var LOG_FOLDER = path.resolve('log')
var FILEBOT_LOG = path.resolve('filebot.log')

// create folder if necessary
if (!fs.existsSync(LOG_FOLDER)) fs.mkdirSync(LOG_FOLDER)


// HELPER FUNCTIONS


function getLogFile(id) {
    return path.join(LOG_FOLDER, id + '.log')
}

function getCommand() {
    return FILEBOT_EXECUTABLE
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
        args.push('--log-file')
        args.push(FILEBOT_LOG)
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
    fs.writeFileSync(logFile, shellescape([command].concat(arguments)) + '\n\n' + DASHLINE + '\n\n')

    var process = child_process.spawn(
        command,
        arguments,
        {stdio: ['ignore', fs.openSync(logFile, 'a'), fs.openSync(logFile, 'a')]}
    )

    ACTIVE_PROCESSES[id] = process
    TASKS.push(pd)
    TASKS.lastModified = Date.now()

    process.on('close', function (code) {
        // remove process object reference
        delete ACTIVE_PROCESSES[id]
        // store exit code
        pd.status = code != null ? code : SIGKILL_EXIT_CODE
        TASKS.lastModified = Date.now()
        fs.appendFile(logFile, DASHLINE +'\n\n' + (code == null ? '[Process killed]' : code == 0 ? '[Process completed]' : '[Process error]'))
    })

    return pd
}


// ROUTES


function execute(options) {
    var pd = spawnChildProcess(getCommand(), getCommandArguments(options))
    return pd
}

function kill(options) {
    var id = options.id
    var process = ACTIVE_PROCESSES[id]

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

    if (requestPath.indexOf(PUBLIC_HTML) == 0) {
        var requestedFile = requestPath == PUBLIC_HTML ? 'index.html' : requestPath.substring(PUBLIC_HTML.length)
        var ext = path.extname(requestedFile)
        var contentType = MIME_TYPES[ext]

        // relative path must not contain '..'
        if (contentType && requestedFile.indexOf('..') < 0) {
            // resolve against CLIENT folder
            return file(request, response, path.resolve(CLIENT, requestedFile), contentType, true, false) 
        } else {
            return unauthorized(response)
        }
    }


    // require user authentication for all handlers below
    if (!auth(request, response)) {
        return unauthorized(response)
    }
    
    if ('/tasks' == requestPath) {
        if (modifiedSince(request, TASKS.lastModified)) {
            return ok(response, TASKS, TASKS.lastModified)
        } else {
            return notModified(response)
        }
    }

    if ('/log' == requestPath) {
        var options = querystring.parse(requestParameters.query)
        var id = options.id
        if (id > 0) {
            return file(request, response, getLogFile(id), MIME_TYPES['.log'], false, false)
        }
    }

    if ('/execute' == requestPath) {
        var options = querystring.parse(requestParameters.query)
        var data = execute(options)
        return ok(response, data)
    }

    if ('/schedule' == requestPath) {
        return error(response, 'NOT IMPLEMENTED')
    }

    if ('/kill' == requestPath) {
        var options = querystring.parse(requestParameters.query)
        var data = kill(options)
        return ok(response, data)
    }

    if ('/log/all' == requestPath) {
        return file(request, response, FILEBOT_LOG, MIME_TYPES['.log'], true, true)
    }

    return error(response, 'ILLEGAL REQUEST')
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
        response.setHeader('Cache-Control', 'Cache-Control: private, max-age=0, no-cache, must-revalidate')
        response.setHeader('Last-Modified', new Date(lastModified).toUTCString())
    }
    response.end(JSON.stringify(result))
}

function file(request, response, file, contentType, cacheable, attachment) {
    fs.stat(file, function(err, stats) {
        if (err) {
            return notFound(response)
        }
        if (modifiedSince(request, stats.mtime.getTime())) {
            var readStream = fs.createReadStream(file)
            readStream.on('open', function() {
                response.statusCode = 200
                response.setHeader('Content-Type', contentType)
                response.setHeader('Content-Length', stats.size)
                if (attachment) response.setHeader('Content-Disposition', 'attachment; filename="' + path.basename(file) +'"')
                if (!cacheable) response.setHeader('Cache-Control', 'Cache-Control: private, max-age=0, no-cache, must-revalidate')
                response.setHeader('Last-Modified', stats.mtime.toUTCString())
                response.setHeader('Access-Control-Allow-Origin', '*')
                readStream.pipe(response) // response.end() is called automatically
            })
            readStream.on('error', function(err) {
                return error(response, err)
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

function notFound(response) {
    response.statusCode = 404
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.end()
}

function unauthorized(response) {
    response.statusCode = 401
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.end()
}

function error(response, exception) {
    var result = {success: false, error: exception.toString()}
    response.statusCode = 500
    response.setHeader('Content-Type', 'text/json')
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.end(JSON.stringify(result))
}

function auth(request, response) {
    switch (AUTH) {
        case 'SYNO':
            return true
        case 'NONE':
            return true
        default:
            return false
    }
}


// START SERVER


function server(request, response) {
    console.log(DASHLINE)
    console.log(new Date().toString())
    console.log(request.method + ": " + request.url)
    console.log(request.headers)

    try {
        handleRequest(request, response)
    } catch (e) {
        error(response, e)
    }
}

// HTTP
if ('YES' == process.env['FILEBOT_NODE_HTTP']) {
    var host = process.env['FILEBOT_NODE_HOST']
    var port = process.env['FILEBOT_NODE_HTTP_PORT']
    http.createServer(server).listen(port, host)
    console.log(process.title + ' listening at http://' + host + ':' + port + '/')  
}

// HTTPS
if ('YES' == process.env['FILEBOT_NODE_HTTPS']) {
    var host = process.env['FILEBOT_NODE_HOST']
    var port = process.env['FILEBOT_NODE_HTTPS_PORT']
    var options = {
        key: fs.readFileSync(process.env['FILEBOT_NODE_HTTPS_KEY']),
        cert: fs.readFileSync(process.env['FILEBOT_NODE_HTTPS_CERT'])
    }
    https.createServer(options, server).listen(port, host)
    console.log(process.title + ' listening at https://' + host + ':' + port + '/')  
}
