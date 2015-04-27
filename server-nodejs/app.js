// CONFIGURATION AND GLOBAL VARIABLES

var PORT = process.env['FILEBOT_NODE_PORT']
var HOST = process.env['FILEBOT_NODE_HOST']
var AUTH = process.env['FILEBOT_NODE_AUTH']

var TASKS = []
var ACTIVE_PROCESSES = {}
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

    process.on('close', function (code) {
        // remove process object reference
        delete ACTIVE_PROCESSES[id]

        // store exit code
        pd.status = code != null ? code : SIGKILL_EXIT_CODE
        console.log('Task complete: ' + JSON.stringify(pd))
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

function listTasks() {
    return TASKS
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
        return listTasks()
    }

    if ('/logs' == requestPath) {
        return listLogs()
    }

    if ('/execute' == requestPath) {
        return execute(querystring.parse(requestParameters.query))
    }

    if ('/kill' == requestPath) {
        return kill(querystring.parse(requestParameters.query))
    }

    if ('/version' == requestPath) {
        return version()
    }

    if ('/log' == requestPath) {
        var id = requestParameters.id
        if (id > 0) {
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
    }

    return false
}


// START NODE SERVER


process.title = 'filebot-nos'


http.createServer(function (request, response) {
    console.log('-----------------------------')
    console.log(request.method)
    console.log(request.url)

    var success = true
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
            success = false
            result = {error: 'ILLEGAL REQUEST'}
            status = 400
        }
    } catch (error) {
        success = false
        result = {error: error.toString()}
        status = 500
    }

    response.writeHead(status, RESPONSE_HEADERS_JSON)
    response.end(JSON.stringify({'success': success, 'data': result}))
}).listen(PORT, HOST);


console.log('FileBot Node Server running at http://' + HOST + ':' + PORT + '/');
