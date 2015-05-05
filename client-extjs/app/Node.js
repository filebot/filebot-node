Ext.define('FileBot.Node', {
    singleton: true,

    CSRF_TOKEN_KEY: 'SynoToken',
    CSRF_TOKEN_VAL: null,
    COOKIE_KEY: 'Cookie',
    COOKIE_VAL: 'id='+Ext.util.Cookies.get('id'),

    init: function() {
        Ext.Ajax.request({
            method: 'GET',
            url: '/webman/login.cgi',
            success: function (response) {
                var data = Ext.decode(response.responseText)
                this.CSRF_TOKEN_VAL = data[this.CSRF_TOKEN_KEY]

                this.requestAuth({'method': 'syno'}) // submit auth request once we have the CSRF token
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

        Ext.Ajax.on('beforerequest', function(conn, request) {
            request.params[this.CSRF_TOKEN_KEY] = this.CSRF_TOKEN_VAL
            request.params[this.COOKIE_KEY] = this.COOKIE_VAL
        }, this)
    },

    getServerEndpoint: function(path) {
        return location.protocol + '//' + location.hostname + ':' + (location.protocol.indexOf('https') < 0 ? Ext.manifest.server.port.http : Ext.manifest.server.port.https) + '/' + path
    },

    getLogAllEndpoint: function() {
        return this.getServerEndpoint('log/all')
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
    }

});