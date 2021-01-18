// PROCESS NAME
process.title = 'filebot-node'

// INCLUDES
const http = require('http')
const https = require('https')
const url = require('url')
const querystring = require('querystring')
const child_process = require('child_process')
const fs = require('fs')
const path = require('path')
const shellescape = require('shell-escape')
const xmlParser = require('fast-xml-parser')
const httpBasicAuth = require('basic-auth')

// CONFIGURATION AND GLOBAL VARIABLES
const DATA = process.env['FILEBOT_NODE_DATA']
const AUTH = process.env['FILEBOT_NODE_AUTH']
const CLIENT = process.env['FILEBOT_NODE_CLIENT']
const TASK_CMD = process.env['FILEBOT_TASK_CMD']
const FILEBOT_CMD = process.env['FILEBOT_CMD']
const FILEBOT_CMD_CWD = process.env['FILEBOT_CMD_CWD']
const FILEBOT_CMD_UID = parseInt(process.env['FILEBOT_CMD_UID'], 10)
const FILEBOT_CMD_GID = parseInt(process.env['FILEBOT_CMD_GID'], 10)

const PUBLIC_HTML = CLIENT ? '/' : ''
const ROUTES = new RegExp('^/[a-z]+$')

const MIME_TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.gif': 'image/gif', '.json': 'text/javascript', '.log': 'text/plain; charset=utf-8'}
const SYSTEM_FILES = /^([.@].+|bin|initrd|opt|sbin|var|dev|lib|proc|sys|var.defaults|etc|lost.found|root|tmp|etc.defaults|mnt|run|usr|System.Volume.Information)$/
const DASHLINE = '------------------------------------------'
const NEWLINE = '\n'
const WRAP = '\n\n'
const SIGKILL_EXIT_CODE = 137
const SCHEDULED_TASK_CODE = 1000

// INITIALIZERS
const AUTH_CACHE = {}
const ACTIVE_PROCESSES = {}
const TASKS = []

// update task list via If-Last-Modified
TASKS.lastModified = Date.now()

const DATA_FOLDER = path.resolve(DATA)
const LOG_FOLDER = path.resolve(DATA_FOLDER, 'log')
const TASK_FOLDER = path.resolve(DATA_FOLDER, 'task')
const TASK_INDEX = path.resolve(DATA_FOLDER, 'schedule.ids')
const STATE_JSON = path.resolve(DATA_FOLDER, 'state.json')
const FILEBOT_LOG = path.resolve(DATA_FOLDER, 'filebot.log')

// create folder if necessary
if (!fs.existsSync(DATA_FOLDER)) {
    fs.mkdirSync(DATA_FOLDER)
}
if (!fs.existsSync(TASK_FOLDER)) {
    fs.mkdirSync(TASK_FOLDER)
}
if (!fs.existsSync(LOG_FOLDER)) {
    fs.mkdirSync(LOG_FOLDER)
    fs.chownSync(LOG_FOLDER, FILEBOT_CMD_UID, FILEBOT_CMD_GID)  // FILEBOT USER MUST BE ABLE TO WRITE LOGS
}
if (!fs.existsSync(FILEBOT_LOG)) {
    fs.writeFileSync(FILEBOT_LOG, '# Created on ' + (new Date()) + NEWLINE)
    fs.chownSync(FILEBOT_LOG, FILEBOT_CMD_UID, FILEBOT_CMD_GID) // FILEBOT USER MUST BE ABLE TO WRITE LOGS
}

