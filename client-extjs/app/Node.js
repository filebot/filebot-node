Ext.define('FileBot.Node', {
    singleton: true,

    init: function() {
        FileBot.getApplication().on('auth', function(options) {
            // init CSRF token for DSM 6.2.4
            if (options.auth == 'SYNO_CGI') {
                this.init_syno()
            } else {
                this.init_generic()
            }
        }, this)

        // request auth config
        this.requestAuth()
    },

    getServerEndpoint: function(path) {
        return Ext.manifest.server.endpoint + path
    },

    getPostEndpoint: function(path, parameters) {
        const query = Ext.Object.toQueryString(parameters)
        if (query) {
            return this.getServerEndpoint(path) + '?' + query
        } else {
            return this.getServerEndpoint(path)
        }
    },

    requestAuth: function() {
        this.dispatchRequest('auth', {})
    },

    requestState: function(parameters) {
        this.dispatchRequest('state', parameters)
    },

    requestExecute: function (parameters) {
        this.dispatchRequest('execute', parameters)
    },

    requestSchedule: function (parameters) {
        this.dispatchRequest('schedule', parameters)
    },

    requestKill: function(parameters) {
        this.dispatchRequest('kill', parameters)
    },

    fetchLog: function(parameters, responseHandler) {
        this.fetchResource('log', parameters, responseHandler)
    },

    requestVersion: function () {
        this.dispatchRequest('version', {})
    },

    dispatchRequest: function(path, parameters) {
        Ext.Ajax.request({
            method: 'GET',
            url: this.getServerEndpoint(path),
            params: parameters,
            useDefaultXhrHeader: false,
            cors: true,
            disableCaching: true,
            success: function (response) {
                // broadcast response as application event
                const data = Ext.JSON.decode(response.responseText).data
                FileBot.getApplication().fireEvent(path, data)
            },
            failure: function (response) {
                Ext.MessageBox.show({
                    title: 'Error',
                    msg: response.responseText ? response.responseText : Ext.encode(response),
                    buttons: Ext.MessageBox.OK,
                    icon: Ext.MessageBox.ERROR
                })
            },
            scope: this
        })
    },

    fetchResource: function(path, parameters, responseHandler) {
        Ext.Ajax.request({
            method: 'GET',
            url: this.getServerEndpoint(path),
            params: parameters,
            useDefaultXhrHeader: false,
            withCredentials: false,
            cors: true,
            disableCaching: false,
            success: responseHandler,
            failure: responseHandler
        })
    },

    getDataProxy: function(path) {
        return new Ext.data.proxy.Ajax({
            method: 'GET',
            url: FileBot.Node.getServerEndpoint(path),
            useDefaultXhrHeader: false,
            cors: true,
            noCache: false,
            reader: {
                type: 'json',
                rootProperty: 'data'
            }
        })
    },



    init_generic: function() {
        // run startup code
        FileBot.getApplication().fireEvent('init')

        // restore state
        this.requestState({})

        // tell user to call scheduled tasks via curl
        FileBot.getApplication().on('schedule', function(request) {
            const id = request.id
            const command = request.command

            const url = new URL(this.getPostEndpoint("task", {id: id}), window.location).href
            const curl = request.curl + ' "' + url + '"\n'

            Ext.MessageBox.show({
                title: 'Prepared Task',
                msg: '<span class="crontab">Prepared Task ' + id + ' can be called via <nobr><code>' + command + '</code></nobr><br/> or <a href="' + url + '" target="_blank">Link</a> or <a href="data:text/plain,' + encodeURIComponent(curl) + '" download="curl.sh">cURL</a>.</span>',
                buttons: Ext.MessageBox.OK,
                icon: Ext.MessageBox.INFO
            }).removeCls('x-unselectable') // HACK TO FIX UNSELECTABLE TEXT
        }, this)

        // display filebot version output after successful initialization
        const version = new Ext.util.DelayedTask(function() {
            // start fetching task data
            this.requestVersion()
        }, this)
        version.delay(250)
    },



    init_syno: function() {
         // DSM 7 proxy_pass.cgi
        this.getServerEndpoint = function(path) {
            return Ext.manifest.server.endpoint + path + '.cgi'
        }

        // init CSRF token for DSM 6.2.4
        Ext.Ajax.request({
            method: 'GET',
            url: '/webman/login.cgi',
            disableCaching: false,
            success: function (response) {
                const json = Ext.decode(response.responseText)
                const token = json['SynoToken']

                // add CSRF token to all subsequent requests
                if (token) {
                    Ext.manifest.server.SynoToken = token
                    Ext.Ajax.on('beforerequest', function(connection, request) {
                        request.params['SynoToken'] = token
                    }, this)
                }

                // run normal init code after login.cgi has been called
                this.init_generic()
            },
            failure: function (response) {
                Ext.MessageBox.show({
                    title: 'Login Error',
                    msg: response.responseText ? response.responseText : Ext.encode(response),
                    buttons: Ext.MessageBox.OK,
                    icon: Ext.MessageBox.ERROR
                })
            },
            scope: this
        })

        // Task Scheduler Web API doesn't accept requests from localhost so we have to do it from the browser
        FileBot.getApplication().on('schedule', function(request) {
            const name = 'FileBot Task ' + request.id
            const command = request.command

            // Syno Web API rejects requests from localhost, so we have to send the request from the client
            Ext.Ajax.request({
                method: 'POST',
                url: '/webapi/_______________________________________________________entry.cgi',
                params: {
                    name: JSON.stringify(name),
                    real_owner: JSON.stringify('admin'),
                    owner: JSON.stringify('admin'),
                    enable: true,
                    schedule: JSON.stringify({"date_type":0,"week_day":"0,1,2,3,4,5,6","hour":4,"minute":0,"repeat_hour":0,"repeat_min":0,"last_work_hour":0,"repeat_min_store_config":[1,5,10,15,20,30],"repeat_hour_store_config":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]}),
                    extra: JSON.stringify({"notify_enable":false,"script":command,"notify_mail":"","notify_if_error":false}),
                    type: JSON.stringify('script'),
                    api: 'SYNO.Core.TaskScheduler',
                    method: 'create',
                    version: 3
                },
                headers: {
                    'X-SYNO-TOKEN': Ext.manifest.server.SynoToken
                },
                success: function (response) {
                    Ext.MessageBox.show({
                        title: 'Task Scheduler',
                        msg: name + ' has been added to the Task Scheduler. Please use Control Panel ➔ Task Scheduler to modify or delete this task.',
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.INFO
                    })
                },
                failure: function (response) {
                    Ext.MessageBox.show({
                        title: 'Task Scheduler Error',
                        msg: response.responseText ? response.responseText : Ext.encode(response),
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.ERROR
                    })
                },
                scope: this
            })
        }, this)
    }

});
