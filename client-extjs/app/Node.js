Ext.define('FileBot.Node', {
    singleton: true,
    
    getServerEndpoint: function(path) {
        return location.protocol + '//' + location.hostname + ':' + (location.protocol.indexOf('https') < 0 ? Ext.manifest.server.port.http : Ext.manifest.server.port.htts) + '/' + path
    },

    getLogAllEndpoint: function() {
        return this.getServerEndpoint('log/all')
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
                    msg: response.responseText,
                    buttons: Ext.MessageBox.OK,
                    scope: this,
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