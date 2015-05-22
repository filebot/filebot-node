Ext.define('FileBot.Node', {
    singleton: true,

    init: function() {
        // add Login Cookie and CSRF token to all subsequent requests
        Ext.Ajax.on('beforerequest', function(conn, request) {
            this.authenticate(request.params)
        }, this)

        // Task Scheduler Web API doesn't accept requests from localhost so we have to do it from the browser
        FileBot.getApplication().on('auth', function(options) {
            if (options.auth == 'SYNO')
                this.init_syno()
        }, this)

        // request auth config
        this.requestAuth()
    },

    getServerEndpoint: function(path) {
        return location.protocol + '//' + location.hostname + ':' + (location.protocol.indexOf('https') < 0 ? Ext.manifest.server.port.http : Ext.manifest.server.port.https) + '/' + path
    },

    getLogAllEndpoint: function() {
        // add auth parameters to URL
        var params = {}
        this.authenticate(params)

        return this.getServerEndpoint('log/all') + '?' + Ext.Object.toQueryString(params)
    },

    requestAuth: function(parameters) {
        this.dispatchRequest('auth', parameters)
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
            }
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

    authenticate: function(params) {
        // do nothing by default
    },

    init_syno: function() {
        if (this.CSRF_TOKEN_KEY == 'SynoToken')
            return

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

                this.requestAuth() // submit auth request once we have the CSRF token
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

        // add Login Cookie and CSRF token to all subsequent requests
        this.authenticate = function(params) {
            params[this.CSRF_TOKEN_KEY] = this.CSRF_TOKEN_VAL
            params[this.COOKIE_KEY] = this.COOKIE_VAL
        }

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
                        msg: response.responseText ? response.responseText : Ext.encode(response),
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
    }

});