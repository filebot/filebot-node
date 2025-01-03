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

const MIME_TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.gif': 'image/gif', '.json': 'application/json', '.log': 'text/plain; charset=utf-8'}
const SYSTEM_FILES = /^([.@#].+|bin|initrd|opt|sbin|var|dev|lib|lib32|lib64|config|proc|sys|var.defaults|etc|lost.found|root|tmp|etc.defaults|mnt|run|usr|home|homes|external|rpc|.+[.]backupbundle|NetBackup|\w+_tmp|tmp_\w+|new_\w+|CACHEDEV\w+_DATA|HD\w+_DATA|System.Volume.Information)$/
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
const ENVIRONMENT_SCRIPT = path.resolve(DATA_FOLDER, 'environment.sh')
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
    fs.writeFileSync(FILEBOT_LOG, '# Created on ' + (new Date().toString()) + NEWLINE)
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


/* ------------------------------------------ FileBot Command ------------------------------------------ */


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
        args.push(options.channel == 'dev' ? 'dev:amc' : 'fn:amc')
        if (options.input) {
            args.push(options.input)
        }
        if (options.output) {
            args.push('--output')
            args.push(options.output)
        }
        if (options.action) {
            args.push('--action')
            args.push(options.action)
        }
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
        if (options.minFileAge) args.push('minFileAge=' + options.minFileAge)
        if (options.exec) args.push('exec=' + options.exec)
        if (options.plex) args.push('plex=' + options.plex)
        if (options.kodi) args.push('kodi=' + options.kodi)
        if (options.emby) args.push('emby=' + options.emby)
        if (options.pushover) args.push('pushover=' + options.pushover)
        if (options.pushbullet) args.push('pushbullet=' + options.pushbullet)
        if (options.discord) args.push('discord=' + options.discord)
        if (options.report) args.push('storeReport=' + options.report)
        if (options.seriesFormat) args.push('seriesFormat=' + options.seriesFormat)
        if (options.animeFormat) args.push('animeFormat=' + options.animeFormat)
        if (options.movieFormat) args.push('movieFormat=' + options.movieFormat)
        if (options.musicFormat) args.push('musicFormat=' + options.musicFormat)
        if (options.movieDB) args.push('movieDB=' + options.movieDB)
        if (options.seriesDB) args.push('seriesDB=' + options.seriesDB)
        if (options.animeDB) args.push('animeDB=' + options.animeDB)
        if (options.unsortedFormat) args.push('unsortedFormat=' + options.unsortedFormat)
        if (options.excludeList) args.push('excludeList=' + options.excludeList)
        // --apply options
        var apply = ['--apply']
        if (options.import == 'on') apply.push('import')
        if (options.metadata == 'on') apply.push('metadata')
        if (options.chmod == 'on') apply.push('chmod')
        if (options.thumbnail == 'on') apply.push('thumbnail')
        if (options.refresh == 'on') apply.push('refresh')
        if (options.apply) apply.push(options.apply)
        if (apply.length > 1) {
            args = args.concat(apply)
        }
        if (options.probe == 'no') args.push('-no-probe')
        if (options.index == 'no') args.push('-no-index')
        if (options.log) {
            args.push('--log')
            args.push(options.log)
        }
        // --def ut_* options for custom commands executed via curl
        var ut_options = ['--def']
        if (options.ut_dir) ut_options.push('ut_dir=' + options.ut_dir)
        if (options.ut_file) ut_options.push('ut_file=' + options.ut_file)
        if (options.ut_label) ut_options.push('ut_label=' + options.ut_label)
        if (options.ut_title) ut_options.push('ut_title=' + options.ut_title)
        if (options.ut_kind) ut_options.push('ut_kind=' + options.ut_kind)
        if (options.ut_state) ut_options.push('ut_state=' + options.ut_state)
        if (ut_options.length > 1) {
            args = args.concat(ut_options)
        }
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
        args.push('-clear-history')
    } else if (options.fn == 'configure') {
        args.push('-script')
        args.push('fn:configure')
        args.push('--def')
        args.push('osdbUser=' + options.osdbUser)
        args.push('osdbPwd=' + options.osdbPwd)
    } else if (options.fn == 'properties') {
        args.push('-script')
        args.push('fn:properties')
        args.push('--def')
        args.push(options.name + '=' + options.value)
    } else if (options.fn == 'mediainfo') {
        args.push('-script')
        args.push(options.channel == 'dev' ? 'dev:mediainfo' : 'fn:mediainfo')
        args.push(options.input)
        args.push('--mode')
        args.push('raw')
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
        // Whoopsies! --action TEST requires a valid license.
        if (code == 2) {
            status += WRAP + '💡 Please use an interactive terminal (i.e. SSH) to evaluate the filebot command-line tool.'
            status += WRAP + '💡 FileBot Node generates and executes filebot commands but cannot itself be used to evaluate the filebot command-line tool.'
        }
        // java: command not found
        if (code == 127) {
            status += WRAP + '💡 FileBot Node requires FileBot and Java. Please ensure that FileBot and Java are installed.'
        }
    }
    return status + WRAP
}

