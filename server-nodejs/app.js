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
var FILEBOT_CMD = process.env['FILEBOT_CMD']
var FILEBOT_CMD_CWD = process.env['FILEBOT_CMD_CWD']
var FILEBOT_CMD_UID = parseInt(process.env['FILEBOT_CMD_UID'], 10)
var FILEBOT_CMD_GID = parseInt(process.env['FILEBOT_CMD_GID'], 10)

var PUBLIC_HTML = '/filebot/'
var MIME_TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.gif': 'image/gif', '.json': 'text/javascript', '.log': 'text/plain; charset=utf-8'}
var DASHLINE = '------------------------------------------'
var SIGKILL_EXIT_CODE = 137
var SCHEDULED_TASK_CODE = 1000

// INITIALIZERS
var AUTH_CACHE = {}
var ACTIVE_PROCESSES = {}
var TASKS = []

// update task list via If-Last-Modified
TASKS.lastModified = Date.now()

var TASK_INDEX = path.resolve('schedule.ids')
var LOG_FOLDER = path.resolve('log')
var FILEBOT_LOG = path.resolve('filebot.log')

// create folder if necessary
if (!fs.existsSync(LOG_FOLDER)) {
    fs.mkdirSync(LOG_FOLDER)
    fs.chownSync(LOG_FOLDER, FILEBOT_CMD_UID, FILEBOT_CMD_GID)
}
if (!fs.existsSync(FILEBOT_LOG)) {
    fs.writeFileSync(FILEBOT_LOG, '# created on ' + (new Date()) + '\n')
    fs.chownSync(FILEBOT_LOG, FILEBOT_CMD_UID, FILEBOT_CMD_GID)
}

if (fs.existsSync(TASK_INDEX)) {
    fs.readFileSync(TASK_INDEX, {'encoding': 'UTF-8'}).split(/\n/).forEach(function(id) {
        if (id) {
            TASKS.push({id: id, status: SCHEDULED_TASK_CODE})
        }
    })
}

// HELPER FUNCTIONS


function getLogFile(id) {
    return path.join(LOG_FOLDER, id + '.log')
}

