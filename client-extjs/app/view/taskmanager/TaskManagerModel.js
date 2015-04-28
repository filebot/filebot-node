/**
 * Created by reinhard on 4/25/15.
 */
Ext.define('FileBot.view.taskmanager.TaskManagerModel', {
    extend: 'Ext.app.ViewModel',
    requires: ['FileBot.Node'],
    alias: 'viewmodel.taskmanager',

    stores: {
        tasks: {
            storeId: 'tasks-store',
            autoLoad: true,
            pageSize: 0,
            remoteFilter: false,
            remoteSort: false,

            fields: [
                { name: 'id', type: 'int' },
                { name: 'status', type: 'string' }
            ],

            sorters: [{
                property: 'id',
                direction: 'DESC'
            }],

            proxy: {
                type: 'ajax',
                useDefaultXhrHeader: false,
                cors: true,

                url: FileBot.Node.getServerEndpoint('/tasks'),
                noCache: false,
                
                reader: {
                    type: 'json',
                    rootProperty: 'data'
                }
            }
        }
    },

    data: {
        /* This object holds the arbitrary data that populates the ViewModel and is then available for binding. */
    }
});