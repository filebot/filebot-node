/**
 * Created by reinhard on 4/25/15.
 */
Ext.define('FileBot.view.taskmanager.TaskManagerModel', {
    extend: 'Ext.app.ViewModel',
    requires: [
        'FileBot.Node'
    ],
    alias: 'viewmodel.taskmanager',

    stores: {
        tasks: {
            storeId: 'tasks-store',
            autoLoad: false,
            pageSize: 0,
            remoteFilter: false,
            remoteSort: false,

            fields: [
                { name: 'id', type: 'string' },
                { name: 'date', type: 'int' },
                { name: 'status', type: 'string' }
            ],

            sorters: [{
                property: 'date',
                direction: 'DESC'
            }]
        }
    },

    data: {
        /* This object holds the arbitrary data that populates the ViewModel and is then available for binding. */
    }
});
