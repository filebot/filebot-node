/**
 * This class is the view model for the Main view of the application.
 */
Ext.define('FileBot.view.task.TaskModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.task',

    stores: {
        folders: {
            storeId: 'folders-store',
            autoLoad: false,
            pageSize: 0,
            remoteFilter: false,
            remoteSort: false,

            fields: [
                { name: 'path', type: 'string' }
            ]
        }
    },

    data: {
        name: 'FileBot'
    }

});
