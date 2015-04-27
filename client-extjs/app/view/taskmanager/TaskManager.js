/**
 * Created by reinhard on 4/25/15.
 */
Ext.define('FileBot.view.taskmanager.TaskManager', {
    extend: 'Ext.grid.Panel',
    requires: [
        'FileBot.view.taskmanager.TaskManagerController',
        'FileBot.view.taskmanager.TaskManagerModel',
        'FileBot.Node'
    ],
    viewModel: {
        type: 'taskmanager'
    },
    controller: 'taskmanager',
    xtype: 'taskmanager',

    bind: '{tasks}',

    width: 400,
    height: 200,

    columns: [
    {
        text: 'Date',
        dataIndex: 'id',
        width: 140,
        renderer: function(val) {
            var t = new Date(val)
            var date = Ext.util.Format.date(t, 'd M')
            var time = Ext.util.Format.date(t, 'H:i:s')
            return '<span style="color:gray;font-size:smaller;margin-right:0.5em">'+date+'</span>'+'<span>'+time+'</span>'
        }
    }, {
        text: 'Status',
        dataIndex: 'status',
        renderer: function(val) {
            console.log(val)
            if (val == '')
                return 'Running'
            if (val == '0')
                return 'Complete'
            if (val == '137')
                return 'Cancelled'
            else
                return 'Failure'
        }
    }, {
        menuDisabled: true,
        sortable: false,
        xtype: 'actioncolumn',
        width: 30,
        
        items: [{
            getClass: function(v, meta, rec) {
                var val = rec.get('status')
                if (val == '')
                    return 'cancel-col'
                if (val == '0')
                    return 'ok-col'
                else
                    return 'fail-col'
            },
            getTip: function(v, meta, rec) {
                var val = rec.get('status')
                if (val == '')
                    return 'Cancel'
                if (val == '0')
                    return 'Success'
                if (val == '137')
                    return 'Cancelled'
                else
                    return 'Error (' + val + ')'
            },
            handler: function(grid, rowIndex, colIndex) {
                var rec = grid.getStore().getAt(rowIndex)
                var val = rec.get('status')
                if (val == '') {
                    FileBot.Node.requestKill({id: rec.get('id')})
                }
            }
        }]
    }],

    title: 'Task Manager',
    collapsible: true,
    headerPosition: 'left',
    sortableColumns: false,
    enableColumnHide: false,
    enableColumnMove: false,

    viewConfig: {
        enableTextSelection: false,
        deferEmptyText: false,
        loadMask: false
    }
});