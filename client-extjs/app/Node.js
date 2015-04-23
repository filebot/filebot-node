Ext.define('FileBot.Node', {
    singleton: true,

    getServerOrigin: function (path) {
        return location.protocol + '//' + location.hostname + ':5452' + path
    },

    requestExecute: function (parameters) {
        // submit the Ajax request and handle the response
        Ext.Ajax.request({
            method: 'GET',
            url: this.getServerOrigin('/execute'),
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
