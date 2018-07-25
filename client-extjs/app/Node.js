Ext.define('FileBot.Node', {
    singleton: true,

    init: function() {
        // add Login Cookie and CSRF token to all subsequent requests
        Ext.Ajax.on('beforerequest', function(conn, request) {
            this.authenticate(request.params)
        }, this)

        // Task Scheduler Web API doesn't accept requests from localhost so we have to do it from the browser
        FileBot.getApplication().on('auth', function(options) {
            if (options.auth == 'SYNO') {
                // perform syno auth
                this.init_syno()
            } else if (options.auth == 'QNAP') {
                // perform qnap auth
                this.init_qnap()
            }

            // display filebot version output after successful initialization
            this.requestVersion()
        }, this)

        // request auth config
        this.requestAuth()
    },

    getServerEndpoint: function(path) {
        // Synology DSM configuration
        if (document.location.pathname == '/webman/3rdparty/filebot-node/index.html') {
            return 'proxy/' + path
        }

        // generic configuration
        return path
    },

    getPostEndpoint: function(path) {
        return this.getServerEndpoint(path) + '?' + Ext.Object.toQueryString(this.getBaseParams())
    },

    requestAuth: function() {
        this.dispatchRequest('auth', {})
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
            noCache: true,
            success: function (response) {
                // broadcast response as application event
                var data = Ext.JSON.decode(response.responseText).data
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
            cors: true,
            noCache: false,
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

    getBaseParams: function() {
        var params = {}
        this.authenticate(params)
        return params
    },

    authenticate: function(params) {
        // do nothing by default
    },

    init_syno: function() {
        if (this.CSRF_TOKEN_KEY == 'SynoToken') {
            return
        }

        // Synology DSM require SynoToken (CSRF) and Cookie (USER) to authenticate a user request
        this.CSRF_TOKEN_KEY ='SynoToken'
        this.CSRF_TOKEN_VAL = null
        this.COOKIE_KEY = 'Cookie'
        this.COOKIE_VAL ='id='+Ext.util.Cookies.get('id')

        Ext.Ajax.request({
            method: 'GET',
            url: '/webman/login.cgi',
            success: function (response) {
                var data = Ext.decode(response.responseText)
                this.CSRF_TOKEN_VAL = data[this.CSRF_TOKEN_KEY]

                // add Login Cookie and CSRF token to all subsequent requests
                this.authenticate = function(params) {
                    if (params instanceof Object) {
                        params[this.CSRF_TOKEN_KEY] = this.CSRF_TOKEN_VAL
                        params[this.COOKIE_KEY] = this.COOKIE_VAL                        
                    }
                }.bind(this)

                // request auth
                this.requestAuth()
            },
            failure: function (response) {
                Ext.MessageBox.show({
                    title: 'Error: CSRF token',
                    msg: response.responseText ? response.responseText : Ext.encode(response),
                    buttons: Ext.MessageBox.OK,
                    icon: Ext.MessageBox.ERROR
                })
            },
            scope: this
        })

        // Task Scheduler Web API doesn't accept requests from localhost so we have to do it from the browser
        FileBot.getApplication().on('schedule', function(request) {
            Ext.Ajax.request({
                method: request.method,
                url: request.url,
                params: request.params,
                headers: request.headers,
                success: function (response) {
                    Ext.MessageBox.show({
                        title: 'Task Scheduler',
                        msg: 'Your task has been added to Task Scheduler. Please use Control Panel ► System ► Task Scheduler to modify or delete tasks.',
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.INFO
                    })
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
        }, this)
    },

    init_qnap: function() {
        // add sid to all subsequent requests
        this.authenticate = function(params) {
            if (params instanceof Object) {
                params['Cookie'] = 'sid='+Ext.util.Cookies.get('NAS_SID')
            }
        }.bind(this)
    }

});
