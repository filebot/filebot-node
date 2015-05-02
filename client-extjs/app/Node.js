Ext.define('FileBot.Node', {
    singleton: true,
    
    getServerEndpoint: function(path) {
        return location.protocol + '//' + location.hostname + ':' + (location.protocol.indexOf('https') < 0 ? Ext.manifest.server.port.http : Ext.manifest.server.port.htts) + path
    },

    getLogAllEndpoint: function() {
        return this.getServerEndpoint('/log/all')
    },

    requestExecute: function (parameters) {
        this.dispatchRequest('/execute', parameters)
    },
    
    requestSchedule: function (parameters) {
        this.dispatchRequest('/schedule', parameters)
    },

    requestKill: function(parameters) {
        this.dispatchRequest('/kill', parameters)
    },

    dispatchRequest: function(path, parameters) {
        Ext.Ajax.request({
            method: 'GET',
            url: this.getServerEndpoint(path),
            params: parameters,
            useDefaultXhrHeader: false,
            cors: true,

            success: function (response) {
                var data = Ext.JSON.decode(response.responseText).data
                console.log(data)
                
                // broadcast event
                FileBot.getApplication().fireEvent('executeTask', data)
            },

            failure: function (response) {
                Ext.MessageBox.show({
                    title: 'Error',
                    msg: response.responseText,
                    buttons: Ext.MessageBox.OK,
                    scope: this,
                    icon: Ext.MessageBox.ERROR
                });
            }
        })
    }

});