function spawnChildProcess(command, arguments) {
    // just use current time in millis as process id
    const id = 'R' + Date.now()
    const logFile = getLogFile(id)

    const pd = { id: id, date: Date.now(), status: null }

    // each log contains the original command (as JSON) in the first line
    fs.writeFileSync(logFile, shellescape([command].concat(arguments)) + WRAP + DASHLINE + WRAP)
    fs.chownSync(logFile, FILEBOT_CMD_UID, FILEBOT_CMD_GID)

    const out = fs.openSync(logFile, 'a')
    const child = child_process.spawn(command, arguments, {
            stdio: ['ignore', out, out],
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
    })
    child.on('close', function (code) {
        // remove process object reference
        delete ACTIVE_PROCESSES[id]
        // store exit code
        pd.status = code != null ? code : SIGKILL_EXIT_CODE
        TASKS.lastModified = Date.now()

        // add status message
        fs.writeSync(out, getExitStatus(code))
        fs.closeSync(out)
    })

    ACTIVE_PROCESSES[id] = child
    TASKS.push(pd)
    TASKS.lastModified = Date.now()

    return pd
}


/* ------------------------------------------ Routes ------------------------------------------ */


function version() {
    const child = child_process.spawnSync(getCommand(), ['-version'], {
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

function environment(options) {
    // PUT ENV
    if (options.environment != null) {
        fs.writeFileSync(ENVIRONMENT_SCRIPT, options.environment)
        return { environment: null, message: "The environment has been set. Please restart the FileBot Node process to reload the environment." }
    }

    // GET ENV
    var environment = ""
    if (fs.existsSync(ENVIRONMENT_SCRIPT)) {
        environment = fs.readFileSync(ENVIRONMENT_SCRIPT, {'encoding': 'UTF-8'})
    }
    return { environment: environment, message: null }
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

    // try to avoid socket timeout
    response.setTimeout(3 * 24 * 60 * 60 * 1000)

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

    folder = folder && folder[0] == '/' ? folder : FILEBOT_CMD_CWD
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

function status() {
    return {
        pid: process.pid,
        node: process.version,
        uptime: process.uptime().toFixed(0),
        date: new Date().toUTCString()
    }
}


/* ------------------------------------------ Main ------------------------------------------ */


function handleRequest(request, response) {
    const requestParameters = url.parse(request.url)
    const requestPath = requestParameters.pathname

    // serve static resources
    if (!ROUTES.test(requestPath)) {
        return html(request, response, requestPath)
    }

    // check if service is running
    if ('/status' == requestPath) {
        return ok(response, status())
    }

    // require user authentication for all handlers below
    const options = querystring.parse(requestParameters.query)
    const user = auth(request, response, options)

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

    if ('/version' == requestPath) {
        return ok(response, version())
    }

    if ('/tasks' == requestPath) {
        if (modifiedSince(request, TASKS.lastModified)) {
            return ok(response, TASKS, TASKS.lastModified)
        } else {
            return notModified(response)
        }
    }

    if ('/folders' == requestPath) {
        return ok(response, listFolders(options))
    }

    if ('/output' == requestPath) {
        const id = options.id
        if (id) {
            return file(request, response, getLogFile(id), MIME_TYPES['.log'], false, false)
        } else {
            return file(request, response, FILEBOT_LOG, MIME_TYPES['.log'], true, true)
        }
    }

    if ('/execute' == requestPath) {
        return ok(response, execute(options))
    }

    if ('/schedule' == requestPath) {
        return schedule(request, response, options)
    }

    if ('/task' == requestPath) {
        return task(request, response, options)
    }

    if ('/kill' == requestPath) {
        return ok(response, kill(options))
    }

    if ('/state' == requestPath) {
        return ok(response, state(options))
    }

    if ('/environment' == requestPath) {
        return ok(response, environment(options))
    }

    return error(response, 'BAD ROUTE')
}


function html(request, response, requestPath) {
    if (PUBLIC_HTML && requestPath.indexOf(PUBLIC_HTML) == 0) {
        const requestedFile = requestPath == PUBLIC_HTML ? 'index.html' : requestPath.substring(PUBLIC_HTML.length)
        const ext = path.extname(requestedFile)
        const contentType = MIME_TYPES[ext]
        if (contentType) {
            return file(request, response, path.resolve(CLIENT, requestedFile), contentType, true, false) // resolve against CLIENT folder
        }
    }
    return notFound(response)
}


/* ------------------------------------------ HTTP Response ------------------------------------------ */


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
    response.setHeader('Content-Type', 'application/json')
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
    response.end('Not Found')
}

function unauthorized(response, authenticate) {
    response.statusCode = 401
    if (authenticate) {
        response.setHeader('WWW-Authenticate', 'Basic realm="filebot-node"')
    }
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.end('Unauthorized')
}

function error(response, exception) {
    var result = {success: false, error: exception.toString()}
    response.statusCode = 500
    response.setHeader('Content-Type', 'application/json')
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.end(JSON.stringify(result))
}


/* ------------------------------------------ Authentication ------------------------------------------ */


function auth(request, response, options) {
    switch (AUTH) {
        case 'SYNO':
            return auth_syno(request, response, options)
        case 'QNAP':
            return auth_qnap(request, response)
        case 'BASIC':
            return auth_basic_env(request, response)
        case 'NONE':
            return 'NONE'
        default:
            return null
    }
}

function auth_header(request, options) {
    try {
        switch (AUTH) {
            case 'SYNO': 
                if (options.SynoToken) {
                    return {
                        'cookie': request.headers['cookie'].match(/\b(id=[^;]+)/)[1],
                        'X-Syno-Token': options.SynoToken
                    }
                } else {
                    return {
                        'cookie': request.headers['cookie'].match(/\b(id=[^;]+)/)[1],
                        'X-Syno-Token': request.headers['x-syno-token']
                    }
                }

            case 'QNAP':
                return {
                    'cookie': request.headers['cookie'].match(/\b(NAS_SID=[^;]+)/)[1]
                }
        }
    } catch(e) {
        // ignore invalid cookies
    }
    return null
}

function auth_basic_env(request, response) {
    const user = httpBasicAuth(request)

    if (user == undefined) {
        return undefined // REQUEST AUTH
    }

    if (user && user.name == process.env['FILEBOT_NODE_AUTH_USER'] && user.pass == process.env['FILEBOT_NODE_AUTH_PASS']) {
        return user.name // AUTH OK
    }

    return null // REQUEST FAIL
}

function auth_syno(request, response, options) {
    const auth = auth_header(request, options)
    if (!auth) {
        return null
    }

    const key = JSON.stringify(auth)
    const user = AUTH_CACHE[key]
    if (user) {
        return user
    }

    // X-Real-IP header is set by nginx server
    var remoteAddress = request.headers['x-real-ip']
    if (!remoteAddress) {
        // DSM 7 does not allow nginx reverse_proxy configuration, so we may be serving requests directly
        remoteAddress = request.connection.remoteAddress
    }

    // authenticate.cgi requires these and some other environment variables for authentication
    const cmd = '/usr/syno/synoman/webman/authenticate.cgi'
    const env = {
        'HTTP_COOKIE': auth['cookie'],
        'REMOTE_ADDR': remoteAddress,
        'HTTP_X_SYNO_TOKEN': auth['X-Syno-Token']
    }

    console.log({ 'cmd': cmd, 'env': env })

    // call authenticate.cgi and capture output
    const pd = child_process.spawnSync(cmd , [], {
            stdio: ['ignore', 'pipe', 'inherit'],
            encoding: 'UTF-8',
            env: env
        }
    )

    if (pd.status == 0) {
        const value = pd.stdout.trim()
        AUTH_CACHE[key] = value

        console.log({ 'auth': auth, 'user': value })
        return value
    }

    console.log({ 'status': pd.status, 'stdout': pd.stdout, 'stderr': pd.stderr })
    return null
}

function auth_qnap(request, response) {
    const auth = auth_header(request)
    if (!auth) {
        return null
    }

    const key = JSON.stringify(auth)
    const user = AUTH_CACHE[key]
    if (user) {
        return user
    }

    // authLogin.cgi requires QUERY_STRING sid=<auth cookie>
    const sid = auth.cookie.split(/=/).pop()

    const cmd = '/home/httpd/cgi-bin/authLogin.cgi'
    const env = {
        'QUERY_STRING': "sid=" + sid
    }

    console.log({ 'cmd': cmd, 'env': env })

    const pd = child_process.spawnSync(cmd, [], {
            stdio: ['ignore', 'pipe', 'inherit'],
            encoding: 'UTF-8',
            env: env
        }
    )

    if (pd.status == 0) {
        const cgiResponse = pd.stdout.trim()
        const xmlStartIndex = cgiResponse.indexOf('<?xml')

        if (xmlStartIndex > 0) {
            const xmlResponse = cgiResponse.substring(xmlStartIndex)
            const dom = xmlParser.parse(xmlResponse)

            if (dom && dom.QDocRoot && dom.QDocRoot.authPassed == "1") {
                const value = dom.QDocRoot.user
                AUTH_CACHE[key] = value

                console.log({ 'auth': auth, 'user': value })
                return value
            }
        }
    }

    console.log({ 'status': pd.status, 'stdout': pd.stdout, 'stderr': pd.stderr })
    return null
}


/* ------------------------------------------ Scheduled Task ------------------------------------------ */


function schedule(request, response, options) {
    const command = prepareScheduledTask(options)
    const id = command.split(/\s/).pop()

    const curl = prepareCurlCommand(request, options)

    const clientSideRequest = { id: id, command: command, curl: curl }
    return ok(response, clientSideRequest)
}


function prepareCurlCommand(request, options) {
    switch (AUTH) {
        case 'SYNO':
            const syno = auth_header(request, options)
            if (syno['X-Syno-Token']) {
                return 'curl --header "X-Syno-Token: '+ syno['X-Syno-Token'] +'" --cookie "' + syno.cookie + '"'    
            } else {
                return 'curl --cookie "' + syno.cookie + '"'    
            }
        case 'QNAP':
            const qnap = auth_header(request, options)
            return 'curl --cookie "' + qnap.cookie + '"'
        case 'BASIC':
            const user = httpBasicAuth(request)
            return 'curl --user "' + user.name + ':' + user.pass + '"'
        case 'NONE':
            return 'curl'
    }
    return null
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


/* ------------------------------------------ Start Server ------------------------------------------ */


function server(request, response) {
    // catch and ignore exceptions in production
    try {
        return handleRequest(request, response)
    } catch(e) {
        return error(response, e)
    }
}

// LOGGING
console.log("ENVIRONMENT", process.env)
console.log("STATUS", status())
console.log("USER", { UID: FILEBOT_CMD_UID,GID: FILEBOT_CMD_GID })

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
