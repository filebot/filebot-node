Ext.define('FileBot.Node', {
    singleton: true,

    protocol: 'http',
    hostname: location.hostname,
    port: 5452,

    getServerEndpoint: function (path) {
        return this.protocol + '://' + this.hostname + ':' + this.port + path
    },

    requestExecute: function (parameters) {
        // submit the Ajax request and handle the response
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
                Ext.Msg.alert('Failed', response.responseText)
            }
        });
    }

});
