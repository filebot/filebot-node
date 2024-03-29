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

    tools: [{
        type: 'print',
        callback: function() {
            FileBot.Node.openEndpoint('output', {})
        }
    }],

    listeners: {
        select: function(view, record) {
            // broadcast event
            FileBot.getApplication().fireEvent('selectTask', record.data)
        }
    },

    columns: [
    {
        text: 'Date',
        dataIndex: 'date',
        width: 120,
        renderer: function(val) {
            var t = new Date(val)
            var date = Ext.util.Format.date(t, 'd M')
            var time = Ext.util.Format.date(t, 'H:i:s')
            return '<span style="color:gray;font-size:smaller;margin-right:0.5em">'+date+'</span>'+'<span>'+time+'</span>'
        }
    }, {
        text: 'Status',
        dataIndex: 'status',
        width: 100,
        align: 'left',
        renderer: function(val) {
            if (val == '')
                return 'Running'
            if (val == '0')
                return 'Complete'
            if (val == '100')
                return 'Complete' // NOOP
            if (val == '137')
                return 'Cancelled'
            if (val == '1000')
                return 'Scheduled'
            else
                return 'Failure'
        }
    }, {
        menuDisabled: true,
        sortable: false,
        xtype: 'actioncolumn',
        focusable: false,
        width: 50,
        align: 'center',
        items: [{
            getClass: function(v, meta, rec) {
                var val = rec.get('status')
                if (val == '')
                    return 'cancel-col'
                if (val == '0')
                    return 'ok-col'
                if (val == '100')
                    return 'ok-col' // NOOP
                if (val == '1000')
                    return 'schedule-col'
                else
                    return 'fail-col'
            },
            getTip: function(v, meta, rec) {
                var val = rec.get('status')
                if (val == '')
                    return 'Cancel'
                if (val == '0')
                    return 'Success'
                if (val == '100')
                    return 'No Operation'
                if (val == '137')
                    return 'Cancelled'
                if (val == '1000')
                    return 'Execute Task'
                else
                    return 'Error (' + val + ')'
            },
            handler: function(grid, rowIndex, colIndex) {
                var rec = grid.getStore().getAt(rowIndex)
                var val = rec.get('status')
                if (val == '') {
                    FileBot.Node.requestKill({id: rec.get('id')})
                }
                else if (val == '1000') {
                    FileBot.Node.openEndpoint("task", {id: rec.get('id')})
                }
            }
        }]
    }],

    title: 'Tasks',
    sortableColumns: false,
    enableColumnHide: false,
    enableColumnMove: false,

    viewConfig: {
        enableTextSelection: false,
        deferEmptyText: false,
        loadMask: false
    }
});