if (fs.existsSync(TASK_INDEX)) {
    fs.readFileSync(TASK_INDEX, {'encoding': 'UTF-8'}).split(/\n/).forEach(function(id) {
        if (id) {
            var stats = fs.statSync(getLogFile(id))
            var mtime = new Date(stats.mtime).getTime()

            TASKS.push({ id: id, date: mtime, status: SCHEDULED_TASK_CODE })
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
        args.push(options.channel == 'fn' ? 'fn:amc' : 'dev:amc')
        args.push(options.input)
        args.push('--output')
        args.push(options.output)
        args.push('--action')
        args.push(options.action)
        if (options.strict != 'no') {
            args.push('-non-strict')
        }
        if (options.order) {
            args.push('--order')
            args.push(options.order)
        }
        if (options.conflict) {
            args.push('--conflict')
            args.push(options.conflict)
        }
        if (options.query) {
            args.push('--q')
            args.push(options.query)
        }
        if (options.filter) {
            args.push('--filter')
            args.push(options.filter)
        }
        if (options.mapper) {
            args.push('--mapper')
            args.push(options.mapper)
        }
        if (options.lang) {
            args.push('--lang')
            args.push(options.lang)
        }
        args.push('--def')
        if (options.label) args.push('ut_label=' + options.label)
        if (options.music != 'no') args.push('music=y')
        if (options.unsorted != 'no') args.push('unsorted=y')
        if (options.excludeLink == 'on') args.push('excludeLink=y')
        if (options.artwork == 'on') args.push('artwork=y')
        if (options.subtitles) args.push('subtitles=' + options.subtitles)
        if (options.clean == 'on') args.push('clean=y')
        if (options.archives == 'skip') {
            args.push('skipExtract=y')
        } else if (options.archives == 'extract-delete') {
            args.push('deleteAfterExtract=y')
        }
        if (options.ignore) args.push('ignore=' + options.ignore)
        if (options.minLengthMS) args.push('minLengthMS=' + options.minLengthMS)
        if (options.minFileSize) args.push('minFileSize=' + options.minFileSize)
        if (options.exec) args.push('exec=' + options.exec)
        if (options.plex) args.push('plex=' + options.plex)
        if (options.kodi) args.push('kodi=' + options.kodi)
        if (options.emby) args.push('emby=' + options.emby)
        if (options.pushover) args.push('pushover=' + options.pushover)
        if (options.pushbullet) args.push('pushbullet=' + options.pushbullet)
        if (options.report) args.push('storeReport=' + options.report)
        if (options.seriesFormat) args.push('seriesFormat=' + options.seriesFormat)
        if (options.animeFormat) args.push('animeFormat=' + options.animeFormat)
        if (options.movieFormat) args.push('movieFormat=' + options.movieFormat)
        if (options.musicFormat) args.push('musicFormat=' + options.musicFormat)
        if (options.unsortedFormat) args.push('unsortedFormat=' + options.unsortedFormat)
        if (options.excludeList) args.push('excludeList=' + options.excludeList)
        args.push('--apply')
        args.push('refresh')
        if (options.probe == 'no') args.push('-no-probe')
        if (options.index == 'no') args.push('-no-index')
        args.push('--log')
        args.push(options.log)
    } else if (options.fn == 'license' && options.license) {
        args.push('--license')
        args.push(options.license)
    } else if (options.fn == 'revert') {
        args.push('-revert')
    } else if (options.fn == 'sysinfo') {
        args.push('-script')
        args.push('fn:sysinfo')
    } else if (options.fn == 'clear') {
        args.push('-clear-cache')
        args.push('-clear-prefs')
        args.push('-clear-history')
    } else if (options.fn == 'configure' && options.osdbUser && options.osdbPwd) {
        args.push('-script')
        args.push('fn:configure')
        args.push('--def')
        args.push('osdbUser=' + options.osdbUser)
        args.push('osdbPwd=' + options.osdbPwd)
    } else {
        throw new Error('Illegal options: ' + JSON.stringify(options))
    }

    // require --log-file because otherwise it will default to lock.log anyway
    args.push('--log-file')
    args.push(FILEBOT_LOG)

    return args
}

function getExitStatus(code) {
    var status = NEWLINE + DASHLINE + WRAP
    if (code == null) {
        status += '[Process killed]'
    } else if (code == 0 || code == 100) {
        status += '[Process completed]'
    } else if (code == -2 || code == 'ENOENT') {
        status += '[Process error]'
        status += WRAP + getCommand() + ': command not found'
        status += WRAP + '⚠️ FileBot is not installed. FileBot Node requires FileBot. Please install FileBot first and then try again.'
    } else {
        status += '[Process error]'
        status += WRAP + '🔺 Exit Code: ' + code
        // Bad License
        if (code == 2) status += WRAP + '💡 You may evaluate FileBot Node by using [Dry Run] instead of [Execute]'
    }
    return status + WRAP
}

function spawnChildProcess(command, arguments) {
    var id = new Date().toISOString().replace(/\W/g, '-')
    var logFile = getLogFile(id)

    var pd = { id: id, date: Date.now(), status: null }

    // each log contains the original command (as JSON) in the first line
    fs.writeFileSync(logFile, shellescape([command].concat(arguments)) + WRAP + DASHLINE + WRAP)
    fs.chownSync(logFile, FILEBOT_CMD_UID, FILEBOT_CMD_GID)

    var child = child_process.spawn(command, arguments, {
            stdio: ['ignore', fs.openSync(logFile, 'a'), fs.openSync(logFile, 'a')],
            env: process.env,
            cwd: FILEBOT_CMD_CWD,
            uid: FILEBOT_CMD_UID,
            gid: FILEBOT_CMD_GID,
            // new process group leader so we can kill the entire group with kill -pid
            detached: true
        }
    )

    child.on('error', function (error) {
        console.log(command, error)
    });
    child.on('close', function (code) {
        // remove process object reference
        delete ACTIVE_PROCESSES[id]
        // store exit code
        pd.status = code != null ? code : SIGKILL_EXIT_CODE
        TASKS.lastModified = Date.now()

        // add status message
        fs.appendFile(logFile, getExitStatus(code), function (error) {
            if (error) console.log(error)
        });
    })

    ACTIVE_PROCESSES[id] = child
    TASKS.push(pd)
    TASKS.lastModified = Date.now()

    return pd
}

function version() {
    var child = child_process.spawnSync(getCommand(), ['-version'], {
            stdio: ['ignore', 'pipe', 'pipe'],
            encoding: 'UTF-8',
            env: process.env,
            cwd: FILEBOT_CMD_CWD,
            uid: FILEBOT_CMD_UID,
            gid: FILEBOT_CMD_GID
        }
    )
    if (child.error && child.error.code) {
        return getExitStatus(child.error.code)
    }
    return [child.stdout, child.stderr].join(WRAP).trim()
}

function state(options) {
    // PUT STATE
    if (options.store) {
        fs.writeFileSync(STATE_JSON, options.store)
    }

    // GET STATE
    else if (fs.existsSync(STATE_JSON)) {
        return fs.readFileSync(STATE_JSON, {'encoding': 'UTF-8'})
    }

    return null
}

function task(request, response, options) {
    var id = options.id

    response.setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Cache-Control', 'private, max-age=0, no-cache, must-revalidate')
    response.setHeader('Connection', 'Keep-Alive')

    // disable response caching to display response stream in real time
    response.setHeader('Content-Type', 'text/plain; charset=UTF-8')
    response.setHeader('X-Content-Type-Options', 'nosniff')

    // enable HTTP 1.1 Trailer (use curl --raw /task to see Exit-Code trailer value)
    response.setHeader('Transfer-Encoding', 'chunked')
    response.setHeader('Trailer', 'Exit-Code')

    // flush headers
    response.write(TASK_CMD + " " + id + WRAP + DASHLINE + WRAP)

    var child = child_process.spawn(TASK_CMD, [id], {
            stdio: ['ignore', 'pipe', 'pipe'],
            encoding: 'UTF-8',
            env: process.env,
            cwd: FILEBOT_CMD_CWD,
            uid: FILEBOT_CMD_UID,
            gid: FILEBOT_CMD_GID
        }
    )

    child.stdout.pipe(response, {end: false})
    child.stderr.pipe(response, {end: false})

    child.on('close', function (code) {
        response.write(getExitStatus(code))
        response.addTrailers({ "Exit-Code": code })
        response.end()
    })
}


// ROUTES


function execute(options) {
    var pd = spawnChildProcess(getCommand(), getCommandArguments(options))
    return pd
}

function kill(options) {
    var id = options.id
    var child = ACTIVE_PROCESSES[id]

    if (child) {
        // remove process object reference
        delete ACTIVE_PROCESSES[id]

        // if pid is less than -1, then sig is sent to every process in the process group whose ID is -pid
        process.kill(-child.pid)

        return {id: id, status: SIGKILL_EXIT_CODE}
    } else {
        throw new Error('No such process')
    }
}

function listFolders(options) {
    var folder = options.q
    var file = null

    folder = folder && folder[0] == '/' ? folder : '/'
    while(!fs.existsSync(folder)) {
        file = path.basename(folder)
        folder = path.dirname(folder)
    }

    var folders = []
    if (folder && fs.lstatSync(folder).isDirectory()) {
        fs.readdirSync(folder).forEach(function(s) {
                if (!SYSTEM_FILES.test(s) && (file == null || s.indexOf(file) == 0)) {
                    var f = path.resolve(folder, s)
                    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) {
                        folders.push({path: f})
                    }
                }
            }
        )
    }
    return folders
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

    if (PUBLIC_HTML && !ROUTES.test(requestPath) && requestPath.indexOf(PUBLIC_HTML) == 0) {
        var requestedFile = requestPath == PUBLIC_HTML ? 'index.html' : requestPath.substring(PUBLIC_HTML.length)
        var ext = path.extname(requestedFile)
        var contentType = MIME_TYPES[ext]

        if (contentType) {
            return file(request, response, path.resolve(CLIENT, requestedFile), contentType, true, false) // resolve against CLIENT folder
        } else {
            return unauthorized(response)
        }
    }

    // DSM 7 uses httponly cookies
    const cookie = request.headers['cookie']

    // require user authentication for all handlers below
    const user = auth(request, response, cookie)

    if ('/auth' == requestPath) {
        if (user === undefined) {
            return unauthorized(response, true)
        } else {
            return ok(response, {'auth': AUTH, 'user': user})
        }
    }

    // AUTHENTICATION REQUIRED BEYOND THIS POINT
    if (!user) {
        return unauthorized(response)
    }

    if ('/state' == requestPath) {
        var data = state(options)
        return ok(response, data)
    }

    if ('/version' == requestPath) {
        var data = version()
        return ok(response, data)
    }

    if ('/tasks' == requestPath) {
        if (modifiedSince(request, TASKS.lastModified)) {
            return ok(response, TASKS, TASKS.lastModified)
        } else {
            return notModified(response)
        }
    }

    if ('/folders' == requestPath) {
        var data = listFolders(options)
        return ok(response, data)
    }

    if ('/log' == requestPath) {
        var id = options.id
        if (id) {
            return file(request, response, getLogFile(id), MIME_TYPES['.log'], false, false)
        } else {
            return file(request, response, FILEBOT_LOG, MIME_TYPES['.log'], true, true)
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

    if ('/task' == requestPath) {
        return task(request, response, options)
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

function unauthorized(response, authenticate) {
    response.statusCode = 401
    if (authenticate) {
        response.setHeader('WWW-Authenticate', 'Basic realm="filebot-node"')
    }
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

function auth(request, response, cookie) {
    switch (AUTH) {
        case 'SYNO':
            return auth_syno(request, response, cookie)
        case 'QNAP':
            return auth_qnap(request, response, cookie)
        case 'BASIC':
            return auth_basic_env(request, response, cookie)
        case 'NONE':
            return 'NONE'
        default:
            return null
    }
}

function auth_basic_env(request, response, cookie) {
    var user = httpBasicAuth(request)

    if (user == undefined)
        return undefined // REQUEST AUTH

    if (user && user.name == process.env['FILEBOT_NODE_AUTH_USER'] && user.pass == process.env['FILEBOT_NODE_AUTH_PASS'])
        return user.name // AUTH OK

    return null // REQUEST FAIL
}

function auth_syno(request, response, cookie) {
    if (!cookie) {
        return null
    }

    const user = AUTH_CACHE[cookie]
    if (user) {
        return user
    }

    // DSM 7 does not allow nginx reverse_proxy configuration, so we don't need to worry about X-Real-IP headers
    const remoteAddress = request.connection.remoteAddress

    // authenticate.cgi requires these and some other environment variables for authentication
    const cmd = '/usr/syno/synoman/webman/modules/authenticate.cgi'
    const env = {
        'HTTP_COOKIE': cookie,
        'REMOTE_ADDR': remoteAddress
    }

    console.log(cmd)
    console.log(env)

    const pd = child_process.spawnSync(cmd , [], {
            stdio: ['ignore', 'pipe', 'inherit'],
            encoding: 'UTF-8',
            env: env
        }
    )

    if (pd.status == 0) {
        const result = pd.stdout.trim()
        console.log(result)

        AUTH_CACHE[cookie] = result
        console.log('AUTH_CACHE: ' + JSON.stringify(AUTH_CACHE))

        return result
    }

    return null
}

function auth_qnap(request, response, cookie) {
    if (!cookie) {
        return null
    }

    const user = AUTH_CACHE[cookie]
    if (user) {
        return user
    }

    // authLogin.cgi requires QUERY_STRING sid=<auth cookie>
    const sid = cookie.match(/(NAS_SID)=(\w+)/)[2]

    const cmd = '/home/httpd/cgi-bin/authLogin.cgi'
    const env = {
        'QUERY_STRING': "sid=" + sid
    }

    console.log(cmd)
    console.log(env)

    const pd = child_process.spawnSync(cmd, [], {
            stdio: ['ignore', 'pipe', 'inherit'],
            encoding: 'UTF-8',
            env: env
        }
    )

    if (pd.status == 0) {
        const cgiResponse = pd.stdout.trim()
        console.log(cgiResponse)

        const xmlStartIndex = cgiResponse.indexOf('<?xml')
        if (xmlStartIndex > 0) {
            const xmlResponse = cgiResponse.substring(xmlStartIndex)
            const dom = xmlParser.parse(xmlResponse)

            if (dom && dom.QDocRoot && dom.QDocRoot.authPassed == "1") {
                const result = dom.QDocRoot.user

                AUTH_CACHE[cookie] = result
                console.log('AUTH_CACHE: ' + JSON.stringify(AUTH_CACHE))

                return result
            }
        }
    }

    return null
}

function schedule(request, response, options) {
    const cookie = request.headers['cookie']

    const command = prepareScheduledTask(options)
    const id = command.split(/\s/).pop()

    const clientSideRequest = { id: id, command: command, cookie: cookie }
    return ok(response, clientSideRequest)
}

function prepareScheduledTask(options) {
    const id = fs.readdirSync(TASK_FOLDER).length
    const logFile = getLogFile(id)

    const command = TASK_CMD + ' ' + id
    const args = getCommandArguments(options)

    // each log contains the original command (as JSON) in the first line
    fs.writeFileSync(logFile, command + ' # ' + shellescape([getCommand()].concat(args)) + WRAP + DASHLINE + WRAP)
    fs.chownSync(logFile, FILEBOT_CMD_UID, FILEBOT_CMD_GID)
    fs.chmodSync(logFile, 0o666)

    const argsFile = path.resolve(TASK_FOLDER, id + '.args')
    fs.writeFileSync(argsFile, args.join(NEWLINE))

    // update scheduled tasks index
    fs.appendFileSync(TASK_INDEX, id + NEWLINE)
    TASKS.push({ id: id, date: Date.now(), status: SCHEDULED_TASK_CODE })
    TASKS.lastModified = Date.now()

    return command
}


// START SERVER


function server(request, response) {
    // request logging and uncaught exceptions for development
    if (AUTH == 'NONE') {
        console.log(DASHLINE)
        console.log(new Date().toString())
        console.log(request.method + ": " + request.url)
        return handleRequest(request, response)
    }

    // catch and ignore exceptions in production
    try {
        return handleRequest(request, response)
    } catch(e) {
        return error(response, e)
    }
}

// LOGGING
console.log("ENVIRONMENT", process.env)
console.log("USER", { UID: FILEBOT_CMD_UID, GID: FILEBOT_CMD_GID })

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
