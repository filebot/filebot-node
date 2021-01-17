Ext.define('FileBot.Node', {
    singleton: true,

    init: function() {
        FileBot.getApplication().on('auth', function(options) {
            // hook up generic configuration
            this.init_generic()

            // display filebot version output after successful initialization
            this.requestVersion()

            // restore state
            this.requestState({})
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
            withCredentials: false,
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

    init_generic: function() {
        // tell user to call scheduled tasks via curl
        FileBot.getApplication().on('schedule', function(request) {
            const id = request.id
            const command = request.command
            const url = new URL(this.getPostEndpoint("task?id=" + id), window.location).href
            const curl = 'curl --cookie "' + request.cookie + '" "' + url + '"'

            Ext.MessageBox.show({
                title: 'Prepared Task',
                msg: '<span class="crontab">Prepared Task ' + id + ' can be called locally via <nobr><code>' + command + '</code></nobr><br/> or remotely via <a href="data:text/plain,' + encodeURIComponent(curl) + '" target="_blank">' + url + '</a>.</span>',
                buttons: Ext.MessageBox.OK,
                icon: Ext.MessageBox.INFO
            }).removeCls('x-unselectable') // HACK TO FIX UNSELECTABLE TEXT
        }, this)
    }

});
