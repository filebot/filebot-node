Ext.define('FileBot.Node', {
    singleton: true,

    protocol: 'http',
    hostname: location.hostname,
    port: 5452,

    getServerEndpoint: function(path) {
        return this.protocol + '://' + this.hostname + ':' + this.port + path
    },

    getLogAllEndpoint: function(path) {
        return this.getServerEndpoint('/log/all')
    },

    requestExecute: function (parameters) {
        Ext.Ajax.request({
            method: 'GET',
            url: this.getServerEndpoint('/execute'),
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
        });
    },

    requestKill: function(parameters) {
        Ext.Ajax.request({
            method: 'GET',
            url: this.getServerEndpoint('/kill'),
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
        });
    }

});