function getCommand() {
    return FILEBOT_CMD
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
        if (options.strict != 'on') {
            args.push('-non-strict')
        }
        if (options.filter) {
            args.push('--filter')
            args.push(options.filter)
        }
        args.push('--def')
        if (options.label) args.push('ut_label=' + options.label)
        args.push('music=y')
        args.push('unsorted=y')
        if (options.artwork == 'on') args.push('artwork=y')
        if (options.subtitles) args.push('subtitles=' + options.subtitles)
        if (options.clean == 'on') args.push('clean=y')
        if (options.skipExtract == 'on') args.push('skipExtract=y')
        args.push('deleteAfterExtract=y')
        if (options.ignore) args.push('ignore=' + options.ignore)
        if (options.minLengthMS) args.push('minLengthMS=' + options.minLengthMS)
        if (options.minFileSize) args.push('minFileSize=' + options.minFileSize)
        if (options.exec) args.push('exec=' + options.exec)
        if (options.plex) args.push('plex=' + options.plex)
        if (options.xbmc) args.push('xbmc=' + options.xbmc)
        if (options.pushover) args.push('pushover=' + options.pushover)
        if (options.pushbullet) args.push('pushbullet=' + options.pushbullet)
        if (options.seriesFormat) args.push('seriesFormat=' + options.seriesFormat)
        if (options.animeFormat) args.push('animeFormat=' + options.animeFormat)
        if (options.movieFormat) args.push('movieFormat=' + options.movieFormat)
        if (options.musicFormat) args.push('musicFormat=' + options.musicFormat)
        if (options.excludeList) args.push('excludeList=' + options.excludeList)
        args.push('--log')
        args.push(options.log)
        if (options.action != 'test') {
            args.push('--log-file')
            args.push(FILEBOT_LOG)
        }
    } else if (options.fn == 'sysinfo') {
        args.push('-script')
        args.push('fn:sysinfo')
    } else if (options.fn == 'configure' && options.osdbUser && options.osdbPwd) {
        args.push('-script')
        args.push('fn:configure')
        args.push('--def')
        args.push('osdbUser=' + options.osdbUser)
        args.push('osdbPwd=' + options.osdbPwd)
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
    fs.chownSync(logFile, FILEBOT_CMD_UID, FILEBOT_CMD_GID)

    var child = child_process.spawn(command, arguments, {
            stdio: ['ignore', fs.openSync(logFile, 'a'), fs.openSync(logFile, 'a')],
            env: process.env,
            cwd: FILEBOT_CMD_CWD,
            uid: FILEBOT_CMD_UID,
            gid: FILEBOT_CMD_GID
        }
    )
    
    child.on('close', function (code) {
        // remove process object reference
        delete ACTIVE_PROCESSES[id]
        // store exit code
        pd.status = code != null ? code : SIGKILL_EXIT_CODE
        TASKS.lastModified = Date.now()
        fs.appendFile(logFile, DASHLINE +'\n\n' + (code == null ? '[Process killed]' : code == 0 ? '[Process completed]' : '[Process error]'))
    })

    ACTIVE_PROCESSES[id] = child
    TASKS.push(pd)
    TASKS.lastModified = Date.now()

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
    var options = querystring.parse(requestParameters.query)


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
    var user = auth(request, response, options)
    // console.log('AUTH: user='+user)

    if ('/auth' == requestPath) {
        return ok(response, {'user': user})
    }

    // AUTHENTICATION REQUIRED BEYOND THIS POINT
    if (!user) {
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
        var id = options.id
        if (id > 0) {
            return file(request, response, getLogFile(id), MIME_TYPES['.log'], false, false)
        }
    }

    if ('/execute' == requestPath) {
        var data = execute(options)
        return ok(response, data)
    }

    if ('/schedule' == requestPath) {
        return schedule(request, response, options)
    }

    if ('/kill' == requestPath) {
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



function auth(request, response, options) {
    switch (AUTH) {
        case 'SYNO':
            return auth_syno(request, response, options)
        case 'NONE':
            return 'NONE'
        default:
            return null
    }
}

function auth_syno(request, response, options) {
    var user_id = options.Cookie

    var user = AUTH_CACHE[user_id]
    if (user) {
        return user
    }

    // authenticate.cgi requires these and some other environment variables for authentication
    var pd = child_process.spawn('/usr/syno/synoman/webman/modules/authenticate.cgi', [], {
        env: {
                'HTTP_COOKIE': options.Cookie, 
                'HTTP_X_SYNO_TOKEN': options.SynoToken, 
                'REMOTE_ADDR': request.connection.remoteAddress
        }
    })
    pd.stdout.on('data', function(data) {
        AUTH_CACHE[user_id] = data.toString('utf8').trim()
    })
    pd.on('close', function(code) {
        if (code == 0) console.log('AUTH_CACHE: ' + JSON.stringify(AUTH_CACHE))
    })
    return null
}

function schedule(request, response, options) {
    switch (AUTH) {
        case 'SYNO':
            return schedule_syno(request, response, options)
        default:
            return error(response, 'NOT IMPLEMENTED')
    }
}

function schedule_syno(request, response, options) {
    var id = Date.now()
    var logFile = getLogFile(id)
    var command = shellescape([getCommand()].concat(getCommandArguments(options)))

    // each log contains the original command (as JSON) in the first line
    fs.writeFileSync(logFile, command + '\n\n' + DASHLINE + '\n\n')
    fs.chownSync(logFile, FILEBOT_CMD_UID, FILEBOT_CMD_GID)

    // update scheduled tasks index
    fs.appendFileSync(TASK_INDEX, id + '\n')
    TASKS.push({id: id, status: SCHEDULED_TASK_CODE})
    TASKS.lastModified = Date.now()

    // IO redirection to log folder
    var script = command + ' >> ' + shellescape([logFile]) + ' 2>&1'

    // Syno Web API rejects requests from localhost, so we have to send the request from the client
    var clientSideRequest = {
        method: 'POST',
        url: process.env['REQUEST_URI'],
        params: {
            name: JSON.stringify('FileBot Task'),
            owner: JSON.stringify('admin'),
            enable: true,
            schedule: JSON.stringify({"date_type":0,"week_day":"0,1,2,3,4,5,6","hour":0,"minute":0,"repeat_hour":0,"repeat_min":0,"last_work_hour":0,"repeat_min_store_config":[1,5,10,15,20,30],"repeat_hour_store_config":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]}),
            extra: JSON.stringify({"script":script}),
            type: JSON.stringify('script'),
            api: 'SYNO.Core.TaskScheduler',
            method: 'create',
            version: 2
        },
        headers: {
            'X-SYNO-TOKEN': options.SynoToken,
            'Cookie': options.Cookie
        }
    }
    return ok(response, clientSideRequest)
}


// START SERVER


function server(request, response) { 
    // console.log(DASHLINE)
    // console.log(new Date().toString())
    // console.log(request.method + ": " + request.url)

    return handleRequest(request, response)
}


// HTTP
if ('YES' == process.env['FILEBOT_NODE_HTTP']) {
    var host = process.env['FILEBOT_NODE_HOST']
    var port = process.env['FILEBOT_NODE_HTTP_PORT']
    http.createServer(server).listen(port, host)
    console.log(process.title + ' listening at http://' + host + ':' + port + PUBLIC_HTML)  
}

// HTTPS
if ('YES' == process.env['FILEBOT_NODE_HTTPS']) {
    var host = process.env['FILEBOT_NODE_HOST']
    var port = process.env['FILEBOT_NODE_HTTPS_PORT']
    var options = {
        key: fs.readFileSync(process.env['FILEBOT_NODE_HTTPS_KEY']),
        cert: fs.readFileSync(process.env['FILEBOT_NODE_HTTPS_CRT'])
    }
    https.createServer(options, server).listen(port, host)
    console.log(process.title + ' listening at https://' + host + ':' + port + PUBLIC_HTML)  
}
