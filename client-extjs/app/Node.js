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
            cors: true,

            success: function (response) {
                console.log(response)
                Ext.Msg.alert('Success', response.responseText);
            },
            failure: function (response) {
                console.log(response)
                Ext.Msg.alert('Failed', response.responseText);
            }
        });
    }

});
